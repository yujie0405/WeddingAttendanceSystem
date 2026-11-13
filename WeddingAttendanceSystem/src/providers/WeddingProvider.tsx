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
  if (!draft.name.trim()) throw new Error("请输入宾客姓名");
  if (!s.tables.some((t) => t.tableNo === draft.tableNo))
    throw new Error("请选择有效桌位");
}
function makeActions(isAdmin: boolean, recordedBy: string) {
  const admin = () => {
    if (!isAdmin) throw new Error("此操作需要管理员权限");
  };
  return {
    toggleCheckIn: (id: string) =>
      weddingStore.transact((s) => {
        const g = s.guests.find((g) => g.id === id && g.isActive);
        if (!g) throw new Error("宾客不存在");
        g.status = g.status === "pending" ? "arrived" : "pending";
        g.checkInTime = g.status === "arrived" ? timeNow() : undefined;
      }),
    checkInFamily: (id: string) =>
      weddingStore.transact((s) => {
        if (!s.groups.some((g) => g.id === id)) throw new Error("家庭不存在");
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
        if (!s.tags.some((t) => t.name === draft.relationship))
          throw new Error("请选择已有标签作为身份关系");
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
        if (!g) throw new Error("宾客不存在");
        Object.assign(g, draft, { name: draft.name.trim() });
      }),
    addTag: (name: string) =>
      weddingStore.transact((s) => {
        admin();
        if (!name.trim()) throw new Error("请输入标签名称");
        s.tags.push({
          id: newId("tag"),
          name: name.trim(),
          color: tagColor(palette[s.tags.length % palette.length]),
        });
      }),
    deleteTag: (id: string) =>
      weddingStore.transact((s) => {
        admin();
        s.tags = s.tags.filter((t) => t.id !== id);
      }),
    addTable: (capacity: number) =>
      weddingStore.transact((s) => {
        admin();
        if (!Number.isSafeInteger(capacity) || capacity < 1)
          throw new Error("容纳人数必须是正整数");
        const next = Math.max(
          s.nextTableNumber,
          ...s.tables.map((t) => Number(t.tableNo) + 1),
        );
        if (!Number.isSafeInteger(next + 1)) throw new Error("桌号已达到上限");
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
        const t = s.tables.find((t) => t.id === id);
        if (!t) throw new Error("桌位不存在");
        if (tableUsage(s, t.tableNo).blocked)
          throw new Error("请先重新安排宾客或家庭桌位，再删除");
        s.tables = s.tables.filter((t) => t.id !== id);
      }),
    registerGift: (draft: GiftDraft) =>
      weddingStore.transact((s) => {
        if (!Number.isFinite(draft.amount) || draft.amount <= 0)
          throw new Error("请输入正确的礼金金额");
        const recipient = (
          draft.targetType === "individual" ? s.guests : s.groups
        ).find((r) => r.id === draft.targetId);
        if (!recipient) throw new Error("礼金收录对象不存在");
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
        if (!reason.trim()) throw new Error("请填写作废原因");
        const r = s.angpaoRecords.find((r) => r.id === id);
        if (!r || r.isVoided) throw new Error("记录不存在或已经作废");
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
  run: (task: () => Promise<unknown>, success: string) => Promise<boolean>;
}
export const WeddingContext = createContext<WeddingContextValue | null>(null);
export function WeddingProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState(() => {
    try {
      weddingStore.getSnapshot();
      return "";
    } catch (e) {
      return e instanceof Error ? e.message : "无法读取保存的数据";
    }
  });
  const recover = (task: () => void) => {
    try {
      task();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "数据无效");
    }
  };
  if (error)
    return (
      <main className="recovery wedding-max-w-4xl wedding-mx-auto wedding-p-6">
        <h1>选择或恢复婚礼数据</h1>
        <p role="alert">{error}</p>
        <p>
          不会删除原始数据。请选择要使用的数据来源，或导入已导出的完整 JSON
          数据。
        </p>
        <div className="admin-row-actions">
          <button
            className="admin-outline-button"
            onClick={() =>
              recover(() => weddingStore.replace(legacySource("react")))
            }
          >
            使用现有 React 数据
          </button>
          <button
            className="admin-outline-button"
            onClick={() =>
              recover(() => weddingStore.replace(legacySource("template")))
            }
          >
            使用模板数据
          </button>
        </div>
        <label className="admin-label wedding-mt-3">
          导入完整 JSON
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
                  .catch(() => setError("无法读取文件"));
            }}
          />
        </label>
      </main>
    );
  return <WeddingSession>{children}</WeddingSession>;
}
function WeddingSession({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    weddingStore.subscribe,
    weddingStore.getSnapshot,
  );
  const { user } = useAuth();
  const [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const run: WeddingContextValue["run"] = async (task, success) => {
    let ok = true;
    let message = success;
    try {
      await task();
    } catch (e) {
      ok = false;
      message = e instanceof Error ? e.message : "操作失败";
    }
    setNotice(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 4000);
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
          {notice}
        </div>
      )}
    </WeddingContext.Provider>
  );
}
