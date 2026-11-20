import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faGift,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { Guest, WeddingState } from "../../types";
import { AttendanceBadge, SideBadge, TagBadge } from "../../component/ui";
export function GuestCard({
  guest: g,
  state,
  onCheckIn,
  onGift,
  onHistory,
  onFamily,
}: {
  guest: Guest;
  state: WeddingState;
  onCheckIn: () => void;
  onGift: () => void;
  onHistory: () => void;
  onFamily: () => void;
}) {
  const { t } = useTranslation();

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
              const tag = state.tags.find((item) => item.id === id);
              return tag ? <TagBadge key={id} tag={tag} /> : null;
            })}
            <AttendanceBadge guest={g} />
          </div>
          <div className="guest-meta">
            <span>
              {t("Common.TableNumber", { table: g.tableNo })}
              {g.seatNo && t("Common.SeatParenthesis", { seat: g.seatNo })}
            </span>
            {g.groupName && (
              <span>{t("Common.FamilyName", { name: g.groupName })}</span>
            )}
            {g.notes && (
              <span className="guest-note">
                {t("Common.Note", { note: g.notes })}
              </span>
            )}
            {g.groupId && (
              <button
                className="wedding-text-emerald-700 wedding-font-semibold"
                onClick={onFamily}
              >
                {t("Main.FamilyCheckIn")}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="guest-actions">
        <div className="d-flex flex-wrap align-items-center wedding-gap-2">
          <button className="gift-button" onClick={onGift}>
            <FontAwesomeIcon icon={faGift} /> {t("Main.RegisterGift")}
          </button>
          {gifts.length > 0 && (
            <button
              className="wedding-text-xs wedding-text-amber-800 wedding-font-semibold"
              onClick={onHistory}
            >
              {t("Main.RecordedGifts", { count: gifts.length })}
            </button>
          )}
        </div>
        <button
          className={"checkin-button " + (arrived ? "arrived" : "")}
          onClick={onCheckIn}
        >
          <FontAwesomeIcon icon={arrived ? faCheck : faUserCheck} />{" "}
          {arrived ? t("Main.UndoCheckIn") : t("Main.CheckIn")}
        </button>
      </div>
    </article>
  );
}
