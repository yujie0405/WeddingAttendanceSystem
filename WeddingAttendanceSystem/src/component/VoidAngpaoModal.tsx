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
  const { actions, run } = useWedding();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="确认作废此礼金记录？" onClose={onClose}>
      <p className="admin-help">
        财务记录无法直接物理删除。作废后该笔礼金将不计入总额，并保留审计记录。
      </p>
      <form
        className="wedding-space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          if (
            await run(
              () => actions.voidGift(recordId, reason),
              "礼金记录已作废",
            )
          )
            onClose();
          setBusy(false);
        }}
      >
        <label className="admin-label">
          作废原因（必填）
          <input
            className="admin-input"
            required
            placeholder="例如：金额登记错误 / 重复录入"
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
            取消
          </button>
          <button className="admin-danger-button" type="submit" disabled={busy}>
            确认作废
          </button>
        </div>
      </form>
    </Modal>
  );
}
