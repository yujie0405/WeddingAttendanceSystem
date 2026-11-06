// src/pages/login/LoginPage.tsx
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

    // 简易 Mock 判定：用户名含 admin 即为管理员，否则为普通招待员
    const role: Role = username.toLowerCase().includes('admin') ? 'admin' : 'staff';
    onLogin({ name: username, role });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-amber-100 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600 text-2xl">
            <i className="fa-solid fa-heart"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">宴会宾客签到系统</h2>
          <p className="text-sm text-gray-500 mt-1">Wedding Check-in & Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">账号/姓名</label>
            <input
              type="text"
              required
              placeholder="请输入您的姓名 (输入 admin 体验管理员功能)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              placeholder="任意输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold shadow-lg hover:bg-amber-700 transition-colors mt-2"
          >
            进入系统
          </button>
        </form>
      </div>
    </div>
  );
};