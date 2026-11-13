import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useWedding } from "../hooks/useWedding";
import { Modal } from "./Modal";
export function FamilyCheckInModal({
  groupId,
  onClose,
}: {
  groupId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { state, actions, run } = useWedding();
  const [busy, setBusy] = useState(false);
  const group = state.groups.find((g) => g.id === groupId);
  return (
    <Modal title={t("Modal.Family.Title")} onClose={onClose}>
      <p className="admin-help">
        {t("Modal.Family.Confirmation", {
          name: group?.name || "",
          count: state.guests.filter(
            (g) =>
              g.isActive && g.groupId === groupId && g.status === "pending",
          ).length,
        })}
      </p>
      <div className="modal-actions">
        <button className="admin-outline-button" onClick={onClose}>
          {t("Common.Cancel")}
        </button>
        <button
          className="admin-primary-button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            if (
              await run(
                () => actions.checkInFamily(groupId),
                "Notifications.FamilyCheckedIn",
              )
            )
              onClose();
            setBusy(false);
          }}
        >
          {t("Modal.Family.Confirm")}
        </button>
      </div>
    </Modal>
  );
}
