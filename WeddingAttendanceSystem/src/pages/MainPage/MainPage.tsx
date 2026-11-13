import { useState } from "react";
import { useWedding } from "../../hooks/useWedding";
import { useGuests } from "../../hooks/useGuests";
import { matchesGuest } from "../../utils/selectors";
import { Listing } from "../../component/listing";
import { SearchField } from "../../component/ui";
import { GuestEditModal } from "../../component/GuestEditModal";
import { AngpaoModal } from "../../component/AngpaoModal";
import { AngpaoHistoryModal } from "../../component/AngpaoHistoryModal";
import { FamilyCheckInModal } from "../../component/FamilyCheckInModal";
import { GuestCard } from "./GuestCard";
import type { AttendanceStatus, WeddingSide } from "../../types";
export function MainPage() {
  const { state, run } = useWedding();
  const { guests, toggleCheckIn } = useGuests();
  const [search, setSearch] = useState("");
  const [side, setSide] = useState<WeddingSide | "all">("all");
  const [status, setStatus] = useState<AttendanceStatus | "all">("all");
  const [table, setTable] = useState("all");
  const [tag, setTag] = useState("all");
  const [modal, setModal] = useState<{
    kind: "edit" | "gift" | "history" | "family";
    id: string;
  }>();
  const active = guests.filter((g) => g.isActive);
  const selectedTable = state.tables.some((t) => t.tableNo === table)
    ? table
    : "all";
  const selectedTag = state.tags.some((t) => t.id === tag) ? tag : "all";
  const visible = active.filter(
    (g) =>
      matchesGuest(g, search) &&
      (side === "all" || g.side === side) &&
      (status === "all" || g.status === status) &&
      (selectedTable === "all" || g.tableNo === selectedTable) &&
      (selectedTag === "all" || g.tagIds.includes(selectedTag)),
  );
  const guest = guests.find((g) => g.id === modal?.id);
  const close = () => setModal(undefined);
  return (
    <div className="wedding-space-y-4">
      <section className="checkin-search">
        <div className="checkin-summary">
          <div>
            <span>全场出席进度 (Arrived / Total)</span>
            <strong>
              {active.filter((g) => g.status === "arrived").length} /{" "}
              {active.length} 人
            </strong>
          </div>
          <div>
            <span>礼金录入状态</span>
            <b>仅管理员后台可查看金额</b>
          </div>
        </div>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="搜索宾客姓名 / 家庭名称 / 桌号 (如: 张伟, 03)"
        />
        <div className="checkin-filters">
          <div className="filter-group">
            {(["all", "groom", "bride"] as const).map((value) => (
              <button
                key={value}
                className={side === value ? `selected ${value}` : ""}
                aria-pressed={side === value}
                onClick={() => setSide(value)}
              >
                {{ all: "全部男/女", groom: "男方", bride: "女方" }[value]}
              </button>
            ))}
          </div>
          <div className="filter-group">
            {(["all", "pending", "arrived"] as const).map((value) => (
              <button
                key={value}
                className={status === value ? `selected ${value}` : ""}
                aria-pressed={status === value}
                onClick={() => setStatus(value)}
              >
                {{ all: "状态", pending: "未到", arrived: "已到" }[value]}
              </button>
            ))}
          </div>
          <select
            aria-label="筛选桌号"
            value={selectedTable}
            onChange={(e) => setTable(e.target.value)}
          >
            <option value="all">所有桌号</option>
            {state.tables.map((t) => (
              <option key={t.id} value={t.tableNo}>
                {t.tableNo} 桌
              </option>
            ))}
          </select>
          <select
            aria-label="筛选标签"
            value={selectedTag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="all">全部自定义标签</option>
            {state.tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </section>
      <Listing
        mode="cards"
        items={visible}
        getKey={(g) => g.id}
        empty="未找到匹配的宾客，请尝试更改搜索词或筛选条件。"
        renderItem={(g) => (
          <GuestCard
            guest={g}
            state={state}
            onCheckIn={() => {
              void run(
                () => toggleCheckIn(g.id),
                g.status === "pending"
                  ? `[${g.name}] 已签到`
                  : `已撤销 [${g.name}] 的签到`,
              );
            }}
            onEdit={() => setModal({ kind: "edit", id: g.id })}
            onGift={() => setModal({ kind: "gift", id: g.id })}
            onHistory={() => setModal({ kind: "history", id: g.id })}
            onFamily={() => setModal({ kind: "family", id: g.id })}
          />
        )}
      />
      {guest && modal?.kind === "edit" && (
        <GuestEditModal guest={guest} onClose={close} />
      )}
      {guest && modal?.kind === "gift" && (
        <AngpaoModal guest={guest} onClose={close} />
      )}
      {guest && modal?.kind === "history" && (
        <AngpaoHistoryModal
          target={{
            name: guest.name,
            guestId: guest.id,
            groupId: guest.groupId,
          }}
          onClose={close}
        />
      )}
      {guest?.groupId && modal?.kind === "family" && (
        <FamilyCheckInModal groupId={guest.groupId} onClose={close} />
      )}
    </div>
  );
}
