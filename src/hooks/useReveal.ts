import { useEffect, useState } from "react";

/**
 * Mount-reveal with a guaranteed-visible fallback (ported from the prototype).
 *
 * phase 0 = hidden, 1 = animating in (`in`), 2 = settled (`in settled`, final
 * state force-locked with no dependency on the animation timeline). Driven by
 * `setTimeout` — which fires even in a backgrounded/throttled tab, unlike
 * `requestAnimationFrame` — so content can never get stuck hidden. Replays
 * whenever `key` changes (e.g. the active category).
 */
export function useReveal(key?: unknown): string {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 20);
    const t2 = setTimeout(() => setPhase(2), 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [key]);

  return phase === 0 ? "" : phase === 1 ? "in" : "in settled";
}
