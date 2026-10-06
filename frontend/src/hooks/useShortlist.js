import { useCallback, useEffect, useState } from "react";

const KEY = "bodhak_shortlist";

export const useShortlist = () => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const has = useCallback((id) => items.some((i) => i.id === id), [items]);
  const add = useCallback((inst) => setItems((prev) => (prev.some((i) => i.id === inst.id) ? prev : [...prev, inst])), []);
  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  return { items, has, add, remove, clear };
};
