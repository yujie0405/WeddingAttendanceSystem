import { useState } from "react";
import type { AngpaoType } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useWedding } from "../hooks/useWedding";
import { formatRM } from "../utils/format";
import { Modal } from "./Modal";
import { VoidAngpaoModal } from "./VoidAngpaoModal";
export interface HistoryTarget {
  name: string;
  guestId?: string;
  groupId?: string;
  type?: AngpaoType;
}
export function AngpaoHistoryModal({
  target,
  financial = false,
  onClose,
}: {
  target: HistoryTarget;
  financial?: boolean;
  onClose: () => void;
}) {
  const { state } = useWedding();
  const { user } = useAuth();
  const [voidId, setVoidId] = useState<string>();
  const records = state.angpaoRecords.filter(
    (r) =>
      (!target.type || target.type === r.targetType) &&
      (r.targetType === "individual"
        ? r.targetId === target.guestId
        : r.targetId === target.groupId),
  );
  return (
    <>
      <Modal title={`【${target.name}】礼金记录明细`} onClose={onClose} wide>
        <div className="wedding-space-y-2">
          {!records.length && <p className="admin-empty">暂无礼金登记记录</p>}
          {records.map((r) => (
            <article
              key={r.id}
              className={"gift-history-row " + (r.isVoided ? "voided" : "")}
            >
              <div className="d-flex justify-content-between wedding-gap-2">
                <strong>
                  {r.targetType === "family" ? "全家礼金" : "个人礼金"} -{" "}
                  {r.targetName}
                </strong>
                {!r.isVoided && user?.role === "admin" && (
                  <button
                    className="wedding-text-red-600"
                    onClick={() => setVoidId(r.id)}
                  >
                    作废
                  </button>
                )}
              </div>
              <p className="admin-help">
                登记人: {r.recordedBy} | 时间: {r.timestamp}
              </p>
              {r.notes && <p className="admin-help">备注: {r.notes}</p>}
              {r.isVoided && (
                <p className="wedding-text-red-600 admin-help">
                  【已作废】原因: {r.voidReason}
                </p>
              )}
              {financial && user?.role === "admin" && (
                <p className="admin-money">{formatRM(r.amount)}</p>
              )}
            </article>
          ))}
        </div>
      </Modal>
      {voidId && (
        <VoidAngpaoModal
          recordId={voidId}
          onClose={() => setVoidId(undefined)}
        />
      )}
    </>
  );
}
