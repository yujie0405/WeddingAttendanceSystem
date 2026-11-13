import { useTranslation } from "react-i18next";
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={t("Common.Language")}
    >
      <button
        type="button"
        lang="en"
        aria-pressed={i18n.resolvedLanguage === "en"}
        onClick={() => {
          void i18n.changeLanguage("en");
        }}
      >
        {t("Common.English")}
      </button>
      <button
        type="button"
        lang="zh-CN"
        aria-pressed={i18n.resolvedLanguage !== "en"}
        onClick={() => {
          void i18n.changeLanguage("zh-CN");
        }}
      >
        {t("Common.Chinese")}
      </button>
    </div>
  );
}
