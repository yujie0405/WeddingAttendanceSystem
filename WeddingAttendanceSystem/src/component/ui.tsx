import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import type { Guest, Tag } from "../types";
export function AttendanceBadge({ guest }: { guest: Guest }) {
  const { t } = useTranslation();

  return (
    <span
      className={
        "admin-badge admin-badge-" +
        (!guest.isActive
          ? "inactive"
          : guest.status === "arrived"
            ? "arrived"
            : "pending")
      }
    >
      {!guest.isActive
        ? t("Status.Inactive")
        : guest.status === "arrived"
          ? t("Status.Arrived", { time: guest.checkInTime || "" })
          : t("Status.Pending")}
    </span>
  );
}
export function SideBadge({ side }: { side: Guest["side"] }) {
  const { t } = useTranslation();

  return (
    <span
      className={
        "admin-badge admin-badge-" + (side === "groom" ? "blue" : "rose")
      }
    >
      {side === "groom" ? t("Common.Groom") : t("Common.Bride")}
    </span>
  );
}
export function TagBadge({ tag }: { tag: Tag }) {
  return <span className={"admin-tag " + tag.color}>{tag.name}</span>;
}
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
}) {
  return (
    <label className="admin-search">
      <FontAwesomeIcon icon={faMagnifyingGlass} />
      <span className="visually-hidden">{placeholder}</span>
      <input
        className="admin-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
