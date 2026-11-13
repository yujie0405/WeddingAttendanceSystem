import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faList } from "@fortawesome/free-solid-svg-icons";
import { useWedding } from "../../../hooks/useWedding";
import { formatRM } from "../../../utils/format";
import { giftTotal, matchesGuest, validGifts } from "../../../utils/selectors";
import type { Guest } from "../../../types";
import { Listing } from "../../../component/listing";
import type { ListingColumn } from "../../../component/listing";
import { AttendanceBadge, SearchField, SideBadge } from "../../../component/ui";
import { AngpaoHistoryModal } from "../../../component/AngpaoHistoryModal";
import type { HistoryTarget } from "../../../component/AngpaoHistoryModal";
export function Dashboard() {
  const { state } = useWedding();
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<HistoryTarget>();
  const active = state.guests.filter((g) => g.isActive);
  const columns: ListingColumn<Guest>[] = [
    {
      key: "name",
      title: "姓名",
      render: (g) => (
        <>
          <strong>{g.name}</strong>
          {g.groupName && (
            <small className="admin-subtext">{g.groupName}</small>
          )}
        </>
      ),
    },
    {
      key: "side",
      title: "婚礼边",
      render: (g) => <SideBadge side={g.side} />,
    },
    { key: "table", title: "桌号", render: (g) => `${g.tableNo} 桌` },
    {
      key: "status",
      title: "签到状态",
      render: (g) => <AttendanceBadge guest={g} />,
    },
    {
      key: "amount",
      title: "个人礼金",
      render: (g) =>
        validGifts(state).some(
          (r) => r.targetType === "individual" && r.targetId === g.id,
        ) ? (
          <span className="admin-money">
            {formatRM(giftTotal(state, "individual", g.id))}
          </span>
        ) : (
          <span className="admin-muted">未登记</span>
        ),
    },
    {
      key: "actions",
      title: "操作",
      render: (g) => (
        <div className="admin-row-actions">
          <button
            className="admin-outline-button"
            onClick={() =>
              setTarget({ name: g.name, guestId: g.id, type: "individual" })
            }
          >
            个人明细
          </button>
          {g.groupId &&
            state.angpaoRecords.some(
              (r) => r.targetType === "family" && r.targetId === g.groupId,
            ) && (
              <button
                className="admin-outline-button"
                onClick={() =>
                  setTarget({
                    name: g.groupName || g.name,
                    groupId: g.groupId,
                    type: "family",
                  })
                }
              >
                家庭礼金
              </button>
            )}
        </div>
      ),
    },
  ];
  return (
    <>
      <div className="admin-summary-grid">
        <div className="attendance-stat">
          <h2>全场出席进度 (Arrived / Total)</h2>
          <strong>
            {active.filter((g) => g.status === "arrived").length} /{" "}
            {active.length} 人
          </strong>
        </div>
        <div className="gift-stat">
          <h2>
            <FontAwesomeIcon icon={faGift} /> 后台礼金汇总统计（仅管理员可见）
          </h2>
          <strong>{formatRM(giftTotal(state))}</strong>
          <p>共 {validGifts(state).length} 笔有效礼金记录</p>
        </div>
      </div>
      <section className="admin-section">
        <h2 className="admin-section-title">
          <FontAwesomeIcon icon={faList} /> 宾客与礼金
        </h2>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="搜索姓名 / 家庭 / 桌号"
        />
        <Listing
          mode="table"
          label="宾客个人礼金列表"
          items={state.guests.filter((g) => matchesGuest(g, search))}
          getKey={(g) => g.id}
          columns={columns}
        />
      </section>
      <p className="admin-gift-breakdown">
        个人礼金 {formatRM(giftTotal(state, "individual"))} ＋ 家庭礼金{" "}
        {formatRM(giftTotal(state, "family"))} ＝ 合计{" "}
        {formatRM(giftTotal(state))}
      </p>
      {target && (
        <AngpaoHistoryModal
          financial
          target={target}
          onClose={() => setTarget(undefined)}
        />
      )}
    </>
  );
}
