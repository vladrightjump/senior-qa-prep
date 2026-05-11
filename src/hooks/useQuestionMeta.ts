import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
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

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const arr = out.get(k);
    if (arr) arr.push(item);
    else out.set(k, [item]);
  }
  return out;
}

// One-time migration: push any localStorage reviewed IDs from previous app
// versions into the DB so progress isn't lost when we switch to server-side
// tracking. Idempotent — guarded by a flag in localStorage.
const MIGRATION_FLAG = "qa-reviewed-migrated-v1";
const LEGACY_KEYS = ["qa-prep-state-v3", "qa-prep-state-v2"];

function readLegacyReviewedIds(): string[] {
  const ids = new Set<string>();
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const r = parsed?.reviewedIds;
      // v2/v3 serialize Sets as { __set__: true, values: [...] }
      const values: unknown = r?.values ?? r;
      if (Array.isArray(values)) {
        for (const v of values) {
          if (typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v)) ids.add(v);
        }
      }
    } catch {
      /* ignore — stale or malformed state */
    }
  }
  return [...ids];
}

async function migrateLocalReviewedIfNeeded(): Promise<string[]> {
  if (localStorage.getItem(MIGRATION_FLAG)) return [];
  const legacy = readLegacyReviewedIds();
  if (legacy.length === 0) {
    localStorage.setItem(MIGRATION_FLAG, "1");
    return [];
  }
  const { error } = await supabase
    .from("qa_reviewed")
    .upsert(
      legacy.map((id) => ({ question_id: id })),
      { onConflict: "question_id" },
    );
  if (error) {
    // Don't set the flag — try again on next load.
    console.warn("Reviewed migration failed:", error.message);
    return [];
  }
  localStorage.setItem(MIGRATION_FLAG, "1");
  return legacy;
}

export function useQuestionMeta(): UseQuestionMetaResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<Set<string>>(() => new Set());
  const [reviewed, setReviewed] = useState<Set<string>>(() => new Set());
  const [commentsByQuestion, setCommentsByQuestion] = useState<
    Map<string, QuestionComment[]>
  >(() => new Map());

  // Mirrors of the state Sets that always reflect the latest value. The
  // toggle handlers need to read the current membership *synchronously* to
  // decide between insert and delete — state updater functions run later, so
  // closing over a side-effect-set variable inside setFlags() doesn't work.
  const flagsRef = useRef(flags);
  const reviewedRef = useRef(reviewed);
  useEffect(() => {
    flagsRef.current = flags;
  }, [flags]);
  useEffect(() => {
    reviewedRef.current = reviewed;
  }, [reviewed]);

  // Counts in-flight DB writes so we can warn the user before they refresh
  // or close the tab while changes haven't been persisted yet.
  const pendingWrites = useRef(0);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (pendingWrites.current > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
  const track = async <T,>(p: PromiseLike<T>): Promise<T> => {
    pendingWrites.current += 1;
    try {
      return await p;
    } finally {
      pendingWrites.current -= 1;
    }
  };

  // Initial load: migrate legacy local state, then fetch everything.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await migrateLocalReviewedIfNeeded();
      const [flagsRes, reviewedRes, commentsRes] = await Promise.all([
        supabase.from("qa_flags").select("question_id"),
        supabase.from("qa_reviewed").select("question_id"),
        supabase
          .from("qa_comments")
          .select("*")
          .order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      if (flagsRes.error || reviewedRes.error || commentsRes.error) {
        setError(
          flagsRes.error?.message ??
            reviewedRes.error?.message ??
            commentsRes.error?.message ??
            "Load failed",
        );
        setLoading(false);
        return;
      }
      setFlags(new Set((flagsRes.data ?? []).map((r) => r.question_id)));
      setReviewed(new Set((reviewedRes.data ?? []).map((r) => r.question_id)));
      setCommentsByQuestion(
        groupBy(commentsRes.data as QuestionComment[], (c) => c.question_id),
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime: keep flags, reviewed, and comments in sync across devices.
  useEffect(() => {
    const channel = supabase
      .channel("qa-meta")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "qa_flags" },
        (payload) => {
          setFlags((prev) => {
            const next = new Set(prev);
            if (payload.eventType === "INSERT") next.add(payload.new.question_id);
            else if (payload.eventType === "DELETE") next.delete(payload.old.question_id);
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "qa_reviewed" },
        (payload) => {
          setReviewed((prev) => {
            const next = new Set(prev);
            if (payload.eventType === "INSERT") next.add(payload.new.question_id);
            else if (payload.eventType === "DELETE") next.delete(payload.old.question_id);
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "qa_comments" },
        (payload) => {
          setCommentsByQuestion((prev) => {
            const next = new Map(prev);
            const upsert = (c: QuestionComment) => {
              const list = (next.get(c.question_id) ?? []).filter((x) => x.id !== c.id);
              list.push(c);
              list.sort((a, b) => a.created_at.localeCompare(b.created_at));
              next.set(c.question_id, list);
            };
            const remove = (c: QuestionComment) => {
              const list = (next.get(c.question_id) ?? []).filter((x) => x.id !== c.id);
              if (list.length) next.set(c.question_id, list);
              else next.delete(c.question_id);
            };
            if (payload.eventType === "INSERT") upsert(payload.new as QuestionComment);
            else if (payload.eventType === "UPDATE") upsert(payload.new as QuestionComment);
            else if (payload.eventType === "DELETE") remove(payload.old as QuestionComment);
            return next;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleFlag = useCallback(async (questionId: string) => {
    const willFlag = !flagsRef.current.has(questionId);
    setFlags((prev) => {
      const next = new Set(prev);
      if (willFlag) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
    const { error } = await track(
      willFlag
        ? supabase
            .from("qa_flags")
            .upsert({ question_id: questionId }, { onConflict: "question_id" })
        : supabase.from("qa_flags").delete().eq("question_id", questionId),
    );
    if (error) {
      setError(error.message);
      setFlags((prev) => {
        const next = new Set(prev);
        if (willFlag) next.delete(questionId);
        else next.add(questionId);
        return next;
      });
    }
  }, []);

  const toggleReviewed = useCallback(async (questionId: string) => {
    const willMark = !reviewedRef.current.has(questionId);
    setReviewed((prev) => {
      const next = new Set(prev);
      if (willMark) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
    const { error } = await track(
      willMark
        ? supabase
            .from("qa_reviewed")
            .upsert({ question_id: questionId }, { onConflict: "question_id" })
        : supabase.from("qa_reviewed").delete().eq("question_id", questionId),
    );
    if (error) {
      setError(error.message);
      setReviewed((prev) => {
        const next = new Set(prev);
        if (willMark) next.delete(questionId);
        else next.add(questionId);
        return next;
      });
    }
  }, []);

  const addComment = useCallback(async (questionId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const { data, error } = await track(
      supabase
        .from("qa_comments")
        .insert({ question_id: questionId, body: trimmed })
        .select()
        .single(),
    );
    if (error || !data) {
      setError(error?.message ?? "Add failed");
      return;
    }
    setCommentsByQuestion((prev) => {
      const next = new Map(prev);
      const list = [...(next.get(questionId) ?? []), data as QuestionComment];
      next.set(questionId, list);
      return next;
    });
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    let removed: QuestionComment | undefined;
    setCommentsByQuestion((prev) => {
      const next = new Map(prev);
      for (const [qId, list] of next) {
        const idx = list.findIndex((c) => c.id === commentId);
        if (idx >= 0) {
          removed = list[idx];
          const updated = list.filter((c) => c.id !== commentId);
          if (updated.length) next.set(qId, updated);
          else next.delete(qId);
          break;
        }
      }
      return next;
    });
    const { error } = await track(
      supabase.from("qa_comments").delete().eq("id", commentId),
    );
    if (error && removed) {
      setError(error.message);
      const restored = removed;
      setCommentsByQuestion((prev) => {
        const next = new Map(prev);
        const list = [...(next.get(restored.question_id) ?? []), restored];
        list.sort((a, b) => a.created_at.localeCompare(b.created_at));
        next.set(restored.question_id, list);
        return next;
      });
    }
  }, []);

  const editComment = useCallback(async (commentId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const { data, error } = await track(
      supabase
        .from("qa_comments")
        .update({ body: trimmed, updated_at: new Date().toISOString() })
        .eq("id", commentId)
        .select()
        .single(),
    );
    if (error || !data) {
      setError(error?.message ?? "Edit failed");
      return;
    }
    const updated = data as QuestionComment;
    setCommentsByQuestion((prev) => {
      const next = new Map(prev);
      const list = (next.get(updated.question_id) ?? []).map((c) =>
        c.id === updated.id ? updated : c,
      );
      next.set(updated.question_id, list);
      return next;
    });
  }, []);

  return {
    loading,
    error,
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
