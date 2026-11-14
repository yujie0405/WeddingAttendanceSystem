import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faTag,
  faUser,
  faTableCells,
} from "@fortawesome/free-solid-svg-icons";
import { isApiMode } from "../config";
const tabs = [
  { to: "/admin/dashboard", label: "Nav.Dashboard" as const, icon: faChartPie },
  { to: "/admin/tag", label: "Nav.Tags" as const, icon: faTag },
  { to: "/admin/add-guest", label: "Nav.Guests" as const, icon: faUser },
  {
    to: "/admin/table-setting",
    label: "Nav.Tables" as const,
    icon: faTableCells,
  },
];
export function NavTag() {
  const { t } = useTranslation();

  return (
    <nav className="admin-nav" aria-label={t("Nav.AdminNavigation")}>
      {tabs.filter(tab => !isApiMode || tab.to !== "/admin/table-setting").map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            "admin-nav-link " + (isActive ? "active" : "")
          }
        >
          <FontAwesomeIcon icon={tab.icon} /> {t(tab.label)}
        </NavLink>
      ))}
    </nav>
  );
}
