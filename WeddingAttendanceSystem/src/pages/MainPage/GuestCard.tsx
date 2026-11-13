import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faGift,
  faPenToSquare,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { Guest, WeddingState } from "../../types";
import { AttendanceBadge, SideBadge, TagBadge } from "../../component/ui";
export function GuestCard({
  guest: g,
  state,
  onCheckIn,
  onEdit,
  onGift,
  onHistory,
  onFamily,
}: {
  guest: Guest;
  state: WeddingState;
  onCheckIn: () => void;
  onEdit: () => void;
  onGift: () => void;
  onHistory: () => void;
  onFamily: () => void;
}) {
  const arrived = g.status === "arrived";
  const gifts = state.angpaoRecords.filter(
    (r) =>
      !r.isVoided &&
      (r.targetType === "individual"
        ? r.targetId === g.id
        : !!g.groupId && r.targetId === g.groupId),
  );
  return (
    <article
      data-guest-id={g.id}
      className={"guest-card " + (arrived ? "arrived" : "")}
    >
      <div className="d-flex align-items-start justify-content-between wedding-gap-2">
        <div className="wedding-space-y-1">
          <div className="d-flex align-items-center flex-wrap wedding-gap-1-5">
            <h2 className="wedding-text-base wedding-font-bold">{g.name}</h2>
            <span className="guest-relationship">{g.relationship}</span>
            <SideBadge side={g.side} />
            {g.tagIds.map((id) => {
              const tag = state.tags.find((t) => t.id === id);
              return tag ? <TagBadge key={id} tag={tag} /> : null;
            })}
            <AttendanceBadge guest={g} />
          </div>
          <div className="guest-meta">
            <span>
              桌号: <strong>{g.tableNo} 桌</strong>
              {g.seatNo && ` (座位 ${g.seatNo})`}
            </span>
            {g.groupName && <span>所属家庭: {g.groupName}</span>}
            {g.notes && <span className="guest-note">备注: {g.notes}</span>}
            {g.groupId && (
              <button
                className="wedding-text-emerald-700 wedding-font-semibold"
                onClick={onFamily}
              >
                全家签到
              </button>
            )}
          </div>
        </div>
        <button
          title="修改宾客资料及标签"
          className="guest-edit"
          onClick={onEdit}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      </div>
      <div className="guest-actions">
        <div className="d-flex flex-wrap align-items-center wedding-gap-2">
          <button className="gift-button" onClick={onGift}>
            <FontAwesomeIcon icon={faGift} /> 登记礼金
          </button>
          {gifts.length > 0 && (
            <button
              className="wedding-text-xs wedding-text-amber-800 wedding-font-semibold"
              onClick={onHistory}
            >
              已登记 ({gifts.length} 笔)
            </button>
          )}
        </div>
        <button
          className={"checkin-button " + (arrived ? "arrived" : "")}
          onClick={onCheckIn}
        >
          <FontAwesomeIcon icon={arrived ? faCheck : faUserCheck} />{" "}
          {arrived ? "已到 (撤销)" : "立即签到"}
        </button>
      </div>
    </article>
  );
}
