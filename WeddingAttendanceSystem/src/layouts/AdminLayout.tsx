import { Outlet } from "react-router-dom";
import { NavTag } from "../component/navtag";
export function AdminLayout() {
  return (
    <div className="wedding-bg-white wedding-rounded-2xl wedding-border wedding-border-hex-E8E2D5 overflow-hidden">
      <NavTag />
      <div className="wedding-p-4 wedding-md-p-6 wedding-space-y-6">
        <Outlet />
      </div>
    </div>
  );
}
