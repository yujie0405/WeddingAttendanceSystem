import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faTag,
  faUser,
  faTableCells,
} from "@fortawesome/free-solid-svg-icons";
const tabs = [
  { to: "/admin/dashboard", label: "仪表盘", icon: faChartPie },
  { to: "/admin/tag", label: "全局标签管理", icon: faTag },
  { to: "/admin/add-guest", label: "新增/管理宾客", icon: faUser },
  { to: "/admin/table-setting", label: "桌位设置", icon: faTableCells },
];
export function NavTag() {
  return (
    <nav className="admin-nav" aria-label="后台导航">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            "admin-nav-link " + (isActive ? "active" : "")
          }
        >
          <FontAwesomeIcon icon={tab.icon} /> {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
