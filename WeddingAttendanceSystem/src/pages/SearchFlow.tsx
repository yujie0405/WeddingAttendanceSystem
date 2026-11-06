// src/pages/search/SearchFlow.tsx
import React, { useState } from 'react';
import type { Role, Guest, WeddingSide } from '../types';
import { INITIAL_GUESTS, INITIAL_TAGS } from '../data';
import {TagListingSelector} from '../components/tagListing';

interface Props {
  currentUser?: { name: string; role: Role };
}

export const SearchFlow: React.FC<Props> = () => {
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSide, setFilterSide] = useState<'all' | WeddingSide>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'arrived'>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');

  // 计算全局已到人数 vs 总人数 (Strict Format: Arrived / Total)
  const totalGuestsCount = guests.length;
  const arrivedGuestsCount = guests.filter((g) => g.status === 'arrived').length;

  // 快捷签到 / 撤销
  const handleToggleCheckIn = (guestId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId
          ? {
              ...g,
              status: g.status === 'arrived' ? 'pending' : 'arrived',
              checkInTime: g.status === 'arrived' ? undefined : now,
            }
          : g
      )
    );
  };

  // 全家一键签到
  const handleCheckInFamily = (groupId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGuests((prev) =>
      prev.map((g) =>
        g.groupId === groupId && g.status === 'pending'
          ? { ...g, status: 'arrived', checkInTime: now }
          : g
      )
    );
  };

  // 搜索过滤逻辑
  const filteredGuests = guests.filter((g) => {
    const matchQuery =
      g.name.includes(searchQuery) ||
      (g.groupName && g.groupName.includes(searchQuery)) ||
      g.tableNo.includes(searchQuery);

    const matchSide = filterSide === 'all' || g.side === filterSide;
    const matchStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchTag = selectedTagFilter === 'all' || g.tagIds.includes(selectedTagFilter);

    return matchQuery && matchSide && matchStatus && matchTag;
  });

  return (
    <div className="space-y-4">
      {/* 顶部全局进度卡片 (xxx / 总人数) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500 font-medium">现场出席进度</span>
          <div className="text-2xl font-bold text-amber-900 mt-0.5">
            {arrivedGuestsCount} <span className="text-sm font-normal text-gray-500">/ {totalGuestsCount} 人</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 font-medium">出席率</span>
          <div className="text-xl font-semibold text-emerald-600 mt-0.5">
            {totalGuestsCount > 0 ? Math.round((arrivedGuestsCount / totalGuestsCount) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* 搜索框与大按钮 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 space-y-3">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-gray-400"></i>
          <input
            type="text"
            placeholder="搜索宾客姓名 / 家庭名称 / 桌号 (如 01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:outline-none text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1"
            >
              <i className="fa-solid fa-circle-xmark"></i>
            </button>
          )}
        </div>

        {/* 快捷 Filter 标签 */}
        <div className="flex flex-wrap gap-2 pt-1 text-sm">
          <button
            onClick={() => setFilterSide('all')}
            className={`px-3 py-1 rounded-full border ${filterSide === 'all' ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-50 border-gray-200'}`}
          >
            全部边
          </button>
          <button
            onClick={() => setFilterSide('groom')}
            className={`px-3 py-1 rounded-full border ${filterSide === 'groom' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200'}`}
          >
            男方
          </button>
          <button
            onClick={() => setFilterSide('bride')}
            className={`px-3 py-1 rounded-full border ${filterSide === 'bride' ? 'bg-rose-600 text-white border-rose-600' : 'bg-gray-50 border-gray-200'}`}
          >
            女方
          </button>
          <button
            onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
            className={`px-3 py-1 rounded-full border ${filterStatus === 'pending' ? 'bg-amber-500 text-white border-amber-500' : 'bg-gray-50 border-gray-200'}`}
          >
            仅看未到
          </button>
        </div>
      </div>

      {/* 宾客卡片 Listing */}
      <div className="space-y-3">
        {filteredGuests.map((guest) => {
          const isArrived = guest.status === 'arrived';
          return (
            <div
              key={guest.id}
              className={`p-4 rounded-xl border transition-all ${
                isArrived ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-slate-800">{guest.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${guest.side === 'groom' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                      {guest.side === 'groom' ? '男方' : '女方'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    关系: <span className="text-gray-700 font-medium">{guest.relationship}</span> | 桌号:{' '}
                    <span className="text-amber-800 font-bold">桌 {guest.tableNo}</span>
                  </p>

                  {/* 自定义标签 List */}
                  {guest.tagIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {guest.tagIds.map((tId) => {
                        const tag = INITIAL_TAGS.find((t) => t.id === tId);
                        return tag ? (
                          <span key={tag.id} className={`text-[10px] px-2 py-0.5 rounded-full border ${tag.color}`}>
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* 签到大按键 */}
                <button
                  onClick={() => handleToggleCheckIn(guest.id)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                    isArrived
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {isArrived ? (
                    <>
                      <i className="fa-solid fa-circle-check mr-1"></i> 已到 ({guest.checkInTime})
                    </>
                  ) : (
                    '签 到'
                  )}
                </button>
              </div>

              {/* 如果属于家庭，显示全家一键签到按钮 */}
              {guest.groupId && (
                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>家庭/团体: {guest.groupName}</span>
                  <button
                    onClick={() => handleCheckInFamily(guest.groupId!)}
                    className="text-amber-700 font-medium hover:underline"
                  >
                    全家一键签到 <i className="fa-solid fa-angles-right text-[10px]"></i>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};