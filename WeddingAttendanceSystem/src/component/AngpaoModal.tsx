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
  const { state, actions, run } = useWedding();
  const group = state.groups.find((g) => g.id === guest.groupId);
  const [type, setType] = useState<AngpaoType>("individual");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="登记礼金 (RM)" onClose={onClose}>
      <form
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
              "成功登记礼金",
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
              个人: {guest.name}
            </button>
            <button
              type="button"
              className={type === "family" ? "selected" : ""}
              onClick={() => setType("family")}
            >
              家庭: {group.name}
            </button>
          </div>
        )}
        <label className="admin-label">
          礼金金额 (RM)
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
          祝词 / 备注
          <input
            className="admin-input"
            placeholder="例如：祝百年好合 / 永结同心"
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
            取消
          </button>
          <button
            type="submit"
            className="admin-primary-button"
            disabled={busy}
          >
            确认保存
          </button>
        </div>
      </form>
    </Modal>
  );
}
