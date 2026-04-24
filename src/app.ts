import { getSnippetPool } from "./data/snippets";
import type {
  Difficulty,
  KeyStat,
  Language,
  SessionRecord,
  Snippet,
} from "./types";

type Screen = "menu" | "session" | "result";

interface ActiveSession {
  language: Language;
  difficulty: Difficulty;
  pool: Snippet[];
  queue: Snippet[];
  currentIndex: number;
  currentSnippet: Snippet;
  progress: number;
  startedAt: number;
  correctStrokes: number;
  assistedCharacters: number;
  assistedCompletions: number;
  errorCount: number;
  totalKeystrokes: number;
  completedSnippets: number;
  keyStats: Record<string, KeyStat>;
  lastPressedCode: string | null;
  lastPressedWasCorrect: boolean | null;
  selectedSuggestionIndex: number;
}

interface AppState {
  screen: Screen;
  language: Language;
  difficulty: Difficulty;
  intellisenseEnabled: boolean;
  history: SessionRecord[];
  session: ActiveSession | null;
  result: SessionRecord | null;
}

interface KeyboardKey {
  code: string;
  label: string;
  shiftLabel?: string;
  width?: number;
}

interface IntelliSenseCandidate {
  insertText: string;
  label: string;
  detail: string;
  kind: "keyword" | "function" | "type" | "variable" | "property" | "snippet";
}

interface TokenContext {
  start: number;
  prefix: string;
}

const STORAGE_KEY = "typing-for-enjoy-workstore:v1";
const SETTINGS_STORAGE_KEY = "typing-for-enjoy-workstore:settings:v1";
const MAX_HISTORY = 20;
const SHIFT_CODES = ["ShiftLeft", "ShiftRight"] as const;

const BASE_SYMBOL_CODES: Record<string, string> = {
  "1": "Digit1",
  "2": "Digit2",
  "3": "Digit3",
  "4": "Digit4",
  "5": "Digit5",
  "6": "Digit6",
  "7": "Digit7",
  "8": "Digit8",
  "9": "Digit9",
  "0": "Digit0",
  "-": "Minus",
  "^": "Equal",
  "¥": "IntlYen",
  "@": "BracketLeft",
  "[": "BracketRight",
  ";": "Semicolon",
  ":": "Quote",
  "]": "Backslash",
  "\\": "IntlRo",
  ",": "Comma",
  ".": "Period",
  "/": "Slash",
};

const SHIFT_SYMBOL_CODES: Record<string, string> = {
  "!": "Digit1",
  '"': "Digit2",
  "#": "Digit3",
  "$": "Digit4",
  "%": "Digit5",
  "&": "Digit6",
  "'": "Digit7",
  "(": "Digit8",
  ")": "Digit9",
  "=": "Minus",
  "~": "Equal",
  "|": "IntlYen",
  "`": "BracketLeft",
  "{": "BracketRight",
  "+": "Semicolon",
  "*": "Quote",
  "}": "Backslash",
  _: "IntlRo",
  "<": "Comma",
  ">": "Period",
  "?": "Slash",
};

const KEYBOARD_LAYOUT: KeyboardKey[][] = [
  [
    { code: "Backquote", label: "半/全", width: 1.35 },
    { code: "Digit1", label: "1", shiftLabel: "!" },
    { code: "Digit2", label: "2", shiftLabel: '"' },
    { code: "Digit3", label: "3", shiftLabel: "#" },
    { code: "Digit4", label: "4", shiftLabel: "$" },
    { code: "Digit5", label: "5", shiftLabel: "%" },
    { code: "Digit6", label: "6", shiftLabel: "&" },
    { code: "Digit7", label: "7", shiftLabel: "'" },
    { code: "Digit8", label: "8", shiftLabel: "(" },
    { code: "Digit9", label: "9", shiftLabel: ")" },
    { code: "Digit0", label: "0" },
    { code: "Minus", label: "-", shiftLabel: "=" },
    { code: "Equal", label: "^", shiftLabel: "~" },
    { code: "IntlYen", label: "¥", shiftLabel: "|" },
    { code: "Backspace", label: "Back", width: 2 },
  ],
  [
    { code: "Tab", label: "Tab", width: 1.6 },
    { code: "KeyQ", label: "Q" },
    { code: "KeyW", label: "W" },
    { code: "KeyE", label: "E" },
    { code: "KeyR", label: "R" },
    { code: "KeyT", label: "T" },
    { code: "KeyY", label: "Y" },
    { code: "KeyU", label: "U" },
    { code: "KeyI", label: "I" },
    { code: "KeyO", label: "O" },
    { code: "KeyP", label: "P" },
    { code: "BracketLeft", label: "@", shiftLabel: "`" },
    { code: "BracketRight", label: "[", shiftLabel: "{" },
  ],
  [
    { code: "CapsLock", label: "Caps", width: 1.8 },
    { code: "KeyA", label: "A" },
    { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" },
    { code: "KeyF", label: "F" },
    { code: "KeyG", label: "G" },
    { code: "KeyH", label: "H" },
    { code: "KeyJ", label: "J" },
    { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" },
    { code: "Semicolon", label: ";", shiftLabel: "+" },
    { code: "Quote", label: ":", shiftLabel: "*" },
    { code: "Backslash", label: "]", shiftLabel: "}" },
    { code: "Enter", label: "Enter", width: 2.2 },
  ],
  [
    { code: "ShiftLeft", label: "Shift", width: 2.4 },
    { code: "KeyZ", label: "Z" },
    { code: "KeyX", label: "X" },
    { code: "KeyC", label: "C" },
    { code: "KeyV", label: "V" },
    { code: "KeyB", label: "B" },
    { code: "KeyN", label: "N" },
    { code: "KeyM", label: "M" },
    { code: "Comma", label: ",", shiftLabel: "<" },
    { code: "Period", label: ".", shiftLabel: ">" },
    { code: "Slash", label: "/", shiftLabel: "?" },
    { code: "IntlRo", label: "\\", shiftLabel: "_" },
    { code: "ShiftRight", label: "Shift", width: 2.8 },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", width: 1.4 },
    { code: "AltLeft", label: "Alt", width: 1.4 },
    { code: "Space", label: "Space", width: 6.2 },
    { code: "AltRight", label: "Alt", width: 1.4 },
    { code: "ControlRight", label: "Ctrl", width: 1.4 },
  ],
];

const KEY_LABELS: Record<string, string> = KEYBOARD_LAYOUT.flat().reduce<
  Record<string, string>
>((labels, key) => {
  labels[key.code] = key.label;
  return labels;
}, {});

const formatter = new Intl.DateTimeFormat("ja-JP", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const INTELLISENSE_CANDIDATES: Record<Language, IntelliSenseCandidate[]> = {
  typescript: [
    createCandidate("const", "keyword", "再代入しない値を宣言します。"),
    createCandidate("let", "keyword", "あとで値を変えられる変数を宣言します。"),
    createCandidate("function", "keyword", "名前付きの処理を定義します。"),
    createCandidate("return", "keyword", "関数から値を返します。"),
    createCandidate("type", "keyword", "データの形に名前を付けます。"),
    createCandidate("string", "type", "文字列を表す型です。"),
    createCandidate("number", "type", "数値を表す型です。"),
    createCandidate("console.log", "function", "コンソールへ値を表示します。"),
    createCandidate("filter", "function", "条件に合う要素だけを取り出します。"),
    createCandidate("users", "variable", "ユーザー一覧を想定した配列です。"),
    createCandidate("user", "variable", "1人分のユーザーを表します。"),
    createCandidate("active", "property", "有効状態を表すプロパティです。"),
    createCandidate("items", "variable", "要素の一覧を表す配列です。"),
    createCandidate("item", "variable", "一覧から取り出した1つの要素です。"),
    createCandidate("total", "variable", "合計値を入れる変数です。"),
    createCandidate("price", "property", "価格を表すプロパティです。"),
    createCandidate("Profile", "type", "プロフィールの型名です。"),
    createCandidate("name", "property", "名前を表す項目です。"),
    createCandidate("level", "property", "レベルを表す項目です。"),
    createCandidate("score", "variable", "点数を表す変数です。"),
  ],
  python: [
    createCandidate("def", "keyword", "関数を定義します。"),
    createCandidate("return", "keyword", "関数から値を返します。"),
    createCandidate("if", "keyword", "条件分岐を作ります。"),
    createCandidate("for", "keyword", "要素を順番に処理します。"),
    createCandidate("in", "keyword", "ループや所属判定に使います。"),
    createCandidate("print", "function", "標準出力に値を表示します。"),
    createCandidate("range", "function", "連続した数値を作ります。"),
    createCandidate("str", "type", "文字列を表す型ヒントです。"),
    createCandidate("total", "variable", "合計値を入れる変数です。"),
    createCandidate("user_name", "variable", "ユーザー名を入れる変数です。"),
    createCandidate("items", "variable", "要素の一覧を表すリストです。"),
    createCandidate("item", "variable", "一覧から取り出した1つの要素です。"),
    createCandidate("price", "property", "価格を表すキーです。"),
    createCandidate("profile", "variable", "プロフィール情報を入れる辞書です。"),
    createCandidate("name", "property", "名前を表すキーです。"),
    createCandidate("level", "property", "レベルを表すキーです。"),
    createCandidate("numbers", "variable", "数値リストを入れる変数です。"),
    createCandidate("value", "variable", "内包表記で取り出す値です。"),
    createCandidate("score", "variable", "点数を表す変数です。"),
  ],
};

export class TypingForEnjoyApp {
  private readonly root: HTMLElement;
  private state: AppState;
  private sessionTicker: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = {
      screen: "menu",
      language: "typescript",
      difficulty: "easy",
      intellisenseEnabled: this.loadIntellisenseSetting(),
      history: this.loadHistory(),
      session: null,
      result: null,
    };

    this.root.addEventListener("click", this.handleClick);
    this.root.addEventListener("keydown", this.handleChoiceKeydown);
    window.addEventListener("keydown", this.handleGlobalKeydown);

    this.render();
  }

  private handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>("[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    if (action === "start-session") {
      this.startSession();
      return;
    }

    if (action === "select-language") {
      this.state.language = button.dataset.value as Language;
      this.render();
      return;
    }

    if (action === "select-difficulty") {
      this.state.difficulty = button.dataset.value as Difficulty;
      this.render();
      return;
    }

    if (action === "back-to-menu") {
      this.returnToMenu();
      return;
    }

    if (action === "retry-session") {
      this.startSession();
      return;
    }

    if (action === "reset-history") {
      this.resetHistory();
      return;
    }

    if (action === "toggle-intellisense") {
      this.toggleIntelliSense();
    }
  };

  private handleChoiceKeydown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>("[data-option-group]");
    if (!button) {
      return;
    }

    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const group = button.dataset.optionGroup;
    const buttons = Array.from(
      this.root.querySelectorAll<HTMLButtonElement>(
        `[data-option-group="${group}"]`,
      ),
    );
    const currentIndex = buttons.indexOf(button);
    const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const nextButton =
      buttons[(currentIndex + direction + buttons.length) % buttons.length];

    nextButton.focus();
    nextButton.click();
  };

  private handleGlobalKeydown = (event: KeyboardEvent) => {
    if (this.state.screen === "session") {
      this.handleTypingInput(event);
      return;
    }

    if (this.state.screen === "result") {
      if (event.key === "Enter") {
        event.preventDefault();
        this.startSession();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        this.returnToMenu();
      }
    }
  };

  private startSession() {
    const pool = getSnippetPool(this.state.language, this.state.difficulty);
    if (pool.length === 0) {
      return;
    }

    const queue = shuffle(pool);
    this.state.session = {
      language: this.state.language,
      difficulty: this.state.difficulty,
      pool,
      queue,
      currentIndex: 0,
      currentSnippet: queue[0],
      progress: 0,
      startedAt: Date.now(),
      correctStrokes: 0,
      assistedCharacters: 0,
      assistedCompletions: 0,
      errorCount: 0,
      totalKeystrokes: 0,
      completedSnippets: 0,
      keyStats: {},
      lastPressedCode: null,
      lastPressedWasCorrect: null,
      selectedSuggestionIndex: 0,
    };
    this.state.result = null;
    this.state.screen = "session";
    this.startTicker();
    this.render();
  }

  private handleTypingInput(event: KeyboardEvent) {
    const session = this.state.session;
    if (!session || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.finishSession();
      return;
    }

    if (this.state.intellisenseEnabled && event.key === "ArrowDown") {
      event.preventDefault();
      this.moveSuggestionSelection(session, 1);
      return;
    }

    if (this.state.intellisenseEnabled && event.key === "ArrowUp") {
      event.preventDefault();
      this.moveSuggestionSelection(session, -1);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      if (this.state.intellisenseEnabled) {
        this.applySelectedSuggestion(session);
      }
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      return;
    }

    const inputChar = normalizeInput(event);
    if (inputChar === null) {
      return;
    }

    event.preventDefault();

    const expectedChar = session.currentSnippet.code[session.progress];
    if (!expectedChar) {
      return;
    }

    session.totalKeystrokes += 1;
    session.lastPressedCode = event.code;
    session.lastPressedWasCorrect = inputChar === expectedChar;
    session.selectedSuggestionIndex = 0;

    const stat = getOrCreateKeyStat(session.keyStats, expectedChar);
    if (inputChar === expectedChar) {
      session.correctStrokes += 1;
      stat.hits += 1;
      session.progress += 1;

      if (session.progress >= session.currentSnippet.code.length) {
        session.completedSnippets += 1;
        this.advanceSnippet(session);
      }
    } else {
      session.errorCount += 1;
      stat.misses += 1;
      stat.mistakesByTyped[inputChar] = (stat.mistakesByTyped[inputChar] ?? 0) + 1;
    }

    this.render();
  }

  private moveSuggestionSelection(session: ActiveSession, direction: number) {
    const suggestions = getIntelliSenseSuggestions(session);
    if (suggestions.length === 0) {
      return;
    }

    session.selectedSuggestionIndex =
      (session.selectedSuggestionIndex + direction + suggestions.length) %
      suggestions.length;
    this.render();
  }

  private applySelectedSuggestion(session: ActiveSession) {
    const suggestions = getIntelliSenseSuggestions(session);
    if (suggestions.length === 0) {
      return;
    }

    const index = clampIndex(session.selectedSuggestionIndex, suggestions.length);
    const suggestion = suggestions[index];
    const token = getCurrentTokenContext(
      session.currentSnippet.code,
      session.progress,
    );
    if (!token || !suggestion.insertText.startsWith(token.prefix)) {
      return;
    }

    const assistedText = suggestion.insertText.slice(token.prefix.length);
    if (assistedText.length === 0) {
      return;
    }

    const expectedText = session.currentSnippet.code.slice(
      session.progress,
      session.progress + assistedText.length,
    );
    if (expectedText !== assistedText) {
      return;
    }

    session.progress += assistedText.length;
    session.assistedCharacters += assistedText.length;
    session.assistedCompletions += 1;
    session.selectedSuggestionIndex = 0;
    session.lastPressedCode = "Tab";
    session.lastPressedWasCorrect = true;

    if (session.progress >= session.currentSnippet.code.length) {
      session.completedSnippets += 1;
      this.advanceSnippet(session);
    }

    this.render();
  }

  private advanceSnippet(session: ActiveSession) {
    session.currentIndex += 1;
    if (session.currentIndex >= session.queue.length) {
      const refreshedPool = getSnippetPool(session.language, session.difficulty);
      session.pool = refreshedPool.length > 0 ? refreshedPool : session.pool;
      session.queue = shuffle(session.pool);
      session.currentIndex = 0;
    }

    session.currentSnippet = session.queue[session.currentIndex];
    session.progress = 0;
    session.lastPressedCode = null;
    session.lastPressedWasCorrect = null;
    session.selectedSuggestionIndex = 0;
  }

  private finishSession() {
    const session = this.state.session;
    if (!session) {
      return;
    }

    const record: SessionRecord = {
      id: globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`,
      endedAt: Date.now(),
      language: session.language,
      difficulty: session.difficulty,
      durationMs: Date.now() - session.startedAt,
      correctStrokes: session.correctStrokes,
      assistedCharacters: session.assistedCharacters,
      assistedCompletions: session.assistedCompletions,
      mistakeCount: session.errorCount,
      totalKeystrokes: session.totalKeystrokes,
      accuracy: calculateAccuracy(session.correctStrokes, session.totalKeystrokes),
      completedSnippets: session.completedSnippets,
      keyStats: session.keyStats,
    };

    this.state.history = [record, ...this.state.history].slice(0, MAX_HISTORY);
    this.state.result = record;
    this.state.session = null;
    this.state.screen = "result";
    this.stopTicker();
    this.persistHistory();
    this.render();
  }

  private returnToMenu() {
    this.state.screen = "menu";
    this.state.result = null;
    this.state.session = null;
    this.stopTicker();
    this.render();
  }

  private startTicker() {
    this.stopTicker();
    this.sessionTicker = window.setInterval(() => {
      if (this.state.screen === "session") {
        this.render();
      }
    }, 1000);
  }

  private stopTicker() {
    if (this.sessionTicker !== null) {
      window.clearInterval(this.sessionTicker);
      this.sessionTicker = null;
    }
  }

  private loadHistory(): SessionRecord[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as { history?: SessionRecord[] };
      return Array.isArray(parsed.history) ? parsed.history : [];
    } catch {
      return [];
    }
  }

  private loadIntellisenseSetting() {
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) {
        return true;
      }

      const parsed = JSON.parse(raw) as { intellisenseEnabled?: boolean };
      return parsed.intellisenseEnabled ?? true;
    } catch {
      return true;
    }
  }

  private persistHistory() {
    const payload = JSON.stringify({ history: this.state.history });
    window.localStorage.setItem(STORAGE_KEY, payload);
  }

  private persistSettings() {
    const payload = JSON.stringify({
      intellisenseEnabled: this.state.intellisenseEnabled,
    });
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, payload);
  }

  private toggleIntelliSense() {
    this.state.intellisenseEnabled = !this.state.intellisenseEnabled;
    if (this.state.session) {
      this.state.session.selectedSuggestionIndex = 0;
    }
    this.persistSettings();
    this.render();
  }

  private resetHistory() {
    if (this.state.history.length === 0) {
      return;
    }

    const shouldReset = window.confirm("履歴をリセットしますか？");
    if (!shouldReset) {
      return;
    }

    this.state.history = [];
    this.state.result = null;
    window.localStorage.removeItem(STORAGE_KEY);
    this.render();
  }

  private render() {
    document.title =
      this.state.screen === "session"
        ? "Typing Session | TypingForEnjoyWorkStore"
        : "TypingForEnjoyWorkStore";

    const view =
      this.state.screen === "menu"
        ? this.renderMenu()
        : this.state.screen === "session"
          ? this.renderSession()
          : this.renderResult();

    this.root.innerHTML = view;
  }

  private renderMenu() {
    const aggregateWeakKeys = summarizeWeakKeys(this.state.history);
    const recentHistory = this.state.history.slice(0, 4);
    const totalCompleted = this.state.history.reduce(
      (sum, record) => sum + record.completedSnippets,
      0,
    );
    const totalMistakes = this.state.history.reduce(
      (sum, record) => sum + record.mistakeCount,
      0,
    );
    const totalAssisted = this.state.history.reduce(
      (sum, record) => sum + (record.assistedCharacters ?? 0),
      0,
    );
    const averageAccuracy =
      this.state.history.length > 0
        ? this.state.history.reduce((sum, record) => sum + record.accuracy, 0) /
          this.state.history.length
        : 0;

    return `
      <div class="app-shell app-shell--menu">
        <header class="panel topbar">
          <div class="topbar__group">
            <h1 class="app-title">TypingForEnjoyWorkStore</h1>
            <div class="topbar__ornament"></div>
          </div>
          <div class="topbar__meta">
            <div class="shortcut-strip" aria-hidden="true">
              <span>Tab</span>
              <span>Enter</span>
              <span>Arrow</span>
            </div>
            <button
              class="secondary-button"
              data-action="toggle-intellisense"
              aria-pressed="${this.state.intellisenseEnabled}"
            >
              IntelliSense ${this.state.intellisenseEnabled ? "ON" : "OFF"}
            </button>
            <button
              class="secondary-button secondary-button--danger"
              data-action="reset-history"
              ${this.state.history.length === 0 ? "disabled" : ""}
            >
              Reset History
            </button>
          </div>
        </header>

        <main class="menu-grid">
          <section class="panel control-panel">
            <div class="panel-head">
              <h2>Mode</h2>
            </div>

            <div class="choice-block">
              <div class="choice-label">Language</div>
              <div class="choice-grid" role="radiogroup" aria-label="Language">
                ${this.renderChoiceButton("language", "typescript", "TypeScript")}
                ${this.renderChoiceButton("language", "python", "Python")}
              </div>
            </div>

            <div class="choice-block">
              <div class="choice-label">Difficulty</div>
              <div class="choice-grid" role="radiogroup" aria-label="Difficulty">
                ${this.renderChoiceButton("difficulty", "easy", "Easy")}
                ${this.renderChoiceButton("difficulty", "normal", "Normal")}
              </div>
            </div>

            <div class="control-panel__footer">
              <button class="primary-button" data-action="start-session">
                Start
              </button>
            </div>
          </section>

          <section class="panel overview-panel">
            <div class="panel-head">
              <h2>Overview</h2>
            </div>

            <div class="stat-grid stat-grid--compact">
              ${renderStatCard("Sessions", `${this.state.history.length}`)}
              ${renderStatCard(
                "Average",
                this.state.history.length > 0 ? `${averageAccuracy.toFixed(1)}%` : "-",
              )}
              ${renderStatCard("Solved", `${totalCompleted}`)}
              ${renderStatCard("Misses", `${totalMistakes}`)}
              ${renderStatCard("Assist", `${totalAssisted}`)}
            </div>

            <div class="panel-head panel-head--tight">
              <h2>Weak Keys</h2>
            </div>
            ${renderWeakKeyList(aggregateWeakKeys, "No history", 4)}
          </section>

          <section class="panel history-panel">
            <div class="panel-head">
              <h2>Recent</h2>
            </div>
            ${
              recentHistory.length > 0
                ? `
                  <div class="history-list">
                    ${recentHistory
                      .map(
                        (record) => `
                          <article class="history-item">
                            <div class="history-item__head">
                              <span class="history-item__title">${formatLanguage(record.language)} / ${formatDifficulty(record.difficulty)}</span>
                              <span>${formatter.format(record.endedAt)}</span>
                            </div>
                            <div class="history-item__body">
                              <span>${record.completedSnippets} solved</span>
                              <span>${record.accuracy.toFixed(1)}%</span>
                              <span>×${record.mistakeCount}</span>
                            </div>
                          </article>
                        `,
                      )
                      .join("")}
                  </div>
                `
                : `<p class="empty-note">No history</p>`
            }
          </section>
        </main>
      </div>
    `;
  }

  private renderChoiceButton(
    group: "language" | "difficulty",
    value: Language | Difficulty,
    title: string,
    description?: string,
  ) {
    const selected =
      group === "language" ? this.state.language === value : this.state.difficulty === value;
    const action = group === "language" ? "select-language" : "select-difficulty";

    return `
      <button
        class="choice-card ${selected ? "choice-card--selected" : ""}"
        data-action="${action}"
        data-option-group="${group}"
        data-value="${value}"
        role="radio"
        aria-checked="${selected}"
      >
        <span class="choice-card__title">${title}</span>
        ${description ? `<span class="choice-card__detail">${description}</span>` : ""}
      </button>
    `;
  }

  private renderSession() {
    const session = this.state.session;
    if (!session) {
      return "";
    }

    const elapsedMs = Date.now() - session.startedAt;
    const accuracy = calculateAccuracy(session.correctStrokes, session.totalKeystrokes);
    const progressRate =
      session.currentSnippet.code.length > 0
        ? (session.progress / session.currentSnippet.code.length) * 100
        : 0;
    const expectedChar = session.currentSnippet.code[session.progress] ?? "";
    const expectedKey = describeExpectedKey(expectedChar);
    const expectedCodes = getExpectedCodes(expectedChar);
    const liveWeakKeys = summarizeWeakKeys([serializeLiveSession(session)]);
    const suggestions = this.state.intellisenseEnabled
      ? getIntelliSenseSuggestions(session)
      : [];
    const selectedSuggestionIndex = clampIndex(
      session.selectedSuggestionIndex,
      suggestions.length,
    );
    const snippetSourceLabel = formatSnippetSource(session.currentSnippet);
    const promptCodeClass = getPromptCodeClass(session.currentSnippet.code);

    return `
      <div class="app-shell app-shell--session">
        <header class="panel topbar topbar--session">
          <div class="topbar__group">
            <h1 class="app-title">${formatLanguage(session.language)} / ${formatDifficulty(session.difficulty)}</h1>
          </div>
          <div class="topbar__meta topbar__meta--session">
            <button
              class="secondary-button"
              data-action="toggle-intellisense"
              aria-pressed="${this.state.intellisenseEnabled}"
            >
              IntelliSense ${this.state.intellisenseEnabled ? "ON" : "OFF"}
            </button>
            <div class="session-chip">
              <span class="session-chip__label">Next</span>
              <span class="session-chip__value">${escapeHtml(displayKeyLabel(expectedChar))}</span>
              <span class="session-chip__detail">${escapeHtml(expectedKey)}</span>
            </div>
            <div class="session-stop">
              <span>Esc</span>
              <small>End</small>
            </div>
          </div>
        </header>

        <main class="session-layout">
          <section class="panel prompt-panel">
            <div class="prompt-panel__top">
              <span class="prompt-title">
                ${escapeHtml(session.currentSnippet.title)}
                <span class="prompt-source">${snippetSourceLabel}</span>
              </span>
              <span class="prompt-count">${session.progress}/${session.currentSnippet.code.length}</span>
            </div>

            <div class="progress-strip">
              <div class="progress-strip__bar" style="width:${progressRate.toFixed(2)}%"></div>
            </div>

            <div class="prompt-code ${promptCodeClass}">
              ${renderSnippet(session.currentSnippet.code, session.progress)}
            </div>

            ${renderIntelliSensePanel(
              suggestions,
              selectedSuggestionIndex,
              this.state.intellisenseEnabled,
            )}
          </section>

          <aside class="panel side-panel">
            <div class="stat-grid stat-grid--compact">
              ${renderStatCard("Time", formatDuration(elapsedMs))}
              ${renderStatCard("Solved", `${session.completedSnippets}`)}
              ${renderStatCard("Hits", `${session.correctStrokes}`)}
              ${renderStatCard("Acc", `${accuracy.toFixed(1)}%`)}
              ${renderStatCard("Assist", `${session.assistedCharacters}`)}
            </div>

            <div class="panel-head panel-head--tight">
              <h2>Weak Keys</h2>
            </div>
            ${renderWeakKeyList(liveWeakKeys, "No misses", 3)}
          </aside>

          <section class="panel explanation-panel">
            ${renderExplanationPanel(session.currentSnippet)}
          </section>

          <section class="panel keyboard-panel">
            <div class="keyboard">
              ${KEYBOARD_LAYOUT.map((row) =>
                `<div class="keyboard-row">${row
                  .map((key) => {
                    const isExpected = expectedCodes.includes(key.code);
                    const isShiftSymbolExpected = key.shiftLabel === expectedChar;
                    const isBaseSymbolExpected =
                      key.label === expectedChar ||
                      (expectedChar === " " && key.code === "Space") ||
                      (expectedChar === "\n" && key.code === "Enter");
                    const isPressed = session.lastPressedCode === key.code;
                    const isWrong = isPressed && session.lastPressedWasCorrect === false;
                    const classes = [
                      "keyboard-key",
                      isExpected ? "keyboard-key--expected" : "",
                      isShiftSymbolExpected ? "keyboard-key--shift-target" : "",
                      isBaseSymbolExpected ? "keyboard-key--base-target" : "",
                      isPressed ? "keyboard-key--pressed" : "",
                      isWrong ? "keyboard-key--wrong" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return `
                      <div class="${classes}" style="--key-width:${key.width ?? 1}">
                        ${renderKeyboardKeyLabel(key, expectedChar)}
                      </div>
                    `;
                  })
                  .join("")}</div>`,
              ).join("")}
            </div>
          </section>
        </main>
      </div>
    `;
  }

  private renderResult() {
    const result = this.state.result;
    if (!result) {
      return "";
    }

    const cumulativeWeakKeys = summarizeWeakKeys(this.state.history);
    const sessionWeakKeys = summarizeWeakKeys([result]);
    const topMistakes = summarizeMistakePairs(result.keyStats);

    return `
      <div class="app-shell app-shell--result">
        <section class="panel result-shell">
          <header class="topbar topbar--result">
            <div class="topbar__group">
              <h1 class="app-title">${formatLanguage(result.language)} / ${formatDifficulty(result.difficulty)}</h1>
              <div class="topbar__ornament"></div>
            </div>
            <div class="result-actions">
              <button class="secondary-button" data-action="back-to-menu">Menu</button>
              <button class="primary-button" data-action="retry-session">Retry</button>
            </div>
          </header>

          <div class="result-layout">
            <section class="result-main">
              <div class="result-grid">
                ${renderStatCard("Time", formatDuration(result.durationMs))}
                ${renderStatCard("Solved", `${result.completedSnippets}`)}
                ${renderStatCard("Hits", `${result.correctStrokes}`)}
                ${renderStatCard("Misses", `${result.mistakeCount}`)}
                ${renderStatCard("Keys", `${result.totalKeystrokes}`)}
                ${renderStatCard("Acc", `${result.accuracy.toFixed(1)}%`)}
                ${renderStatCard("Assist", `${result.assistedCharacters ?? 0}`)}
              </div>

              <section class="result-section">
                <div class="panel-head panel-head--tight">
                  <h2>Mistakes</h2>
                </div>
                ${
                  topMistakes.length > 0
                    ? `
                      <div class="mistake-list">
                        ${topMistakes
                          .map(
                            (item) => `
                              <article class="mistake-item">
                                <span class="mistake-item__expected">${escapeHtml(displayKeyLabel(item.expected))}</span>
                                <span class="mistake-item__typed">${escapeHtml(displayKeyLabel(item.typed))}</span>
                                <em>×${item.count}</em>
                              </article>
                            `,
                          )
                          .join("")}
                      </div>
                    `
                    : `<p class="empty-note">No pattern</p>`
                }
              </section>

              <p class="result-shortcut">
                <span>Enter</span>
                Retry
                <span>Esc</span>
                Menu
              </p>
            </section>

            <aside class="result-side">
              <section class="result-section">
                <div class="panel-head">
                  <h2>Session Weak Keys</h2>
                </div>
                ${renderWeakKeyList(sessionWeakKeys, "No misses", 4)}
              </section>

              <section class="result-section">
                <div class="panel-head panel-head--tight">
                  <h2>All Time</h2>
                </div>
                ${renderWeakKeyList(cumulativeWeakKeys, "No history", 4)}
              </section>
            </aside>
          </div>
        </section>
      </div>
    `;
  }
}

function renderStatCard(label: string, value: string) {
  return `
    <article class="stat-card">
      <span class="stat-card__label">${label}</span>
      <span class="stat-card__value">${value}</span>
    </article>
  `;
}

function renderWeakKeyList(
  items: Array<{ key: string; misses: number; accuracy: number }>,
  emptyMessage: string,
  limit = 5,
) {
  if (items.length === 0) {
    return `<p class="empty-note">${emptyMessage}</p>`;
  }

  return `
    <div class="weak-key-list">
      ${items
        .slice(0, limit)
        .map(
          (item) => `
            <article class="weak-key-item">
              <span class="weak-key-item__key">${escapeHtml(displayKeyLabel(item.key))}</span>
              <span>×${item.misses}</span>
              <span>${item.accuracy.toFixed(1)}%</span>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderIntelliSensePanel(
  suggestions: IntelliSenseCandidate[],
  selectedIndex: number,
  enabled: boolean,
) {
  if (!enabled) {
    return `
      <div class="intellisense-panel intellisense-panel--muted">
        <span class="intellisense-panel__status">IntelliSense OFF</span>
      </div>
    `;
  }

  if (suggestions.length === 0) {
    return `
      <div class="intellisense-panel intellisense-panel--muted">
        <span class="intellisense-panel__status">候補なし</span>
        <span class="intellisense-panel__hint">単語を入力すると候補が出ます</span>
      </div>
    `;
  }

  return `
    <div class="intellisense-panel">
      <div class="intellisense-panel__head">
        <span>IntelliSense</span>
        <span>↑↓ Select / Tab Complete</span>
      </div>
      <div class="suggestion-list">
        ${suggestions
          .map(
            (suggestion, index) => `
              <article class="suggestion-item ${
                index === selectedIndex ? "suggestion-item--selected" : ""
              }">
                <span class="suggestion-item__kind">${suggestion.kind}</span>
                <span class="suggestion-item__label">${escapeHtml(suggestion.label)}</span>
                <span class="suggestion-item__detail">${escapeHtml(suggestion.detail)}</span>
              </article>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderExplanationPanel(snippet: Snippet) {
  return `
    <div class="explanation-panel__content">
      <section class="meaning-panel">
        <div class="panel-head panel-head--tight">
          <h2>Meaning</h2>
        </div>
        <p class="meaning-panel__text">${escapeHtml(snippet.meaning)}</p>
      </section>
      <section class="notes-panel">
        <div class="panel-head panel-head--tight">
          <h2>Notes</h2>
        </div>
        <div class="meaning-panel__notes">
          ${snippet.notes
            .slice(0, 2)
            .map(
              (note) => `
                <div class="meaning-note">
                  <span class="meaning-note__mark"></span>
                  <span class="meaning-note__text">${escapeHtml(note)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderKeyboardKeyLabel(key: KeyboardKey, expectedChar: string) {
  if (!key.shiftLabel) {
    return `<span class="keyboard-key__single">${escapeHtml(key.label)}</span>`;
  }

  const shiftClass =
    key.shiftLabel === expectedChar ? " keyboard-key__shift--active" : "";
  const baseClass = key.label === expectedChar ? " keyboard-key__base--active" : "";

  return `
    <span class="keyboard-key__shift${shiftClass}">${escapeHtml(key.shiftLabel)}</span>
    <span class="keyboard-key__base${baseClass}">${escapeHtml(key.label)}</span>
  `;
}

function createCandidate(
  insertText: string,
  kind: IntelliSenseCandidate["kind"],
  detail: string,
): IntelliSenseCandidate {
  return {
    insertText,
    label: insertText,
    kind,
    detail,
  };
}

function getIntelliSenseSuggestions(session: ActiveSession) {
  const token = getCurrentTokenContext(
    session.currentSnippet.code,
    session.progress,
  );
  if (!token || token.prefix.length === 0) {
    return [];
  }

  const targetToken = getTargetToken(session.currentSnippet.code, token.start);
  const candidates = [...INTELLISENSE_CANDIDATES[session.language]];
  if (
    targetToken &&
    !candidates.some((candidate) => candidate.insertText === targetToken)
  ) {
    candidates.push(
      createCandidate(targetToken, "snippet", "この問題文に出てくる識別子です。"),
    );
  }

  const seen = new Set<string>();
  return candidates
    .filter((candidate) => {
      if (seen.has(candidate.insertText)) {
        return false;
      }

      seen.add(candidate.insertText);
      return (
        candidate.insertText.length > token.prefix.length &&
        candidate.insertText.startsWith(token.prefix) &&
        session.currentSnippet.code.startsWith(candidate.insertText, token.start)
      );
    })
    .slice(0, 5);
}

function getCurrentTokenContext(code: string, progress: number): TokenContext | null {
  let start = progress;
  while (start > 0 && isCompletionTokenChar(code[start - 1])) {
    start -= 1;
  }

  const prefix = code.slice(start, progress);
  if (!prefix || !isCompletionTokenChar(prefix[0])) {
    return null;
  }

  return { start, prefix };
}

function getTargetToken(code: string, start: number) {
  let end = start;
  while (end < code.length && isCompletionTokenChar(code[end])) {
    end += 1;
  }

  const token = code.slice(start, end);
  return token.length > 0 ? token : null;
}

function isCompletionTokenChar(char: string) {
  return /[A-Za-z0-9_.]/.test(char);
}

function clampIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
}

function renderSnippet(code: string, progress: number) {
  let currentLine = "";
  let lineNumber = 1;
  let html = "";

  for (let index = 0; index < code.length; index += 1) {
    const char = code[index];

    if (char === "\n") {
      if (index === progress) {
        currentLine += `<span class="prompt-char prompt-char--current prompt-char--newline">↵</span>`;
      }

      html += renderSnippetLine(lineNumber, currentLine);
      currentLine = "";
      lineNumber += 1;
      continue;
    }

    currentLine += renderSnippetChar(char, index, progress);
  }

  html += renderSnippetLine(lineNumber, currentLine);
  return html;
}

function renderSnippetLine(lineNumber: number, contents: string) {
  return `
    <div class="prompt-line">
      <span class="prompt-line__number">${lineNumber}</span>
      <span class="prompt-line__content">${contents || "&nbsp;"}</span>
    </div>
  `;
}

function renderSnippetChar(char: string, index: number, progress: number) {
  const classes = ["prompt-char"];
  if (index < progress) {
    classes.push("prompt-char--done");
  } else if (index === progress) {
    classes.push("prompt-char--current");
  }

  if (char === " ") {
    classes.push("prompt-char--space");
  }

  const safeText = char === " " ? "&nbsp;" : escapeHtml(char);
  return `<span class="${classes.join(" ")}">${safeText}</span>`;
}

function serializeLiveSession(session: ActiveSession): SessionRecord {
  return {
    id: "live-session",
    endedAt: Date.now(),
    language: session.language,
    difficulty: session.difficulty,
    durationMs: Date.now() - session.startedAt,
    correctStrokes: session.correctStrokes,
    assistedCharacters: session.assistedCharacters,
    assistedCompletions: session.assistedCompletions,
    mistakeCount: session.errorCount,
    totalKeystrokes: session.totalKeystrokes,
    accuracy: calculateAccuracy(session.correctStrokes, session.totalKeystrokes),
    completedSnippets: session.completedSnippets,
    keyStats: session.keyStats,
  };
}

function getOrCreateKeyStat(stats: Record<string, KeyStat>, expected: string): KeyStat {
  if (!stats[expected]) {
    stats[expected] = {
      expected,
      hits: 0,
      misses: 0,
      mistakesByTyped: {},
    };
  }

  return stats[expected];
}

function normalizeInput(event: KeyboardEvent): string | null {
  if (event.key === "Enter") {
    return "\n";
  }

  if (event.key.length === 1) {
    return event.key;
  }

  return null;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function calculateAccuracy(correct: number, total: number) {
  if (total === 0) {
    return 100;
  }

  return (correct / total) * 100;
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function displayKeyLabel(char: string) {
  if (char === " ") {
    return "Space";
  }

  if (char === "\n") {
    return "Enter";
  }

  return char;
}

function describeExpectedKey(char: string) {
  const meta = resolveExpectedKey(char);
  if (!meta) {
    return "入力待機";
  }

  const keyName = KEY_LABELS[meta.primaryCode] ?? meta.primaryCode;
  return meta.shift ? `Shift + ${keyName} -> ${displayKeyLabel(char)}` : keyName;
}

function getExpectedCodes(char: string) {
  const meta = resolveExpectedKey(char);
  if (!meta) {
    return [];
  }

  return meta.shift ? [meta.primaryCode, ...SHIFT_CODES] : [meta.primaryCode];
}

function resolveExpectedKey(char: string) {
  if (char === " ") {
    return { primaryCode: "Space", shift: false };
  }

  if (char === "\n") {
    return { primaryCode: "Enter", shift: false };
  }

  if (/^[a-z]$/.test(char)) {
    return { primaryCode: `Key${char.toUpperCase()}`, shift: false };
  }

  if (/^[A-Z]$/.test(char)) {
    return { primaryCode: `Key${char}`, shift: true };
  }

  if (BASE_SYMBOL_CODES[char]) {
    return { primaryCode: BASE_SYMBOL_CODES[char], shift: false };
  }

  if (SHIFT_SYMBOL_CODES[char]) {
    return { primaryCode: SHIFT_SYMBOL_CODES[char], shift: true };
  }

  return null;
}

function summarizeWeakKeys(history: SessionRecord[]) {
  const merged = new Map<string, { hits: number; misses: number }>();

  for (const record of history) {
    for (const stat of Object.values(record.keyStats)) {
      const current = merged.get(stat.expected) ?? { hits: 0, misses: 0 };
      current.hits += stat.hits;
      current.misses += stat.misses;
      merged.set(stat.expected, current);
    }
  }

  return [...merged.entries()]
    .map(([key, value]) => ({
      key,
      misses: value.misses,
      accuracy:
        value.hits + value.misses > 0
          ? (value.hits / (value.hits + value.misses)) * 100
          : 100,
    }))
    .filter((item) => item.misses > 0)
    .sort((left, right) => {
      if (right.misses !== left.misses) {
        return right.misses - left.misses;
      }

      return left.accuracy - right.accuracy;
    });
}

function summarizeMistakePairs(keyStats: Record<string, KeyStat>) {
  const pairs: Array<{ expected: string; typed: string; count: number }> = [];

  for (const stat of Object.values(keyStats)) {
    for (const [typed, count] of Object.entries(stat.mistakesByTyped)) {
      pairs.push({
        expected: stat.expected,
        typed,
        count,
      });
    }
  }

  return pairs.sort((left, right) => right.count - left.count).slice(0, 5);
}

function formatLanguage(language: Language) {
  return language === "typescript" ? "TypeScript" : "Python";
}

function formatDifficulty(difficulty: Difficulty) {
  return difficulty === "easy" ? "Easy" : "Normal";
}

function formatSnippetSource(snippet: Snippet) {
  return snippet.source === "generated" ? "Generated" : "Fixed";
}

function getPromptCodeClass(code: string) {
  const lines = code.split("\n");
  const longestLine = lines.reduce(
    (maxLength, line) => Math.max(maxLength, line.length),
    0,
  );

  if (code.length > 165 || lines.length >= 5 || longestLine > 56) {
    return "prompt-code--ultra";
  }

  if (code.length > 105 || lines.length >= 4 || longestLine > 42) {
    return "prompt-code--dense";
  }

  return "";
}
