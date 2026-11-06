// src/components/Navbar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Role } from '../types';

interface Props {
  currentUser: { name: string; role: Role };
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ currentUser, onLogout }) => {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-amber-100 sticky top-0 z-20 shadow-sm px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <h1 className="font-bold text-amber-900 flex items-center gap-2 text-base sm:text-lg">
          <i className="fa-solid fa-heart text-amber-600"></i>
          婚礼宾客签到系统
        </h1>
        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 hidden sm:inline-block">
          {currentUser.name} ({currentUser.role === 'admin' ? '管理员' : '招待员'})
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === '/' ? 'bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <i className="fa-solid fa-magnifying-glass mr-1"></i> 宾客签到
        </Link>

        {currentUser.role === 'admin' && (
          <Link
            to="/admin"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/admin' ? 'bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-sliders mr-1"></i> 后台配置
          </Link>
        )}

        <button
          onClick={onLogout}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors ml-1"
          title="退出登录"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </header>
  );
};