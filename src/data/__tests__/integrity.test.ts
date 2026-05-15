import { describe, it, expect } from "vitest";
import { CATEGORIES } from "../questions";

describe("CATEGORIES data integrity", () => {
  it("contains at least one category", () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });

  it("every category has a non-empty id, label, and questions array", () => {
    for (const c of CATEGORIES) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(Array.isArray(c.questions)).toBe(true);
      expect(c.questions.length).toBeGreaterThan(0);
    }
  });

  it("all question ids are unique app-wide", () => {
    const seen = new Map<string, string>();
    for (const c of CATEGORIES) {
      for (const q of c.questions) {
        expect(q.id, `missing id in category ${c.id}`).toBeTruthy();
        if (seen.has(q.id)) {
          throw new Error(
            `Duplicate question id ${q.id} in categories "${seen.get(q.id)}" and "${c.id}"`,
          );
        }
        seen.set(q.id, c.id);
      }
    }
  });

  it("all category ids are unique", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every question has q, diff, and answer", () => {
    const valid = new Set(["easy", "mid", "hard"]);
    for (const c of CATEGORIES) {
      for (const q of c.questions) {
        expect(q.q, `category ${c.id}`).toBeTruthy();
        expect(q.answer, `q ${q.id}`).toBeTruthy();
        expect(valid.has(q.diff), `q ${q.id} diff=${q.diff}`).toBe(true);
      }
    }
  });

  it("optional media entries are well-formed when present", () => {
    const validTypes = new Set(["image", "video", "youtube"]);
    for (const c of CATEGORIES) {
      for (const q of c.questions) {
        if (!q.media) continue;
        for (const m of q.media) {
          expect(validTypes.has(m.type), `q ${q.id} type=${m.type}`).toBe(true);
          expect(m.src, `q ${q.id} media src`).toBeTruthy();
        }
      }
    }
  });
});
