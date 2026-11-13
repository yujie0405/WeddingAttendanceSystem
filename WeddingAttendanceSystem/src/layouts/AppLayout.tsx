import { Outlet } from "react-router-dom";
import { Navbar } from "../component/navbar";
export function AppLayout() {
  return (
    <div className="wedding-min-h-screen d-flex flex-column">
      <Navbar />
      <main className="wedding-flex-1 wedding-max-w-4xl w-100 wedding-mx-auto wedding-p-3 wedding-md-p-6">
        <Outlet />
      </main>
    </div>
  );
}
