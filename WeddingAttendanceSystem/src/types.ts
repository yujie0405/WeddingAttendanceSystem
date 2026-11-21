export type Role = "staff" | "guest" | "admin";
export type WeddingSide = "groom" | "bride";
export type AttendanceStatus = "pending" | "arrived";
export type AngpaoType = "individual" | "family";
export interface CurrentUser {
  id?: string;
  username?: string;
  name: string;
  role: Role;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Guest {
  id: string;
  name: string;
  groupId?: string;
  groupName?: string;
  relationship: string;
  side: WeddingSide;
  tableNo: string;
  seatNo?: string;
  guestNum?: number;
  status: AttendanceStatus;
  checkInTime?: string;
  tagIds: string[];
  isActive: boolean;
  phone?: string;
  notes?: string;
}
export interface Group {
  id: string;
  name: string;
  side: WeddingSide;
  tableNos: string[];
}

export interface AngpaoRecord {
  id: string;
  targetType: AngpaoType;
  targetId: string; // guestId or groupId
  targetName: string;
  amount: number;
  recordedBy: string;
  timestamp: string;
  isVoided: boolean;
  voidReason?: string;
  notes?: string;
}

export interface TableConfig {
  id: string;
  tableNo: string;
  capacity: number;
  tagIds: string[];
}
export interface WeddingState {
  version: 2;
  guests: Guest[];
  groups: Group[];
  tags: Tag[];
  tables: TableConfig[];
  angpaoRecords: AngpaoRecord[];
  nextTableNumber: number;
}
export type GuestDraft = Pick<
  Guest,
  "name" | "relationship" | "side" | "tableNo" | "seatNo" | "tagIds" | "guestNum"
>;
export interface GiftDraft {
  targetType: AngpaoType;
  targetId: string;
  amount: number;
  notes: string;
}
