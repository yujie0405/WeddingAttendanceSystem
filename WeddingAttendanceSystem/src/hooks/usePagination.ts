import { useState } from "react";
export function usePagination<T>(items: readonly T[], size: number) {
  const [requested, setRequested] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.max(1, Math.min(requested, pages));
  const start = (page - 1) * size;
  return {
    page,
    pages,
    total: items.length,
    size,
    start,
    items: items.slice(start, start + size),
    setPage: setRequested,
    reset: () => setRequested(1),
  };
}
