// src/pages/SearchFlow.tsx
import React, { useState } from 'react';
import type { Role, Guest, WeddingSide } from '../types';
import { INITIAL_GUESTS, INITIAL_TAGS } from '../data';

interface Props {
  currentUser?: { name: string; role: Role };
}

export const SearchFlow: React.FC<Props> = () => {
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSide, setFilterSide] = useState<'all' | WeddingSide>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'arrived'>('all');

  // Strict Format: Arrived / Total (例: 85 / 120 人)
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

  // 搜索与条件过滤
  const filteredGuests = guests.filter((g) => {
    const matchQuery =
      g.name.includes(searchQuery) ||
      (g.groupName && g.groupName.includes(searchQuery)) ||
      g.tableNo.includes(searchQuery);

    const matchSide = filterSide === 'all' || g.side === filterSide;
    const matchStatus = filterStatus === 'all' || g.status === filterStatus;

    return matchQuery && matchSide && matchStatus;
  });

  return (
    <div className="d-flex flex-column gap-3">
      {/* 顶部全局出席进度卡片 (xxx / 总人数) */}
      <div className="card shadow-sm border-warning-subtle bg-white">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <span className="text-muted small fw-medium">现场出席进度</span>
            <div className="fs-3 fw-bold text-warning-emphasis mt-1">
              {arrivedGuestsCount} <span className="fs-6 fw-normal text-muted">/ {totalGuestsCount} 人</span>
            </div>
          </div>
          <div className="text-end">
            <span className="text-muted small fw-medium">出席率</span>
            <div className="fs-4 fw-bold text-success mt-1">
              {totalGuestsCount > 0 ? Math.round((arrivedGuestsCount / totalGuestsCount) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* 搜索框与筛选 Tag */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="input-group input-group-lg mb-3">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="搜索宾客姓名 / 家庭 / 桌号 (如 01)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="btn btn-outline-secondary border-start-0 bg-white"
                onClick={() => setSearchQuery('')}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              onClick={() => setFilterSide('all')}
              className={`btn btn-sm rounded-pill ${filterSide === 'all' ? 'btn-warning text-dark font-semibold' : 'btn-outline-secondary'}`}
            >
              全部边
            </button>
            <button
              onClick={() => setFilterSide('groom')}
              className={`btn btn-sm rounded-pill ${filterSide === 'groom' ? 'btn-primary' : 'btn-outline-primary'}`}
            >
              男方
            </button>
            <button
              onClick={() => setFilterSide('bride')}
              className={`btn btn-sm rounded-pill ${filterSide === 'bride' ? 'btn-danger' : 'btn-outline-danger'}`}
            >
              女方
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
              className={`btn btn-sm rounded-pill ${filterStatus === 'pending' ? 'btn-dark' : 'btn-outline-dark'}`}
            >
              仅看未到
            </button>
          </div>
        </div>
      </div>

      {/* 宾客卡片列表 Listing */}
      <div className="d-flex flex-column gap-2">
        {filteredGuests.map((guest) => {
          const isArrived = guest.status === 'arrived';
          return (
            <div
              key={guest.id}
              className={`card shadow-sm border ${
                isArrived ? 'border-success bg-success-subtle bg-opacity-10' : 'border-light-subtle bg-white'
              }`}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="mb-0 fw-bold">{guest.name}</h5>
                      <span className={`badge rounded-pill ${guest.side === 'groom' ? 'bg-primary-subtle text-primary' : 'bg-danger-subtle text-danger'}`}>
                        {guest.side === 'groom' ? '男方' : '女方'}
                      </span>
                    </div>

                    <p className="text-muted small mb-0 mt-2">
                      关系: <strong className="text-dark">{guest.relationship}</strong> | 桌号:{' '}
                      <strong className="text-warning-emphasis">桌 {guest.tableNo}</strong>
                    </p>

                    {/* 自定义标签展现 */}
                    {guest.tagIds.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mt-2">
                        {guest.tagIds.map((tId) => {
                          const tag = INITIAL_TAGS.find((t) => t.id === tId);
                          return tag ? (
                            <span key={tag.id} className="badge bg-secondary-subtle text-secondary-emphasis font-normal">
                              {tag.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* 签到按键 */}
                  <button
                    onClick={() => handleToggleCheckIn(guest.id)}
                    className={`btn px-3 py-2 fw-bold ${
                      isArrived ? 'btn-success' : 'btn-warning text-dark'
                    }`}
                  >
                    {isArrived ? (
                      <>
                        <i className="fa-solid fa-circle-check me-1"></i> 已到 ({guest.checkInTime})
                      </>
                    ) : (
                      '签 到'
                    )}
                  </button>
                </div>

                {/* 如果为家庭，显示全家签到链接 */}
                {guest.groupId && (
                  <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
                    <span>家庭/团体: {guest.groupName}</span>
                    <button
                      onClick={() => handleCheckInFamily(guest.groupId!)}
                      className="btn btn-link btn-sm text-warning-emphasis p-0 text-decoration-none fw-bold"
                    >
                      全家一键签到 <i className="fa-solid fa-angles-right ms-1"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};