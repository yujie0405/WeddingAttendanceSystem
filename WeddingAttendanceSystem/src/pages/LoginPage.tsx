import { LocalizedForm } from "../component/LocalizedForm";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LanguageSwitcher } from "../component/LanguageSwitcher";
import type { TranslationKey } from "../i18n/messages";
import { AppError } from "../i18n/messages";
import { isApiMode, isAuthConfigured } from "../config";
export function LoginPage() {
  const { t } = useTranslation();

  const { user, login, loading, authError, retry, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<TranslationKey>();
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  return (
    <main className="wedding-min-h-screen d-flex align-items-center justify-content-center wedding-p-4">
      <div className="wedding-bg-white wedding-p-6 wedding-rounded-2xl wedding-border wedding-border-hex-E8E2D5 wedding-shadow-md wedding-max-w-sm w-100 wedding-space-y-4 text-center">
        <LanguageSwitcher />
        <div className="login-mark">囍</div>
        <h1 className="wedding-text-lg wedding-font-bold">
          {t("Login.Title")}
        </h1>
        <p className="admin-help">{t(isApiMode ? "Backend.ApiHelp" : "Login.DemoHelp")}</p>
        {isApiMode && !isAuthConfigured() && <p role="alert">{t("Backend.ConfigurationRequired")}</p>}
        {authError && <div role="alert">
          <p>{t(authError)}</p>
          <button type="button" onClick={retry}>{t("Backend.Retry")}</button>
          <button type="button" onClick={() => { void logout().catch(() => setError("Backend.RequestFailed")); }}>{t("Backend.SignOut")}</button>
        </div>}
        <LocalizedForm
          className="wedding-space-y-3 text-start"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy || loading) return;
            if (!username.trim()) {
              setError("Errors.UsernameRequired");
              return;
            }
            try {
              setBusy(true);
              setError(undefined);
              await login(username, password);
              navigate("/");
            } catch (error) {
              setError(error instanceof AppError ? error.key : "Errors.LoginSave");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="admin-label">
            {t(isApiMode ? "Backend.Email" : "Login.Username")}
            <input
              className="admin-input"
              required
              type={isApiMode ? "email" : "text"}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="admin-label">
            {t("Login.Password")}
            <input
              className="admin-input"
              type="password"
              required={isApiMode}
              autoComplete="current-password"
              placeholder={t(isApiMode ? "Backend.PasswordPlaceholder" : "Login.PasswordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p role="alert">{t(error)}</p>}
          <button className="admin-primary-button w-100" type="submit" disabled={busy || loading || (isApiMode && !isAuthConfigured())}>
            {t(loading || busy ? "Backend.Loading" : "Login.Submit")}
          </button>
        </LocalizedForm>
      </div>
    </main>
  );
}
