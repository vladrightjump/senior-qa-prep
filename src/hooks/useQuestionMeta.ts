import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { QuestionComment } from "../types";

interface UseQuestionMetaResult {
  loading: boolean;
  error: string | null;
  flags: Set<string>;
  commentsByQuestion: Map<string, QuestionComment[]>;
  toggleFlag: (questionId: string) => Promise<void>;
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

export function useQuestionMeta(): UseQuestionMetaResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<Set<string>>(() => new Set());
  const [commentsByQuestion, setCommentsByQuestion] = useState<
    Map<string, QuestionComment[]>
  >(() => new Map());

  // Initial load: fetch all flags + comments in parallel.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [flagsRes, commentsRes] = await Promise.all([
        supabase.from("qa_flags").select("question_id"),
        supabase
          .from("qa_comments")
          .select("*")
          .order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      if (flagsRes.error || commentsRes.error) {
        setError(flagsRes.error?.message ?? commentsRes.error?.message ?? "Load failed");
        setLoading(false);
        return;
      }
      setFlags(new Set((flagsRes.data ?? []).map((r) => r.question_id)));
      setCommentsByQuestion(
        groupBy(commentsRes.data as QuestionComment[], (c) => c.question_id),
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime: keep flags + comments in sync across devices.
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
    let willFlag = false;
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
        willFlag = false;
      } else {
        next.add(questionId);
        willFlag = true;
      }
      return next;
    });
    const { error } = willFlag
      ? await supabase.from("qa_flags").insert({ question_id: questionId })
      : await supabase.from("qa_flags").delete().eq("question_id", questionId);
    if (error) {
      setError(error.message);
      // Revert optimistic update.
      setFlags((prev) => {
        const next = new Set(prev);
        if (willFlag) next.delete(questionId);
        else next.add(questionId);
        return next;
      });
    }
  }, []);

  const addComment = useCallback(async (questionId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const { data, error } = await supabase
      .from("qa_comments")
      .insert({ question_id: questionId, body: trimmed })
      .select()
      .single();
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
    const { error } = await supabase.from("qa_comments").delete().eq("id", commentId);
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
    const { data, error } = await supabase
      .from("qa_comments")
      .update({ body: trimmed, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .select()
      .single();
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
    commentsByQuestion,
    toggleFlag,
    addComment,
    deleteComment,
    editComment,
  };
}
