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
  const { state, actions, run } = useWedding();
  const [busy, setBusy] = useState(false);
  const group = state.groups.find((g) => g.id === groupId);
  return (
    <Modal title="全家一键签到确认" onClose={onClose}>
      <p className="admin-help">
        是否确认将 <strong>{group?.name}</strong> 剩余的{" "}
        <strong>
          {
            state.guests.filter(
              (g) =>
                g.isActive && g.groupId === groupId && g.status === "pending",
            ).length
          }
        </strong>{" "}
        位未到成员一次性标记为已到场？
      </p>
      <div className="modal-actions">
        <button className="admin-outline-button" onClick={onClose}>
          取消
        </button>
        <button
          className="admin-primary-button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            if (
              await run(() => actions.checkInFamily(groupId), "已完成全家签到")
            )
              onClose();
            setBusy(false);
          }}
        >
          确认一键签到
        </button>
      </div>
    </Modal>
  );
}
