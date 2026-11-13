import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
  const selectedTable = state.tables.some((item) => item.tableNo === table)
    ? table
    : "all";
  const selectedTag = state.tags.some((item) => item.id === tag) ? tag : "all";
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
            <span>{t("Main.ArrivedPeople")}</span>
            <strong>
              {t("Main.ArrivalSummary", {
                arrived: active.filter((g) => g.status === "arrived").length,
                count: active.length,
              })}
            </strong>
          </div>
          <div>
            <span>{t("Main.GiftStatus")}</span>
            <b>{t("Main.GiftPrivacy")}</b>
          </div>
        </div>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t("Main.SearchPlaceholder")}
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
                {
                  {
                    all: t("Main.AllSides"),
                    groom: t("Common.Groom"),
                    bride: t("Common.Bride"),
                  }[value]
                }
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
                {
                  {
                    all: t("Main.StatusFilter"),
                    pending: t("Main.PendingFilter"),
                    arrived: t("Main.ArrivedFilter"),
                  }[value]
                }
              </button>
            ))}
          </div>
          <select
            aria-label={t("Main.FilterTable")}
            value={selectedTable}
            onChange={(e) => setTable(e.target.value)}
          >
            <option value="all">{t("Main.AllTables")}</option>
            {state.tables.map((item) => (
              <option key={item.id} value={item.tableNo}>
                {t("Common.TableNumber", { table: item.tableNo })}
              </option>
            ))}
          </select>
          <select
            aria-label={t("Main.FilterTag")}
            value={selectedTag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="all">{t("Main.AllTags")}</option>
            {state.tags.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </section>
      <Listing
        mode="cards"
        items={visible}
        getKey={(g) => g.id}
        empty={t("Main.Empty")}
        renderItem={(g) => (
          <GuestCard
            guest={g}
            state={state}
            onCheckIn={() => {
              void run(
                () => toggleCheckIn(g.id),
                g.status === "pending"
                  ? {
                      key: "Notifications.GuestCheckedIn",
                      params: { name: g.name },
                    }
                  : {
                      key: "Notifications.CheckInUndone",
                      params: { name: g.name },
                    },
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
