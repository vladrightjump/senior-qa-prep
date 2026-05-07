import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw, reviver) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value, replacer));
    } catch {
      /* quota or privacy mode — ignore */
    }
  }, [key, value]);

  return [value, setValue];
}

// Allow Set serialization
function replacer(_key: string, val: unknown) {
  if (val instanceof Set) {
    return { __set__: true, values: Array.from(val) };
  }
  return val;
}

function reviver(_key: string, val: unknown) {
  if (
    val !== null &&
    typeof val === "object" &&
    "__set__" in (val as Record<string, unknown>) &&
    Array.isArray((val as { values: unknown[] }).values)
  ) {
    return new Set((val as { values: unknown[] }).values);
  }
  return val;
}
