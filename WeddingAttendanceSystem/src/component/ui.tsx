import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import type { Guest, Tag } from "../types";
export function AttendanceBadge({ guest }: { guest: Guest }) {
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
        ? "已停用"
        : guest.status === "arrived"
          ? `已签到 ${guest.checkInTime || ""}`
          : "未签到"}
    </span>
  );
}
export function SideBadge({ side }: { side: Guest["side"] }) {
  return (
    <span
      className={
        "admin-badge admin-badge-" + (side === "groom" ? "blue" : "rose")
      }
    >
      {side === "groom" ? "男方" : "女方"}
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
