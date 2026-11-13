import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faUserCheck,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";
export function Navbar() {
  const { user, logout } = useAuth();
  const adminPage = useLocation().pathname.startsWith("/admin");
  const navigate = useNavigate();
  return (
    <header className="position-sticky wedding-top-0 wedding-z-30 wedding-bg-hex-FFFDF9-95 wedding-backdrop-blur-md wedding-border-b wedding-border-hex-E8E2D5">
      <div className="wedding-max-w-4xl wedding-mx-auto wedding-px-4 wedding-py-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center wedding-gap-2-5">
          <Link
            to="/"
            aria-label="签到主页"
            className="wedding-w-9 wedding-h-9 wedding-rounded-full wedding-bg-gradient-to-br wedding-from-amber-600 wedding-to-amber-700 wedding-text-white d-flex align-items-center justify-content-center wedding-font-serif wedding-text-lg wedding-font-bold flex-shrink-0"
          >
            囍
          </Link>
          <div>
            <h1 className="wedding-text-base wedding-font-bold wedding-leading-tight">
              婚礼宾客签到与礼金管理系统
            </h1>
            <p className="wedding-text-xs wedding-text-hex-78716C wedding-mt-0-5">
              🟢 {user?.name} ({user?.role === "admin" ? "管理员" : "接待员"})
            </p>
          </div>
        </div>
        <div className="d-flex align-items-center wedding-gap-2">
          {user?.role === "admin" && (
            <Link
              className={"header-link " + (adminPage ? "active" : "")}
              to={adminPage ? "/" : "/admin/dashboard"}
            >
              <FontAwesomeIcon icon={adminPage ? faUserCheck : faUserShield} />
              <span>{adminPage ? "返回签到主页" : "后台标签/配置"}</span>
            </Link>
          )}
          <button
            className="wedding-p-1-5 wedding-text-hex-78716C"
            title="退出登录"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      </div>
    </header>
  );
}
