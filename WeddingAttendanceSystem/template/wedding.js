/*
 * wedding.js — shared logic for the wedding check-in / angpao system.
 *
 * Loaded by every page (mainpage.html and admin/*.html) via:
 *   <script type="text/babel" src="wedding.js"></script>      (root)
 *   <script type="text/babel" src="../wedding.js"></script>   (admin/)
 *
 * Each page declares which screen to render on its mount element:
 *   <div id="root" data-page="mainpage|dashboard|tag|add-guest|table-setting" data-base="" | "../"></div>
 * Nothing runs unless that element exists, so the file is safe on any page.
 *
 * Everything lives inside one IIFE, so no globals are leaked.
 */
(function () {
    const { useState, useMemo, useEffect, useCallback } = React;

    // ==========================================
    // MOCK DATA & TYPES (seed data, unchanged from original)
    // ==========================================

    const INITIAL_TAGS = [
      { id: 'tag-1', name: 'VIP', color: 'bg-amber-100 text-amber-900 border-amber-300' },
      { id: 'tag-2', name: '男方长辈', color: 'bg-blue-100 text-blue-900 border-blue-300' },
      { id: 'tag-3', name: '女方长辈', color: 'bg-rose-100 text-rose-900 border-rose-300' },
      { id: 'tag-4', name: '大学同学', color: 'bg-purple-100 text-purple-900 border-purple-300' },
      { id: 'tag-5', name: '公司同事', color: 'bg-teal-100 text-teal-900 border-teal-300' },
      { id: 'tag-6', name: '素食者', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    ];

    const INITIAL_TABLES = [
      { id: 't1', number: '01', capacity: 10, tags: ['tag-1', 'tag-2'] },
      { id: 't2', number: '02', capacity: 10, tags: ['tag-1', 'tag-3'] },
      { id: 't3', number: '03', capacity: 10, tags: ['tag-2'] },
      { id: 't4', number: '04', capacity: 10, tags: ['tag-3'] },
      { id: 't5', number: '05', capacity: 10, tags: ['tag-4'] },
      { id: 't6', number: '06', capacity: 10, tags: ['tag-5'] },
    ];

    const INITIAL_GROUPS = [
      { id: 'g1', name: '张伟全家', side: 'GROOM', tableNumbers: ['03'] },
      { id: 'g2', name: '陈美玲一家', side: 'BRIDE', tableNumbers: ['04'] },
      { id: 'g3', name: '李强家庭', side: 'GROOM', tableNumbers: ['01', '03'] },
    ];

    const INITIAL_GUESTS = [
      {
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
        isActive: true,
      },
      {
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
        isActive: true,
      },
      {
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
        isActive: true,
      },
      {
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
        isActive: true,
      },
      {
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
        isActive: true,
      },
      {
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
        isActive: true,
      },
      {
        id: 'guest-107',
        name: '黄志明',
        relationship: '大学同学',
        tableNumber: '05',
        side: 'GROOM',
        tags: ['tag-4'],
        status: 'PENDING',
        isActive: true,
      },
      {
        id: 'guest-108',
        name: '刘婷婷',
        relationship: '公司同事',
        tableNumber: '06',
        side: 'BRIDE',
        tags: ['tag-5'],
        status: 'PENDING',
        isActive: true,
      },
    ];

    const INITIAL_ANGPAO = [
      {
        id: 'ap-1',
        recipientType: 'INDIVIDUAL',
        recipientId: 'guest-104',
        recipientName: '陈美玲',
        amount: 300,
        notes: '祝百年好合',
        recordedBy: '工作人员 阿杰',
        recordedAt: '2026-11-06 18:16',
        isVoided: false,
      },
      {
        id: 'ap-2',
        recipientType: 'FAMILY',
        recipientId: 'g2',
        recipientName: '陈美玲一家',
        amount: 800,
        notes: '大姨一家贺礼',
        recordedBy: '工作人员 阿杰',
        recordedAt: '2026-11-06 18:17',
        isVoided: false,
      },
    ];

    const formatRM = (val) => `RM ${val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // ==========================================
    // SHARED STATE STORE (localStorage-backed)
    // The original kept all state in one React tree. Now that each page is a
    // separate document, state is persisted so pages see the same data.
    // ==========================================

    const STORAGE_PREFIX = 'wedding.v1.';
    const DEFAULT_USER = { id: 'u1', username: 'staff01', name: '接待员 - 阿杰', role: 'ADMIN' };
    const SEED = {
      tags: INITIAL_TAGS,
      guests: INITIAL_GUESTS,
      groups: INITIAL_GROUPS,
      tables: INITIAL_TABLES,
      angpaoRecords: INITIAL_ANGPAO,
      currentUser: DEFAULT_USER,
    };

    const Store = (() => {
      const cache = {};
      const listeners = {};

      const read = (key) => {
        try {
          const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
          return raw === null ? undefined : JSON.parse(raw);
        } catch (e) {
          return undefined;
        }
      };
      const write = (key, value) => {
        try {
          window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        } catch (e) {
          /* storage unavailable: fall back to in-memory only */
        }
      };
      const notify = (key) => {
        (listeners[key] || []).slice().forEach(fn => fn(cache[key]));
      };

      const api = {
        get(key) {
          if (!(key in cache)) {
            const stored = read(key);
            if (stored === undefined) {
              cache[key] = SEED[key];
              write(key, SEED[key]);
            } else {
              cache[key] = stored;
            }
          }
          return cache[key];
        },
        set(key, value) {
          cache[key] = value;
          write(key, value);
          notify(key);
        },
        subscribe(key, fn) {
          if (!listeners[key]) listeners[key] = [];
          listeners[key].push(fn);
          return () => {
            listeners[key] = listeners[key].filter(f => f !== fn);
          };
        },
        reloadFromStorage(key) {
          delete cache[key];
          api.get(key);
          notify(key);
        },
      };

      // Another tab changed data
      window.addEventListener('storage', (e) => {
        if (!e.key || e.key.indexOf(STORAGE_PREFIX) !== 0) return;
        api.reloadFromStorage(e.key.slice(STORAGE_PREFIX.length));
      });
      // Back/forward cache restore: re-read everything so pages are never stale
      window.addEventListener('pageshow', (e) => {
        if (e.persisted) Object.keys(SEED).forEach(api.reloadFromStorage);
      });

      return api;
    })();

    // Same shape as useState: [value, setValue] (setValue accepts a value or an updater function)
    function useStored(key) {
      const [value, setValue] = useState(() => Store.get(key));
      useEffect(() => {
        setValue(Store.get(key));
        return Store.subscribe(key, setValue);
      }, [key]);
      const update = useCallback((next) => {
        const current = Store.get(key);
        Store.set(key, typeof next === 'function' ? next(current) : next);
      }, [key]);
      return [value, update];
    }

    // ==========================================
    // NAVIGATION (paths differ between / and /admin)
    // ==========================================

    function getLinks(base) {
      const admin = base ? '' : 'admin/';
      return {
        main: base + 'mainpage.html',
        dashboard: admin + 'dashboard.html',
        tag: admin + 'tag.html',
        addGuest: admin + 'add-guest.html',
        tableSetting: admin + 'table-setting.html',
      };
    }
    let LINKS = getLinks('');

    const ADMIN_TABS = [
      { id: 'dashboard', linkKey: 'dashboard', label: '后台概览', icon: 'fa-solid fa-chart-simple' },
      { id: 'tag', linkKey: 'tag', label: '全局标签管理', icon: 'fa-solid fa-tag text-amber-700' },
      { id: 'add-guest', linkKey: 'addGuest', label: '新增/管理宾客', icon: 'fa-solid fa-user' },
      { id: 'table-setting', linkKey: 'tableSetting', label: '桌位设置', icon: 'fa-solid fa-table-cells' },
    ];

    // ==========================================
    // APP SHELL: login gate + toast + sticky header (was inside App)
    // ==========================================

    function AppShell({ isAdminPage = false, children }) {
      const [currentUser, setCurrentUser] = useStored('currentUser');
      const [toastMessage, setToastMessage] = useState(null);

      const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
      };

      // Admin pages were only reachable by ADMIN in the original
      useEffect(() => {
        if (isAdminPage && currentUser && currentUser.role !== 'ADMIN') {
          window.location.replace(LINKS.main);
        }
      }, [isAdminPage, currentUser]);

      if (!currentUser) {
        return (
          <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl border border-[#E8E2D5] shadow-md max-w-sm w-full space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-700 text-white flex items-center justify-center mx-auto text-xl font-bold font-serif">
                囍
              </div>
              <h2 className="text-lg font-bold text-[#2C2A29]">婚礼宾客签到系统登录</h2>
              <button
                onClick={() =>
                  setCurrentUser({
                    id: 'u1',
                    username: 'staff01',
                    name: '接待员 - 阿杰',
                    role: 'ADMIN',
                  })
                }
                className="w-full py-2.5 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 transition-colors"
              >
                以管理员登录体验
              </button>
            </div>
          </div>
        );
      }

      if (isAdminPage && currentUser.role !== 'ADMIN') return null;

      return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#2C2A29] font-sans flex flex-col selection:bg-amber-100">
          {toastMessage && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#322F2B] text-white text-xs md:text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-amber-500/30">
              <i className="fa-solid fa-circle-check text-amber-400"></i>
              <span>{toastMessage}</span>
            </div>
          )}

          <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8E2D5] shadow-xs">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                  囍
                </div>
                <div>
                  <h1 className="text-base font-bold text-[#2C2A29] leading-tight">婚礼宾客签到与礼金管理系统</h1>
                  <p className="text-xs text-[#78716C] flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {currentUser.name} ({currentUser.role === 'ADMIN' ? '管理员' : '接待员'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentUser.role === 'ADMIN' && (
                  <a
                    href={isAdminPage ? LINKS.main : LINKS.dashboard}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isAdminPage
                        ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-[#57534E] border-[#D6CEC2] hover:bg-[#F5F2EA]'
                    }`}
                  >
                    <i className={isAdminPage ? 'fa-solid fa-user-check' : 'fa-solid fa-user-shield'}></i>
                    <span>{isAdminPage ? '返回签到主页' : '后台标签/配置'}</span>
                  </a>
                )}

                <button
                  onClick={() => setCurrentUser(null)}
                  className="p-1.5 text-[#78716C] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="退出登录"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            </div>
          </header>

          {children({ showToast, currentUser })}
        </div>
      );
    }

    // Wrapper that reproduces the original <main> element
    function PageMain({ children }) {
      return (
        <main className="flex-1 max-w-4xl w-full mx-auto p-3 md:p-6">
          {children}
        </main>
      );
    }

    // Admin card + tab strip. The three original tabs (TAGS / GUESTS / TABLES) are now links
    // to their own pages; "dashboard" holds the angpao summary that used to sit on top of TAGS.
    function AdminPanelFrame({ active, children }) {
      return (
        <div className="bg-white rounded-2xl border border-[#E8E2D5] shadow-xs overflow-hidden">
          <div className="flex border-b border-[#E8E2D5] bg-[#FAF7F2] overflow-x-auto">
            {ADMIN_TABS.map(tab => (
              <a
                key={tab.id}
                href={LINKS[tab.linkKey]}
                className={`flex-1 min-w-[100px] py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  active === tab.id ? 'bg-white text-amber-900 border-b-2 border-amber-700' : 'text-[#78716C]'
                }`}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </a>
            ))}
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {children}
          </div>
        </div>
      );
    }


    // ==========================================
    // MAIN PAGE (mainpage.html): check-in + angpao
    // ==========================================

    function CheckInPage() {
      return (
        <AppShell>
          {({ showToast, currentUser }) => <CheckInContent showToast={showToast} currentUser={currentUser} />}
        </AppShell>
      );
    }

    function CheckInContent({ showToast, currentUser }) {
      const [tags] = useStored('tags');
      const [guests, setGuests] = useStored('guests');
      const [groups] = useStored('groups');
      const [tables] = useStored('tables');
      const [angpaoRecords, setAngpaoRecords] = useStored('angpaoRecords');

      const [searchTerm, setSearchTerm] = useState('');
      const [sideFilter, setSideFilter] = useState('ALL');
      const [statusFilter, setStatusFilter] = useState('ALL');
      const [tableFilter, setTableFilter] = useState('ALL');
      const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');

      const [activeTab, setActiveTab] = useState('CHECKIN');

      const [angpaoModalData, setAngpaoModalData] = useState({ isOpen: false });
      const [angpaoHistoryModal, setAngpaoHistoryModal] = useState({ isOpen: false });
      const [editGuestModal, setEditGuestModal] = useState({ isOpen: false });
      const [confirmFamilyCheckInModal, setConfirmFamilyCheckInModal] = useState({ isOpen: false });
      const [voidConfirmModal, setVoidConfirmModal] = useState({ isOpen: false });
      const [voidReason, setVoidReason] = useState('');

      const [toastMessage, setToastMessage] = useState(null);

      const toggleCheckIn = (guestId) => {
        setGuests(prev =>
          prev.map(g => {
            if (g.id === guestId) {
              const nextStatus = g.status === 'PENDING' ? 'ARRIVED' : 'PENDING';
              const now = new Date();
              const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              showToast(nextStatus === 'ARRIVED' ? `[${g.name}] 已签到` : `已撤销 [${g.name}] 的签到`);
              return {
                ...g,
                status: nextStatus,
                checkInTime: nextStatus === 'ARRIVED' ? timeStr : undefined,
              };
            }
            return g;
          })
        );
      };

      const checkInEntireFamily = (groupId) => {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        const pendingMembers = guests.filter(g => g.groupId === groupId && g.status === 'PENDING' && g.isActive);
        if (pendingMembers.length === 0) {
          showToast('该家庭所有成员均已签到');
          return;
        }

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        setGuests(prev =>
          prev.map(g => {
            if (g.groupId === groupId && g.isActive && g.status === 'PENDING') {
              return {
                ...g,
                status: 'ARRIVED',
                checkInTime: timeStr,
              };
            }
            return g;
          })
        );

        showToast(`已成功将 [${group.name}] 的 ${pendingMembers.length} 位成员全员签到`);
        setConfirmFamilyCheckInModal({ isOpen: false });
      };

      const handleSaveAngpao = (data) => {
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
          isVoided: false,
        };

        setAngpaoRecords(prev => [newRecord, ...prev]);
        showToast(`成功登记 ${data.recipientName} 礼金`);
        setAngpaoModalData({ isOpen: false });
      };

      const handleVoidAngpao = () => {
        if (!voidConfirmModal.recordId) return;
        if (!voidReason.trim()) {
          alert('请填写作废原因');
          return;
        }

        setAngpaoRecords(prev =>
          prev.map(rec => {
            if (rec.id === voidConfirmModal.recordId) {
              return {
                ...rec,
                isVoided: true,
                voidReason: voidReason.trim(),
              };
            }
            return rec;
          })
        );

        showToast('礼金记录已作废');
        setVoidConfirmModal({ isOpen: false });
        setVoidReason('');
      };

      const handleSaveGuestEdit = (updatedGuest) => {
        setGuests(prev => prev.map(g => (g.id === updatedGuest.id ? updatedGuest : g)));
        showToast(`宾客 [${updatedGuest.name}] 资料及标签已更新`);
        setEditGuestModal({ isOpen: false });
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

        return { familyMap, standalone };
      }, [filteredGuests]);

      const stats = useMemo(() => {
        const totalGuests = guests.filter(g => g.isActive).length;
        const arrivedGuests = guests.filter(g => g.isActive && g.status === 'ARRIVED').length;
        const validAngpao = angpaoRecords.filter(r => !r.isVoided);
        const totalAngpaoRM = validAngpao.reduce((acc, curr) => acc + curr.amount, 0);

        return { totalGuests, arrivedGuests, totalAngpaoRM };
      }, [guests, angpaoRecords]);

      return (
        <>
          <PageMain>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E2D5] space-y-3">
                  <div className="grid grid-cols-2 gap-2 pb-1 border-b border-[#F0EBE1] text-center">
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 flex flex-col items-center justify-center">
                      <span className="text-emerald-800 text-[11px] font-medium block">全场出席进度 (Arrived / Total)</span>
                      <span className="text-lg md:text-xl font-extrabold text-emerald-900 mt-0.5">
                        {stats.arrivedGuests} / {stats.totalGuests} 人
                      </span>
                    </div>
                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 flex flex-col items-center justify-center">
                      <span className="text-amber-800 text-[11px] font-medium block">礼金录入状态</span>
                      <span className="text-sm font-bold text-amber-900 mt-1">仅管理员后台可查看金额</span>
                    </div>
                  </div>

                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700/60 pointer-events-none"></i>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="搜索宾客姓名 / 家庭名称 / 桌号 (如: 张伟, 03)"
                      className="w-full pl-11 pr-10 py-3 bg-[#FAF8F5] border-2 border-[#E0D8C8] focus:border-amber-600 rounded-xl text-base text-[#2C2A29] placeholder-[#A8A29E] focus:outline-none focus:bg-white transition-all shadow-inner"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A8A29E] hover:text-[#57534E] rounded-full hover:bg-[#E8E2D5]"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <div className="inline-flex rounded-lg bg-[#FAF7F2] p-0.5 border border-[#E8E2D5]">
                      <button
                        onClick={() => setSideFilter('ALL')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          sideFilter === 'ALL' ? 'bg-white text-[#2C2A29] shadow-xs' : 'text-[#78716C]'
                        }`}
                      >
                        全部男/女
                      </button>
                      <button
                        onClick={() => setSideFilter('GROOM')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          sideFilter === 'GROOM' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#78716C]'
                        }`}
                      >
                        男方
                      </button>
                      <button
                        onClick={() => setSideFilter('BRIDE')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          sideFilter === 'BRIDE' ? 'bg-rose-600 text-white shadow-xs' : 'text-[#78716C]'
                        }`}
                      >
                        女方
                      </button>
                    </div>

                    <div className="inline-flex rounded-lg bg-[#FAF7F2] p-0.5 border border-[#E8E2D5]">
                      <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          statusFilter === 'ALL' ? 'bg-white text-[#2C2A29] shadow-xs' : 'text-[#78716C]'
                        }`}
                      >
                        状态
                      </button>
                      <button
                        onClick={() => setStatusFilter('PENDING')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          statusFilter === 'PENDING' ? 'bg-amber-600 text-white shadow-xs' : 'text-[#78716C]'
                        }`}
                      >
                        未到
                      </button>
                      <button
                        onClick={() => setStatusFilter('ARRIVED')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          statusFilter === 'ARRIVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#78716C]'
                        }`}
                      >
                        已到
                      </button>
                    </div>

                    <select
                      value={tableFilter}
                      onChange={e => setTableFilter(e.target.value)}
                      className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-lg px-2.5 py-1 text-[#57534E] focus:outline-none focus:border-amber-600 font-medium"
                    >
                      <option value="ALL">所有桌号</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.number}>
                          {t.number} 桌
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedTagFilter}
                      onChange={e => setSelectedTagFilter(e.target.value)}
                      className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-lg px-2.5 py-1 text-[#57534E] focus:outline-none focus:border-amber-600 font-medium"
                    >
                      <option value="ALL">全部自定义标签</option>
                      {tags.map(tag => (
                        <option key={tag.id} value={tag.id}>
                          🏷️ {tag.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredGuests.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-[#E8E2D5] shadow-xs">
                      <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#A8A29E] flex items-center justify-center mx-auto mb-3">
                        <i className="fa-solid fa-magnifying-glass text-xl"></i>
                      </div>
                      <h3 className="text-base font-semibold text-[#44403C]">未找到匹配的宾客</h3>
                      <p className="text-xs text-[#78716C] mt-1">请尝试更改搜索词，或重置筛选条件。</p>
                    </div>
                  ) : (
                    <>
                      {Object.entries(groupedGuestItems.familyMap).map(([groupId, groupGuests]) => {
                        const groupInfo = groups.find(g => g.id === groupId);
                        if (!groupInfo) return null;

                        return (
                          <FamilyGroupCard
                            key={groupId}
                            group={groupInfo}
                            guests={groupGuests}
                            allGuestsInGroup={guests.filter(g => g.groupId === groupId && g.isActive)}
                            systemTags={tags}
                            angpaoRecords={angpaoRecords}
                            onCheckInIndividual={toggleCheckIn}
                            onOpenFamilyCheckInModal={() => setConfirmFamilyCheckInModal({ isOpen: true, group: groupInfo })}
                            onOpenAngpaoModal={guest => setAngpaoModalData({ isOpen: true, guest })}
                            onOpenAngpaoHistory={group => setAngpaoHistoryModal({ isOpen: true, group })}
                            onOpenEditModal={guest => setEditGuestModal({ isOpen: true, guest })}
                          />
                        );
                      })}

                      {groupedGuestItems.standalone.map(guest => (
                        <GuestCardItem
                          key={guest.id}
                          guest={guest}
                          systemTags={tags}
                          angpaoRecords={angpaoRecords.filter(r => r.recipientId === guest.id && !r.isVoided)}
                          onCheckIn={() => toggleCheckIn(guest.id)}
                          onOpenAngpaoModal={() => setAngpaoModalData({ isOpen: true, guest })}
                          onOpenAngpaoHistory={() => setAngpaoHistoryModal({ isOpen: true, guest })}
                          onOpenEditModal={() => setEditGuestModal({ isOpen: true, guest })}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
          </PageMain>

          {angpaoModalData.isOpen && angpaoModalData.guest && (
            <AngpaoEntryModal
              guest={angpaoModalData.guest}
              groups={groups}
              onClose={() => setAngpaoModalData({ isOpen: false })}
              onSave={handleSaveAngpao}
            />
          )}

          {angpaoHistoryModal.isOpen && (
            <AngpaoHistoryModal
              guest={angpaoHistoryModal.guest}
              group={angpaoHistoryModal.group}
              records={angpaoRecords}
              onClose={() => setAngpaoHistoryModal({ isOpen: false })}
              onVoidRecord={recordId => setVoidConfirmModal({ isOpen: true, recordId })}
            />
          )}

          {editGuestModal.isOpen && editGuestModal.guest && (
            <EditGuestModal
              guest={editGuestModal.guest}
              systemTags={tags}
              tables={tables}
              groups={groups}
              onClose={() => setEditGuestModal({ isOpen: false })}
              onSave={handleSaveGuestEdit}
            />
          )}

          {confirmFamilyCheckInModal.isOpen && confirmFamilyCheckInModal.group && (
            <ConfirmFamilyCheckInModal
              group={confirmFamilyCheckInModal.group}
              guests={guests.filter(g => g.groupId === confirmFamilyCheckInModal.group.id && g.isActive)}
              onClose={() => setConfirmFamilyCheckInModal({ isOpen: false })}
              onConfirm={() => checkInEntireFamily(confirmFamilyCheckInModal.group.id)}
            />
          )}

          {voidConfirmModal.isOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 border border-[#E8E2D5] shadow-xl">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="p-2 bg-red-100 rounded-full">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <h3 className="text-base font-bold text-[#2C2A29]">确认作废此礼金记录？</h3>
                </div>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  财务记录无法直接物理删除。作废后该笔礼金将不计入总额，并生成审计留痕。
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[#44403C] mb-1">作废原因 (必填)</label>
                  <input
                    type="text"
                    value={voidReason}
                    onChange={e => setVoidReason(e.target.value)}
                    placeholder="例如：金额登记错误 / 重复录入"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setVoidConfirmModal({ isOpen: false })}
                    className="flex-1 py-2.5 border border-[#D6CEC2] rounded-xl text-xs font-medium text-[#57534E] hover:bg-[#F5F2EA]"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleVoidAngpao}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium shadow-xs"
                  >
                    确认作废
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
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
      onOpenEditModal,
    }) {
      const [isExpanded, setIsExpanded] = useState(true);

      const totalMembers = allGuestsInGroup.length;
      const arrivedMembers = allGuestsInGroup.filter(g => g.status === 'ARRIVED').length;
      const pendingMembers = totalMembers - arrivedMembers;

      return (
        <div className="bg-white rounded-2xl border-2 border-[#E5DFD3] shadow-xs overflow-hidden transition-all">
          <div className="bg-gradient-to-r from-[#FAF6EE] to-[#F5EFE3] p-3.5 border-b border-[#E8E2D5]">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-100 text-amber-900 rounded-md">
                    <i className="fa-solid fa-users text-sm"></i>
                  </span>
                  <h3 className="text-base font-bold text-[#2C2A29]">{group.name}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      group.side === 'GROOM' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {group.side === 'GROOM' ? '男方亲友' : '女方亲友'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#78716C]">
                  <span>桌号: <strong className="text-[#2C2A29]">{group.tableNumbers.join(', ')} 桌</strong></span>
                  <span>•</span>
                  <span>家庭出席进度: <strong className={arrivedMembers === totalMembers ? 'text-emerald-700 font-extrabold' : 'text-amber-800 font-extrabold'}>{arrivedMembers} / {totalMembers} 人</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAngpaoHistory(group)}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <i className="fa-solid fa-gift text-amber-700"></i>
                  <span>礼金记录</span>
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-[#78716C] hover:bg-[#E8E2D5] rounded-lg"
                >
                  <i className={isExpanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'}></i>
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#E8E2D5]/60">
              <div className="text-xs text-[#78716C]">
                {pendingMembers > 0 ? (
                  <span className="text-amber-800 font-medium">尚有 {pendingMembers} 位未签到</span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <i className="fa-solid fa-check"></i> 全员已到齐
                  </span>
                )}
              </div>

              {pendingMembers > 0 && (
                <button
                  onClick={onOpenFamilyCheckInModal}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <i className="fa-solid fa-user-check"></i>
                  <span>全家一键签到</span>
                </button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="p-3 bg-[#FCFBF9] space-y-2 divide-y divide-[#F0EBE1]">
              {guests.map((guest, idx) => (
                <div key={guest.id} className={idx > 0 ? 'pt-2' : ''}>
                  <GuestCardItem
                    guest={guest}
                    systemTags={systemTags}
                    isGroupMember
                    angpaoRecords={angpaoRecords.filter(r => r.recipientId === guest.id && !r.isVoided)}
                    onCheckIn={() => onCheckInIndividual(guest.id)}
                    onOpenAngpaoModal={() => onOpenAngpaoModal(guest)}
                    onOpenAngpaoHistory={() => onOpenAngpaoHistory(group)}
                    onOpenEditModal={() => onOpenEditModal(guest)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
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
      onOpenEditModal,
    }) {
      const isArrived = guest.status === 'ARRIVED';

      return (
        <div
          className={`rounded-xl border p-3 transition-all ${
            isArrived ? 'bg-emerald-50/40 border-emerald-200/80' : 'bg-white border-[#E8E2D5]'
          } ${isGroupMember ? 'shadow-none' : 'shadow-xs'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-base font-bold text-[#2C2A29]">{guest.name}</h4>

                <span className="text-xs px-2 py-0.5 bg-[#F2ECE1] text-[#57534E] rounded-md font-medium">
                  {guest.relationship}
                </span>

                {!isGroupMember && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      guest.side === 'GROOM' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {guest.side === 'GROOM' ? '男方' : '女方'}
                  </span>
                )}

                {guest.tags &&
                  guest.tags.map(tagId => {
                    const tag = systemTags.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tag.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium flex items-center gap-0.5 ${tag.color}`}
                      >
                        <i className="fa-solid fa-tag text-[9px]"></i>
                        {tag.name}
                      </span>
                    );
                  })}

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    isArrived ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  <i className={isArrived ? 'fa-solid fa-circle-check text-emerald-600' : 'fa-solid fa-clock text-amber-600'}></i>
                  {isArrived ? `已签到 ${guest.checkInTime || ''}` : '未签到'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#78716C]">
                <span>
                  桌号: <strong className="text-[#2C2A29]">{guest.tableNumber} 桌</strong>
                  {guest.seatNumber && <span> (座位 {guest.seatNumber})</span>}
                </span>

                {guest.groupName && !isGroupMember && (
                  <span>所属家庭: <span className="text-[#57534E] font-medium">{guest.groupName}</span></span>
                )}

                {guest.notes && (
                  <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    备注: {guest.notes}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onOpenEditModal}
              className="p-1.5 text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F2ECE1] rounded-lg transition-colors"
              title="修改宾客资料及标签"
            >
              <i className="fa-solid fa-[#pen]"></i>
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#F0EBE1] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAngpaoModal}
                className="px-3 py-1.5 bg-[#FAF6EE] hover:bg-amber-100/80 border border-amber-300/80 text-amber-900 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <i className="fa-solid fa-gift text-amber-700"></i>
                <span>登记礼金</span>
              </button>

              {angpaoRecords.length > 0 && (
                <button onClick={onOpenAngpaoHistory} className="text-xs text-amber-800 hover:underline font-semibold">
                  已登记 ({angpaoRecords.length} 笔)
                </button>
              )}
            </div>

            <button
              onClick={onCheckIn}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                isArrived
                  ? 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                  : 'bg-amber-700 hover:bg-amber-800 text-white'
              }`}
            >
              {isArrived ? (
                <>
                  <i className="fa-solid fa-check text-emerald-600"></i>
                  <span>已到 (撤销)</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-check"></i>
                  <span>立即签到</span>
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // ==========================================
    // MODALS
    // ==========================================

    function AngpaoEntryModal({ guest, groups, onClose, onSave }) {
      const [type, setType] = useState('INDIVIDUAL');
      const [amount, setAmount] = useState('');
      const [notes, setNotes] = useState('');

      const group = guest.groupId ? groups.find(g => g.id === guest.groupId) : null;

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
          alert('请输入正确的礼金金额');
          return;
        }

        const recipientId = type === 'INDIVIDUAL' ? guest.id : (group ? group.id : guest.id);
        const recipientName = type === 'INDIVIDUAL' ? guest.name : (group ? group.name : guest.name);

        onSave({
          type,
          recipientId,
          recipientName,
          amount: Number(amount),
          notes: notes.trim() || undefined,
        });
      };

      return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 border border-[#E8E2D5] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2">
              <h3 className="text-base font-bold text-[#2C2A29] flex items-center gap-1.5">
                <i className="fa-solid fa-gift text-amber-700"></i> 登记礼金 (RM)
              </h3>
              <button onClick={onClose} className="p-1 text-[#A8A29E] hover:text-[#2C2A29]">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {group && (
                <div className="flex items-center gap-2 p-1 bg-[#FAF7F2] rounded-xl border border-[#E8E2D5]">
                  <button
                    type="button"
                    onClick={() => setType('INDIVIDUAL')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      type === 'INDIVIDUAL' ? 'bg-amber-700 text-white' : 'text-[#78716C]'
                    }`}
                  >
                    个人: {guest.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('FAMILY')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      type === 'FAMILY' ? 'bg-amber-700 text-white' : 'text-[#78716C]'
                    }`}
                  >
                    家庭: {group.name}
                  </button>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#44403C] mb-1">礼金金额 (RM)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border-2 border-amber-200 focus:border-amber-600 rounded-xl text-lg font-extrabold text-[#2C2A29] focus:outline-none"
                />
                <div className="flex items-center gap-1.5 mt-2">
                  {[100, 200, 300, 500, 1000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(prev => (Number(prev) || 0) + val)}
                      className="flex-1 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-900 font-bold"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#44403C] mb-1">祝词 / 备注</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="例如：祝百年好合 / 永结同心"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-[#D6CEC2] rounded-xl font-medium text-[#57534E]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold shadow-xs"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    function AngpaoHistoryModal({ guest, group, records, onClose, onVoidRecord }) {
      const targetName = group ? group.name : guest?.name;

      const relevantRecords = records.filter(r => {
        if (group) return r.recipientId === group.id || (guest && r.recipientId === guest.id);
        return guest && r.recipientId === guest.id;
      });

      return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-[#E8E2D5] shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
              <h3 className="text-base font-bold text-[#2C2A29]">【{targetName}】礼金记录明细</h3>
              <button onClick={onClose} className="p-1 text-[#A8A29E] hover:text-[#2C2A29]">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {relevantRecords.length === 0 ? (
                <p className="text-center py-4 text-[#A8A29E]">暂无礼金登记记录</p>
              ) : (
                relevantRecords.map(r => (
                  <div
                    key={r.id}
                    className={`p-3 rounded-xl border ${
                      r.isVoided ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-[#FAF8F5] border-[#E8E2D5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2C2A29]">
                        {r.recipientType === 'FAMILY' ? '全家礼金' : '个人礼金'} - {r.recipientName}
                      </span>
                      {!r.isVoided && (
                        <button
                          onClick={() => onVoidRecord(r.id)}
                          className="text-red-600 hover:underline font-semibold"
                        >
                          作废
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#78716C] mt-1">
                      登记人: {r.recordedBy} | 时间: {r.recordedAt}
                    </p>
                    {r.notes && <p className="text-xs text-amber-800 mt-1">备注: {r.notes}</p>}
                    {r.isVoided && <p className="text-xs text-red-600 font-bold mt-1">【已作废】原因: {r.voidReason}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    function EditGuestModal({ guest, systemTags, tables, groups, onClose, onSave }) {
      const [formData, setFormData] = useState({
        ...guest,
        tags: guest.tags || [],
      });

      const toggleTag = (tagId) => {
        setFormData(prev => {
          const exists = prev.tags.includes(tagId);
          if (exists) {
            return { ...prev, tags: prev.tags.filter(t => t !== tagId) };
          } else {
            return { ...prev, tags: [...prev.tags, tagId] };
          }
        });
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
      };

      return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-[#E8E2D5] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
              <h3 className="text-base font-bold text-[#2C2A29]">编辑宾客资料与标签</h3>
              <button onClick={onClose} className="p-1 text-[#A8A29E] hover:text-[#2C2A29]">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#44403C] mb-1">宾客姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl focus:outline-none focus:border-amber-600 text-sm"
                />
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E2D5]">
                <label className="block font-bold text-[#44403C] mb-1.5 flex items-center justify-between">
                  <span>赋予标签 (多选 Listing)</span>
                  <span className="text-[10px] text-[#78716C]">已选 {formData.tags.length} 个标签</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {systemTags.map(tag => {
                    const isSelected = formData.tags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                            : 'bg-white text-[#57534E] border-[#D6CEC2] hover:bg-amber-50'
                        }`}
                      >
                        {isSelected ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus text-[#A8A29E]"></i>}
                        <span>{tag.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#44403C] mb-1">婚礼边 (女方/男方)</label>
                  <select
                    value={formData.side}
                    onChange={e => setFormData({ ...formData, side: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl focus:outline-none focus:border-amber-600 text-sm"
                  >
                    <option value="GROOM">男方 (Groom)</option>
                    <option value="BRIDE">女方 (Bride)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#44403C] mb-1">身份关系</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="如: 舅舅 / 大学同学"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl focus:outline-none focus:border-amber-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#44403C] mb-1">安排桌号</label>
                  <select
                    value={formData.tableNumber}
                    onChange={e => setFormData({ ...formData, tableNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl focus:outline-none focus:border-amber-600 text-sm"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.number}>
                        {t.number} 桌
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#44403C] mb-1">座位号 (选填)</label>
                  <input
                    type="text"
                    value={formData.seatNumber || ''}
                    onChange={e => setFormData({ ...formData, seatNumber: e.target.value })}
                    placeholder="如: 01"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl focus:outline-none focus:border-amber-600 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-[#D6CEC2] rounded-xl font-medium text-[#57534E]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold shadow-xs"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    function ConfirmFamilyCheckInModal({ group, guests, onClose, onConfirm }) {
      const pendingCount = guests.filter(g => g.status === 'PENDING').length;

      return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 border border-[#E8E2D5] shadow-xl text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <i className="fa-solid fa-user-check text-xl"></i>
            </div>
            <h3 className="text-base font-bold text-[#2C2A29]">全家一键签到确认</h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              是否确认将 <strong className="text-[#2C2A29]">{group.name}</strong> 剩余的{' '}
              <strong className="text-emerald-700 font-extrabold">{pendingCount}</strong> 位未到成员一次性标记为已到场？
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-[#D6CEC2] rounded-xl text-xs font-medium text-[#57534E]"
              >
                取消
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                确认一键签到
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ==========================================
    // ADMIN: dashboard.html
    // ==========================================

    function DashboardPage() {
      return (
        <AppShell isAdminPage>
          {() => <DashboardContent />}
        </AppShell>
      );
    }

    function DashboardContent() {
      const [angpaoRecords] = useStored('angpaoRecords');

      return (
        <PageMain>
          <AdminPanelFrame active="dashboard">
            <div className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-1">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-gift text-amber-700"></i> 后台礼金汇总统计 (仅管理员可见)
                  </h4>
                  <p className="text-2xl font-extrabold text-amber-900 pt-1">
                    {formatRM(
                      angpaoRecords.filter(r => !r.isVoided).reduce((acc, curr) => acc + curr.amount, 0)
                    )}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    共 {angpaoRecords.filter(r => !r.isVoided).length} 笔有效礼金记录
                  </p>
                </div>
            </div>
          </AdminPanelFrame>
        </PageMain>
      );
    }

    // ==========================================
    // ADMIN: tag.html
    // ==========================================

    function TagPage() {
      return (
        <AppShell isAdminPage>
          {({ showToast }) => <TagContent showToast={showToast} />}
        </AppShell>
      );
    }

    function TagContent({ showToast }) {
      const [tags, setTags] = useStored('tags');
      const [newTagName, setNewTagName] = useState('');

      const handleCreateTag = (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        const colors = [
          'bg-amber-100 text-amber-900 border-amber-300',
          'bg-blue-100 text-blue-900 border-blue-300',
          'bg-emerald-100 text-emerald-900 border-emerald-300',
          'bg-purple-100 text-purple-900 border-purple-300',
          'bg-rose-100 text-rose-900 border-rose-300',
        ];
        const color = colors[tags.length % colors.length];

        const newTag = {
          id: `tag-${Date.now()}`,
          name: newTagName.trim(),
          color,
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

      return (
        <PageMain>
          <AdminPanelFrame active="tag">
            <div className="space-y-6">
                <form onSubmit={handleCreateTag} className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    placeholder="新增全局标签名称 (如：大学同学, VIP)"
                    className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl text-xs focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold"
                  >
                    添加标签
                  </button>
                </form>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tags.map(tag => (
                    <div
                      key={tag.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${tag.color}`}
                    >
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-tag"></i>
                        {tag.name}
                      </span>
                      <button
                        onClick={() => handleDeleteTag(tag.id, tag.name)}
                        className="p-1 text-red-600 hover:bg-white/50 rounded-lg"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  ))}
                </div>
            </div>
          </AdminPanelFrame>
        </PageMain>
      );
    }

    // ==========================================
    // ADMIN: add-guest.html
    // ==========================================

    function AddGuestPage() {
      return (
        <AppShell isAdminPage>
          {({ showToast }) => <AddGuestContent showToast={showToast} />}
        </AppShell>
      );
    }

    function AddGuestContent({ showToast }) {
      const [tables] = useStored('tables');
      const [, setGuests] = useStored('guests');
      const [newGuestName, setNewGuestName] = useState('');
      const [newGuestRel, setNewGuestRel] = useState('');
      const [newGuestSide, setNewGuestSide] = useState('GROOM');
      const [newGuestTable, setNewGuestTable] = useState('01');
      const [selectedTagsForNewGuest, setSelectedTagsForNewGuest] = useState([]);

      const handleAddSingleGuest = (e) => {
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
          isActive: true,
        };

        setGuests(prev => [newG, ...prev]);
        showToast(`成功登记新宾客: ${newG.name}`);
        setNewGuestName('');
        setNewGuestRel('');
        setSelectedTagsForNewGuest([]);
      };

      return (
        <PageMain>
          <AdminPanelFrame active="add-guest">
              <form onSubmit={handleAddSingleGuest} className="space-y-4 text-xs">
                <h3 className="font-bold text-sm text-[#2C2A29]">新增单个宾客</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">姓名</label>
                    <input
                      type="text"
                      value={newGuestName}
                      onChange={e => setNewGuestName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">身份关系</label>
                    <input
                      type="text"
                      value={newGuestRel}
                      onChange={e => setNewGuestRel(e.target.value)}
                      placeholder="如: 同事"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">婚礼边</label>
                    <select
                      value={newGuestSide}
                      onChange={e => setNewGuestSide(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl"
                    >
                      <option value="GROOM">男方</option>
                      <option value="BRIDE">女方</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">安排桌号</label>
                    <select
                      value={newGuestTable}
                      onChange={e => setNewGuestTable(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl"
                    >
                      {tables.map(t => (
                        <option key={t.id} value={t.number}>
                          {t.number} 桌
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800"
                >
                  录入宾客
                </button>
              </form>
          </AdminPanelFrame>
        </PageMain>
      );
    }

    // ==========================================
    // ADMIN: table-setting.html
    // ==========================================

    function TableSettingPage() {
      return (
        <AppShell isAdminPage>
          {() => <TableSettingContent />}
        </AppShell>
      );
    }

    function TableSettingContent() {
      const [tables] = useStored('tables');

      return (
        <PageMain>
          <AdminPanelFrame active="table-setting">
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-sm text-[#2C2A29]">桌位与容纳人数设置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tables.map(t => (
                    <div key={t.id} className="p-3 border rounded-xl bg-[#FAF8F5] flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-base text-[#2C2A29]">{t.number} 桌</span>
                        <span className="text-xs text-[#78716C] ml-2">(容量 {t.capacity} 人)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </AdminPanelFrame>
        </PageMain>
      );
    }


    // ==========================================
    // BOOTSTRAP: mount whichever page this document declares
    // ==========================================

    const PAGES = {
      mainpage: CheckInPage,
      dashboard: DashboardPage,
      tag: TagPage,
      'add-guest': AddGuestPage,
      'table-setting': TableSettingPage,
    };

    function mountPage() {
      const rootElement = document.getElementById('root');
      if (!rootElement) return;
      const Page = PAGES[rootElement.getAttribute('data-page')];
      if (!Page) return;
      LINKS = getLinks(rootElement.getAttribute('data-base') || '');
      ReactDOM.createRoot(rootElement).render(<Page />);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountPage);
    } else {
      mountPage();
    }
})();
