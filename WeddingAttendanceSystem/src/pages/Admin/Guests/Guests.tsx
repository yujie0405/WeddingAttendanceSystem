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
  const { state, actions, run } = useWedding();
  const [draft, setDraft] = useState(emptyDraft);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const filtered = state.guests.filter((g) => matchesGuest(g, search));
  const page = usePagination(filtered, 20);
  const edit = state.guests.find((g) => g.id === editId);
  const table = state.tables.some((t) => t.tableNo === draft.tableNo)
    ? draft.tableNo
    : state.tables[0]?.tableNo || "";
  const relationships = [...new Set(state.tags.map((t) => t.name))];
  const columns: ListingColumn<Guest>[] = [
    {
      key: "name",
      title: "姓名 / 身份 / 家庭",
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
      title: "婚礼边 / 标签",
      render: (g) => (
        <>
          <SideBadge side={g.side} />
          <div className="admin-tags">
            {g.tagIds.map((id) => {
              const tag = state.tags.find((t) => t.id === id);
              return tag ? <TagBadge key={id} tag={tag} /> : null;
            })}
          </div>
        </>
      ),
    },
    {
      key: "table",
      title: "桌号 / 座位",
      render: (g) => (
        <>
          {g.tableNo} 桌
          {g.seatNo && <small className="admin-subtext">座位 {g.seatNo}</small>}
        </>
      ),
    },
    {
      key: "status",
      title: "签到状态",
      render: (g) => <AttendanceBadge guest={g} />,
    },
    {
      key: "actions",
      title: "操作",
      render: (g) => (
        <button
          className="admin-outline-button"
          onClick={() => setEditId(g.id)}
        >
          编辑
        </button>
      ),
    },
  ];
  return (
    <>
      <form
        className="wedding-space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          if (
            await run(
              () => actions.addGuest({ ...draft, tableNo: table }),
              "成功登记新宾客",
            )
          ) {
            setDraft(emptyDraft);
            setSearch("");
            page.reset();
          }
          setBusy(false);
        }}
      >
        <h2 className="admin-section-title">新增 / 管理宾客</h2>
        <div className="form-grid">
          <label className="admin-label">
            姓名
            <input
              className="admin-input"
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="admin-label">
            身份关系
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
                  ? "请选择身份关系（标签）"
                  : "请先添加标签"}
              </option>
              {relationships.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
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
            安排桌号
            <select
              className="admin-input"
              required
              value={table}
              onChange={(e) => setDraft({ ...draft, tableNo: e.target.value })}
            >
              {!state.tables.length && <option value="">请先添加桌位</option>}
              {state.tables.map((t) => (
                <option key={t.id} value={t.tableNo}>
                  {t.tableNo} 桌
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
          录入宾客
        </button>
      </form>
      <section className="admin-section">
        <div className="admin-section-heading">
          <h2 className="admin-section-title">宾客列表</h2>
          <span className="admin-help">
            显示 {filtered.length ? page.start + 1 : 0}–
            {page.start + page.items.length} / {filtered.length} 位宾客
          </span>
        </div>
        <SearchField
          value={search}
          onChange={(s) => {
            setSearch(s);
            page.reset();
          }}
          placeholder="搜索宾客 / 家庭 / 桌号"
        />
        <Listing
          mode="table"
          label="宾客管理列表"
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
