import { LocalizedForm } from "./LocalizedForm";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const { state, actions, run } = useWedding();
  const [draft, setDraft] = useState<GuestDraft>({
    name: guest.name,
    guestNum: guest.guestNum ?? 1,
    relationship: guest.relationship,
    side: guest.side,
    tableNo: guest.tableNo,
    seatNo: guest.seatNo,
    tagIds: [...guest.tagIds],
  });
  const [busy, setBusy] = useState(false);
  const relationships = [...new Set(state.tags.map((item) => item.name))];
  const legacy =
    guest.relationship && !relationships.includes(guest.relationship);
  return (
    <Modal title={t("Modal.EditGuest.Title")} onClose={onClose} wide>
      <LocalizedForm
        className="wedding-space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          if (
            await run(
              () => actions.editGuest(guest.id, draft),
              "Notifications.GuestUpdated",
            )
          )
            onClose();
          setBusy(false);
        }}
      >
        <label className="admin-label">
          {t("Modal.EditGuest.Name")}
          <input
            className="admin-input"
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <div className="edit-tags">
          <div className="d-flex justify-content-between">
            <span className="admin-label">{t("Modal.EditGuest.Tags")}</span>
            <span className="admin-help">
              {t("Modal.EditGuest.SelectedTags", {
                count: draft.tagIds.length,
              })}
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
            {t("Common.Side")}
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
              <option value="groom">{t("Common.Groom")}</option>
              <option value="bride">{t("Common.Bride")}</option>
            </select>
          </label>
          <label className="admin-label">
            {t("Common.Relationship")}
            <select
              className="admin-input"
              required
              value={draft.relationship}
              onChange={(e) =>
                setDraft({ ...draft, relationship: e.target.value })
              }
            >
              <option value="" disabled>
                {t("Admin.Guests.SelectRelationship")}
              </option>
              {legacy && (
                <option value={guest.relationship}>
                  {t("Common.Existing", { value: guest.relationship })}
                </option>
              )}
              {relationships.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="admin-label">
            {t("Common.AssignTable")}
            <select
              className="admin-input"
              required
              value={draft.tableNo}
              onChange={(e) => setDraft({ ...draft, tableNo: e.target.value })}
            >
              {state.tables.map((item) => (
                <option key={item.id} value={item.tableNo}>
                  {t("Common.TableNumber", { table: item.tableNo })}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-label">
            {t("Backend.GuestNum")}
            <input type="number" min="1" step="1" required className="admin-input"
              value={draft.guestNum || ""}
              onChange={(e) => setDraft({ ...draft, guestNum: Number(e.target.value) })} />
          </label>
          <label className="admin-label">
            {t("Modal.EditGuest.Seat")}
            <input
              className="admin-input"
              placeholder={t("Modal.EditGuest.SeatPlaceholder")}
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
            {t("Common.Cancel")}
          </button>
          <button
            type="submit"
            className="admin-primary-button"
            disabled={busy}
          >
            {t("Common.SaveChanges")}
          </button>
        </div>
      </LocalizedForm>
    </Modal>
  );
}
