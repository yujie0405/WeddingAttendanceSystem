import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  if (user) return <Navigate to="/" replace />;
  return (
    <main className="wedding-min-h-screen d-flex align-items-center justify-content-center wedding-p-4">
      <div className="wedding-bg-white wedding-p-6 wedding-rounded-2xl wedding-border wedding-border-hex-E8E2D5 wedding-shadow-md wedding-max-w-sm w-100 wedding-space-y-4 text-center">
        <div className="login-mark">囍</div>
        <h1 className="wedding-text-lg wedding-font-bold">
          婚礼宾客签到系统登录
        </h1>
        <p className="admin-help">
          演示登录：账号含 admin 为管理员，其余为接待员。
        </p>
        <form
          className="wedding-space-y-3 text-start"
          onSubmit={(e) => {
            e.preventDefault();
            if (!username.trim()) {
              setError("请输入账号");
              return;
            }
            try {
              login(username);
              navigate("/");
            } catch {
              setError("无法保存登录状态");
            }
          }}
        >
          <label className="admin-label">
            账号 / 接待员姓名
            <input
              className="admin-input"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="admin-label">
            密码
            <input
              className="admin-input"
              type="password"
              placeholder="演示模式：任意密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <button className="admin-primary-button w-100" type="submit">
            进入系统
          </button>
        </form>
      </div>
    </main>
  );
}
