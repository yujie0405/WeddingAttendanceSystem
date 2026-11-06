import React from 'react';

export const AttendanceBadge: React.FC<{ status: 'pending' | 'arrived'; time?: string }> = ({ status, time }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
    status === 'arrived' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'
  }`}>
    <i className={`fa-solid ${status === 'arrived' ? 'fa-circle-check' : 'fa-clock'}`}></i>
    {status === 'arrived' ? `已到 ${time || ''}` : '未到现场'}
  </span>
);