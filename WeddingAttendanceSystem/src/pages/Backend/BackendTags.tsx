import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faTag, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { backend } from "../../api/backend";
import { LocalizedForm } from "../../component/LocalizedForm";
import { useBackendAdmin } from "../../hooks/useBackendAdmin";
import { formatRM } from "../../utils/format";

const colors = ["amber", "blue", "rose", "purple", "teal", "emerald"];
const load = async (signal: AbortSignal) => {
  const [tags, total] = await Promise.all([backend.tags(signal), backend.total(signal)]);
  return { tags, total };
};

export function BackendTags() {
  const { t, i18n } = useTranslation();
  const { data, loading, saving, error, saved, refresh, perform } = useBackendAdmin(load);
  const [name, setName] = useState("");
  return <section className="wedding-space-y-6" aria-label={t("Nav.Tags")}>
    <div className="wedding-bg-amber-50 wedding-p-4 wedding-rounded-xl wedding-border wedding-border-amber-200 wedding-space-y-1">
      <h2 className="wedding-text-xs wedding-font-bold wedding-text-amber-900 d-flex align-items-center wedding-gap-1-5">
        <FontAwesomeIcon icon={faGift} className="wedding-text-amber-700" /> {t("Admin.Dashboard.TotalTitle")}
      </h2>
      <p className="wedding-text-2xl wedding-font-extrabold wedding-text-amber-900 wedding-pt-1">
        {loading || !data ? "—" : formatRM(data.total.amount, i18n.resolvedLanguage)}
      </p>
      <p className="wedding-text-11px wedding-text-amber-700">{t("Backend.TotalHelp")}</p>
    </div>
    {error && <div role="alert"><p>{t(error)}</p><button className="admin-outline-button" onClick={refresh}>{t("Backend.Retry")}</button></div>}
    {saved && <p role="status">{t("Backend.Saved")}</p>}
    <LocalizedForm className="d-flex wedding-gap-2" onSubmit={async event => {
      event.preventDefault();
      if (loading || saving || !name.trim()) return;
      if (await perform(() => backend.addTag(name.trim()))) setName("");
    }}>
      <input className="admin-input wedding-flex-1" required maxLength={100} value={name}
        placeholder={t("Admin.Tags.Placeholder")} aria-label={t("Admin.Tags.NewName")}
        disabled={saving || loading} onChange={event => setName(event.target.value)} />
      <button className="admin-primary-button" type="submit" disabled={saving || loading || !name.trim()}>{t("Admin.Tags.Add")}</button>
    </LocalizedForm>
    {loading ? <p role="status">{t("Backend.Loading")}</p> : <div className="wedding-grid wedding-grid-cols-2 wedding-md-grid-cols-3 wedding-gap-2">
      {data?.tags.map(tag => {
        const color = colors[(tag.id - 1) % colors.length];
        return <div key={tag.id} className={`managed-tag wedding-bg-${color}-100 wedding-text-${color}-900 wedding-border-${color}-300`}>
          <span className="d-flex align-items-center wedding-gap-1"><FontAwesomeIcon icon={faTag} /> {tag.name}</span>
          <button type="button" className="wedding-p-1 wedding-text-red-600 wedding-hover-bg-white-50 wedding-rounded-lg"
            disabled={saving} aria-label={t("Admin.Tags.DeleteLabel", { name: tag.name })}
            onClick={() => { if (confirm(t("Admin.Tags.DeleteConfirmation", { name: tag.name }))) void perform(() => backend.deleteTag(tag.id)); }}>
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        </div>;
      })}
    </div>}
    {!loading && !error && data?.tags.length === 0 && <p className="admin-empty">{t("Backend.Empty")}</p>}
  </section>;
}
