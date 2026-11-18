import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair, faPlus, faTableCells, faTag, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { backend } from "../../api/backend";
import { LocalizedForm } from "../../component/LocalizedForm";
import { Pagination } from "../../component/pagination";
import { useBackendAdmin } from "../../hooks/useBackendAdmin";
import { usePagination } from "../../hooks/usePagination";

const load = async (signal: AbortSignal) => {
  const [tables, tags] = await Promise.all([backend.tables(signal), backend.tags(signal)]);
  return { tables, tags };
};
export function BackendTables() {
  const { t } = useTranslation();
  const { data, loading, saving, error, saved, refresh, perform } = useBackendAdmin(load);
  const page = usePagination(data?.tables ?? [], 10);
  const [capacity, setCapacity] = useState("10");
  const [tableNumber, setTableNumber] = useState("");
  const [guestTagId, setGuestTagId] = useState("");
  return <section className="wedding-space-y-4">
    <h2 className="admin-section-title"><FontAwesomeIcon icon={faTableCells} /> {t("Nav.Tables")}</h2>
    {error && <div role="alert"><p>{t(error)}</p><button className="admin-outline-button" onClick={refresh}>{t("Backend.Retry")}</button></div>}
    {saved && <p role="status">{t("Backend.Saved")}</p>}
    <LocalizedForm className="admin-table-form" onSubmit={async event => {
      event.preventDefault();
      const number = Number(tableNumber);
      if (!saving && !loading && await perform(() => backend.addTable(number, Number(capacity), guestTagId ? Number(guestTagId) : null))) {
        page.setPage(Math.floor((data?.tables.filter(table => table.tableNumber < number).length ?? 0) / 10) + 1);
        setTableNumber("");
      }
    }}>
      <label className="admin-label">{t("Backend.TableNumberLabel")}<input className="admin-input" type="number" min="1" max="32767" step="1"
        inputMode="numeric" required value={tableNumber} disabled={saving || loading} onChange={event => setTableNumber(event.target.value)} /></label>
      <label className="admin-label">{t("Admin.Tables.Capacity")}<input className="admin-input" type="number" min="1" max="10000" step="1"
        required value={capacity} disabled={saving || loading} onChange={event => setCapacity(event.target.value)} /></label>
      <button className="admin-primary-button" type="submit" disabled={saving || loading}><FontAwesomeIcon icon={faPlus} /> {t("Admin.Tables.Add")}</button>
      <label className="admin-label table-tag-field">{t("Backend.TableTag")}
        <select className="admin-input" disabled={saving || loading} value={guestTagId} onChange={event => setGuestTagId(event.target.value)}>
          <option value="">{t("Backend.NoTableTag")}</option>
          {data?.tags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
        </select>
      </label>
    </LocalizedForm>
    <p className="admin-help">{t("Backend.ManualTableHelp")}</p>
    {loading ? <p role="status">{t("Backend.Loading")}</p> : <div className="admin-table-grid">
      {page.items.map(table => <article className="admin-table-card" key={table.tableNumber} data-table={table.tableNumber}>
        <div><h3 className="admin-table-number"><FontAwesomeIcon icon={faChair} className="wedding-text-amber-700" /> {t("Common.TableNumber", { table: table.tableNumber })}</h3>
          <p className="admin-subtext">{t("Admin.Tables.CapacityInfo", { count: table.capacity })}</p>
          <p className="admin-subtext">{t("Admin.Tables.AssignedInfo", { count: table.assignedCount })}</p>
          {table.guestTagId !== null && <p className="admin-subtext"><FontAwesomeIcon icon={faTag} /> {data?.tags.find(tag => tag.id === table.guestTagId)?.name ?? table.guestTagId}</p>}
        </div>
        <div className="admin-table-actions"><button type="button" className="admin-danger-button" disabled={saving || table.assignedCount > 0}
          aria-label={t("Admin.Tables.DeleteLabel", { table: table.tableNumber })}
          onClick={() => { if (confirm(t("Admin.Tables.DeleteConfirmation", { table: table.tableNumber }))) void perform(() => backend.deleteTable(table.tableNumber)); }}>
          <FontAwesomeIcon icon={faTrashCan} /> {t("Common.Delete")}
        </button><p className="admin-help">{t(table.assignedCount > 0 ? "Admin.Tables.Protected" : "Admin.Tables.EmptyTable")}</p></div>
      </article>)}
    </div>}
    {!loading && !error && data?.tables.length === 0 && <p className="admin-empty">{t("Admin.Tables.Empty")}</p>}
    {!loading && <Pagination {...page} />}
  </section>;
}
