import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();

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
      <Modal
        title={t("Modal.History.Title", { name: target.name })}
        onClose={onClose}
        wide
      >
        <div className="wedding-space-y-2">
          {!records.length && (
            <p className="admin-empty">{t("Modal.History.Empty")}</p>
          )}
          {records.map((r) => (
            <article
              key={r.id}
              className={"gift-history-row " + (r.isVoided ? "voided" : "")}
            >
              <div className="d-flex justify-content-between wedding-gap-2">
                <strong>
                  {r.targetType === "family"
                    ? t("Modal.History.FamilyLabel")
                    : t("Common.IndividualGift")}{" "}
                  - {r.targetName}
                </strong>
                {!r.isVoided && user?.role === "admin" && (
                  <button
                    className="wedding-text-red-600"
                    onClick={() => setVoidId(r.id)}
                  >
                    {t("Modal.History.Void")}
                  </button>
                )}
              </div>
              <p className="admin-help">
                {t("Modal.History.Meta", {
                  name: r.recordedBy,
                  time: r.timestamp,
                })}
              </p>
              {r.notes && (
                <p className="admin-help">
                  {t("Common.Note", { note: r.notes })}
                </p>
              )}
              {r.isVoided && (
                <p className="wedding-text-red-600 admin-help">
                  {t("Modal.History.VoidReason", {
                    reason: r.voidReason || "",
                  })}
                </p>
              )}
              {financial && user?.role === "admin" && (
                <p className="admin-money">
                  {formatRM(r.amount, i18n.resolvedLanguage)}
                </p>
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
