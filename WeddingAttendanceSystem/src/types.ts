// src/types.ts

export type Role = 'staff' | 'admin';
export type WeddingSide = 'groom' | 'bride';
export type AttendanceStatus = 'pending' | 'arrived';
export type AngpaoType = 'individual' | 'family';

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
  status: AttendanceStatus;
  checkInTime?: string;
  tagIds: string[];
}

export interface AngpaoRecord {
  id: string;
  targetType: AngpaoType;
  targetId: string; // guestId or groupId
  targetName: string;
  amount: number;
  recordedBy: string;
  timestamp: string;
  isVoided?: boolean;
  voidReason?: string;
}

export interface TableConfig {
  tableNo: string;
  capacity: number;
  tagIds: string[];
}