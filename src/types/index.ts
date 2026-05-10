export type Difficulty = "easy" | "mid" | "hard";

export interface Question {
  id: string;
  q: string;
  diff: Difficulty;
  tags?: string[];
  answer: string;
}

export interface QuestionComment {
  id: string;
  question_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  label: string;
  desc: string;
  questions: Question[];
}

export type Theme = "auto" | "light" | "dark";
export type DiffFilter = "all" | Difficulty;

export interface AppState {
  activeCategoryId: string;
  reviewedIds: Set<string>;
  openIds: Set<string>;
  search: string;
  diffFilter: DiffFilter;
  theme: Theme;
}
