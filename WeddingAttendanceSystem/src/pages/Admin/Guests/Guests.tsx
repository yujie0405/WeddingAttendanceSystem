import { LocalizedForm } from "../../../component/LocalizedForm";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { Guest, GuestDraft } from "../../../types";
import { useWedding } from "../../../hooks/useWedding";
import { usePagination } from "../../../hooks/usePagination";
import { matchesGuest } from "../../../utils/selectors";
import { Listing } from "../../../component/listing";
import type { ListingColumn } from "../../../component/listing";
import { Pagination } from "../../../component/pagination";
import {
  AttendanceBadge,
  SearchField,
  SideBadge,
  TagBadge,
} from "../../../component/ui";
import { GuestEditModal } from "../../../component/GuestEditModal";
const emptyDraft: GuestDraft = {
  name: "",
  relationship: "",
  side: "groom",
  tableNo: "",
  seatNo: "",
  tagIds: [],
};
export function Guests() {
  const { t } = useTranslation();

  const { state, actions, run } = useWedding();
  const [draft, setDraft] = useState(emptyDraft);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const filtered = state.guests.filter((g) => matchesGuest(g, search));
  const page = usePagination(filtered, 20);
  const edit = state.guests.find((g) => g.id === editId);
  const table = state.tables.some((item) => item.tableNo === draft.tableNo)
    ? draft.tableNo
    : state.tables[0]?.tableNo || "";
  const relationships = [...new Set(state.tags.map((item) => item.name))];
  const columns: ListingColumn<Guest>[] = [
    {
      key: "name",
      title: t("Admin.Guests.NameColumn"),
      render: (g) => (
        <>
          <strong>{g.name}</strong>
          <small className="admin-subtext">{g.relationship}</small>
          <small className="admin-subtext">{g.groupName}</small>
        </>
      ),
    },
    {
      key: "tags",
      title: t("Admin.Guests.TagColumn"),
      render: (g) => (
        <>
          <SideBadge side={g.side} />
          <div className="admin-tags">
            {g.tagIds.map((id) => {
              const tag = state.tags.find((item) => item.id === id);
              return tag ? <TagBadge key={id} tag={tag} /> : null;
            })}
          </div>
        </>
      ),
    },
    {
      key: "table",
      title: t("Admin.Guests.TableColumn"),
      render: (g) => (
        <>
          {t("Common.TableNumber", { table: g.tableNo })}
          {g.seatNo && (
            <small className="admin-subtext">
              {t("Common.SeatNumber", { seat: g.seatNo })}
            </small>
          )}
        </>
      ),
    },
    {
      key: "status",
      title: t("Common.Status"),
      render: (g) => <AttendanceBadge guest={g} />,
    },
    {
      key: "actions",
      title: t("Common.Actions"),
      render: (g) => (
        <button
          className="admin-outline-button"
          onClick={() => setEditId(g.id)}
        >
          {t("Common.Edit")}
        </button>
      ),
    },
  ];
  return (
    <>
      <LocalizedForm
        className="wedding-space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          if (
            await run(
              () => actions.addGuest({ ...draft, tableNo: table }),
              "Notifications.GuestAdded",
            )
          ) {
            setDraft(emptyDraft);
            setSearch("");
            page.reset();
          }
          setBusy(false);
        }}
      >
        <h2 className="admin-section-title">{t("Admin.Guests.Title")}</h2>
        <div className="form-grid">
          <label className="admin-label">
            {t("Common.Name")}
            <input
              className="admin-input"
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="admin-label">
            {t("Common.Relationship")}
            <select
              className="admin-input"
              required
              value={
                relationships.includes(draft.relationship)
                  ? draft.relationship
                  : ""
              }
              onChange={(e) =>
                setDraft({ ...draft, relationship: e.target.value })
              }
            >
              <option value="" disabled>
                {relationships.length
                  ? t("Admin.Guests.SelectRelationship")
                  : t("Admin.Guests.AddTagsFirst")}
              </option>
              {relationships.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
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
            {t("Common.AssignTable")}
            <select
              className="admin-input"
              required
              value={table}
              onChange={(e) => setDraft({ ...draft, tableNo: e.target.value })}
            >
              {!state.tables.length && (
                <option value="">{t("Admin.Guests.AddTableFirst")}</option>
              )}
              {state.tables.map((item) => (
                <option key={item.id} value={item.tableNo}>
                  {t("Common.TableNumber", { table: item.tableNo })}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="admin-primary-button w-100"
          type="submit"
          disabled={busy || !state.tables.length || !relationships.length}
        >
          {t("Admin.Guests.Add")}
        </button>
      </LocalizedForm>
      <section className="admin-section">
        <div className="admin-section-heading">
          <h2 className="admin-section-title">{t("Admin.Guests.ListTitle")}</h2>
          <span className="admin-help">
            {t("Admin.Guests.Range", {
              start: filtered.length ? page.start + 1 : 0,
              end: page.start + page.items.length,
              total: filtered.length,
            })}
          </span>
        </div>
        <SearchField
          value={search}
          onChange={(s) => {
            setSearch(s);
            page.reset();
          }}
          placeholder={t("Admin.Guests.Search")}
        />
        <Listing
          mode="table"
          label={t("Admin.Guests.ListLabel")}
          items={page.items}
          getKey={(g) => g.id}
          columns={columns}
        />
        <Pagination {...page} />
      </section>
      {edit && (
        <GuestEditModal guest={edit} onClose={() => setEditId(undefined)} />
      )}
    </>
  );
}
