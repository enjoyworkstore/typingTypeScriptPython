export type Language = "typescript" | "python";
export type Difficulty = "easy" | "normal";

export interface Snippet {
  id: string;
  language: Language;
  difficulty: Difficulty;
  source?: "fixed" | "generated";
  title: string;
  description: string;
  meaning: string;
  notes: string[];
  code: string;
}

export interface KeyStat {
  expected: string;
  hits: number;
  misses: number;
  mistakesByTyped: Record<string, number>;
}

export interface SessionRecord {
  id: string;
  endedAt: number;
  language: Language;
  difficulty: Difficulty;
  durationMs: number;
  correctStrokes: number;
  assistedCharacters: number;
  assistedCompletions: number;
  mistakeCount: number;
  totalKeystrokes: number;
  accuracy: number;
  completedSnippets: number;
  keyStats: Record<string, KeyStat>;
}
