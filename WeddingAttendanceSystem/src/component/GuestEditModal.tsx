import { useState } from "react";
import type { Guest, GuestDraft } from "../types";
import { useWedding } from "../hooks/useWedding";
import { Modal } from "./Modal";
import { TagListingSelector } from "./tagListing";
export function GuestEditModal({
  guest,
  onClose,
}: {
  guest: Guest;
  onClose: () => void;
}) {
  const { state, actions, run } = useWedding();
  const [draft, setDraft] = useState<GuestDraft>({
    name: guest.name,
    relationship: guest.relationship,
    side: guest.side,
    tableNo: guest.tableNo,
    seatNo: guest.seatNo,
    tagIds: [...guest.tagIds],
  });
  const [busy, setBusy] = useState(false);
  const relationships = [...new Set(state.tags.map((t) => t.name))];
  const legacy =
    guest.relationship && !relationships.includes(guest.relationship);
  return (
    <Modal title="编辑宾客资料与标签" onClose={onClose} wide>
      <form
        className="wedding-space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          if (
            await run(
              () => actions.editGuest(guest.id, draft),
              "已更新宾客资料",
            )
          )
            onClose();
          setBusy(false);
        }}
      >
        <label className="admin-label">
          宾客姓名
          <input
            className="admin-input"
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <div className="edit-tags">
          <div className="d-flex justify-content-between">
            <span className="admin-label">赋予标签（多选）</span>
            <span className="admin-help">
              已选 {draft.tagIds.length} 个标签
            </span>
          </div>
          <TagListingSelector
            allTags={state.tags}
            selectedTagIds={draft.tagIds}
            onChange={(tagIds) => setDraft({ ...draft, tagIds })}
          />
        </div>
        <div className="form-grid">
          <label className="admin-label">
            婚礼边
            <select
              className="admin-input"
              value={draft.side}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  side: e.target.value === "bride" ? "bride" : "groom",
                })
              }
            >
              <option value="groom">男方</option>
              <option value="bride">女方</option>
            </select>
          </label>
          <label className="admin-label">
            身份关系
            <select
              className="admin-input"
              required
              value={draft.relationship}
              onChange={(e) =>
                setDraft({ ...draft, relationship: e.target.value })
              }
            >
              <option value="" disabled>
                请选择身份关系（标签）
              </option>
              {legacy && (
                <option value={guest.relationship}>
                  {guest.relationship}（现有）
                </option>
              )}
              {relationships.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="admin-label">
            安排桌号
            <select
              className="admin-input"
              required
              value={draft.tableNo}
              onChange={(e) => setDraft({ ...draft, tableNo: e.target.value })}
            >
              {state.tables.map((t) => (
                <option key={t.id} value={t.tableNo}>
                  {t.tableNo} 桌
                </option>
              ))}
            </select>
          </label>
          <label className="admin-label">
            座位号（选填）
            <input
              className="admin-input"
              placeholder="如: 01"
              value={draft.seatNo || ""}
              onChange={(e) => setDraft({ ...draft, seatNo: e.target.value })}
            />
          </label>
        </div>
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
            保存修改
          </button>
        </div>
      </form>
    </Modal>
  );
}
