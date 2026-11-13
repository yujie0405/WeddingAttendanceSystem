export function Pagination({
  page,
  pages,
  total,
  setPage,
}: {
  page: number;
  pages: number;
  total: number;
  setPage: (n: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="admin-pagination" aria-label="列表分页">
      <button
        className="admin-outline-button"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        上一页
      </button>
      <span aria-live="polite">
        第 {page} / {pages} 页 · 共 {total} 条
      </span>
      <button
        className="admin-outline-button"
        disabled={page === pages}
        onClick={() => setPage(page + 1)}
      >
        下一页
      </button>
    </nav>
  );
}
