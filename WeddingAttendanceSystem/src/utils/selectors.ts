import type { AngpaoType, Guest, WeddingState } from "../types";
export const matchesGuest = (g: Guest, search: string) => {
  const term = search.trim().toLowerCase();
  return (
    !term ||
    [
      g.name,
      g.groupName,
      g.relationship,
      g.tableNo,
      `桌${g.tableNo}`,
      `桌 ${g.tableNo}`,
      `table ${g.tableNo}`,
      `table${g.tableNo}`,
    ].some((v) => v?.toLowerCase().includes(term))
  );
};
export const validGifts = (s: WeddingState) =>
  s.angpaoRecords.filter((r) => !r.isVoided);
export const giftTotal = (s: WeddingState, type?: AngpaoType, id?: string) =>
  validGifts(s)
    .filter(
      (r) => (!type || r.targetType === type) && (!id || r.targetId === id),
    )
    .reduce((sum, r) => sum + r.amount, 0);
export function tableUsage(s: WeddingState, tableNo: string, excludingId?: string) {
  return {
    count: s.guests
      .filter((g) => g.isActive && g.tableNo === tableNo && g.id !== excludingId)
      .reduce((count, guest) => count + (guest.guestNum ?? 1), 0),
    blocked:
      s.guests.some((g) => g.tableNo === tableNo) ||
      s.groups.some((g) => g.tableNos.includes(tableNo)),
  };
}
