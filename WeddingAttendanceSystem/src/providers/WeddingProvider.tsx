import { AppError } from "../i18n/messages";
import { useTranslation } from "react-i18next";
import { errorMessage, translateMessage } from "../i18n/messages";
import type { Message, MessageInput } from "../i18n/messages";
import { LanguageSwitcher } from "../component/LanguageSwitcher";
import {
  createContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { GiftDraft, GuestDraft, WeddingState } from "../types";
import { weddingStore } from "../api/client";
import { legacySource } from "../api/migrations";
import { useAuth } from "../hooks/useAuth";
import {
  dateTimeNow,
  newId,
  palette,
  tagColor,
  timeNow,
} from "../utils/format";
import { tableUsage } from "../utils/selectors";

function validateGuest(s: WeddingState, draft: GuestDraft) {
  if (!draft.name.trim()) throw new AppError("Errors.GuestNameRequired");
  if (!s.tables.some((item) => item.tableNo === draft.tableNo))
    throw new AppError("Errors.InvalidTable");
}
function makeActions(isAdmin: boolean, recordedBy: string) {
  const admin = () => {
    if (!isAdmin) throw new AppError("Errors.AdminRequired");
  };
  return {
    toggleCheckIn: (id: string) =>
      weddingStore.transact((s) => {
        const g = s.guests.find((g) => g.id === id && g.isActive);
        if (!g) throw new AppError("Errors.GuestMissing");
        g.status = g.status === "pending" ? "arrived" : "pending";
        g.checkInTime = g.status === "arrived" ? timeNow() : undefined;
      }),
    checkInFamily: (id: string) =>
      weddingStore.transact((s) => {
        if (!s.groups.some((g) => g.id === id))
          throw new AppError("Errors.FamilyMissing");
        const now = timeNow();
        s.guests.forEach((g) => {
          if (g.groupId === id && g.isActive && g.status === "pending") {
            g.status = "arrived";
            g.checkInTime = now;
          }
        });
      }),
    addGuest: (draft: GuestDraft) =>
      weddingStore.transact((s) => {
        admin();
        validateGuest(s, draft);
        if (!s.tags.some((item) => item.name === draft.relationship))
          throw new AppError("Errors.RelationshipRequired");
        s.guests.unshift({
          ...draft,
          name: draft.name.trim(),
          id: newId("guest"),
          status: "pending",
          isActive: true,
        });
      }),
    editGuest: (id: string, draft: GuestDraft) =>
      weddingStore.transact((s) => {
        validateGuest(s, draft);
        const g = s.guests.find((g) => g.id === id);
        if (!g) throw new AppError("Errors.GuestMissing");
        Object.assign(g, draft, { name: draft.name.trim() });
      }),
    addTag: (name: string) =>
      weddingStore.transact((s) => {
        admin();
        if (!name.trim()) throw new AppError("Errors.TagNameRequired");
        s.tags.push({
          id: newId("tag"),
          name: name.trim(),
          color: tagColor(palette[s.tags.length % palette.length]),
        });
      }),
    deleteTag: (id: string) =>
      weddingStore.transact((s) => {
        admin();
        s.tags = s.tags.filter((item) => item.id !== id);
      }),
    addTable: (capacity: number) =>
      weddingStore.transact((s) => {
        admin();
        if (!Number.isSafeInteger(capacity) || capacity < 1)
          throw new AppError("Errors.CapacityInvalid");
        const next = Math.max(
          s.nextTableNumber,
          ...s.tables.map((item) => Number(item.tableNo) + 1),
        );
        if (!Number.isSafeInteger(next + 1))
          throw new AppError("Errors.TableLimit");
        s.tables.push({
          id: newId("table"),
          tableNo: String(next).padStart(2, "0"),
          capacity,
          tagIds: [],
        });
        s.nextTableNumber = next + 1;
      }),
    deleteTable: (id: string) =>
      weddingStore.transact((s) => {
        admin();
        const t = s.tables.find((item) => item.id === id);
        if (!t) throw new AppError("Errors.TableMissing");
        if (tableUsage(s, t.tableNo).blocked)
          throw new AppError("Errors.TableAssigned");
        s.tables = s.tables.filter((item) => item.id !== id);
      }),
    registerGift: (draft: GiftDraft) =>
      weddingStore.transact((s) => {
        if (!Number.isFinite(draft.amount) || draft.amount <= 0)
          throw new AppError("Errors.GiftAmountInvalid");
        const recipient = (
          draft.targetType === "individual" ? s.guests : s.groups
        ).find((r) => r.id === draft.targetId);
        if (!recipient) throw new AppError("Errors.RecipientMissing");
        s.angpaoRecords.unshift({
          id: newId("ap"),
          targetType: draft.targetType,
          targetId: recipient.id,
          targetName: recipient.name,
          amount: draft.amount,
          notes: draft.notes.trim() || undefined,
          recordedBy,
          timestamp: dateTimeNow(),
          isVoided: false,
        });
      }),
    voidGift: (id: string, reason: string) =>
      weddingStore.transact((s) => {
        admin();
        if (!reason.trim()) throw new AppError("Errors.VoidReasonRequired");
        const r = s.angpaoRecords.find((r) => r.id === id);
        if (!r || r.isVoided) throw new AppError("Errors.GiftUnavailable");
        r.isVoided = true;
        r.voidReason = reason.trim();
      }),
    importData: async (raw: unknown) => {
      admin();
      weddingStore.replace(raw);
    },
  };
}
interface WeddingContextValue {
  state: WeddingState;
  actions: ReturnType<typeof makeActions>;
  run: (
    task: () => Promise<unknown>,
    success: MessageInput,
  ) => Promise<boolean>;
}
export const WeddingContext = createContext<WeddingContextValue | null>(null);
export function WeddingProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [error, setError] = useState<Message | undefined>(() => {
    try {
      weddingStore.getSnapshot();
      return undefined;
    } catch (e) {
      return errorMessage(e);
    }
  });
  const recover = (task: () => void) => {
    try {
      task();
      setError(undefined);
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  if (error)
    return (
      <main className="recovery wedding-max-w-4xl wedding-mx-auto wedding-p-6">
        <LanguageSwitcher />
        <h1>{t("DataTransfer.RecoveryTitle")}</h1>
        <p role="alert">{translateMessage(t, error)}</p>
        <p>{t("DataTransfer.RecoveryHelp")}</p>
        <div className="admin-row-actions">
          <button
            className="admin-outline-button"
            onClick={() =>
              recover(() => weddingStore.replace(legacySource("react")))
            }
          >
            {t("DataTransfer.UseReact")}
          </button>
          <button
            className="admin-outline-button"
            onClick={() =>
              recover(() => weddingStore.replace(legacySource("template")))
            }
          >
            {t("DataTransfer.UseTemplate")}
          </button>
        </div>
        <label className="admin-label wedding-mt-3">
          {t("DataTransfer.ImportComplete")}
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file)
                void file
                  .text()
                  .then((text) =>
                    recover(() => weddingStore.replace(JSON.parse(text))),
                  )
                  .catch(() => setError({ key: "Errors.FileRead" }));
            }}
          />
        </label>
      </main>
    );
  return <WeddingSession>{children}</WeddingSession>;
}
function WeddingSession({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const state = useSyncExternalStore(
    weddingStore.subscribe,
    weddingStore.getSnapshot,
  );
  const { user } = useAuth();
  const [notice, setNotice] = useState<MessageInput>();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const run: WeddingContextValue["run"] = async (task, success) => {
    let ok = true;
    let message = success;
    try {
      await task();
    } catch (e) {
      ok = false;
      message = errorMessage(e);
    }
    setNotice(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(undefined), 4000);
    return ok;
  };
  return (
    <WeddingContext.Provider
      value={{
        state,
        actions: makeActions(user?.role === "admin", user?.name || "工作人员"),
        run,
      }}
    >
      {children}
      {notice && (
        <div role="status" className="wedding-toast">
          {translateMessage(t, notice)}
        </div>
      )}
    </WeddingContext.Provider>
  );
}
