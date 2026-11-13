import "i18next";
import type CN from "../locales/CN.json";
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    returnNull: false;
    resources: { translation: typeof CN };
  }
}
