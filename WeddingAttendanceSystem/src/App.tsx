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
import { BackendPage } from "./pages/Backend/BackendPage";
import { BackendTags } from "./pages/Backend/BackendTags";
import { BackendTables } from "./pages/Backend/BackendTables";
import { isApiMode } from "./config";
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={isApiMode ? <BackendPage mode="checkin" /> : <MainPage />} />
          <Route element={<ProtectedRoute admin />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={isApiMode ? <BackendPage key="gifts" mode="gifts" /> : <Dashboard />} />
              <Route path="tag" element={isApiMode ? <BackendTags /> : <Tags />} />
              <Route path="add-guest" element={isApiMode ? <BackendPage key="guests" mode="guests" /> : <Guests />} />
              <Route path="table-setting" element={isApiMode ? <BackendTables /> : <Tables />} />
              <Route path="tag.html" element={<Navigate to="/admin/tag" replace />} />
              <Route path="table-setting.html" element={<Navigate to="/admin/table-setting" replace />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
