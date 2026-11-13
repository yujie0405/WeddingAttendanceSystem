import { LocalizedForm } from "./LocalizedForm";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { AngpaoType, Guest } from "../types";
import { useWedding } from "../hooks/useWedding";
import { Modal } from "./Modal";
export function AngpaoModal({
  guest,
  onClose,
}: {
  guest: Guest;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { state, actions, run } = useWedding();
  const group = state.groups.find((g) => g.id === guest.groupId);
  const [type, setType] = useState<AngpaoType>("individual");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={t("Modal.Gift.Title")} onClose={onClose}>
      <LocalizedForm
        className="wedding-space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          if (
            await run(
              () =>
                actions.registerGift({
                  targetType: type,
                  targetId: type === "family" && group ? group.id : guest.id,
                  amount: Number(amount),
                  notes,
                }),
              "Notifications.GiftRegistered",
            )
          )
            onClose();
          setBusy(false);
        }}
      >
        {group && (
          <div className="gift-type">
            <button
              type="button"
              className={type === "individual" ? "selected" : ""}
              onClick={() => setType("individual")}
            >
              {t("Modal.Gift.Individual", { name: guest.name })}
            </button>
            <button
              type="button"
              className={type === "family" ? "selected" : ""}
              onClick={() => setType("family")}
            >
              {t("Modal.Gift.Family", { name: group.name })}
            </button>
          </div>
        )}
        <label className="admin-label">
          {t("Modal.Gift.Amount")}
          <input
            className="admin-input gift-amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <div className="quick-amounts">
          {[100, 200, 300, 500, 1000].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setAmount(String((Number(amount) || 0) + value))}
            >
              +{value}
            </button>
          ))}
        </div>
        <label className="admin-label">
          {t("Modal.Gift.Notes")}
          <input
            className="admin-input"
            placeholder={t("Modal.Gift.NotesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
          <button
            type="submit"
            className="admin-primary-button"
            disabled={busy}
          >
            {t("Common.ConfirmSave")}
          </button>
        </div>
      </LocalizedForm>
    </Modal>
  );
}
