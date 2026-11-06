// src/data.ts
import type { Guest, Tag, TableConfig, AngpaoRecord } from './types';

export const INITIAL_TAGS: Tag[] = [
  { id: 't1', name: 'VIP', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 't2', name: '男方长辈', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 't3', name: '女方长辈', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 't4', name: '大学同学', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 't5', name: '公司同事', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 't6', name: '素食者', color: 'bg-green-100 text-green-800 border-green-300' },
];

export const INITIAL_GUESTS: Guest[] = [
  { id: 'g1', name: '陈大明', groupId: 'fg1', groupName: '陈大明全家', relationship: '舅舅', side: 'groom', tableNo: '01', seatNo: 'A1', status: 'pending', tagIds: ['t1', 't2'] },
  { id: 'g2', name: '林小美', groupId: 'fg1', groupName: '陈大明全家', relationship: '舅母', side: 'groom', tableNo: '01', seatNo: 'A2', status: 'pending', tagIds: ['t2'] },
  { id: 'g3', name: '陈杰克', groupId: 'fg1', groupName: '陈大明全家', relationship: '表弟', side: 'groom', tableNo: '01', seatNo: 'A3', status: 'pending', tagIds: ['t4'] },
  { id: 'g4', name: '张伟', groupId: 'fg2', groupName: '张伟全家', relationship: '中学同学', side: 'bride', tableNo: '03', seatNo: 'B1', status: 'pending', tagIds: ['t4'] },
  { id: 'g5', name: '李婷', groupId: 'fg2', groupName: '张伟全家', relationship: '同学太太', side: 'bride', tableNo: '03', seatNo: 'B2', status: 'pending', tagIds: [] },
  { id: 'g6', name: '王强', relationship: '大学室友', side: 'groom', tableNo: '05', status: 'arrived', checkInTime: '18:45', tagIds: ['t1', 't4'] },
];

export const INITIAL_TABLES: TableConfig[] = [
  { tableNo: '01', capacity: 10, tagIds: ['t1', 't2'] },
  { tableNo: '03', capacity: 10, tagIds: ['t4'] },
  { tableNo: '05', capacity: 8, tagIds: ['t1', 't4'] },
];

export const INITIAL_ANGPAO: AngpaoRecord[] = [
  { id: 'a1', targetType: 'family', targetId: 'fg1', targetName: '陈大明全家', amount: 888, recordedBy: 'Staff A', timestamp: '2026-11-06 18:30' },
  { id: 'a2', targetType: 'individual', targetId: 'g6', targetName: '王强', amount: 300, recordedBy: 'Staff B', timestamp: '2026-11-06 18:46' },
];

export const RELATIONSHIP_OPTIONS = ['父亲', '母亲', '舅舅', '舅母', '兄弟姐妹', '表亲', '大学同学', '中学同学', '公司同事', 'VIP贵宾', '其他亲友'];