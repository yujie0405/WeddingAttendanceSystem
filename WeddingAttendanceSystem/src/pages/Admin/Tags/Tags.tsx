import { LocalizedForm } from "../../../component/LocalizedForm";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useWedding } from "../../../hooks/useWedding";
import { DataTransfer } from "../../../component/DataTransfer";
export function Tags() {
  const { t } = useTranslation();

  const { state, actions, run } = useWedding();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <section className="wedding-space-y-4">
        <h2 className="admin-section-title">{t("Nav.Tags")}</h2>
        <LocalizedForm
          className="d-flex wedding-gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            if (await run(() => actions.addTag(name), "Notifications.TagAdded"))
              setName("");
            setBusy(false);
          }}
        >
          <input
            className="admin-input"
            aria-label={t("Admin.Tags.NewName")}
            placeholder={t("Admin.Tags.Placeholder")}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="admin-primary-button"
            type="submit"
            disabled={busy}
          >
            {t("Admin.Tags.Add")}
          </button>
        </LocalizedForm>
        <div className="wedding-grid wedding-grid-cols-2 wedding-md-grid-cols-3 wedding-gap-2">
          {state.tags.map((item) => (
            <div key={item.id} className={"managed-tag " + item.color}>
              <span>
                <FontAwesomeIcon icon={faTag} /> {item.name}
              </span>
              <button
                aria-label={t("Admin.Tags.DeleteLabel", { name: item.name })}
                className="wedding-text-red-600"
                onClick={() => {
                  if (
                    confirm(
                      t("Admin.Tags.DeleteConfirmation", { name: item.name }),
                    )
                  )
                    void run(
                      () => actions.deleteTag(item.id),
                      "Notifications.TagDeleted",
                    );
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            </div>
          ))}
        </div>
      </section>
      <DataTransfer />
    </>
  );
}
