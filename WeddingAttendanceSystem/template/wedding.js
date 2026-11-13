/* Shared React application. Serve this folder over HTTP. */
(function () {
const {
  useState,
  useMemo,
  useEffect
} = React;
const mount = document.getElementById('root');
const page = mount.dataset.page;
const base = mount.dataset.base;
const pagePaths = {
  mainpage: 'mainpage.html',
  dashboard: 'admin/dashboard.html',
  tag: 'admin/tag.html',
  'add-guest': 'admin/add-guest.html',
  'table-setting': 'admin/table-setting.html'
};
const navigate = name => {
  window.location.href = base + pagePaths[name];
};
function useStoredState(key, seed) {
  const storageKey = 'wedding-template-v1:' + key;
  const [value, update] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw === null ? seed : JSON.parse(raw);
    } catch {
      return seed;
    }
  });
  const setValue = change => update(previous => {
    const next = typeof change === 'function' ? change(previous) : change;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {/* Keep the current page usable when browser storage is unavailable. */}
    return next;
  });
  useEffect(() => {
    const sync = event => {
      if (event.key === storageKey && event.newValue !== null) {
        try {
          update(JSON.parse(event.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [storageKey]);
  return [value, setValue];
}

// ==========================================
// MOCK DATA & TYPES
// ==========================================

const INITIAL_TAGS = [{
  id: 'tag-1',
  name: 'VIP',
  color: "wedding-bg-amber-100 wedding-text-amber-900 wedding-border-amber-300"
}, {
  id: 'tag-2',
  name: '男方长辈',
  color: "wedding-bg-blue-100 wedding-text-blue-900 wedding-border-blue-300"
}, {
  id: 'tag-3',
  name: '女方长辈',
  color: "wedding-bg-rose-100 wedding-text-rose-900 wedding-border-rose-300"
}, {
  id: 'tag-4',
  name: '大学同学',
  color: "wedding-bg-purple-100 wedding-text-purple-900 wedding-border-purple-300"
}, {
  id: 'tag-5',
  name: '公司同事',
  color: "wedding-bg-teal-100 wedding-text-teal-900 wedding-border-teal-300"
}, {
  id: 'tag-6',
  name: '素食者',
  color: "wedding-bg-emerald-100 wedding-text-emerald-900 wedding-border-emerald-300"
}];
const INITIAL_TABLES = [{
  id: 't1',
  number: '01',
  capacity: 10,
  tags: ['tag-1', 'tag-2']
}, {
  id: 't2',
  number: '02',
  capacity: 10,
  tags: ['tag-1', 'tag-3']
}, {
  id: 't3',
  number: '03',
  capacity: 10,
  tags: ['tag-2']
}, {
  id: 't4',
  number: '04',
  capacity: 10,
  tags: ['tag-3']
}, {
  id: 't5',
  number: '05',
  capacity: 10,
  tags: ['tag-4']
}, {
  id: 't6',
  number: '06',
  capacity: 10,
  tags: ['tag-5']
}];
const INITIAL_GROUPS = [{
  id: 'g1',
  name: '张伟全家',
  side: 'GROOM',
  tableNumbers: ['03']
}, {
  id: 'g2',
  name: '陈美玲一家',
  side: 'BRIDE',
  tableNumbers: ['04']
}, {
  id: 'g3',
  name: '李强家庭',
  side: 'GROOM',
  tableNumbers: ['01', '03']
}];
const INITIAL_GUESTS = [{
  id: 'guest-101',
  name: '张伟',
  groupId: 'g1',
  groupName: '张伟全家',
  relationship: '父亲',
  tableNumber: '03',
  seatNumber: '01',
  side: 'GROOM',
  tags: ['tag-2', 'tag-1'],
  status: 'PENDING',
  phone: '012-3456789',
  isActive: true
}, {
  id: 'guest-102',
  name: '王丽',
  groupId: 'g1',
  groupName: '张伟全家',
  relationship: '母亲',
  tableNumber: '03',
  seatNumber: '02',
  side: 'GROOM',
  tags: ['tag-2'],
  status: 'PENDING',
  phone: '012-3456790',
  isActive: true
}, {
  id: 'guest-103',
  name: '张伟',
  groupId: 'g1',
  groupName: '张伟全家',
  relationship: '长子',
  tableNumber: '03',
  seatNumber: '03',
  side: 'GROOM',
  tags: ['tag-4'],
  status: 'PENDING',
  isActive: true
}, {
  id: 'guest-104',
  name: '陈美玲',
  groupId: 'g2',
  groupName: '陈美玲一家',
  relationship: '大姨',
  tableNumber: '04',
  seatNumber: '01',
  side: 'BRIDE',
  tags: ['tag-3', 'tag-1'],
  status: 'ARRIVED',
  checkInTime: '18:15',
  isActive: true
}, {
  id: 'guest-105',
  name: '林建国',
  groupId: 'g2',
  groupName: '陈美玲一家',
  relationship: '姨丈',
  tableNumber: '04',
  seatNumber: '02',
  side: 'BRIDE',
  tags: ['tag-3'],
  status: 'ARRIVED',
  checkInTime: '18:15',
  isActive: true
}, {
  id: 'guest-106',
  name: '李强',
  groupId: 'g3',
  groupName: '李强家庭',
  relationship: '舅舅',
  tableNumber: '01',
  seatNumber: '05',
  side: 'GROOM',
  tags: ['tag-1', 'tag-2', 'tag-6'],
  status: 'PENDING',
  notes: '吃素食品',
  isActive: true
}, {
  id: 'guest-107',
  name: '黄志明',
  relationship: '大学同学',
  tableNumber: '05',
  side: 'GROOM',
  tags: ['tag-4'],
  status: 'PENDING',
  isActive: true
}, {
  id: 'guest-108',
  name: '刘婷婷',
  relationship: '公司同事',
  tableNumber: '06',
  side: 'BRIDE',
  tags: ['tag-5'],
  status: 'PENDING',
  isActive: true
}];
const INITIAL_ANGPAO = [{
  id: 'ap-1',
  recipientType: 'INDIVIDUAL',
  recipientId: 'guest-104',
  recipientName: '陈美玲',
  amount: 300,
  notes: '祝百年好合',
  recordedBy: '工作人员 阿杰',
  recordedAt: '2026-11-06 18:16',
  isVoided: false
}, {
  id: 'ap-2',
  recipientType: 'FAMILY',
  recipientId: 'g2',
  recipientName: '陈美玲一家',
  amount: 800,
  notes: '大姨一家贺礼',
  recordedBy: '工作人员 阿杰',
  recordedAt: '2026-11-06 18:17',
  isVoided: false
}];
const formatRM = val => `RM ${val.toLocaleString('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;

// ==========================================
// MAIN APP COMPONENT
// ==========================================

function App() {
  const [currentUser, setCurrentUser] = useStoredState('currentUser', {
    id: 'u1',
    username: 'staff01',
    name: '接待员 - 阿杰',
    role: 'ADMIN'
  });
  const [tags, setTags] = useStoredState('tags', INITIAL_TAGS);
  const [guests, setGuests] = useStoredState('guests', INITIAL_GUESTS);
  const [groups, setGroups] = useStoredState('groups', INITIAL_GROUPS);
  const [tables, setTables] = useStoredState('tables', INITIAL_TABLES);
  const [angpaoRecords, setAngpaoRecords] = useStoredState('angpaoRecords', INITIAL_ANGPAO);
  const [searchTerm, setSearchTerm] = useState('');
  const [sideFilter, setSideFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tableFilter, setTableFilter] = useState('ALL');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const activeTab = page === 'mainpage' ? 'CHECKIN' : 'ADMIN';
  const [angpaoModalData, setAngpaoModalData] = useState({
    isOpen: false
  });
  const [angpaoHistoryModal, setAngpaoHistoryModal] = useState({
    isOpen: false
  });
  const [editGuestModal, setEditGuestModal] = useState({
    isOpen: false
  });
  const [confirmFamilyCheckInModal, setConfirmFamilyCheckInModal] = useState({
    isOpen: false
  });
  const [voidConfirmModal, setVoidConfirmModal] = useState({
    isOpen: false
  });
  const [voidReason, setVoidReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = msg => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const toggleCheckIn = guestId => {
    setGuests(prev => prev.map(g => {
      if (g.id === guestId) {
        const nextStatus = g.status === 'PENDING' ? 'ARRIVED' : 'PENDING';
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        showToast(nextStatus === 'ARRIVED' ? `[${g.name}] 已签到` : `已撤销 [${g.name}] 的签到`);
        return {
          ...g,
          status: nextStatus,
          checkInTime: nextStatus === 'ARRIVED' ? timeStr : undefined
        };
      }
      return g;
    }));
  };
  const checkInEntireFamily = groupId => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    const pendingMembers = guests.filter(g => g.groupId === groupId && g.status === 'PENDING' && g.isActive);
    if (pendingMembers.length === 0) {
      showToast('该家庭所有成员均已签到');
      return;
    }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setGuests(prev => prev.map(g => {
      if (g.groupId === groupId && g.isActive && g.status === 'PENDING') {
        return {
          ...g,
          status: 'ARRIVED',
          checkInTime: timeStr
        };
      }
      return g;
    }));
    showToast(`已成功将 [${group.name}] 的 ${pendingMembers.length} 位成员全员签到`);
    setConfirmFamilyCheckInModal({
      isOpen: false
    });
  };
  const handleSaveAngpao = data => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newRecord = {
      id: `ap-${Date.now()}`,
      recipientType: data.type,
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      amount: data.amount,
      notes: data.notes,
      recordedBy: currentUser ? currentUser.name : '工作人员',
      recordedAt: formattedDate,
      isVoided: false
    };
    setAngpaoRecords(prev => [newRecord, ...prev]);
    showToast(`成功登记 ${data.recipientName} 礼金`);
    setAngpaoModalData({
      isOpen: false
    });
  };
  const handleVoidAngpao = () => {
    if (!voidConfirmModal.recordId) return;
    if (!voidReason.trim()) {
      alert('请填写作废原因');
      return;
    }
    setAngpaoRecords(prev => prev.map(rec => {
      if (rec.id === voidConfirmModal.recordId) {
        return {
          ...rec,
          isVoided: true,
          voidReason: voidReason.trim()
        };
      }
      return rec;
    }));
    showToast('礼金记录已作废');
    setVoidConfirmModal({
      isOpen: false
    });
    setVoidReason('');
  };
  const handleSaveGuestEdit = updatedGuest => {
    setGuests(prev => prev.map(g => g.id === updatedGuest.id ? updatedGuest : g));
    showToast(`宾客 [${updatedGuest.name}] 资料及标签已更新`);
    setEditGuestModal({
      isOpen: false
    });
  };
  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      if (!g.isActive) return false;
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        const nameMatch = g.name.toLowerCase().includes(term);
        const groupMatch = g.groupName ? g.groupName.toLowerCase().includes(term) : false;
        const tableMatch = g.tableNumber.toLowerCase() === term || `桌${g.tableNumber}`.includes(term) || `桌 ${g.tableNumber}`.includes(term);
        const relMatch = g.relationship.toLowerCase().includes(term);
        if (!nameMatch && !groupMatch && !tableMatch && !relMatch) return false;
      }
      if (sideFilter !== 'ALL' && g.side !== sideFilter) return false;
      if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
      if (tableFilter !== 'ALL' && g.tableNumber !== tableFilter) return false;
      if (selectedTagFilter !== 'ALL' && (!g.tags || !g.tags.includes(selectedTagFilter))) return false;
      return true;
    });
  }, [guests, searchTerm, sideFilter, statusFilter, tableFilter, selectedTagFilter]);
  const groupedGuestItems = useMemo(() => {
    const familyMap = {};
    const standalone = [];
    filteredGuests.forEach(g => {
      if (g.groupId) {
        if (!familyMap[g.groupId]) familyMap[g.groupId] = [];
        familyMap[g.groupId].push(g);
      } else {
        standalone.push(g);
      }
    });
    return {
      familyMap,
      standalone
    };
  }, [filteredGuests]);
  const stats = useMemo(() => {
    const totalGuests = guests.filter(g => g.isActive).length;
    const arrivedGuests = guests.filter(g => g.isActive && g.status === 'ARRIVED').length;
    const validAngpao = angpaoRecords.filter(r => !r.isVoided);
    const totalAngpaoRM = validAngpao.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalGuests,
      arrivedGuests,
      totalAngpaoRM
    };
  }, [guests, angpaoRecords]);
  if (!currentUser) {
    return <div className="wedding-min-h-screen wedding-bg-hex-FDFBF7 d-flex align-items-center justify-content-center wedding-p-4">
            <div className="wedding-bg-white wedding-p-6 wedding-rounded-2xl wedding-border wedding-border-hex-E8E2D5 wedding-shadow-md wedding-max-w-sm w-100 wedding-space-y-4 text-center">
              <div className="wedding-w-12 wedding-h-12 wedding-rounded-full wedding-bg-amber-700 wedding-text-white d-flex align-items-center justify-content-center wedding-mx-auto wedding-text-xl wedding-font-bold wedding-font-serif">
                囍
              </div>
              <h2 className="wedding-text-lg wedding-font-bold wedding-text-hex-2C2A29">婚礼宾客签到系统登录</h2>
              <button onClick={() => setCurrentUser({
          id: 'u1',
          username: 'staff01',
          name: '接待员 - 阿杰',
          role: 'ADMIN'
        })} className="w-100 wedding-py-2-5 wedding-bg-amber-700 wedding-text-white wedding-rounded-xl wedding-font-bold wedding-hover-bg-amber-800 wedding-transition-colors">
                以管理员登录体验
              </button>
            </div>
          </div>;
  }
  return <div className="wedding-min-h-screen wedding-bg-hex-FDFBF7 wedding-text-hex-2C2A29 wedding-font-sans d-flex flex-column wedding-selection-bg-amber-100">
          {toastMessage && <div className="position-fixed wedding-top-4 wedding-left-1-2 wedding--translate-x-1-2 wedding-z-50 wedding-bg-hex-322F2B wedding-text-white wedding-text-xs wedding-md-text-sm wedding-px-4 wedding-py-2-5 wedding-rounded-full wedding-shadow-lg d-flex align-items-center wedding-gap-2 wedding-border wedding-border-amber-500-30">
              <i className="fa-solid fa-circle-check wedding-text-amber-400"></i>
              <span>{toastMessage}</span>
            </div>}

          <header className="position-sticky wedding-top-0 wedding-z-30 wedding-bg-hex-FFFDF9-95 wedding-backdrop-blur-md wedding-border-b wedding-border-hex-E8E2D5 ">
            <div className="wedding-max-w-4xl wedding-mx-auto wedding-px-4 wedding-py-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center wedding-gap-2-5">
                <div className="wedding-w-9 wedding-h-9 wedding-rounded-full wedding-bg-gradient-to-br wedding-from-amber-600 wedding-to-amber-700 wedding-text-white d-flex align-items-center justify-content-center wedding-font-serif wedding-text-lg wedding-font-bold ">
                  囍
                </div>
                <div>
                  <h1 className="wedding-text-base wedding-font-bold wedding-text-hex-2C2A29 wedding-leading-tight">婚礼宾客签到与礼金管理系统</h1>
                  <p className="wedding-text-xs wedding-text-hex-78716C d-flex align-items-center wedding-gap-1-5 wedding-mt-0-5">
                    <span className="d-inline-block wedding-w-1-5 wedding-h-1-5 wedding-rounded-full wedding-bg-emerald-500"></span>
                    {currentUser.name} ({currentUser.role === 'ADMIN' ? '管理员' : '接待员'})
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center wedding-gap-2">
                {currentUser.role === 'ADMIN' && <button onClick={() => navigate(activeTab === 'CHECKIN' ? 'dashboard' : 'mainpage')} className={`wedding-text-xs wedding-font-medium wedding-px-3 wedding-py-1-5 wedding-rounded-lg wedding-border wedding-transition-all d-flex align-items-center wedding-gap-1-5 ${activeTab === 'ADMIN' ? "wedding-bg-amber-700 wedding-text-white wedding-border-amber-700 " : "wedding-bg-white wedding-text-hex-57534E wedding-border-hex-D6CEC2 wedding-hover-bg-hex-F5F2EA"}`}>
                    <i className={activeTab === 'ADMIN' ? 'fa-solid fa-user-check' : 'fa-solid fa-user-shield'}></i>
                    <span>{activeTab === 'ADMIN' ? '返回签到主页' : '后台标签/配置'}</span>
                  </button>}

                <button onClick={() => setCurrentUser(null)} className="wedding-p-1-5 wedding-text-hex-78716C wedding-hover-text-red-700 wedding-hover-bg-red-50 wedding-rounded-lg wedding-transition-colors" title="退出登录">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            </div>
          </header>

          <main className="wedding-flex-1 wedding-max-w-4xl w-100 wedding-mx-auto wedding-p-3 wedding-md-p-6">
            {activeTab === 'CHECKIN' ? <div className="wedding-space-y-4">
                <div className="wedding-bg-white wedding-rounded-2xl wedding-p-4 wedding-shadow-sm wedding-border wedding-border-hex-E8E2D5 wedding-space-y-3">
                  <div className="wedding-grid wedding-grid-cols-2 wedding-gap-2 wedding-pb-1 wedding-border-b wedding-border-hex-F0EBE1 text-center">
                    <div className="wedding-bg-emerald-50-70 wedding-p-2-5 wedding-rounded-xl wedding-border wedding-border-emerald-100 d-flex flex-column align-items-center justify-content-center">
                      <span className="wedding-text-emerald-800 wedding-text-11px wedding-font-medium d-block">全场出席进度 (Arrived / Total)</span>
                      <span className="wedding-text-lg wedding-md-text-xl wedding-font-extrabold wedding-text-emerald-900 wedding-mt-0-5">
                        {stats.arrivedGuests} / {stats.totalGuests} 人
                      </span>
                    </div>
                    <div className="wedding-bg-amber-50-70 wedding-p-2-5 wedding-rounded-xl wedding-border wedding-border-amber-100 d-flex flex-column align-items-center justify-content-center">
                      <span className="wedding-text-amber-800 wedding-text-11px wedding-font-medium d-block">礼金录入状态</span>
                      <span className="wedding-text-sm wedding-font-bold wedding-text-amber-900 wedding-mt-1">仅管理员后台可查看金额</span>
                    </div>
                  </div>

                  <div className="position-relative">
                    <i className="fa-solid fa-magnifying-glass position-absolute wedding-left-3-5 wedding-top-1-2 wedding--translate-y-1-2 wedding-text-amber-700-60 wedding-pointer-events-none"></i>
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索宾客姓名 / 家庭名称 / 桌号 (如: 张伟, 03)" className="w-100 wedding-pl-11 wedding-pr-10 wedding-py-3 wedding-bg-hex-FAF8F5 wedding-border-2 wedding-border-hex-E0D8C8 wedding-focus-border-amber-600 wedding-rounded-xl wedding-text-base wedding-text-hex-2C2A29 wedding-placeholder-hex-A8A29E wedding-focus-outline-none wedding-focus-bg-white wedding-transition-all wedding-shadow-inner" />
                    {searchTerm && <button onClick={() => setSearchTerm('')} className="position-absolute wedding-right-3 wedding-top-1-2 wedding--translate-y-1-2 wedding-p-1 wedding-text-hex-A8A29E wedding-hover-text-hex-57534E wedding-rounded-full wedding-hover-bg-hex-E8E2D5">
                        <i className="fa-solid fa-xmark"></i>
                      </button>}
                  </div>

                  <div className="d-flex flex-wrap align-items-center wedding-gap-2 wedding-pt-1 wedding-text-xs">
                    <div className="d-inline-flex wedding-rounded-lg wedding-bg-hex-FAF7F2 wedding-p-0-5 wedding-border wedding-border-hex-E8E2D5">
                      <button onClick={() => setSideFilter('ALL')} className={`wedding-px-2-5 wedding-py-1 wedding-rounded-md wedding-font-medium wedding-transition-all ${sideFilter === 'ALL' ? "wedding-bg-white wedding-text-hex-2C2A29 " : "wedding-text-hex-78716C"}`}>
                        全部男/女
                      </button>
                      <button onClick={() => setSideFilter('GROOM')} className={`wedding-px-2-5 wedding-py-1 wedding-rounded-md wedding-font-medium wedding-transition-all ${sideFilter === 'GROOM' ? "wedding-bg-blue-600 wedding-text-white " : "wedding-text-hex-78716C"}`}>
                        男方
                      </button>
                      <button onClick={() => setSideFilter('BRIDE')} className={`wedding-px-2-5 wedding-py-1 wedding-rounded-md wedding-font-medium wedding-transition-all ${sideFilter === 'BRIDE' ? "wedding-bg-rose-600 wedding-text-white " : "wedding-text-hex-78716C"}`}>
                        女方
                      </button>
                    </div>

                    <div className="d-inline-flex wedding-rounded-lg wedding-bg-hex-FAF7F2 wedding-p-0-5 wedding-border wedding-border-hex-E8E2D5">
                      <button onClick={() => setStatusFilter('ALL')} className={`wedding-px-2-5 wedding-py-1 wedding-rounded-md wedding-font-medium wedding-transition-all ${statusFilter === 'ALL' ? "wedding-bg-white wedding-text-hex-2C2A29 " : "wedding-text-hex-78716C"}`}>
                        状态
                      </button>
                      <button onClick={() => setStatusFilter('PENDING')} className={`wedding-px-2-5 wedding-py-1 wedding-rounded-md wedding-font-medium wedding-transition-all ${statusFilter === 'PENDING' ? "wedding-bg-amber-600 wedding-text-white " : "wedding-text-hex-78716C"}`}>
                        未到
                      </button>
                      <button onClick={() => setStatusFilter('ARRIVED')} className={`wedding-px-2-5 wedding-py-1 wedding-rounded-md wedding-font-medium wedding-transition-all ${statusFilter === 'ARRIVED' ? "wedding-bg-emerald-600 wedding-text-white " : "wedding-text-hex-78716C"}`}>
                        已到
                      </button>
                    </div>

                    <select value={tableFilter} onChange={e => setTableFilter(e.target.value)} className="wedding-bg-hex-FAF7F2 wedding-border wedding-border-hex-E8E2D5 wedding-rounded-lg wedding-px-2-5 wedding-py-1 wedding-text-hex-57534E wedding-focus-outline-none wedding-focus-border-amber-600 wedding-font-medium">
                      <option value="ALL">所有桌号</option>
                      {tables.map(t => <option key={t.id} value={t.number}>
                          {t.number} 桌
                        </option>)}
                    </select>

                    <select value={selectedTagFilter} onChange={e => setSelectedTagFilter(e.target.value)} className="wedding-bg-hex-FAF7F2 wedding-border wedding-border-hex-E8E2D5 wedding-rounded-lg wedding-px-2-5 wedding-py-1 wedding-text-hex-57534E wedding-focus-outline-none wedding-focus-border-amber-600 wedding-font-medium">
                      <option value="ALL">全部自定义标签</option>
                      {tags.map(tag => <option key={tag.id} value={tag.id}>
                          🏷️ {tag.name}
                        </option>)}
                    </select>
                  </div>
                </div>

                <div className="wedding-space-y-3">
                  {filteredGuests.length === 0 ? <div className="wedding-bg-white wedding-rounded-2xl wedding-p-8 text-center wedding-border wedding-border-hex-E8E2D5 ">
                      <div className="wedding-w-12 wedding-h-12 wedding-rounded-full wedding-bg-hex-FAF7F2 wedding-text-hex-A8A29E d-flex align-items-center justify-content-center wedding-mx-auto wedding-mb-3">
                        <i className="fa-solid fa-magnifying-glass wedding-text-xl"></i>
                      </div>
                      <h3 className="wedding-text-base wedding-font-semibold wedding-text-hex-44403C">未找到匹配的宾客</h3>
                      <p className="wedding-text-xs wedding-text-hex-78716C wedding-mt-1">请尝试更改搜索词，或重置筛选条件。</p>
                    </div> : <>
                      {Object.entries(groupedGuestItems.familyMap).map(([groupId, groupGuests]) => {
              const groupInfo = groups.find(g => g.id === groupId);
              if (!groupInfo) return null;
              return <FamilyGroupCard key={groupId} group={groupInfo} guests={groupGuests} allGuestsInGroup={guests.filter(g => g.groupId === groupId && g.isActive)} systemTags={tags} angpaoRecords={angpaoRecords} onCheckInIndividual={toggleCheckIn} onOpenFamilyCheckInModal={() => setConfirmFamilyCheckInModal({
                isOpen: true,
                group: groupInfo
              })} onOpenAngpaoModal={guest => setAngpaoModalData({
                isOpen: true,
                guest
              })} onOpenAngpaoHistory={group => setAngpaoHistoryModal({
                isOpen: true,
                group
              })} onOpenEditModal={guest => setEditGuestModal({
                isOpen: true,
                guest
              })} />;
            })}

                      {groupedGuestItems.standalone.map(guest => <GuestCardItem key={guest.id} guest={guest} systemTags={tags} angpaoRecords={angpaoRecords.filter(r => r.recipientId === guest.id && !r.isVoided)} onCheckIn={() => toggleCheckIn(guest.id)} onOpenAngpaoModal={() => setAngpaoModalData({
              isOpen: true,
              guest
            })} onOpenAngpaoHistory={() => setAngpaoHistoryModal({
              isOpen: true,
              guest
            })} onOpenEditModal={() => setEditGuestModal({
              isOpen: true,
              guest
            })} />)}
                    </>}
                </div>
              </div> : <AdminManagementPanel tags={tags} setTags={setTags} guests={guests} setGuests={setGuests} groups={groups} setGroups={setGroups} tables={tables} setTables={setTables} angpaoRecords={angpaoRecords} showToast={showToast} />}
          </main>

          {angpaoModalData.isOpen && angpaoModalData.guest && <AngpaoEntryModal guest={angpaoModalData.guest} groups={groups} onClose={() => setAngpaoModalData({
      isOpen: false
    })} onSave={handleSaveAngpao} />}

          {angpaoHistoryModal.isOpen && <AngpaoHistoryModal guest={angpaoHistoryModal.guest} group={angpaoHistoryModal.group} records={angpaoRecords} onClose={() => setAngpaoHistoryModal({
      isOpen: false
    })} onVoidRecord={recordId => setVoidConfirmModal({
      isOpen: true,
      recordId
    })} />}

          {editGuestModal.isOpen && editGuestModal.guest && <EditGuestModal guest={editGuestModal.guest} systemTags={tags} tables={tables} groups={groups} onClose={() => setEditGuestModal({
      isOpen: false
    })} onSave={handleSaveGuestEdit} />}

          {confirmFamilyCheckInModal.isOpen && confirmFamilyCheckInModal.group && <ConfirmFamilyCheckInModal group={confirmFamilyCheckInModal.group} guests={guests.filter(g => g.groupId === confirmFamilyCheckInModal.group.id && g.isActive)} onClose={() => setConfirmFamilyCheckInModal({
      isOpen: false
    })} onConfirm={() => checkInEntireFamily(confirmFamilyCheckInModal.group.id)} />}

          {voidConfirmModal.isOpen && <div className="position-fixed wedding-inset-0 wedding-z-50 wedding-bg-black-60  d-flex align-items-center justify-content-center wedding-p-4">
              <div className="wedding-bg-white wedding-rounded-2xl wedding-max-w-sm w-100 wedding-p-5 wedding-space-y-4 wedding-border wedding-border-hex-E8E2D5 wedding-shadow-xl">
                <div className="d-flex align-items-center wedding-gap-3 wedding-text-red-600">
                  <div className="wedding-p-2 wedding-bg-red-100 wedding-rounded-full">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <h3 className="wedding-text-base wedding-font-bold wedding-text-hex-2C2A29">确认作废此礼金记录？</h3>
                </div>
                <p className="wedding-text-xs wedding-text-hex-78716C wedding-leading-relaxed">
                  财务记录无法直接物理删除。作废后该笔礼金将不计入总额，并生成审计留痕。
                </p>
                <div>
                  <label className="d-block wedding-text-xs wedding-font-semibold wedding-text-hex-44403C wedding-mb-1">作废原因 (必填)</label>
                  <input type="text" value={voidReason} onChange={e => setVoidReason(e.target.value)} placeholder="例如：金额登记错误 / 重复录入" className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-text-xs wedding-focus-outline-none wedding-focus-border-amber-600" />
                </div>
                <div className="d-flex align-items-center wedding-gap-2 wedding-pt-2">
                  <button onClick={() => setVoidConfirmModal({
            isOpen: false
          })} className="wedding-flex-1 wedding-py-2-5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-text-xs wedding-font-medium wedding-text-hex-57534E wedding-hover-bg-hex-F5F2EA">
                    取消
                  </button>
                  <button onClick={handleVoidAngpao} className="wedding-flex-1 wedding-py-2-5 wedding-bg-red-600 wedding-hover-bg-red-700 wedding-text-white wedding-rounded-xl wedding-text-xs wedding-font-medium ">
                    确认作废
                  </button>
                </div>
              </div>
            </div>}
        </div>;
}

// ==========================================
// FAMILY GROUP CARD COMPONENT
// ==========================================

function FamilyGroupCard({
  group,
  guests,
  allGuestsInGroup,
  systemTags,
  angpaoRecords,
  onCheckInIndividual,
  onOpenFamilyCheckInModal,
  onOpenAngpaoModal,
  onOpenAngpaoHistory,
  onOpenEditModal
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const totalMembers = allGuestsInGroup.length;
  const arrivedMembers = allGuestsInGroup.filter(g => g.status === 'ARRIVED').length;
  const pendingMembers = totalMembers - arrivedMembers;
  return <div className="wedding-bg-white wedding-rounded-2xl wedding-border-2 wedding-border-hex-E5DFD3  overflow-hidden wedding-transition-all">
          <div className="wedding-bg-gradient-to-r wedding-from-hex-FAF6EE wedding-to-hex-F5EFE3 wedding-p-3-5 wedding-border-b wedding-border-hex-E8E2D5">
            <div className="d-flex align-items-start justify-content-between wedding-gap-2">
              <div className="wedding-space-y-1">
                <div className="d-flex align-items-center wedding-gap-2">
                  <span className="wedding-p-1 wedding-bg-amber-100 wedding-text-amber-900 wedding-rounded-md">
                    <i className="fa-solid fa-users wedding-text-sm"></i>
                  </span>
                  <h3 className="wedding-text-base wedding-font-bold wedding-text-hex-2C2A29">{group.name}</h3>
                  <span className={`wedding-text-10px wedding-px-2 wedding-py-0-5 wedding-rounded-full wedding-font-semibold ${group.side === 'GROOM' ? "wedding-bg-blue-100 wedding-text-blue-800" : "wedding-bg-rose-100 wedding-text-rose-800"}`}>
                    {group.side === 'GROOM' ? '男方亲友' : '女方亲友'}
                  </span>
                </div>

                <div className="d-flex flex-wrap align-items-center wedding-gap-x-3 wedding-gap-y-1 wedding-text-xs wedding-text-hex-78716C">
                  <span>桌号: <strong className="wedding-text-hex-2C2A29">{group.tableNumbers.join(', ')} 桌</strong></span>
                  <span>•</span>
                  <span>家庭出席进度: <strong className={arrivedMembers === totalMembers ? "wedding-text-emerald-700 wedding-font-extrabold" : "wedding-text-amber-800 wedding-font-extrabold"}>{arrivedMembers} / {totalMembers} 人</strong></span>
                </div>
              </div>

              <div className="d-flex align-items-center wedding-gap-1-5">
                <button onClick={() => onOpenAngpaoHistory(group)} className="wedding-px-2-5 wedding-py-1-5 wedding-bg-amber-50 wedding-hover-bg-amber-100 wedding-border wedding-border-amber-200 wedding-text-amber-900 wedding-rounded-lg wedding-text-xs wedding-font-medium d-flex align-items-center wedding-gap-1 wedding-transition-colors">
                  <i className="fa-solid fa-gift wedding-text-amber-700"></i>
                  <span>礼金记录</span>
                </button>

                <button onClick={() => setIsExpanded(!isExpanded)} className="wedding-p-1-5 wedding-text-hex-78716C wedding-hover-bg-hex-E8E2D5 wedding-rounded-lg">
                  <i className={isExpanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}></i>
                </button>
              </div>
            </div>

            <div className="wedding-mt-3 d-flex align-items-center justify-content-between wedding-gap-2 wedding-pt-2 wedding-border-t wedding-border-hex-E8E2D5-60">
              <div className="wedding-text-xs wedding-text-hex-78716C">
                {pendingMembers > 0 ? <span className="wedding-text-amber-800 wedding-font-medium">尚有 {pendingMembers} 位未签到</span> : <span className="wedding-text-emerald-700 wedding-font-medium d-flex align-items-center wedding-gap-1">
                    <i className="fa-solid fa-check"></i> 全员已到齐
                  </span>}
              </div>

              {pendingMembers > 0 && <button onClick={onOpenFamilyCheckInModal} className="wedding-px-3 wedding-py-1-5 wedding-bg-emerald-700 wedding-hover-bg-emerald-800 wedding-text-white wedding-rounded-lg wedding-text-xs wedding-font-semibold  d-flex align-items-center wedding-gap-1-5 wedding-active-scale-95 wedding-transition-transform">
                  <i className="fa-solid fa-user-check"></i>
                  <span>全家一键签到</span>
                </button>}
            </div>
          </div>

          {isExpanded && <div className="wedding-p-3 wedding-bg-hex-FCFBF9 wedding-space-y-2 wedding-divide-y wedding-divide-hex-F0EBE1">
              {guests.map((guest, idx) => <div key={guest.id} className={idx > 0 ? "wedding-pt-2" : ''}>
                  <GuestCardItem guest={guest} systemTags={systemTags} isGroupMember angpaoRecords={angpaoRecords.filter(r => r.recipientId === guest.id && !r.isVoided)} onCheckIn={() => onCheckInIndividual(guest.id)} onOpenAngpaoModal={() => onOpenAngpaoModal(guest)} onOpenAngpaoHistory={() => onOpenAngpaoHistory(group)} onOpenEditModal={() => onOpenEditModal(guest)} />
                </div>)}
            </div>}
        </div>;
}

// ==========================================
// INDIVIDUAL GUEST CARD ITEM
// ==========================================

function GuestCardItem({
  guest,
  systemTags,
  isGroupMember = false,
  angpaoRecords = [],
  onCheckIn,
  onOpenAngpaoModal,
  onOpenAngpaoHistory,
  onOpenEditModal
}) {
  const isArrived = guest.status === 'ARRIVED';
  return <div className={`wedding-rounded-xl wedding-border wedding-p-3 wedding-transition-all ${isArrived ? "wedding-bg-emerald-50-40 wedding-border-emerald-200-80" : "wedding-bg-white wedding-border-hex-E8E2D5"} ${isGroupMember ? "wedding-shadow-none" : ''}`}>
          <div className="d-flex align-items-start justify-content-between wedding-gap-2">
            <div className="wedding-space-y-1">
              <div className="d-flex align-items-center wedding-gap-1-5 flex-wrap">
                <h4 className="wedding-text-base wedding-font-bold wedding-text-hex-2C2A29">{guest.name}</h4>

                <span className="wedding-text-xs wedding-px-2 wedding-py-0-5 wedding-bg-hex-F2ECE1 wedding-text-hex-57534E wedding-rounded-md wedding-font-medium">
                  {guest.relationship}
                </span>

                {!isGroupMember && <span className={`wedding-text-10px wedding-px-2 wedding-py-0-5 wedding-rounded-full wedding-font-semibold ${guest.side === 'GROOM' ? "wedding-bg-blue-100 wedding-text-blue-800" : "wedding-bg-rose-100 wedding-text-rose-800"}`}>
                    {guest.side === 'GROOM' ? '男方' : '女方'}
                  </span>}

                {guest.tags && guest.tags.map(tagId => {
            const tag = systemTags.find(t => t.id === tagId);
            if (!tag) return null;
            return <span key={tag.id} className={`wedding-text-10px wedding-px-1-5 wedding-py-0-5 wedding-rounded-md wedding-border wedding-font-medium d-flex align-items-center wedding-gap-0-5 ${tag.color}`}>
                        <i className="fa-solid fa-tag wedding-text-9px"></i>
                        {tag.name}
                      </span>;
          })}

                <span className={`wedding-text-10px wedding-px-2 wedding-py-0-5 wedding-rounded-full wedding-font-bold d-flex align-items-center wedding-gap-1 ${isArrived ? "wedding-bg-emerald-100 wedding-text-emerald-800" : "wedding-bg-amber-100 wedding-text-amber-900"}`}>
                  <i className={isArrived ? "fa-solid fa-circle-check wedding-text-emerald-600" : "fa-solid fa-clock wedding-text-amber-600"}></i>
                  {isArrived ? `已签到 ${guest.checkInTime || ''}` : '未签到'}
                </span>
              </div>

              <div className="d-flex flex-wrap align-items-center wedding-gap-x-3 wedding-gap-y-1 wedding-text-xs wedding-text-hex-78716C">
                <span>
                  桌号: <strong className="wedding-text-hex-2C2A29">{guest.tableNumber} 桌</strong>
                  {guest.seatNumber && <span> (座位 {guest.seatNumber})</span>}
                </span>

                {guest.groupName && !isGroupMember && <span>所属家庭: <span className="wedding-text-hex-57534E wedding-font-medium">{guest.groupName}</span></span>}

                {guest.notes && <span className="wedding-text-amber-800 wedding-bg-amber-50 wedding-px-1-5 wedding-py-0-5 wedding-rounded wedding-border wedding-border-amber-200">
                    备注: {guest.notes}
                  </span>}
              </div>
            </div>

            <button onClick={onOpenEditModal} className="wedding-p-1-5 wedding-text-hex-A8A29E wedding-hover-text-hex-57534E wedding-hover-bg-hex-F2ECE1 wedding-rounded-lg wedding-transition-colors" title="修改宾客资料及标签">
              <i className="fa-solid fa-[#pen]"></i>
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
          </div>

          <div className="wedding-mt-2-5 wedding-pt-2 wedding-border-t wedding-border-hex-F0EBE1 d-flex align-items-center justify-content-between wedding-gap-2">
            <div className="d-flex align-items-center wedding-gap-2">
              <button onClick={onOpenAngpaoModal} className="wedding-px-3 wedding-py-1-5 wedding-bg-hex-FAF6EE wedding-hover-bg-amber-100-80 wedding-border wedding-border-amber-300-80 wedding-text-amber-900 wedding-rounded-lg wedding-text-xs wedding-font-medium d-flex align-items-center wedding-gap-1-5 wedding-transition-colors">
                <i className="fa-solid fa-gift wedding-text-amber-700"></i>
                <span>登记礼金</span>
              </button>

              {angpaoRecords.length > 0 && <button onClick={onOpenAngpaoHistory} className="wedding-text-xs wedding-text-amber-800 wedding-hover-underline wedding-font-semibold">
                  已登记 ({angpaoRecords.length} 笔)
                </button>}
            </div>

            <button onClick={onCheckIn} className={`wedding-px-3-5 wedding-py-1-5 wedding-rounded-lg wedding-text-xs wedding-font-semibold  d-flex align-items-center wedding-gap-1-5 wedding-transition-all wedding-active-scale-95 ${isArrived ? "wedding-bg-white wedding-border wedding-border-emerald-300 wedding-text-emerald-800 wedding-hover-bg-emerald-50" : "wedding-bg-amber-700 wedding-hover-bg-amber-800 wedding-text-white"}`}>
              {isArrived ? <>
                  <i className="fa-solid fa-check wedding-text-emerald-600"></i>
                  <span>已到 (撤销)</span>
                </> : <>
                  <i className="fa-solid fa-user-check"></i>
                  <span>立即签到</span>
                </>}
            </button>
          </div>
        </div>;
}

// ==========================================
// MODALS & ADMIN COMPONENTS
// ==========================================

function AngpaoEntryModal({
  guest,
  groups,
  onClose,
  onSave
}) {
  const [type, setType] = useState('INDIVIDUAL');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const group = guest.groupId ? groups.find(g => g.id === guest.groupId) : null;
  const handleSubmit = e => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('请输入正确的礼金金额');
      return;
    }
    const recipientId = type === 'INDIVIDUAL' ? guest.id : group ? group.id : guest.id;
    const recipientName = type === 'INDIVIDUAL' ? guest.name : group ? group.name : guest.name;
    onSave({
      type,
      recipientId,
      recipientName,
      amount: Number(amount),
      notes: notes.trim() || undefined
    });
  };
  return <div className="position-fixed wedding-inset-0 wedding-z-50 wedding-bg-black-60  d-flex align-items-center justify-content-center wedding-p-4">
          <div className="wedding-bg-white wedding-rounded-2xl wedding-max-w-sm w-100 wedding-p-5 wedding-space-y-4 wedding-border wedding-border-hex-E8E2D5 wedding-shadow-xl">
            <div className="d-flex align-items-center justify-content-between wedding-border-b wedding-border-hex-F0EBE1 wedding-pb-2">
              <h3 className="wedding-text-base wedding-font-bold wedding-text-hex-2C2A29 d-flex align-items-center wedding-gap-1-5">
                <i className="fa-solid fa-gift wedding-text-amber-700"></i> 登记礼金 (RM)
              </h3>
              <button onClick={onClose} className="wedding-p-1 wedding-text-hex-A8A29E wedding-hover-text-hex-2C2A29">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="wedding-space-y-3 wedding-text-xs">
              {group && <div className="d-flex align-items-center wedding-gap-2 wedding-p-1 wedding-bg-hex-FAF7F2 wedding-rounded-xl wedding-border wedding-border-hex-E8E2D5">
                  <button type="button" onClick={() => setType('INDIVIDUAL')} className={`wedding-flex-1 wedding-py-1-5 wedding-rounded-lg wedding-font-bold wedding-transition-all ${type === 'INDIVIDUAL' ? "wedding-bg-amber-700 wedding-text-white" : "wedding-text-hex-78716C"}`}>
                    个人: {guest.name}
                  </button>
                  <button type="button" onClick={() => setType('FAMILY')} className={`wedding-flex-1 wedding-py-1-5 wedding-rounded-lg wedding-font-bold wedding-transition-all ${type === 'FAMILY' ? "wedding-bg-amber-700 wedding-text-white" : "wedding-text-hex-78716C"}`}>
                    家庭: {group.name}
                  </button>
                </div>}

              <div>
                <label className="d-block wedding-font-semibold wedding-text-hex-44403C wedding-mb-1">礼金金额 (RM)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')} placeholder="0.00" required className="w-100 wedding-px-3 wedding-py-2-5 wedding-bg-hex-FAF8F5 wedding-border-2 wedding-border-amber-200 wedding-focus-border-amber-600 wedding-rounded-xl wedding-text-lg wedding-font-extrabold wedding-text-hex-2C2A29 wedding-focus-outline-none" />
                <div className="d-flex align-items-center wedding-gap-1-5 wedding-mt-2">
                  {[100, 200, 300, 500, 1000].map(val => <button key={val} type="button" onClick={() => setAmount(prev => (Number(prev) || 0) + val)} className="wedding-flex-1 wedding-py-1 wedding-bg-amber-50 wedding-hover-bg-amber-100 wedding-border wedding-border-amber-200 wedding-rounded-lg wedding-text-amber-900 wedding-font-bold">
                      +{val}
                    </button>)}
                </div>
              </div>

              <div>
                <label className="d-block wedding-font-semibold wedding-text-hex-44403C wedding-mb-1">祝词 / 备注</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="例如：祝百年好合 / 永结同心" className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-focus-outline-none" />
              </div>

              <div className="d-flex align-items-center wedding-gap-2 wedding-pt-2">
                <button type="button" onClick={onClose} className="wedding-flex-1 wedding-py-2-5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-font-medium wedding-text-hex-57534E">
                  取消
                </button>
                <button type="submit" className="wedding-flex-1 wedding-py-2-5 wedding-bg-amber-700 wedding-hover-bg-amber-800 wedding-text-white wedding-rounded-xl wedding-font-bold ">
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>;
}
function AngpaoHistoryModal({
  guest,
  group,
  records,
  onClose,
  onVoidRecord
}) {
  const targetName = group ? group.name : guest?.name;
  const relevantRecords = records.filter(r => {
    if (group) return r.recipientId === group.id || guest && r.recipientId === guest.id;
    return guest && r.recipientId === guest.id;
  });
  return <div className="position-fixed wedding-inset-0 wedding-z-50 wedding-bg-black-60  d-flex align-items-center justify-content-center wedding-p-4">
          <div className="wedding-bg-white wedding-rounded-2xl wedding-max-w-md w-100 wedding-p-5 wedding-space-y-4 wedding-border wedding-border-hex-E8E2D5 wedding-shadow-xl wedding-max-h-85vh wedding-overflow-y-auto">
            <div className="d-flex align-items-center justify-content-between wedding-border-b wedding-border-hex-F0EBE1 wedding-pb-3">
              <h3 className="wedding-text-base wedding-font-bold wedding-text-hex-2C2A29">【{targetName}】礼金记录明细</h3>
              <button onClick={onClose} className="wedding-p-1 wedding-text-hex-A8A29E wedding-hover-text-hex-2C2A29">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="wedding-space-y-2 wedding-text-xs">
              {relevantRecords.length === 0 ? <p className="text-center wedding-py-4 wedding-text-hex-A8A29E">暂无礼金登记记录</p> : relevantRecords.map(r => <div key={r.id} className={`wedding-p-3 wedding-rounded-xl wedding-border ${r.isVoided ? "wedding-bg-gray-50 wedding-border-gray-200 wedding-opacity-60" : "wedding-bg-hex-FAF8F5 wedding-border-hex-E8E2D5"}`}>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="wedding-font-bold wedding-text-hex-2C2A29">
                        {r.recipientType === 'FAMILY' ? '全家礼金' : '个人礼金'} - {r.recipientName}
                      </span>
                      {!r.isVoided && <button onClick={() => onVoidRecord(r.id)} className="wedding-text-red-600 wedding-hover-underline wedding-font-semibold">
                          作废
                        </button>}
                    </div>
                    <p className="wedding-text-xs wedding-text-hex-78716C wedding-mt-1">
                      登记人: {r.recordedBy} | 时间: {r.recordedAt}
                    </p>
                    {r.notes && <p className="wedding-text-xs wedding-text-amber-800 wedding-mt-1">备注: {r.notes}</p>}
                    {r.isVoided && <p className="wedding-text-xs wedding-text-red-600 wedding-font-bold wedding-mt-1">【已作废】原因: {r.voidReason}</p>}
                  </div>)}
            </div>
          </div>
        </div>;
}
function EditGuestModal({
  guest,
  systemTags,
  tables,
  groups,
  onClose,
  onSave
}) {
  const [formData, setFormData] = useState({
    ...guest,
    tags: guest.tags || []
  });
  const toggleTag = tagId => {
    setFormData(prev => {
      const exists = prev.tags.includes(tagId);
      if (exists) {
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tagId)
        };
      } else {
        return {
          ...prev,
          tags: [...prev.tags, tagId]
        };
      }
    });
  };
  const handleSubmit = e => {
    e.preventDefault();
    onSave(formData);
  };
  return <div className="position-fixed wedding-inset-0 wedding-z-50 wedding-bg-black-60  d-flex align-items-center justify-content-center wedding-p-4">
          <div className="wedding-bg-white wedding-rounded-2xl wedding-max-w-md w-100 wedding-p-5 wedding-space-y-4 wedding-border wedding-border-hex-E8E2D5 wedding-shadow-2xl wedding-max-h-90vh wedding-overflow-y-auto">
            <div className="d-flex align-items-center justify-content-between wedding-border-b wedding-border-hex-F0EBE1 wedding-pb-3">
              <h3 className="wedding-text-base wedding-font-bold wedding-text-hex-2C2A29">编辑宾客资料与标签</h3>
              <button onClick={onClose} className="wedding-p-1 wedding-text-hex-A8A29E wedding-hover-text-hex-2C2A29">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="wedding-space-y-3 wedding-text-xs">
              <div>
                <label className="d-block wedding-font-semibold wedding-text-hex-44403C wedding-mb-1">宾客姓名</label>
                <input type="text" value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} required className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-focus-outline-none wedding-focus-border-amber-600 wedding-text-sm" />
              </div>

              <div className="wedding-bg-hex-FAF7F2 wedding-p-3 wedding-rounded-xl wedding-border wedding-border-hex-E8E2D5">
                <label className="d-block wedding-font-bold wedding-text-hex-44403C wedding-mb-1-5 d-flex align-items-center justify-content-between">
                  <span>赋予标签 (多选 Listing)</span>
                  <span className="wedding-text-10px wedding-text-hex-78716C">已选 {formData.tags.length} 个标签</span>
                </label>
                <div className="d-flex flex-wrap wedding-gap-1-5">
                  {systemTags.map(tag => {
              const isSelected = formData.tags.includes(tag.id);
              return <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} className={`wedding-px-2-5 wedding-py-1 wedding-rounded-lg wedding-text-xs wedding-font-medium wedding-border wedding-transition-all d-flex align-items-center wedding-gap-1 ${isSelected ? "wedding-bg-amber-700 wedding-text-white wedding-border-amber-800 " : "wedding-bg-white wedding-text-hex-57534E wedding-border-hex-D6CEC2 wedding-hover-bg-amber-50"}`}>
                        {isSelected ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus wedding-text-hex-A8A29E"></i>}
                        <span>{tag.name}</span>
                      </button>;
            })}
                </div>
              </div>

              <div className="wedding-grid wedding-grid-cols-2 wedding-gap-2">
                <div>
                  <label className="d-block wedding-font-semibold wedding-text-hex-44403C wedding-mb-1">婚礼边 (女方/男方)</label>
                  <select value={formData.side} onChange={e => setFormData({
              ...formData,
              side: e.target.value
            })} className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-focus-outline-none wedding-focus-border-amber-600 wedding-text-sm">
                    <option value="GROOM">男方 (Groom)</option>
                    <option value="BRIDE">女方 (Bride)</option>
                  </select>
                </div>

                <div>
                  <label className="d-block wedding-font-semibold wedding-text-hex-44403C wedding-mb-1">身份关系</label>
                  <input type="text" value={formData.relationship} onChange={e => setFormData({
              ...formData,
              relationship: e.target.value
            })} placeholder="如: 舅舅 / 大学同学" className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-focus-outline-none wedding-focus-border-amber-600 wedding-text-sm" />
                </div>
              </div>

              <div className="wedding-grid wedding-grid-cols-2 wedding-gap-2">
                <div>
                  <label className="d-block wedding-font-semibold wedding-text-hex-44403C wedding-mb-1">安排桌号</label>
                  <select value={formData.tableNumber} onChange={e => setFormData({
              ...formData,
              tableNumber: e.target.value
            })} className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-focus-outline-none wedding-focus-border-amber-600 wedding-text-sm">
                    {tables.map(t => <option key={t.id} value={t.number}>
                        {t.number} 桌
                      </option>)}
                  </select>
                </div>

                <div>
                  <label className="d-block wedding-font-semibold wedding-text-hex-44403C wedding-mb-1">座位号 (选填)</label>
                  <input type="text" value={formData.seatNumber || ''} onChange={e => setFormData({
              ...formData,
              seatNumber: e.target.value
            })} placeholder="如: 01" className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-focus-outline-none wedding-focus-border-amber-600 wedding-text-sm" />
                </div>
              </div>

              <div className="d-flex align-items-center wedding-gap-2 wedding-pt-2">
                <button type="button" onClick={onClose} className="wedding-flex-1 wedding-py-2-5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-font-medium wedding-text-hex-57534E">
                  取消
                </button>
                <button type="submit" className="wedding-flex-1 wedding-py-2-5 wedding-bg-amber-700 wedding-hover-bg-amber-800 wedding-text-white wedding-rounded-xl wedding-font-bold ">
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>;
}
function ConfirmFamilyCheckInModal({
  group,
  guests,
  onClose,
  onConfirm
}) {
  const pendingCount = guests.filter(g => g.status === 'PENDING').length;
  return <div className="position-fixed wedding-inset-0 wedding-z-50 wedding-bg-black-60  d-flex align-items-center justify-content-center wedding-p-4">
          <div className="wedding-bg-white wedding-rounded-2xl wedding-max-w-sm w-100 wedding-p-5 wedding-space-y-4 wedding-border wedding-border-hex-E8E2D5 wedding-shadow-xl text-center">
            <div className="wedding-w-12 wedding-h-12 wedding-bg-emerald-100 wedding-text-emerald-700 wedding-rounded-full d-flex align-items-center justify-content-center wedding-mx-auto">
              <i className="fa-solid fa-user-check wedding-text-xl"></i>
            </div>
            <h3 className="wedding-text-base wedding-font-bold wedding-text-hex-2C2A29">全家一键签到确认</h3>
            <p className="wedding-text-xs wedding-text-hex-78716C wedding-leading-relaxed">
              是否确认将 <strong className="wedding-text-hex-2C2A29">{group.name}</strong> 剩余的{' '}
              <strong className="wedding-text-emerald-700 wedding-font-extrabold">{pendingCount}</strong> 位未到成员一次性标记为已到场？
            </p>
            <div className="d-flex align-items-center wedding-gap-2 wedding-pt-2">
              <button onClick={onClose} className="wedding-flex-1 wedding-py-2-5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-text-xs wedding-font-medium wedding-text-hex-57534E">
                取消
              </button>
              <button onClick={onConfirm} className="wedding-flex-1 wedding-py-2-5 wedding-bg-emerald-700 wedding-hover-bg-emerald-800 wedding-text-white wedding-rounded-xl wedding-text-xs wedding-font-bold ">
                确认一键签到
              </button>
            </div>
          </div>
        </div>;
}
function AdminManagementPanel({
  tags,
  setTags,
  guests,
  setGuests,
  groups,
  setGroups,
  tables,
  setTables,
  angpaoRecords,
  showToast
}) {
  const adminTab = {
    dashboard: 'DASHBOARD',
    tag: 'TAGS',
    'add-guest': 'GUESTS',
    'table-setting': 'TABLES'
  }[page];
  const [newTagName, setNewTagName] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestRel, setNewGuestRel] = useState('');
  const [newGuestSide, setNewGuestSide] = useState('GROOM');
  const [newGuestTable, setNewGuestTable] = useState('01');
  const [selectedTagsForNewGuest, setSelectedTagsForNewGuest] = useState([]);
  const handleCreateTag = e => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    const colors = ["wedding-bg-amber-100 wedding-text-amber-900 wedding-border-amber-300", "wedding-bg-blue-100 wedding-text-blue-900 wedding-border-blue-300", "wedding-bg-emerald-100 wedding-text-emerald-900 wedding-border-emerald-300", "wedding-bg-purple-100 wedding-text-purple-900 wedding-border-purple-300", "wedding-bg-rose-100 wedding-text-rose-900 wedding-border-rose-300"];
    const color = colors[tags.length % colors.length];
    const newTag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color
    };
    setTags(prev => [...prev, newTag]);
    showToast(`全局标签 [${newTag.name}] 创建成功`);
    setNewTagName('');
  };
  const handleDeleteTag = (tagId, tagName) => {
    if (confirm(`确定要删除标签 [${tagName}] 吗？`)) {
      setTags(prev => prev.filter(t => t.id !== tagId));
      showToast(`已删除标签 [${tagName}]`);
    }
  };
  const handleAddSingleGuest = e => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    const newG = {
      id: `guest-${Date.now()}`,
      name: newGuestName.trim(),
      relationship: newGuestRel.trim() || '宾客',
      tableNumber: newGuestTable,
      side: newGuestSide,
      tags: selectedTagsForNewGuest,
      status: 'PENDING',
      isActive: true
    };
    setGuests(prev => [newG, ...prev]);
    showToast(`成功登记新宾客: ${newG.name}`);
    setNewGuestName('');
    setNewGuestRel('');
    setSelectedTagsForNewGuest([]);
  };
  return <div className="wedding-bg-white wedding-rounded-2xl wedding-border wedding-border-hex-E8E2D5  overflow-hidden">
          <div className="d-flex wedding-border-b wedding-border-hex-E8E2D5 wedding-bg-hex-FAF7F2 wedding-overflow-x-auto">
            <button onClick={() => navigate('dashboard')} className={`wedding-flex-1 wedding-min-w-100px wedding-py-3 wedding-text-xs wedding-font-bold d-flex align-items-center justify-content-center wedding-gap-1-5 ${adminTab === 'DASHBOARD' ? "wedding-bg-white wedding-text-amber-900 wedding-border-b-2 wedding-border-amber-700" : "wedding-text-hex-78716C"}`}><i className="fa-solid fa-chart-pie"></i><span>仪表盘</span></button>
<button onClick={() => navigate('tag')} className={`wedding-flex-1 wedding-min-w-100px wedding-py-3 wedding-text-xs wedding-font-bold wedding-transition-colors d-flex align-items-center justify-content-center wedding-gap-1-5 ${adminTab === 'TAGS' ? "wedding-bg-white wedding-text-amber-900 wedding-border-b-2 wedding-border-amber-700" : "wedding-text-hex-78716C"}`}>
              <i className="fa-solid fa-tag wedding-text-amber-700"></i>
              <span>全局标签管理</span>
            </button>
            <button onClick={() => navigate('add-guest')} className={`wedding-flex-1 wedding-min-w-100px wedding-py-3 wedding-text-xs wedding-font-bold wedding-transition-colors d-flex align-items-center justify-content-center wedding-gap-1-5 ${adminTab === 'GUESTS' ? "wedding-bg-white wedding-text-amber-900 wedding-border-b-2 wedding-border-amber-700" : "wedding-text-hex-78716C"}`}>
              <i className="fa-solid fa-user"></i>
              <span>新增/管理宾客</span>
            </button>
            <button onClick={() => navigate('table-setting')} className={`wedding-flex-1 wedding-min-w-100px wedding-py-3 wedding-text-xs wedding-font-bold wedding-transition-colors d-flex align-items-center justify-content-center wedding-gap-1-5 ${adminTab === 'TABLES' ? "wedding-bg-white wedding-text-amber-900 wedding-border-b-2 wedding-border-amber-700" : "wedding-text-hex-78716C"}`}>
              <i className="fa-solid fa-table-cells"></i>
              <span>桌位设置</span>
            </button>
          </div>

          <div className="wedding-p-4 wedding-md-p-6 wedding-space-y-6">
            {(adminTab === 'TAGS' || adminTab === 'DASHBOARD') && <div className="wedding-space-y-6">
                {adminTab === 'DASHBOARD' && <div className="wedding-bg-emerald-100 wedding-p-4 wedding-rounded-xl wedding-border wedding-border-emerald-100"><h3 className="wedding-text-xs wedding-font-bold wedding-text-emerald-800">全场出席进度 (Arrived / Total)</h3><p className="wedding-text-lg wedding-font-extrabold wedding-text-emerald-900">{guests.filter(g => g.isActive && g.status === 'ARRIVED').length} / {guests.filter(g => g.isActive).length} 人</p></div>}
                <div className="wedding-bg-amber-50 wedding-p-4 wedding-rounded-xl wedding-border wedding-border-amber-200 wedding-space-y-1">
                  <h4 className="wedding-text-xs wedding-font-bold wedding-text-amber-900 d-flex align-items-center wedding-gap-1-5">
                    <i className="fa-solid fa-gift wedding-text-amber-700"></i> 后台礼金汇总统计 (仅管理员可见)
                  </h4>
                  <p className="wedding-text-2xl wedding-font-extrabold wedding-text-amber-900 wedding-pt-1">
                    {formatRM(angpaoRecords.filter(r => !r.isVoided).reduce((acc, curr) => acc + curr.amount, 0))}
                  </p>
                  <p className="wedding-text-11px wedding-text-amber-700">
                    共 {angpaoRecords.filter(r => !r.isVoided).length} 笔有效礼金记录
                  </p>
                </div>

                {adminTab === 'TAGS' && <form onSubmit={handleCreateTag} className="d-flex wedding-gap-2">
                  <input type="text" value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="新增全局标签名称 (如：大学同学, VIP)" className="wedding-flex-1 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl wedding-text-xs wedding-focus-outline-none wedding-focus-border-amber-600" />
                  <button type="submit" className="wedding-px-4 wedding-py-2 wedding-bg-amber-700 wedding-hover-bg-amber-800 wedding-text-white wedding-rounded-xl wedding-text-xs wedding-font-bold">
                    添加标签
                  </button>
                </form>}

                {adminTab === 'TAGS' && <div className="wedding-grid wedding-grid-cols-2 wedding-md-grid-cols-3 wedding-gap-2">
                  {tags.map(tag => <div key={tag.id} className={`wedding-p-2-5 wedding-rounded-xl wedding-border d-flex align-items-center justify-content-between wedding-text-xs wedding-font-semibold ${tag.color}`}>
                      <span className="d-flex align-items-center wedding-gap-1">
                        <i className="fa-solid fa-tag"></i>
                        {tag.name}
                      </span>
                      <button onClick={() => handleDeleteTag(tag.id, tag.name)} className="wedding-p-1 wedding-text-red-600 wedding-hover-bg-white-50 wedding-rounded-lg">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>)}
                </div>}
              </div>}

            {adminTab === 'GUESTS' && <form onSubmit={handleAddSingleGuest} className="wedding-space-y-4 wedding-text-xs">
                <h3 className="wedding-font-bold wedding-text-sm wedding-text-hex-2C2A29">新增单个宾客</h3>
                <div className="wedding-grid wedding-grid-cols-2 wedding-gap-2">
                  <div>
                    <label className="d-block wedding-font-semibold wedding-mb-1">姓名</label>
                    <input type="text" value={newGuestName} onChange={e => setNewGuestName(e.target.value)} required className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl" />
                  </div>
                  <div>
                    <label className="d-block wedding-font-semibold wedding-mb-1">身份关系</label>
                    <input type="text" value={newGuestRel} onChange={e => setNewGuestRel(e.target.value)} placeholder="如: 同事" className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl" />
                  </div>
                </div>

                <div className="wedding-grid wedding-grid-cols-2 wedding-gap-2">
                  <div>
                    <label className="d-block wedding-font-semibold wedding-mb-1">婚礼边</label>
                    <select value={newGuestSide} onChange={e => setNewGuestSide(e.target.value)} className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl">
                      <option value="GROOM">男方</option>
                      <option value="BRIDE">女方</option>
                    </select>
                  </div>
                  <div>
                    <label className="d-block wedding-font-semibold wedding-mb-1">安排桌号</label>
                    <select value={newGuestTable} onChange={e => setNewGuestTable(e.target.value)} className="w-100 wedding-px-3 wedding-py-2 wedding-bg-hex-FAF8F5 wedding-border wedding-border-hex-D6CEC2 wedding-rounded-xl">
                      {tables.map(t => <option key={t.id} value={t.number}>
                          {t.number} 桌
                        </option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-100 wedding-py-2-5 wedding-bg-amber-700 wedding-text-white wedding-rounded-xl wedding-font-bold wedding-hover-bg-amber-800">
                  录入宾客
                </button>
              </form>}

            {adminTab === 'TABLES' && <div className="wedding-space-y-3 wedding-text-xs">
                <h3 className="wedding-font-bold wedding-text-sm wedding-text-hex-2C2A29">桌位与容纳人数设置</h3>
                <div className="wedding-grid wedding-grid-cols-1 wedding-md-grid-cols-2 wedding-gap-3">
                  {tables.map(t => <div key={t.id} className="wedding-p-3 wedding-border wedding-rounded-xl wedding-bg-hex-FAF8F5 d-flex align-items-center justify-content-between">
                      <div>
                        <span className="wedding-font-extrabold wedding-text-base wedding-text-hex-2C2A29">{t.number} 桌</span>
                        <span className="wedding-text-xs wedding-text-hex-78716C wedding-ml-2">(容量 {t.capacity} 人)</span>
                      </div>
                    </div>)}
                </div>
              </div>}
          </div>
        </div>;
}
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
})();
