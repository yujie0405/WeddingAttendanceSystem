import { LEGACY_REACT_SEED, TEMPLATE_SEED } from "../data";
import type {
  AngpaoRecord,
  CurrentUser,
  Group,
  Guest,
  WeddingState,
} from "../types";
import { tagColor } from "../utils/format";

type RecordValue = Record<string, unknown>;
function object(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("数据格式不正确：需要一个对象。");
  return value as RecordValue;
}
function text(value: unknown): string {
  if (typeof value !== "string") throw new Error("数据中有无效文字字段。");
  return value;
}
function optional(value: unknown) {
  return value === undefined || value === null ? undefined : text(value);
}
function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("数据中缺少记录列表。");
  return value;
}
function strings(value: unknown) {
  return array(value).map(text);
}
function number(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new Error("数据中有无效数字。");
  return value;
}
function side(value: unknown) {
  const v = text(value).toLowerCase();
  if (v !== "groom" && v !== "bride") throw new Error("婚礼边数据无效。");
  return v;
}
function unique(values: string[], label: string) {
  if (new Set(values).size !== values.length)
    throw new Error(`${label}存在重复编号。`);
}
export function normalizeData(raw: unknown): WeddingState {
  const wrapper = object(raw);
  const s = object(wrapper.data ?? wrapper);
  if (s.version !== undefined && s.version !== 2)
    throw new Error("此数据版本暂不支持，请保留原始备份。");
  const guests = array(s.guests).map((value): Guest => {
    const g = object(value);
    const status = text(g.status).toLowerCase();
    if (status !== "pending" && status !== "arrived")
      throw new Error("签到状态无效。");
    if (g.isActive !== undefined && typeof g.isActive !== "boolean")
      throw new Error("宾客状态无效。");
    return {
      id: text(g.id),
      name: text(g.name),
      relationship: text(g.relationship),
      side: side(g.side),
      status,
      tableNo: text(g.tableNo ?? g.tableNumber),
      seatNo: optional(g.seatNo ?? g.seatNumber),
      groupId: optional(g.groupId),
      groupName: optional(g.groupName),
      tagIds: strings(g.tagIds ?? g.tags),
      isActive: g.isActive !== false,
      checkInTime: optional(g.checkInTime),
      phone: optional(g.phone),
      notes: optional(g.notes),
    };
  });
  const tags = array(s.tags).map((value) => {
    const t = object(value);
    return {
      id: text(t.id),
      name: text(t.name),
      color: tagColor(text(t.color)),
    };
  });
  const tables = array(s.tables).map((value) => {
    const t = object(value);
    const tableNo = text(t.tableNo ?? t.number);
    const capacity = number(t.capacity);
    if (
      !Number.isSafeInteger(capacity) ||
      capacity <= 0 ||
      !/^\d+$/.test(tableNo)
    )
      throw new Error("桌号或容纳人数无效。");
    return {
      id: t.id === undefined ? `table-${tableNo}` : text(t.id),
      tableNo,
      capacity,
      tagIds: strings(t.tagIds ?? t.tags),
    };
  });
  const groups: Group[] =
    s.groups === undefined
      ? [...new Set(guests.flatMap((g) => (g.groupId ? [g.groupId] : [])))].map(
          (id) => {
            const members = guests.filter((g) => g.groupId === id);
            return {
              id,
              name: members[0].groupName || id,
              side: members[0].side,
              tableNos: [...new Set(members.map((g) => g.tableNo))],
            };
          },
        )
      : array(s.groups).map((value) => {
          const g = object(value);
          return {
            id: text(g.id),
            name: text(g.name),
            side: side(g.side),
            tableNos: strings(g.tableNos ?? g.tableNumbers),
          };
        });
  const angpaoRecords = array(s.angpaoRecords).map((value): AngpaoRecord => {
    const r = object(value);
    const targetType = text(r.targetType ?? r.recipientType).toLowerCase();
    if (targetType !== "individual" && targetType !== "family")
      throw new Error("礼金类型无效。");
    const amount = number(r.amount);
    if (amount <= 0) throw new Error("礼金金额必须大于零。");
    if (r.isVoided !== undefined && typeof r.isVoided !== "boolean")
      throw new Error("作废状态无效。");
    return {
      id: text(r.id),
      targetType,
      targetId: text(r.targetId ?? r.recipientId),
      targetName: text(r.targetName ?? r.recipientName),
      amount,
      recordedBy: text(r.recordedBy),
      timestamp: text(r.timestamp ?? r.recordedAt),
      notes: optional(r.notes),
      isVoided: r.isVoided === true,
      voidReason: optional(r.voidReason),
    };
  });
  unique(
    guests.map((g) => g.id),
    "宾客",
  );
  unique(
    tags.map((t) => t.id),
    "标签",
  );
  unique(
    groups.map((g) => g.id),
    "家庭",
  );
  unique(
    tables.map((t) => t.id),
    "桌位",
  );
  unique(
    tables.map((t) => String(Number(t.tableNo))),
    "桌号",
  );
  unique(
    angpaoRecords.map((r) => r.id),
    "礼金",
  );
  for (const g of guests) {
    if (
      !tables.some((t) => t.tableNo === g.tableNo) ||
      (g.groupId && !groups.some((f) => f.id === g.groupId))
    )
      throw new Error("宾客引用了不存在的桌位或家庭，请先修复源数据。");
  }
  for (const g of groups)
    if (g.tableNos.some((n) => !tables.some((t) => t.tableNo === n)))
      throw new Error("家庭引用了不存在的桌位。");
  for (const r of angpaoRecords)
    if (
      !(r.targetType === "individual" ? guests : groups).some(
        (item) => item.id === r.targetId,
      )
    )
      throw new Error("礼金引用了不存在的宾客或家庭。");
  // Deleted tag references can remain in records; the original template permits tag deletion.
  const highest = Math.max(0, ...tables.map((t) => Number(t.tableNo)));
  const next =
    s.nextTableNumber === undefined ? highest + 1 : number(s.nextTableNumber);
  if (
    !Number.isSafeInteger(next) ||
    next < 1 ||
    !Number.isSafeInteger(highest + 1)
  )
    throw new Error("桌号计数器无效。");
  return {
    version: 2,
    guests,
    groups,
    tags,
    tables,
    angpaoRecords,
    nextTableNumber: Math.max(next, highest + 1),
  };
}
export function normalizeUser(value: unknown): CurrentUser | null {
  if (value === null) return null;
  const u = object(value);
  const role = text(u.role).toLowerCase();
  if (role !== "admin" && role !== "staff") throw new Error("用户角色无效。");
  return {
    name: text(u.name),
    role,
    id: optional(u.id),
    username: optional(u.username),
  };
}
export const canonicalKey = "wedding-react-v2";
export const authKey = "wedding-react-auth-v2";
export const defaultUser = normalizeUser(TEMPLATE_SEED.currentUser);
export type Source = "react" | "template";
function read(key: string) {
  const raw = localStorage.getItem(key);
  return raw === null ? undefined : (JSON.parse(raw) as unknown);
}
export function legacySource(source: Source): WeddingState {
  if (source === "react")
    return normalizeData({
      ...LEGACY_REACT_SEED,
      guests: read("wedding_guests") ?? LEGACY_REACT_SEED.guests,
      angpaoRecords: read("wedding_angpao") ?? LEGACY_REACT_SEED.angpaoRecords,
    });
  return normalizeData(
    Object.fromEntries(
      Object.entries(TEMPLATE_SEED).map(([key, value]) => [
        key,
        read("wedding-template-v1:" + key) ?? value,
      ]),
    ),
  );
}
export function migrate(): WeddingState {
  const canonical = read(canonicalKey);
  if (canonical !== undefined) return normalizeData(canonical);
  const react = ["wedding_guests", "wedding_angpao"].some(
    (key) => localStorage.getItem(key) !== null,
  );
  const template = ["guests", "groups", "tags", "tables", "angpaoRecords"].some(
    (key) => localStorage.getItem("wedding-template-v1:" + key) !== null,
  );
  if (react && template)
    throw new Error(
      "检测到现有 React 数据和模板数据。请选择要使用的数据来源；两份原始数据都会保留。",
    );
  return react
    ? legacySource("react")
    : template
      ? legacySource("template")
      : normalizeData(TEMPLATE_SEED);
}
