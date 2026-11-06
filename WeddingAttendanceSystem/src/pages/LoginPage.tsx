// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import type { Role } from '../types';

interface Props {
  onLogin: (user: { name: string; role: Role }) => void;
}

export const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    const role: Role = username.toLowerCase().includes('admin') ? 'admin' : 'staff';
    onLogin({ name: username, role });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="card shadow-lg border-0 rounded-4 w-100" style={{ maxWidth: '400px' }}>
        <div className="card-body p-4 p-sm-5 text-center">
          <div className="rounded-circle bg-warning-subtle text-warning p-3 d-inline-flex mb-3">
            <i className="fa-solid fa-heart fs-2"></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">宴会宾客签到系统</h3>
          <p className="text-muted small mb-4">Wedding Check-in System</p>

          <form onSubmit={handleSubmit} className="text-start">
            <div className="mb-3">
              <label className="form-label small fw-medium">账号 / 招待员姓名</label>
              <input
                type="text"
                required
                className="form-control form-control-lg fs-6"
                placeholder="输入 admin 体验管理员功能"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-medium">密码</label>
              <input
                type="password"
                className="form-control form-control-lg fs-6"
                placeholder="任意密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-warning btn-lg text-dark fw-bold w-100 shadow-sm">
              进入系统
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};