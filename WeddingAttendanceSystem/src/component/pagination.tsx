import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  if (pages <= 1) return null;
  return (
    <nav className="admin-pagination" aria-label={t("Common.Pagination")}>
      <button
        className="admin-outline-button"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        {t("Common.PreviousPage")}
      </button>
      <span aria-live="polite">
        {t("Common.PageInfo", { page, pages, total })}
      </span>
      <button
        className="admin-outline-button"
        disabled={page === pages}
        onClick={() => setPage(page + 1)}
      >
        {t("Common.NextPage")}
      </button>
    </nav>
  );
}
