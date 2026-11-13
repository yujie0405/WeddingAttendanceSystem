import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();

  const { state } = useWedding();
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<HistoryTarget>();
  const active = state.guests.filter((g) => g.isActive);
  const columns: ListingColumn<Guest>[] = [
    {
      key: "name",
      title: t("Common.Name"),
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
      title: t("Common.Side"),
      render: (g) => <SideBadge side={g.side} />,
    },
    {
      key: "table",
      title: t("Common.Table"),
      render: (g) => t("Common.TableNumber", { table: g.tableNo }),
    },
    {
      key: "status",
      title: t("Common.Status"),
      render: (g) => <AttendanceBadge guest={g} />,
    },
    {
      key: "amount",
      title: t("Common.IndividualGift"),
      render: (g) =>
        validGifts(state).some(
          (r) => r.targetType === "individual" && r.targetId === g.id,
        ) ? (
          <span className="admin-money">
            {formatRM(
              giftTotal(state, "individual", g.id),
              i18n.resolvedLanguage,
            )}
          </span>
        ) : (
          <span className="admin-muted">{t("Common.NotRecorded")}</span>
        ),
    },
    {
      key: "actions",
      title: t("Common.Actions"),
      render: (g) => (
        <div className="admin-row-actions">
          <button
            className="admin-outline-button"
            onClick={() =>
              setTarget({ name: g.name, guestId: g.id, type: "individual" })
            }
          >
            {t("Admin.Dashboard.Details")}
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
                {t("Common.FamilyGift")}
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
          <h2>{t("Main.ArrivedPeople")}</h2>
          <strong>
            {t("Main.ArrivalSummary", {
              arrived: active.filter((g) => g.status === "arrived").length,
              count: active.length,
            })}
          </strong>
        </div>
        <div className="gift-stat">
          <h2>
            <FontAwesomeIcon icon={faGift} /> {t("Admin.Dashboard.TotalTitle")}
          </h2>
          <strong>{formatRM(giftTotal(state), i18n.resolvedLanguage)}</strong>
          <p>
            {t("Admin.Dashboard.ValidGiftCount", {
              count: validGifts(state).length,
            })}
          </p>
        </div>
      </div>
      <section className="admin-section">
        <h2 className="admin-section-title">
          <FontAwesomeIcon icon={faList} /> {t("Admin.Dashboard.GuestGifts")}
        </h2>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t("Admin.Dashboard.Search")}
        />
        <Listing
          mode="table"
          label={t("Admin.Dashboard.ListLabel")}
          items={state.guests.filter((g) => matchesGuest(g, search))}
          getKey={(g) => g.id}
          columns={columns}
        />
      </section>
      <p className="admin-gift-breakdown">
        {t("Admin.Dashboard.Breakdown", {
          individual: formatRM(
            giftTotal(state, "individual"),
            i18n.resolvedLanguage,
          ),
          family: formatRM(giftTotal(state, "family"), i18n.resolvedLanguage),
          total: formatRM(giftTotal(state), i18n.resolvedLanguage),
        })}
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
