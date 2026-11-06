// src/App.tsx
import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { SearchFlow } from './pages/SearchFlow';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/navbar';
import type { Role } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: Role } | null>({
    name: '招待员 小张',
    role: 'admin', // 可切换为 'staff' 测试权限
  });

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
      {/* 直接调用拆分出去的导航栏组件 */}
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

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