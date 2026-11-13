import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { MainPage } from "./pages/MainPage/MainPage";
import { Dashboard } from "./pages/Admin/Dashboard/Dashboard";
import { Tags } from "./pages/Admin/Tags/Tags";
import { Guests } from "./pages/Admin/Guests/Guests";
import { Tables } from "./pages/Admin/Tables/Tables";
import { LoginPage } from "./pages/LoginPage";
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<MainPage />} />
          <Route element={<ProtectedRoute admin />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tag" element={<Tags />} />
              <Route path="add-guest" element={<Guests />} />
              <Route path="table-setting" element={<Tables />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
