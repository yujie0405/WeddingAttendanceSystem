import { AppError } from "../i18n/messages";
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
    throw new AppError("Errors.DataObject");
  return value as RecordValue;
}
function text(value: unknown): string {
  if (typeof value !== "string") throw new AppError("Errors.DataText");
  return value;
}
function optional(value: unknown) {
  return value === undefined || value === null ? undefined : text(value);
}
function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new AppError("Errors.DataArray");
  return value;
}
function strings(value: unknown) {
  return array(value).map(text);
}
function number(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new AppError("Errors.DataNumber");
  return value;
}
function side(value: unknown) {
  const v = text(value).toLowerCase();
  if (v !== "groom" && v !== "bride") throw new AppError("Errors.DataSide");
  return v;
}
function unique(values: string[], label: string) {
  if (new Set(values).size !== values.length)
    throw new AppError("Errors.Duplicate", { entityKey: label });
}
export function normalizeData(raw: unknown): WeddingState {
  const wrapper = object(raw);
  const s = object(wrapper.data ?? wrapper);
  if (s.version !== undefined && s.version !== 2)
    throw new AppError("Errors.DataVersion");
  const guests = array(s.guests).map((value): Guest => {
    const g = object(value);
    const status = text(g.status).toLowerCase();
    if (status !== "pending" && status !== "arrived")
      throw new AppError("Errors.DataAttendance");
    if (g.isActive !== undefined && typeof g.isActive !== "boolean")
      throw new AppError("Errors.DataActivity");
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
      throw new AppError("Errors.DataTable");
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
      throw new AppError("Errors.DataGiftType");
    const amount = number(r.amount);
    if (amount <= 0) throw new AppError("Errors.DataGiftAmount");
    if (r.isVoided !== undefined && typeof r.isVoided !== "boolean")
      throw new AppError("Errors.DataVoid");
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
    "Guest",
  );
  unique(
    tags.map((t) => t.id),
    "Tag",
  );
  unique(
    groups.map((g) => g.id),
    "Family",
  );
  unique(
    tables.map((t) => t.id),
    "Table",
  );
  unique(
    tables.map((t) => String(Number(t.tableNo))),
    "TableNumber",
  );
  unique(
    angpaoRecords.map((r) => r.id),
    "Gift",
  );
  for (const g of guests) {
    if (
      !tables.some((t) => t.tableNo === g.tableNo) ||
      (g.groupId && !groups.some((f) => f.id === g.groupId))
    )
      throw new AppError("Errors.DataGuestReference");
  }
  for (const g of groups)
    if (g.tableNos.some((n) => !tables.some((t) => t.tableNo === n)))
      throw new AppError("Errors.DataFamilyReference");
  for (const r of angpaoRecords)
    if (
      !(r.targetType === "individual" ? guests : groups).some(
        (item) => item.id === r.targetId,
      )
    )
      throw new AppError("Errors.DataGiftReference");
  // Deleted tag references can remain in records; the original template permits tag deletion.
  const highest = Math.max(0, ...tables.map((t) => Number(t.tableNo)));
  const next =
    s.nextTableNumber === undefined ? highest + 1 : number(s.nextTableNumber);
  if (
    !Number.isSafeInteger(next) ||
    next < 1 ||
    !Number.isSafeInteger(highest + 1)
  )
    throw new AppError("Errors.DataCounter");
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
  if (role !== "admin" && role !== "staff")
    throw new AppError("Errors.DataRole");
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
  if (react && template) throw new AppError("Errors.DataConflict");
  return react
    ? legacySource("react")
    : template
      ? legacySource("template")
      : normalizeData(TEMPLATE_SEED);
}
