import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useLocalStorage } from "../useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => localStorage.clear());

  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("k", { x: 1 }));
    expect(result.current[0]).toEqual({ x: 1 });
  });

  it("persists primitive values across hook instances", () => {
    const first = renderHook(() => useLocalStorage<string>("greeting", "hi"));
    act(() => first.result.current[1]("hola"));
    expect(localStorage.getItem("greeting")).toContain("hola");

    const second = renderHook(() => useLocalStorage<string>("greeting", "hi"));
    expect(second.result.current[0]).toBe("hola");
  });

  it("serializes and revives Set values", () => {
    const { result } = renderHook(() =>
      useLocalStorage<Set<string>>("ids", new Set()),
    );
    act(() => result.current[1](new Set(["a", "b", "c"])));

    const raw = localStorage.getItem("ids");
    expect(raw).toContain("__set__");

    const remount = renderHook(() =>
      useLocalStorage<Set<string>>("ids", new Set()),
    );
    expect(remount.result.current[0]).toBeInstanceOf(Set);
    expect([...remount.result.current[0]].sort()).toEqual(["a", "b", "c"]);
  });

  it("serializes nested objects containing Sets", () => {
    interface State {
      open: Set<string>;
      label: string;
    }
    const { result } = renderHook(() =>
      useLocalStorage<State>("nested", { open: new Set(), label: "" }),
    );
    act(() =>
      result.current[1]({ open: new Set(["1", "2"]), label: "ready" }),
    );

    const remount = renderHook(() =>
      useLocalStorage<State>("nested", { open: new Set(), label: "" }),
    );
    expect(remount.result.current[0].label).toBe("ready");
    expect(remount.result.current[0].open).toBeInstanceOf(Set);
    expect(remount.result.current[0].open.has("1")).toBe(true);
  });

  it("falls back to the initial value when stored JSON is corrupt", () => {
    localStorage.setItem("broken", "{not json");
    const { result } = renderHook(() =>
      useLocalStorage<{ ok: boolean }>("broken", { ok: true }),
    );
    expect(result.current[0]).toEqual({ ok: true });
  });

  it("supports functional updates", () => {
    const { result } = renderHook(() => useLocalStorage<number>("count", 0));
    act(() => result.current[1]((p) => p + 1));
    act(() => result.current[1]((p) => p + 1));
    expect(result.current[0]).toBe(2);
  });
});
