import { useCallback, useEffect, useState } from "react";
import type { QuestionComment } from "../types";

interface UseQuestionMetaResult {
  loading: boolean;
  error: string | null;
  flags: Set<string>;
  reviewed: Set<string>;
  commentsByQuestion: Map<string, QuestionComment[]>;
  toggleFlag: (questionId: string) => Promise<void>;
  toggleReviewed: (questionId: string) => Promise<void>;
  addComment: (questionId: string, body: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  editComment: (commentId: string, body: string) => Promise<void>;
}

const FLAGS_KEY = "qa-flags-v1";
const REVIEWED_KEY = "qa-reviewed-v1";
const COMMENTS_KEY = "qa-comments-v1";

// One-time migration from the legacy v2/v3 combined state blob where
// reviewed IDs were stored inside qa-prep-state-v3.
const MIGRATION_FLAG = "qa-reviewed-migrated-local-v1";
const LEGACY_KEYS = ["qa-prep-state-v3", "qa-prep-state-v2"];

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed.filter((v) => typeof v === "string"));
  } catch {
    /* fall through */
  }
  return new Set();
}

function writeSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* quota / privacy mode — ignore */
  }
}

function readComments(): Map<string, QuestionComment[]> {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as QuestionComment[];
    if (!Array.isArray(parsed)) return new Map();
    const map = new Map<string, QuestionComment[]>();
    for (const c of parsed) {
      const list = map.get(c.question_id) ?? [];
      list.push(c);
      map.set(c.question_id, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.created_at.localeCompare(b.created_at));
    }
    return map;
  } catch {
    return new Map();
  }
}

function writeComments(map: Map<string, QuestionComment[]>): void {
  try {
    const flat: QuestionComment[] = [];
    for (const list of map.values()) flat.push(...list);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(flat));
  } catch {
    /* ignore */
  }
}

function migrateLegacyReviewed(current: Set<string>): Set<string> {
  if (localStorage.getItem(MIGRATION_FLAG)) return current;
  const merged = new Set(current);
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const r = parsed?.reviewedIds;
      const values: unknown = r?.values ?? r;
      if (Array.isArray(values)) {
        for (const v of values) if (typeof v === "string") merged.add(v);
      }
    } catch {
      /* ignore stale state */
    }
  }
  localStorage.setItem(MIGRATION_FLAG, "1");
  if (merged.size !== current.size) writeSet(REVIEWED_KEY, merged);
  return merged;
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function useQuestionMeta(): UseQuestionMetaResult {
  const [flags, setFlags] = useState<Set<string>>(() => readSet(FLAGS_KEY));
  const [reviewed, setReviewed] = useState<Set<string>>(() =>
    migrateLegacyReviewed(readSet(REVIEWED_KEY)),
  );
  const [commentsByQuestion, setCommentsByQuestion] = useState<
    Map<string, QuestionComment[]>
  >(() => readComments());

  useEffect(() => writeSet(FLAGS_KEY, flags), [flags]);
  useEffect(() => writeSet(REVIEWED_KEY, reviewed), [reviewed]);
  useEffect(() => writeComments(commentsByQuestion), [commentsByQuestion]);

  const toggleFlag = useCallback(async (questionId: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  const toggleReviewed = useCallback(async (questionId: string) => {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  const addComment = useCallback(async (questionId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const comment: QuestionComment = {
      id: newId(),
      question_id: questionId,
      body: trimmed,
      created_at: now,
      updated_at: now,
    };
    setCommentsByQuestion((prev) => {
      const next = new Map(prev);
      next.set(questionId, [...(next.get(questionId) ?? []), comment]);
      return next;
    });
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    setCommentsByQuestion((prev) => {
      const next = new Map(prev);
      for (const [qId, list] of next) {
        const updated = list.filter((c) => c.id !== commentId);
        if (updated.length !== list.length) {
          if (updated.length) next.set(qId, updated);
          else next.delete(qId);
          break;
        }
      }
      return next;
    });
  }, []);

  const editComment = useCallback(async (commentId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    setCommentsByQuestion((prev) => {
      const next = new Map(prev);
      for (const [qId, list] of next) {
        const idx = list.findIndex((c) => c.id === commentId);
        if (idx >= 0) {
          const updated = [...list];
          updated[idx] = { ...list[idx]!, body: trimmed, updated_at: now };
          next.set(qId, updated);
          break;
        }
      }
      return next;
    });
  }, []);

  return {
    loading: false,
    error: null,
    flags,
    reviewed,
    commentsByQuestion,
    toggleFlag,
    toggleReviewed,
    addComment,
    deleteComment,
    editComment,
  };
}
