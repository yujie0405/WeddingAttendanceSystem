import { LocalizedForm } from "./LocalizedForm";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useWedding } from "../hooks/useWedding";
import { Modal } from "./Modal";
export function VoidAngpaoModal({
  recordId,
  onClose,
}: {
  recordId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { actions, run } = useWedding();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={t("Modal.Void.Title")} onClose={onClose}>
      <p className="admin-help">{t("Modal.Void.Help")}</p>
      <LocalizedForm
        className="wedding-space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          if (
            await run(
              () => actions.voidGift(recordId, reason),
              "Notifications.GiftVoided",
            )
          )
            onClose();
          setBusy(false);
        }}
      >
        <label className="admin-label">
          {t("Modal.Void.Reason")}
          <input
            className="admin-input"
            required
            placeholder={t("Modal.Void.Placeholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <div className="modal-actions">
          <button
            type="button"
            className="admin-outline-button"
            onClick={onClose}
          >
            {t("Common.Cancel")}
          </button>
          <button className="admin-danger-button" type="submit" disabled={busy}>
            {t("Modal.Void.Confirm")}
          </button>
        </div>
      </LocalizedForm>
    </Modal>
  );
}
