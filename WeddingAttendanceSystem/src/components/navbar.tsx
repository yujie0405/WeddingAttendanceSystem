// src/components/navbar.tsx
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
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom sticky-top shadow-sm px-3">
      <div className="container-fluid max-w-4xl p-0 flex-wrap flex-sm-nowrap">
        {/* 系统 Title */}
        <div className="d-flex items-center gap-2 me-auto">
          <Link to="/" className="navbar-brand font-bold text-warning d-flex align-items-center gap-2 m-0 fs-5">
            <i className="fa-solid fa-heart text-danger"></i>
            <span className="fw-bold text-dark">婚礼宾客签到系统</span>
          </Link>
          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle d-none d-sm-inline-block">
            {currentUser.name} ({currentUser.role === 'admin' ? '管理员' : '招待员'})
          </span>
        </div>

        {/* 路由导航按键 */}
        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <Link
            to="/"
            className={`btn btn-sm ${
              location.pathname === '/' ? 'btn-warning text-dark fw-bold' : 'btn-light text-secondary'
            }`}
          >
            <i className="fa-solid fa-magnifying-glass me-1"></i> 宾客签到
          </Link>

          {currentUser.role === 'admin' && (
            <Link
              to="/admin"
              className={`btn btn-sm ${
                location.pathname === '/admin' ? 'btn-warning text-dark fw-bold' : 'btn-light text-secondary'
              }`}
            >
              <i className="fa-solid fa-sliders me-1"></i> 后台配置
            </Link>
          )}

          <button
            onClick={onLogout}
            className="btn btn-sm btn-outline-danger border-0 ms-1"
            title="退出登录"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};