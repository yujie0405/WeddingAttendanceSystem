import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import CN from "../locales/CN.json";
import EN from "../locales/EN.json";

export const languageKey = "wedding-language";
export const supportedLanguages = ["zh-CN", "en"] as const;
function savedLanguage() {
  try {
    const saved = localStorage.getItem(languageKey);
    return saved === "en" ? "en" : "zh-CN";
  } catch {
    return "zh-CN";
  }
}
// Bundled resources initialize synchronously; no network loader or first-frame key flash.
void i18n.use(initReactI18next).init({
  resources: { "zh-CN": { translation: CN }, en: { translation: EN } },
  lng: savedLanguage(),
  fallbackLng: "zh-CN",
  supportedLngs: [...supportedLanguages],
  defaultNS: "translation",
  initAsync: false,
  returnNull: false,
  interpolation: { escapeValue: false },
});
function updateDocument() {
  document.documentElement.lang =
    i18n.resolvedLanguage === "en" ? "en" : "zh-CN";
  document.title = i18n.t("Nav.AppTitle");
}
i18n.on("languageChanged", (language) => {
  updateDocument();
  try {
    localStorage.setItem(languageKey, language === "en" ? "en" : "zh-CN");
  } catch {
    /* A session can still switch language when preference storage is blocked. */
  }
});
updateDocument();
window.addEventListener("storage", (event) => {
  if (event.key === languageKey) {
    const language = event.newValue === "en" ? "en" : "zh-CN";
    if (i18n.resolvedLanguage !== language) void i18n.changeLanguage(language);
  }
});
export default i18n;
