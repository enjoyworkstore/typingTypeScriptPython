import type { Difficulty, Language, Snippet } from "../types";

const IMPORTED_SNIPPETS_STORAGE_KEY = "typing-for-enjoy-workstore:imports:v1";
const MAX_FILES = 12;
const MAX_SNIPPETS_PER_FILE = 24;
const MAX_TOTAL_SNIPPETS = 120;
const MAX_SNIPPET_LINES = 6;
const MAX_SNIPPET_CHARS = 220;

interface StoredImportedFile {
  fileKey: string;
  fileName: string;
  importedAt: number;
  language: Language;
  snippets: Snippet[];
}

interface StoredImportedLibrary {
  files: StoredImportedFile[];
}

export interface ImportedFileSummary {
  fileKey: string;
  fileName: string;
  importedAt: number;
  language: Language;
  snippetCount: number;
  easyCount: number;
  normalCount: number;
}

export interface ImportedLibrary {
  files: ImportedFileSummary[];
  snippets: Snippet[];
}

export interface ImportedFileResult {
  summary: ImportedFileSummary;
  replaced: boolean;
  importedCount: number;
}

interface ChunkedBlock {
  code: string;
  partIndex: number;
  partTotal: number;
}

export function loadImportedLibrary(): ImportedLibrary {
  const stored = loadStoredLibrary();
  const files = stored.files
    .map(toImportedFileSummary)
    .sort((left, right) => right.importedAt - left.importedAt);
  const snippets = files.flatMap((summary) => {
    const file = stored.files.find((entry) => entry.fileKey === summary.fileKey);
    return file?.snippets ?? [];
  });

  return { files, snippets };
}

export function importCodeFile(
  fileName: string,
  sourceText: string,
): ImportedFileResult {
  const language = inferLanguageFromFileName(fileName);
  if (!language) {
    throw new Error("`.ts` / `.py` / `.sql` ファイルを選んでください。");
  }

  const normalizedSource = normalizeImportedSource(sourceText);
  if (normalizedSource.length === 0) {
    throw new Error("空のファイルは取り込めません。");
  }

  const blocks =
    language === "typescript"
      ? splitTypeScriptBlocks(normalizedSource)
      : language === "python"
        ? splitPythonBlocks(normalizedSource)
        : splitSqlBlocks(normalizedSource);
  const chunkedBlocks = blocks
    .flatMap((block) => chunkBlock(block))
    .map((block) => ({
      ...block,
      code: normalizeImportedCode(block.code),
    }))
    .filter((block) => isValidImportedChunk(block.code))
    .slice(0, MAX_SNIPPETS_PER_FILE);

  if (chunkedBlocks.length === 0) {
    throw new Error("出題できるコード断片を見つけられませんでした。");
  }

  const fileKey = createFileKey(fileName, language);
  const importedAt = Date.now();
  const snippets = chunkedBlocks.map((block, index) =>
    createImportedSnippet({
      fileKey,
      fileName,
      language,
      code: block.code,
      chunkIndex: index,
      partIndex: block.partIndex,
      partTotal: block.partTotal,
    }),
  );

  const nextFile: StoredImportedFile = {
    fileKey,
    fileName,
    importedAt,
    language,
    snippets,
  };

  const stored = loadStoredLibrary();
  const replaced = stored.files.some((entry) => entry.fileKey === fileKey);
  const nextFiles = [nextFile, ...stored.files.filter((entry) => entry.fileKey !== fileKey)];
  const trimmedFiles = trimStoredFiles(nextFiles);

  saveStoredLibrary({ files: trimmedFiles });

  return {
    summary: toImportedFileSummary(nextFile),
    replaced,
    importedCount: snippets.length,
  };
}

export function clearImportedLibrary(): ImportedLibrary {
  window.localStorage.removeItem(IMPORTED_SNIPPETS_STORAGE_KEY);
  return { files: [], snippets: [] };
}

function loadStoredLibrary(): StoredImportedLibrary {
  try {
    const raw = window.localStorage.getItem(IMPORTED_SNIPPETS_STORAGE_KEY);
    if (!raw) {
      return { files: [] };
    }

    const parsed = JSON.parse(raw) as StoredImportedLibrary;
    if (!parsed || !Array.isArray(parsed.files)) {
      return { files: [] };
    }

    return {
      files: parsed.files
        .filter(
          (entry): entry is StoredImportedFile =>
            typeof entry?.fileKey === "string" &&
            typeof entry?.fileName === "string" &&
            typeof entry?.importedAt === "number" &&
            (
              entry?.language === "typescript" ||
              entry?.language === "python" ||
              entry?.language === "sql"
            ) &&
            Array.isArray(entry?.snippets),
        )
        .map((entry) => ({
          ...entry,
          snippets: entry.snippets.filter(isStoredSnippet),
        })),
    };
  } catch {
    return { files: [] };
  }
}

function saveStoredLibrary(library: StoredImportedLibrary) {
  window.localStorage.setItem(
    IMPORTED_SNIPPETS_STORAGE_KEY,
    JSON.stringify(library),
  );
}

function trimStoredFiles(files: StoredImportedFile[]) {
  const limitedFiles = files
    .sort((left, right) => right.importedAt - left.importedAt)
    .slice(0, MAX_FILES);
  const nextFiles: StoredImportedFile[] = [];
  let totalSnippets = 0;

  for (const file of limitedFiles) {
    if (totalSnippets >= MAX_TOTAL_SNIPPETS) {
      break;
    }

    const allowed = Math.min(
      file.snippets.length,
      MAX_TOTAL_SNIPPETS - totalSnippets,
    );
    nextFiles.push({
      ...file,
      snippets: file.snippets.slice(0, allowed),
    });
    totalSnippets += allowed;
  }

  return nextFiles;
}

function inferLanguageFromFileName(fileName: string): Language | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
    return "typescript";
  }

  if (lower.endsWith(".py")) {
    return "python";
  }

  if (lower.endsWith(".sql")) {
    return "sql";
  }

  return null;
}

function normalizeImportedSource(sourceText: string) {
  return sourceText
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

function normalizeImportedCode(code: string) {
  return code
    .replace(/\t/g, "  ")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .trim();
}

function splitTypeScriptBlocks(source: string) {
  const blocks: string[] = [];
  let start = 0;
  let lineStart = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inBlockComment = false;
  let inLineComment = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        const line = source.slice(lineStart, index).trim();
        if (shouldSplitTypeScriptLine(line, braceDepth, bracketDepth, parenDepth)) {
          pushBlock(blocks, source.slice(start, index));
          start = index + 1;
        }
        lineStart = index + 1;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (inSingle) {
      if (char === "'") {
        inSingle = false;
      }
      continue;
    }

    if (inDouble) {
      if (char === "\"") {
        inDouble = false;
      }
      continue;
    }

    if (inTemplate) {
      if (char === "`") {
        inTemplate = false;
        continue;
      }

      if (char === "$" && next === "{") {
        braceDepth += 1;
        index += 1;
      } else if (char === "}") {
        braceDepth = Math.max(0, braceDepth - 1);
      }
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (char === "'") {
      inSingle = true;
      continue;
    }

    if (char === "\"") {
      inDouble = true;
      continue;
    }

    if (char === "`") {
      inTemplate = true;
      continue;
    }

    if (char === "{") {
      braceDepth += 1;
    } else if (char === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
    } else if (char === "[") {
      bracketDepth += 1;
    } else if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
    } else if (char === "(") {
      parenDepth += 1;
    } else if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
    } else if (char === "\n") {
      const line = source.slice(lineStart, index).trim();
      if (shouldSplitTypeScriptLine(line, braceDepth, bracketDepth, parenDepth)) {
        pushBlock(blocks, source.slice(start, index));
        start = index + 1;
      }
      lineStart = index + 1;
    }
  }

  pushBlock(blocks, source.slice(start));

  return blocks.filter((block) => !shouldSkipTypeScriptBlock(block));
}

function shouldSplitTypeScriptLine(
  line: string,
  braceDepth: number,
  bracketDepth: number,
  parenDepth: number,
) {
  if (line.length === 0) {
    return braceDepth === 0 && bracketDepth === 0 && parenDepth === 0;
  }

  return (
    braceDepth === 0 &&
    bracketDepth === 0 &&
    parenDepth === 0 &&
    (/[;}]\s*$/.test(line) || /^export\s+\{/.test(line))
  );
}

function shouldSkipTypeScriptBlock(block: string) {
  const trimmed = block.trim();
  if (!trimmed) {
    return true;
  }

  return (
    /^import\s/m.test(trimmed) ||
    /^export\s+\{[\s\S]*\};?$/.test(trimmed) ||
    /^\/\/.*$/.test(trimmed)
  );
}

function splitPythonBlocks(source: string) {
  const lines = source.split("\n");
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const currentLine = lines[index];
    const trimmed = currentLine.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      index += 1;
      continue;
    }

    const start = index;
    const baseIndent = getIndentSize(currentLine);
    const startsIndentedBlock =
      baseIndent === 0 &&
      /^(@|def\b|class\b|if\b|for\b|while\b|try\b|with\b|match\b)/.test(trimmed);
    const endsWithContinuation =
      /[:\\([{]\s*$/.test(trimmed) || countOpenPythonBrackets(trimmed) > 0;

    index += 1;

    if (startsIndentedBlock) {
      while (index < lines.length) {
        const line = lines[index];
        const lineTrimmed = line.trim();
        if (!lineTrimmed) {
          index += 1;
          continue;
        }

        const indent = getIndentSize(line);
        if (indent === 0 && !lineTrimmed.startsWith("@")) {
          break;
        }

        index += 1;
      }
    } else {
      let bracketBalance = countOpenPythonBrackets(trimmed);
      let continuation = endsWithContinuation;

      while (index < lines.length) {
        const line = lines[index];
        const lineTrimmed = line.trim();

        if (!lineTrimmed) {
          break;
        }

        if (
          getIndentSize(line) === 0 &&
          bracketBalance <= 0 &&
          !continuation &&
          looksLikePythonBoundary(lineTrimmed)
        ) {
          break;
        }

        bracketBalance += countOpenPythonBrackets(lineTrimmed);
        continuation = /[:\\([{]\s*$/.test(lineTrimmed);
        index += 1;

        if (bracketBalance <= 0 && !continuation && !lineTrimmed.endsWith("\\")) {
          break;
        }
      }
    }

    pushBlock(blocks, lines.slice(start, index).join("\n"));
  }

  return blocks.filter((block) => block.trim().length > 0);
}

function splitSqlBlocks(source: string) {
  const blocks: string[] = [];
  let start = 0;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inSingle) {
      if (char === "'" && next === "'") {
        index += 1;
        continue;
      }

      if (char === "'") {
        inSingle = false;
      }
      continue;
    }

    if (inDouble) {
      if (char === '"' && next === '"') {
        index += 1;
        continue;
      }

      if (char === '"') {
        inDouble = false;
      }
      continue;
    }

    if (char === "-" && next === "-") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (char === "'") {
      inSingle = true;
      continue;
    }

    if (char === '"') {
      inDouble = true;
      continue;
    }

    if (char === ";") {
      pushBlock(blocks, source.slice(start, index + 1));
      start = index + 1;
    }
  }

  if (start < source.length) {
    const tail = source.slice(start);
    if (tail.includes("\n\n")) {
      tail.split(/\n\s*\n/g).forEach((block) => pushBlock(blocks, block));
    } else {
      pushBlock(blocks, tail);
    }
  }

  return blocks.filter((block) => block.trim().length > 0);
}

function chunkBlock(block: string): ChunkedBlock[] {
  const normalized = block.trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split("\n");
  if (lines.length <= MAX_SNIPPET_LINES && normalized.length <= MAX_SNIPPET_CHARS) {
    return [{ code: normalized, partIndex: 1, partTotal: 1 }];
  }

  const chunks: ChunkedBlock[] = [];
  let currentLines: string[] = [];

  for (const line of lines) {
    const candidateLines = [...currentLines, line];
    const candidateCode = candidateLines.join("\n");
    if (
      currentLines.length > 0 &&
      (candidateLines.length > MAX_SNIPPET_LINES ||
        candidateCode.length > MAX_SNIPPET_CHARS)
    ) {
      chunks.push({
        code: currentLines.join("\n"),
        partIndex: chunks.length + 1,
        partTotal: 0,
      });
      currentLines = [line];
    } else {
      currentLines = candidateLines;
    }
  }

  if (currentLines.length > 0) {
    chunks.push({
      code: currentLines.join("\n"),
      partIndex: chunks.length + 1,
      partTotal: 0,
    });
  }

  return chunks.map((chunk, index) => ({
    ...chunk,
    partIndex: index + 1,
    partTotal: chunks.length,
  }));
}

function isValidImportedChunk(code: string) {
  const trimmed = code.trim();
  if (trimmed.length < 8) {
    return false;
  }

  const nonEmptyLines = trimmed.split("\n").filter((line) => line.trim().length > 0);
  return nonEmptyLines.length > 0;
}

function createImportedSnippet(options: {
  fileKey: string;
  fileName: string;
  language: Language;
  code: string;
  chunkIndex: number;
  partIndex: number;
  partTotal: number;
}): Snippet {
  const difficulty = estimateDifficulty(options.language, options.code);
  const construct = detectConstruct(options.language, options.code);
  const title = buildImportedTitle(
    options.language,
    options.code,
    construct,
    options.partIndex,
    options.partTotal,
  );
  const meaning = `${options.fileName} から自動分解した ${construct.label} の練習です。`;
  const notes = [
    `元ファイル: ${options.fileName}`,
    options.partTotal > 1
      ? `長いコードを ${options.partIndex}/${options.partTotal} に分割しています。`
      : "前後の文脈を省略している場合があります。",
  ];

  return {
    id: `${options.fileKey}-${options.chunkIndex + 1}`,
    language: options.language,
    difficulty,
    source: "imported",
    originLabel: options.fileName,
    title,
    description: `${options.fileName} から取り込んだコードです。`,
    meaning,
    notes,
    code: options.code,
  };
}

function estimateDifficulty(language: Language, code: string): Difficulty {
  const lineCount = code.split("\n").length;
  const complexityPattern =
    language === "typescript"
      ? /\b(function|type|interface|class|for|while|if|switch|try|async|await|=>)\b/
      : language === "python"
        ? /\b(def|class|for|while|if|try|with|match|lambda)\b/
        : /\b(join|group\s+by|order\s+by|having|with|case|union|create\s+table)\b/i;

  if (
    code.length > 90 ||
    lineCount >= 4 ||
    complexityPattern.test(code) ||
    /[{}[\]()]/.test(code)
  ) {
    return "normal";
  }

  return "easy";
}

function detectConstruct(language: Language, code: string) {
  const firstLine = code.split("\n").find((line) => line.trim().length > 0)?.trim() ?? "";

  if (language === "typescript") {
    if (/^(export\s+)?(async\s+)?function\b/.test(firstLine)) {
      return { label: "function", name: matchName(firstLine, /function\s+([A-Za-z0-9_]+)/) };
    }
    if (/^(export\s+)?class\b/.test(firstLine)) {
      return { label: "class", name: matchName(firstLine, /class\s+([A-Za-z0-9_]+)/) };
    }
    if (/^(export\s+)?interface\b/.test(firstLine)) {
      return { label: "interface", name: matchName(firstLine, /interface\s+([A-Za-z0-9_]+)/) };
    }
    if (/^(export\s+)?type\b/.test(firstLine)) {
      return { label: "type", name: matchName(firstLine, /type\s+([A-Za-z0-9_]+)/) };
    }
    if (/^(export\s+)?enum\b/.test(firstLine)) {
      return { label: "enum", name: matchName(firstLine, /enum\s+([A-Za-z0-9_]+)/) };
    }
    if (/^(export\s+)?(const|let|var)\b/.test(firstLine)) {
      return {
        label: "variable",
        name: matchName(firstLine, /(?:const|let|var)\s+([A-Za-z0-9_]+)/),
      };
    }
  } else if (language === "python") {
    if (/^def\b/.test(firstLine)) {
      return { label: "function", name: matchName(firstLine, /def\s+([A-Za-z0-9_]+)/) };
    }
    if (/^class\b/.test(firstLine)) {
      return { label: "class", name: matchName(firstLine, /class\s+([A-Za-z0-9_]+)/) };
    }
    if (/^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(firstLine)) {
      return {
        label: "assignment",
        name: matchName(firstLine, /^([A-Za-z_][A-Za-z0-9_]*)\s*=/),
      };
    }
  } else if (language === "sql") {
    if (/^select\b/i.test(firstLine)) {
      return { label: "select", name: null };
    }
    if (/^insert\b/i.test(firstLine)) {
      return { label: "insert", name: null };
    }
    if (/^update\b/i.test(firstLine)) {
      return { label: "update", name: null };
    }
    if (/^delete\b/i.test(firstLine)) {
      return { label: "delete", name: null };
    }
    if (/^create\s+table\b/i.test(firstLine)) {
      return {
        label: "table",
        name: matchName(firstLine, /^create\s+table\s+([A-Za-z0-9_]+)/i),
      };
    }
    if (/^with\b/i.test(firstLine)) {
      return { label: "cte", name: null };
    }
  }

  if (/^if\b/.test(firstLine)) {
    return { label: "if block", name: null };
  }
  if (/^for\b/.test(firstLine)) {
    return { label: "loop", name: null };
  }
  if (/^while\b/.test(firstLine)) {
    return { label: "loop", name: null };
  }
  if (/^try\b/.test(firstLine)) {
    return { label: "try block", name: null };
  }

  return { label: "code block", name: null };
}

function buildImportedTitle(
  language: Language,
  code: string,
  construct: { label: string; name: string | null },
  partIndex: number,
  partTotal: number,
) {
  const baseTitle = construct.name
    ? construct.label === "variable" || construct.label === "assignment"
      ? `${construct.name}`
      : `${construct.name}${construct.label === "function" ? "()" : ""}`
    : createTitleFromCode(language, code, construct.label);

  return partTotal > 1 ? `${baseTitle} ${partIndex}/${partTotal}` : baseTitle;
}

function createTitleFromCode(
  language: Language,
  code: string,
  fallback: string,
) {
  const firstLine = code.split("\n").find((line) => line.trim().length > 0)?.trim() ?? "";
  const shortened = firstLine.replace(/\s+/g, " ").slice(0, 32);
  if (shortened.length > 0) {
    return shortened;
  }

  return language === "typescript" ? `Imported ${fallback}` : `Imported ${fallback}`;
}

function toImportedFileSummary(file: StoredImportedFile): ImportedFileSummary {
  return {
    fileKey: file.fileKey,
    fileName: file.fileName,
    importedAt: file.importedAt,
    language: file.language,
    snippetCount: file.snippets.length,
    easyCount: file.snippets.filter((snippet) => snippet.difficulty === "easy").length,
    normalCount: file.snippets.filter((snippet) => snippet.difficulty === "normal").length,
  };
}

function isStoredSnippet(snippet: Snippet): boolean {
  return (
    typeof snippet?.id === "string" &&
    (
      snippet?.language === "typescript" ||
      snippet?.language === "python" ||
      snippet?.language === "sql"
    ) &&
    (snippet?.difficulty === "easy" || snippet?.difficulty === "normal") &&
    typeof snippet?.title === "string" &&
    typeof snippet?.description === "string" &&
    typeof snippet?.meaning === "string" &&
    Array.isArray(snippet?.notes) &&
    typeof snippet?.code === "string"
  );
}

function createFileKey(fileName: string, language: Language) {
  return `${language}-${slugify(fileName)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pushBlock(blocks: string[], value: string) {
  const trimmed = value.trim();
  if (trimmed.length > 0) {
    blocks.push(trimmed);
  }
}

function getIndentSize(line: string) {
  const match = line.match(/^\s*/);
  return match ? match[0].replace(/\t/g, "  ").length : 0;
}

function countOpenPythonBrackets(line: string) {
  let count = 0;
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (const char of line) {
    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (inSingle) {
      if (char === "'") {
        inSingle = false;
      }
      continue;
    }

    if (inDouble) {
      if (char === "\"") {
        inDouble = false;
      }
      continue;
    }

    if (char === "'") {
      inSingle = true;
      continue;
    }

    if (char === "\"") {
      inDouble = true;
      continue;
    }

    if ("([{".includes(char)) {
      count += 1;
    } else if (")]}".includes(char)) {
      count -= 1;
    }
  }

  return count;
}

function looksLikePythonBoundary(line: string) {
  return /^(@|def\b|class\b|if\b|for\b|while\b|try\b|with\b|match\b|[A-Za-z_])/.test(
    line,
  );
}

function matchName(line: string, pattern: RegExp) {
  const match = line.match(pattern);
  return match?.[1] ?? null;
}
