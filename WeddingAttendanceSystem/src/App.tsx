// src/App.tsx
import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { SearchFlow } from './pages/SearchFlow';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import type { Role } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: Role } | null>({
    name: '招待员 小张',
    role: 'admin', // 可切换为 'staff' 测试权限
  });

  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800">
      {/* 顶部 Navigation Shell */}
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
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors ml-1"
            title="退出登录"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      {/* 路由视图挂载区 */}
      <main className="p-4 max-w-4xl mx-auto">
        <Routes>
          <Route path="/" element={<SearchFlow currentUser={currentUser} />} />
          <Route path="/admin" element={<AdminPage currentUser={currentUser} />} />
          <Route path="/login" element={<LoginPage onLogin={(user) => { setCurrentUser(user); navigate('/'); }} />} />
        </Routes>
      </main>
    </div>
  );
}