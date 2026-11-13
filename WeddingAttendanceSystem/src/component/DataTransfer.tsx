import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { useWedding } from "../hooks/useWedding";
import { normalizeData } from "../api/migrations";
export function DataTransfer() {
  const { t } = useTranslation();

  const { state, actions, run } = useWedding();
  const input = useRef<HTMLInputElement>(null);
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ data: state }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-data.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section className="admin-section">
      <h2 className="admin-section-title">{t("DataTransfer.Title")}</h2>
      <p className="admin-help">{t("DataTransfer.Help")}</p>
      <div className="admin-row-actions">
        <button className="admin-outline-button" onClick={download}>
          {t("DataTransfer.Export")}
        </button>
        <button
          className="admin-outline-button"
          onClick={() => input.current?.click()}
        >
          {t("DataTransfer.Import")}
        </button>
      </div>
      <input
        ref={input}
        className="visually-hidden"
        type="file"
        accept=".json,application/json"
        aria-label={t("DataTransfer.ImportLabel")}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          await run(async () => {
            const data = normalizeData(JSON.parse(await file.text()));
            if (
              confirm(
                t("DataTransfer.Confirmation", {
                  guests: data.guests.length,
                  tables: data.tables.length,
                  gifts: data.angpaoRecords.length,
                }),
              )
            )
              await actions.importData(data);
          }, "Notifications.ImportProcessed");
        }}
      />
    </section>
  );
}
