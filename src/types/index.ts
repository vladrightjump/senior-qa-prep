export type Difficulty = "easy" | "mid" | "hard";

export interface QuestionMedia {
  type: "image" | "video" | "youtube";
  src: string;
  caption?: string;
  alt?: string;
  poster?: string;
}

export interface Question {
  id: string;
  q: string;
  diff: Difficulty;
  tags?: string[];
  answer: string;
  // Optional Mermaid diagram source (e.g. `graph TD; A-->B`). Rendered above
  // the answer body when present.
  diagram?: string;
  // Optional rich media (images, video clips, YouTube embeds) rendered below
  // the diagram and above the answer body.
  media?: QuestionMedia[];
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

export interface CategoryGroup {
  id: string;
  label: string;
  categoryIds: string[];
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
