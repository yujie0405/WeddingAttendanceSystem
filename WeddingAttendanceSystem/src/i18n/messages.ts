import type CN from "../locales/CN.json";
import type { TFunction } from "i18next";
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`;
}[keyof T & string];
export type TranslationKey = Leaves<typeof CN>;
export interface Message {
  key: TranslationKey;
  params?: Record<string, string | number>;
}
export type MessageInput = TranslationKey | Message;
export class AppError extends Error {
  readonly key: TranslationKey;
  readonly params?: Message["params"];
  constructor(key: TranslationKey, params?: Message["params"]) {
    super(key);
    this.name = "AppError";
    this.key = key;
    this.params = params;
  }
}
export function errorMessage(error: unknown): Message {
  if (error instanceof AppError)
    return { key: error.key, params: error.params };
  if (error instanceof SyntaxError) return { key: "Errors.InvalidData" };
  console.error(error);
  return { key: "Errors.OperationFailed" };
}
export function translateMessage(t: TFunction, message: MessageInput) {
  if (typeof message === "string") return t(message);
  const params = { ...message.params };
  if (
    message.key === "Errors.Duplicate" &&
    typeof params.entityKey === "string"
  ) {
    const entities = {
      Guest: "Errors.Entities.Guest",
      Tag: "Errors.Entities.Tag",
      Family: "Errors.Entities.Family",
      Table: "Errors.Entities.Table",
      TableNumber: "Errors.Entities.TableNumber",
      Gift: "Errors.Entities.Gift",
    } as const;
    const key = params.entityKey;
    if (key in entities)
      params.entity = t(entities[key as keyof typeof entities]);
  }
  return t(message.key, params);
}
