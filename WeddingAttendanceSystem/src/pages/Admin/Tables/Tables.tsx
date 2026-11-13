import { LocalizedForm } from "../../../component/LocalizedForm";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useWedding } from "../../../hooks/useWedding";
import { usePagination } from "../../../hooks/usePagination";
import { tableUsage } from "../../../utils/selectors";
import { Listing } from "../../../component/listing";
import { Pagination } from "../../../component/pagination";
export function Tables() {
  const { t } = useTranslation();

  const { state, actions, run } = useWedding();
  const page = usePagination(state.tables, 10);
  const [capacity, setCapacity] = useState("10");
  const [busy, setBusy] = useState(false);
  return (
    <section className="wedding-space-y-4">
      <h2 className="admin-section-title">{t("Nav.Tables")}</h2>
      <LocalizedForm
        className="admin-table-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          if (
            await run(
              () => actions.addTable(Number(capacity)),
              "Notifications.TableAdded",
            )
          )
            page.setPage(Math.ceil((state.tables.length + 1) / 10));
          setBusy(false);
        }}
      >
        <label className="admin-label">
          {t("Admin.Tables.NextNumber")}
          <input
            className="admin-input"
            readOnly
            value={t("Admin.Tables.Automatic", {
              number: String(state.nextTableNumber).padStart(2, "0"),
            })}
          />
        </label>
        <label className="admin-label">
          {t("Admin.Tables.Capacity")}
          <input
            className="admin-input"
            type="number"
            min="1"
            step="1"
            required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </label>
        <button className="admin-primary-button" type="submit" disabled={busy}>
          <FontAwesomeIcon icon={faPlus} /> {t("Admin.Tables.Add")}
        </button>
      </LocalizedForm>
      <p className="admin-help">{t("Admin.Tables.NumberingHelp")}</p>
      <Listing
        mode="cards"
        className="admin-table-grid"
        items={page.items}
        getKey={(item) => item.id}
        empty={t("Admin.Tables.Empty")}
        renderItem={(item) => {
          const usage = tableUsage(state, item.tableNo);
          return (
            <article className="admin-table-card" data-table={item.tableNo}>
              <div>
                <h3 className="admin-table-number">
                  <FontAwesomeIcon icon={faChair} />{" "}
                  {t("Common.TableNumber", { table: item.tableNo })}
                </h3>
                <p className="admin-subtext">
                  {t("Admin.Tables.CapacityInfo", { count: item.capacity })}
                </p>
                <p className="admin-subtext">
                  {t("Admin.Tables.AssignedInfo", { count: usage.count })}
                </p>
              </div>
              <div className="admin-table-actions">
                <button
                  className="admin-danger-button"
                  disabled={usage.blocked}
                  aria-label={t("Admin.Tables.DeleteLabel", {
                    table: item.tableNo,
                  })}
                  onClick={() => {
                    if (
                      confirm(
                        t("Admin.Tables.DeleteConfirmation", {
                          table: item.tableNo,
                        }),
                      )
                    )
                      void run(
                        () => actions.deleteTable(item.id),
                        "Notifications.TableDeleted",
                      );
                  }}
                >
                  <FontAwesomeIcon icon={faTrashCan} /> {t("Common.Delete")}
                </button>
                <p className="admin-help">
                  {usage.blocked
                    ? t("Admin.Tables.Protected")
                    : t("Admin.Tables.EmptyTable")}
                </p>
              </div>
            </article>
          );
        }}
      />
      <Pagination {...page} />
    </section>
  );
}
