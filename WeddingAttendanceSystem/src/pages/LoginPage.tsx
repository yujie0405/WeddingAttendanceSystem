import { LocalizedForm } from "../component/LocalizedForm";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LanguageSwitcher } from "../component/LanguageSwitcher";
import type { TranslationKey } from "../i18n/messages";
export function LoginPage() {
  const { t } = useTranslation();

  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<TranslationKey>();
  if (user) return <Navigate to="/" replace />;
  return (
    <main className="wedding-min-h-screen d-flex align-items-center justify-content-center wedding-p-4">
      <div className="wedding-bg-white wedding-p-6 wedding-rounded-2xl wedding-border wedding-border-hex-E8E2D5 wedding-shadow-md wedding-max-w-sm w-100 wedding-space-y-4 text-center">
        <LanguageSwitcher />
        <div className="login-mark">囍</div>
        <h1 className="wedding-text-lg wedding-font-bold">
          {t("Login.Title")}
        </h1>
        <p className="admin-help">{t("Login.DemoHelp")}</p>
        <LocalizedForm
          className="wedding-space-y-3 text-start"
          onSubmit={(e) => {
            e.preventDefault();
            if (!username.trim()) {
              setError("Errors.UsernameRequired");
              return;
            }
            try {
              login(username);
              navigate("/");
            } catch {
              setError("Errors.LoginSave");
            }
          }}
        >
          <label className="admin-label">
            {t("Login.Username")}
            <input
              className="admin-input"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="admin-label">
            {t("Login.Password")}
            <input
              className="admin-input"
              type="password"
              placeholder={t("Login.PasswordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p role="alert">{t(error)}</p>}
          <button className="admin-primary-button w-100" type="submit">
            {t("Login.Submit")}
          </button>
        </LocalizedForm>
      </div>
    </main>
  );
}
