// Original records, shared by the plain HTML pages.
const INITIAL_DATA = {
  "tags": [
    {
      "id": "tag-1",
      "name": "VIP",
      "color": "wedding-bg-amber-100 wedding-text-amber-900 wedding-border-amber-300"
    },
    {
      "id": "tag-2",
      "name": "男方长辈",
      "color": "wedding-bg-blue-100 wedding-text-blue-900 wedding-border-blue-300"
    },
    {
      "id": "tag-3",
      "name": "女方长辈",
      "color": "wedding-bg-rose-100 wedding-text-rose-900 wedding-border-rose-300"
    },
    {
      "id": "tag-4",
      "name": "大学同学",
      "color": "wedding-bg-purple-100 wedding-text-purple-900 wedding-border-purple-300"
    },
    {
      "id": "tag-5",
      "name": "公司同事",
      "color": "wedding-bg-teal-100 wedding-text-teal-900 wedding-border-teal-300"
    },
    {
      "id": "tag-6",
      "name": "素食者",
      "color": "wedding-bg-emerald-100 wedding-text-emerald-900 wedding-border-emerald-300"
    }
  ],
  "tables": [
    {
      "id": "t1",
      "number": "01",
      "capacity": 10,
      "tags": [
        "tag-1",
        "tag-2"
      ]
    },
    {
      "id": "t2",
      "number": "02",
      "capacity": 10,
      "tags": [
        "tag-1",
        "tag-3"
      ]
    },
    {
      "id": "t3",
      "number": "03",
      "capacity": 10,
      "tags": [
        "tag-2"
      ]
    },
    {
      "id": "t4",
      "number": "04",
      "capacity": 10,
      "tags": [
        "tag-3"
      ]
    },
    {
      "id": "t5",
      "number": "05",
      "capacity": 10,
      "tags": [
        "tag-4"
      ]
    },
    {
      "id": "t6",
      "number": "06",
      "capacity": 10,
      "tags": [
        "tag-5"
      ]
    }
  ],
  "groups": [
    {
      "id": "g1",
      "name": "张伟全家",
      "side": "GROOM",
      "tableNumbers": [
        "03"
      ]
    },
    {
      "id": "g2",
      "name": "陈美玲一家",
      "side": "BRIDE",
      "tableNumbers": [
        "04"
      ]
    },
    {
      "id": "g3",
      "name": "李强家庭",
      "side": "GROOM",
      "tableNumbers": [
        "01",
        "03"
      ]
    }
  ],
  "guests": [
    {
      "id": "guest-101",
      "name": "张伟",
      "groupId": "g1",
      "groupName": "张伟全家",
      "relationship": "父亲",
      "tableNumber": "03",
      "seatNumber": "01",
      "side": "GROOM",
      "tags": [
        "tag-2",
        "tag-1"
      ],
      "status": "PENDING",
      "phone": "012-3456789",
      "isActive": true
    },
    {
      "id": "guest-102",
      "name": "王丽",
      "groupId": "g1",
      "groupName": "张伟全家",
      "relationship": "母亲",
      "tableNumber": "03",
      "seatNumber": "02",
      "side": "GROOM",
      "tags": [
        "tag-2"
      ],
      "status": "PENDING",
      "phone": "012-3456790",
      "isActive": true
    },
    {
      "id": "guest-103",
      "name": "张伟",
      "groupId": "g1",
      "groupName": "张伟全家",
      "relationship": "长子",
      "tableNumber": "03",
      "seatNumber": "03",
      "side": "GROOM",
      "tags": [
        "tag-4"
      ],
      "status": "PENDING",
      "isActive": true
    },
    {
      "id": "guest-104",
      "name": "陈美玲",
      "groupId": "g2",
      "groupName": "陈美玲一家",
      "relationship": "大姨",
      "tableNumber": "04",
      "seatNumber": "01",
      "side": "BRIDE",
      "tags": [
        "tag-3",
        "tag-1"
      ],
      "status": "ARRIVED",
      "checkInTime": "18:15",
      "isActive": true
    },
    {
      "id": "guest-105",
      "name": "林建国",
      "groupId": "g2",
      "groupName": "陈美玲一家",
      "relationship": "姨丈",
      "tableNumber": "04",
      "seatNumber": "02",
      "side": "BRIDE",
      "tags": [
        "tag-3"
      ],
      "status": "ARRIVED",
      "checkInTime": "18:15",
      "isActive": true
    },
    {
      "id": "guest-106",
      "name": "李强",
      "groupId": "g3",
      "groupName": "李强家庭",
      "relationship": "舅舅",
      "tableNumber": "01",
      "seatNumber": "05",
      "side": "GROOM",
      "tags": [
        "tag-1",
        "tag-2",
        "tag-6"
      ],
      "status": "PENDING",
      "notes": "吃素食品",
      "isActive": true
    },
    {
      "id": "guest-107",
      "name": "黄志明",
      "relationship": "大学同学",
      "tableNumber": "05",
      "side": "GROOM",
      "tags": [
        "tag-4"
      ],
      "status": "PENDING",
      "isActive": true
    },
    {
      "id": "guest-108",
      "name": "刘婷婷",
      "relationship": "公司同事",
      "tableNumber": "06",
      "side": "BRIDE",
      "tags": [
        "tag-5"
      ],
      "status": "PENDING",
      "isActive": true
    }
  ],
  "angpaoRecords": [
    {
      "id": "ap-1",
      "recipientType": "INDIVIDUAL",
      "recipientId": "guest-104",
      "recipientName": "陈美玲",
      "amount": 300,
      "notes": "祝百年好合",
      "recordedBy": "工作人员 阿杰",
      "recordedAt": "2026-11-06 18:16",
      "isVoided": false
    },
    {
      "id": "ap-2",
      "recipientType": "FAMILY",
      "recipientId": "g2",
      "recipientName": "陈美玲一家",
      "amount": 800,
      "notes": "大姨一家贺礼",
      "recordedBy": "工作人员 阿杰",
      "recordedAt": "2026-11-06 18:17",
      "isVoided": false
    }
  ],
  "currentUser": {
    "id": "u1",
    "username": "staff01",
    "name": "接待员 - 阿杰",
    "role": "ADMIN"
  }
};
/* Plain JavaScript for the wedding template. No framework, build step or server is required.
 * The editable layout and reusable <template> elements are in the HTML pages.
 * Shared records use localStorage. For direct file navigation, window.name also
 * carries a same-tab copy because file:// storage behavior varies by browser.
 */
(function () {
  'use strict';

  const prefix = 'wedding-template-v1:';
  const fileMode = location.protocol === 'file:';
  const copy = value => JSON.parse(JSON.stringify(value));
  let carried;
  if (fileMode) {
    try { const saved = JSON.parse(window.name); if (saved.app === prefix) carried = saved.data; } catch { /* First visit. */ }
  }
  const data = Object.fromEntries(Object.entries(INITIAL_DATA).map(([key, seed]) => {
    try {
      if (carried && Object.hasOwn(carried, key)) return [key, carried[key]];
      const raw = localStorage.getItem(prefix + key);
      return [key, raw === null ? copy(seed) : JSON.parse(raw)];
    } catch { return [key, copy(seed)]; }
  }));
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const field = (root, name) => $('[data-field="' + name + '"]', root);
  const setText = (root, name, text) => { const element = field(root, name); if (element) element.textContent = text; return element; };
  const clone = id => document.getElementById(id).content.firstElementChild.cloneNode(true);
  const buttonAction = (root, name) => $('[data-action="' + name + '"]', root);
  const rm = value => 'RM ' + value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const activeGuests = () => data.guests.filter(guest => guest.isActive);
  const validGifts = () => data.angpaoRecords.filter(record => !record.isVoided);
  const uid = prefix => prefix + '-' + (globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(16).slice(2));
  const time = () => new Date().toTimeString().slice(0, 5);
  const timestamp = () => { const now = new Date(); return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + time(); };
  const filters = { side: 'ALL', status: 'ALL', table: 'ALL', tag: 'ALL', search: '' };
  const collapsed = new Set();
  let toastTimer;
  let returnFocus;
  let modalState = null;
  let historyScope = null;

  function carry() {
    if (fileMode) window.name = JSON.stringify({ app: prefix, data });
  }
  function save(...keys) {
    for (const key of keys) {
      try { localStorage.setItem(prefix + key, JSON.stringify(data[key])); } catch { /* Same-tab file navigation can still use window.name. */ }
    }
    carry();
  }
  function toast(message) {
    const element = $('#toast');
    $('span', element).textContent = message;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 3000);
  }
  function options(select, records, valueKey, label, first) {
    if (!select) return;
    const previous = select.value;
    const entries = first ? [new Option(first, 'ALL')] : [];
    entries.push(...records.map(record => new Option(label(record), record[valueKey])));
    select.replaceChildren(...entries);
    if (entries.some(entry => entry.value === previous)) select.value = previous;
  }
  function sideBadge(element, side, family = false) {
    if (!element) return;
    element.className = 'wedding-text-10px wedding-px-2 wedding-py-0-5 wedding-rounded-full wedding-font-semibold ' + (side === 'GROOM' ? 'wedding-bg-blue-100 wedding-text-blue-800' : 'wedding-bg-rose-100 wedding-text-rose-800');
    element.textContent = (side === 'GROOM' ? '男方' : '女方') + (family ? '亲友' : '');
  }
  function guestCard(guest, member) {
    const arrived = guest.status === 'ARRIVED';
    const card = clone('guest-' + (member ? 'member' : 'single') + '-' + (arrived ? 'arrived' : 'pending'));
    card.dataset.id = guest.id;
    setText(card, 'guest-name', guest.name);
    setText(card, 'relationship', guest.relationship);
    sideBadge(field(card, 'guest-side'), guest.side);
    const status = field(card, 'guest-status');
    const icon = $('i', status);
    status.replaceChildren(icon, document.createTextNode(arrived ? '已签到 ' + (guest.checkInTime || '') : '未签到'));
    for (const id of guest.tags || []) {
      const tag = data.tags.find(item => item.id === id);
      if (!tag) continue;
      const badge = clone('tag-badge-template');
      badge.className = 'wedding-text-10px wedding-px-1-5 wedding-py-0-5 wedding-rounded-md wedding-border wedding-font-medium d-flex align-items-center wedding-gap-0-5 ' + tag.color;
      const icon = $('i', badge);
      badge.replaceChildren(icon, document.createTextNode(tag.name));
      status.before(badge);
    }
    setText(card, 'guest-table', guest.tableNumber + ' 桌');
    const seat = setText(card, 'guest-seat', ' (座位 ' + (guest.seatNumber || '') + ')');
    if (seat.previousSibling?.nodeType === Node.TEXT_NODE && !seat.previousSibling.textContent.trim()) seat.previousSibling.remove();
    seat.hidden = !guest.seatNumber;
    const family = setText(card, 'guest-family', '所属家庭: ' + (guest.groupName || ''));
    if (family) family.hidden = !guest.groupName;
    const notes = setText(card, 'guest-notes', '备注: ' + (guest.notes || ''));
    notes.hidden = !guest.notes;
    const gifts = validGifts().filter(record => record.recipientId === guest.id);
    const history = buttonAction(card, 'guest-history');
    history.textContent = '已登记 (' + gifts.length + ' 笔)';
    history.hidden = gifts.length === 0;
    return card;
  }
  function familyCard(group, visibleMembers) {
    const card = clone('family-template');
    card.dataset.id = group.id;
    setText(card, 'family-name', group.name);
    sideBadge(field(card, 'family-side'), group.side, true);
    setText(card, 'family-tables', group.tableNumbers.join(', ') + ' 桌');
    const members = activeGuests().filter(guest => guest.groupId === group.id);
    const arrived = members.filter(guest => guest.status === 'ARRIVED').length;
    const pending = members.length - arrived;
    const progress = setText(card, 'family-progress', arrived + ' / ' + members.length + ' 人');
    progress.className = 'wedding-font-extrabold ' + (pending ? 'wedding-text-amber-800' : 'wedding-text-emerald-700');
    const pendingElement = field(card, 'family-pending');
    const message = document.createElement('span');
    message.className = pending ? 'wedding-text-amber-800 wedding-font-medium' : 'wedding-text-emerald-700 wedding-font-medium d-flex align-items-center wedding-gap-1';
    if (!pending) { const icon = document.createElement('i'); icon.className = 'fa-solid fa-check'; message.append(icon, document.createTextNode(' 全员已到齐')); }
    else message.textContent = '尚有 ' + pending + ' 位未签到';
    pendingElement.replaceChildren(message);
    buttonAction(card, 'family-checkin').hidden = pending === 0;
    const container = field(card, 'family-members');
    container.replaceChildren(...visibleMembers.map((guest, index) => {
      const wrapper = document.createElement('div');
      if (index) wrapper.className = 'wedding-pt-2';
      wrapper.append(guestCard(guest, true));
      return wrapper;
    }));
    const closed = collapsed.has(group.id);
    container.hidden = closed;
    const toggle = buttonAction(card, 'collapse-family');
    toggle.setAttribute('aria-expanded', String(!closed));
    toggle.setAttribute('aria-label', closed ? '展开家庭' : '收起家庭');
    $('i', toggle).className = 'fa-solid fa-chevron-' + (closed ? 'down' : 'up');
    return card;
  }
  function renderGuests() {
    const list = $('#guest-list');
    if (!list) return;
    const term = filters.search.trim().toLowerCase();
    const guests = activeGuests().filter(guest => {
      if (term && !guest.name.toLowerCase().includes(term) && !(guest.groupName || '').toLowerCase().includes(term) && guest.tableNumber.toLowerCase() !== term && !('桌' + guest.tableNumber).includes(term) && !('桌 ' + guest.tableNumber).includes(term) && !guest.relationship.toLowerCase().includes(term)) return false;
      return (filters.side === 'ALL' || guest.side === filters.side) && (filters.status === 'ALL' || guest.status === filters.status) && (filters.table === 'ALL' || guest.tableNumber === filters.table) && (filters.tag === 'ALL' || (guest.tags || []).includes(filters.tag));
    });
    const families = new Map();
    const single = [];
    for (const guest of guests) {
      if (guest.groupId) { if (!families.has(guest.groupId)) families.set(guest.groupId, []); families.get(guest.groupId).push(guest); }
      else single.push(guest);
    }
    const cards = [];
    for (const [id, members] of families) {
      const group = data.groups.find(group => group.id === id);
      if (group) cards.push(familyCard(group, members));
    }
    cards.push(...single.map(guest => guestCard(guest, false)));
    list.replaceChildren(...(cards.length ? cards : [clone('empty-template')]));
    $('#clear-search').hidden = !filters.search;
  }
  function renderTags() {
    const list = $('#tag-list');
    if (!list) return;
    list.replaceChildren(...data.tags.map(tag => {
      const row = clone('admin-tag-template');
      row.className = 'wedding-p-2-5 wedding-rounded-xl wedding-border d-flex align-items-center justify-content-between wedding-text-xs wedding-font-semibold ' + tag.color;
      const text = $('span', row);
      text.replaceChildren($('i', text), document.createTextNode(tag.name));
      const button = $('button', row);
      button.dataset.action = 'delete-tag'; button.dataset.id = tag.id;
      button.setAttribute('aria-label', '删除标签 ' + tag.name);
      return row;
    }));
  }
  function renderTables() {
    const list = $('#table-list');
    if (!list) return;
    list.replaceChildren(...data.tables.map(table => {
      const row = clone('table-row-template');
      const spans = $$('span', row);
      spans[0].textContent = table.number + ' 桌'; spans[1].textContent = '(容量 ' + table.capacity + ' 人)';
      return row;
    }));
  }
  function render() {
    const loggedIn = Boolean(data.currentUser);
    $('#application').hidden = !loggedIn;
    $('#login-view').hidden = loggedIn;
    if (!loggedIn) {
      $('#login-view').replaceChildren(clone('login-template'));
      $('#modal-root').replaceChildren();
      document.body.classList.remove('wedding-dialog-open');
      return;
    }
    const user = field(document, 'current-user');
    user.replaceChildren(user.firstElementChild, document.createTextNode(data.currentUser.name + ' (' + (data.currentUser.role === 'ADMIN' ? '管理员' : '接待员') + ')'));
    const total = activeGuests().length;
    setText(document, 'attendance', activeGuests().filter(guest => guest.status === 'ARRIVED').length + ' / ' + total + ' 人');
    setText(document, 'gift-total', rm(validGifts().reduce((sum, record) => sum + record.amount, 0)));
    setText(document, 'gift-count', '共 ' + validGifts().length + ' 笔有效礼金记录');
    options($('#table-filter'), data.tables, 'number', table => table.number + ' 桌', '所有桌号');
    options($('#tag-filter'), data.tags, 'id', tag => tag.name, '全部自定义标签');
    options($('#add-guest-form select[name="tableNumber"]'), data.tables, 'number', table => table.number + ' 桌');
    renderGuests(); renderTags(); renderTables();
  }
  function showModal(id, stack = false) {
    const root = $('#modal-root');
    if (!root.children.length) returnFocus = document.activeElement;
    if (!stack) root.replaceChildren();
    const dialog = clone(id);
    for (const [index, input] of $$('input,select', dialog).entries()) {
      input.id = id + '-field-' + index;
      const label = $('label', input.parentElement);
      if (label) label.htmlFor = input.id;
    }
    root.append(dialog);
    document.body.classList.add('wedding-dialog-open');
    ($('input,select,button', dialog) || dialog).focus();
    return dialog;
  }
  function closeModal() {
    const root = $('#modal-root');
    root.lastElementChild?.remove();
    if (!root.children.length) {
      modalState = null;
      document.body.classList.remove('wedding-dialog-open');
      if (returnFocus?.isConnected) returnFocus.focus();
    } else { root.lastElementChild.focus(); modalState = { type: 'history' }; }
  }
  function openGift(guest) {
    modalState = { type: 'gift', guestId: guest.id, giftType: 'INDIVIDUAL' };
    const dialog = showModal('gift-modal-template');
    const group = data.groups.find(group => group.id === guest.groupId);
    field(dialog, 'gift-type-controls').hidden = !group;
    setText(dialog, 'gift-person', '个人: ' + guest.name);
    setText(dialog, 'gift-family', '家庭: ' + (group?.name || ''));
    $('input[name="amount"]', dialog).value = '';
    $('input[name="notes"]', dialog).value = '';
    $('input[name="amount"]', dialog).focus();
  }
  function renderEditTags() {
    const dialog = $('#modal-root').lastElementChild;
    setText(dialog, 'selected-tag-count', '已选 ' + modalState.tags.length + ' 个标签');
    field(dialog, 'edit-tag-list').replaceChildren(...data.tags.map(tag => {
      const button = clone('edit-tag-template');
      const selected = modalState.tags.includes(tag.id);
      button.dataset.id = tag.id;
      button.setAttribute('aria-pressed', String(selected));
      button.className = 'wedding-px-2-5 wedding-py-1 wedding-rounded-lg wedding-text-xs wedding-font-medium wedding-border wedding-transition-all d-flex align-items-center wedding-gap-1 ' + (selected ? 'wedding-bg-amber-700 wedding-text-white wedding-border-amber-800' : 'wedding-bg-white wedding-text-hex-57534E wedding-border-hex-D6CEC2 wedding-hover-bg-amber-50');
      $('i', button).className = selected ? 'fa-solid fa-check' : 'fa-solid fa-plus wedding-text-hex-A8A29E';
      $('span', button).textContent = tag.name;
      return button;
    }));
  }
  function openEdit(guest) {
    modalState = { type: 'edit', guestId: guest.id, tags: [...(guest.tags || [])] };
    const dialog = showModal('edit-modal-template');
    const form = $('form', dialog);
    options(form.elements.tableNumber, data.tables, 'number', table => table.number + ' 桌');
    for (const name of ['name', 'side', 'relationship', 'tableNumber', 'seatNumber']) form.elements[name].value = guest[name] || '';
    renderEditTags();
  }
  function openHistory(scope) {
    historyScope = scope;
    modalState = { type: 'history' };
    const guest = data.guests.find(guest => guest.id === scope.guestId);
    const group = data.groups.find(group => group.id === scope.groupId);
    const dialog = showModal('history-modal-template');
    setText(dialog, 'history-title', '【' + (group?.name || guest?.name || '') + '】礼金记录明细');
    const records = data.angpaoRecords.filter(record => group ? record.recipientId === group.id || (guest && record.recipientId === guest.id) : guest && record.recipientId === guest.id);
    const list = field(dialog, 'history-records');
    if (!records.length) {
      const empty = document.createElement('p');
      empty.className = 'text-center wedding-py-4 wedding-text-hex-A8A29E'; empty.textContent = '暂无礼金登记记录';
      list.replaceChildren(empty); return;
    }
    list.replaceChildren(...records.map(record => {
      const row = clone('history-record-' + (record.isVoided ? 'voided' : 'valid'));
      setText(row, 'record-name', (record.recipientType === 'FAMILY' ? '全家礼金' : '个人礼金') + ' - ' + record.recipientName);
      setText(row, 'record-meta', '登记人: ' + record.recordedBy + ' | 时间: ' + record.recordedAt);
      setText(row, 'record-notes', '备注: ' + (record.notes || '')).hidden = !record.notes;
      setText(row, 'record-void-reason', '【已作废】原因: ' + (record.voidReason || ''));
      if (!record.isVoided) buttonAction(row, 'void-record').dataset.id = record.id;
      return row;
    }));
  }
  function updateFilterButtons(action, value) {
    for (const button of $$('[data-action="' + action + '"]')) {
      const selected = button.dataset.value === value;
      const color = { GROOM: 'blue', BRIDE: 'rose', PENDING: 'amber', ARRIVED: 'emerald' }[value];
      button.className = 'wedding-px-2-5 wedding-py-1 wedding-rounded-md wedding-font-medium wedding-transition-all ' + (selected ? value === 'ALL' ? 'wedding-bg-white wedding-text-hex-2C2A29' : 'wedding-bg-' + color + '-600 wedding-text-white' : 'wedding-text-hex-78716C');
      button.setAttribute('aria-pressed', String(selected));
    }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) { if (event.target.closest('a[href]')) carry(); return; }
    const action = button.dataset.action;
    const guest = data.guests.find(item => item.id === button.closest('[data-guest-card]')?.dataset.id);
    const groupId = button.closest('[data-family-card]')?.dataset.id;
    if (action === 'logout') { data.currentUser = null; save('currentUser'); render(); }
    else if (action === 'login') { data.currentUser = copy(INITIAL_DATA.currentUser); save('currentUser'); render(); }
    else if (action === 'clear-search') { filters.search = ''; $('#guest-search').value = ''; renderGuests(); $('#guest-search').focus(); }
    else if (action === 'side-filter' || action === 'status-filter') { filters[action === 'side-filter' ? 'side' : 'status'] = button.dataset.value; updateFilterButtons(action, button.dataset.value); renderGuests(); }
    else if (action === 'checkin' && guest) {
      guest.status = guest.status === 'PENDING' ? 'ARRIVED' : 'PENDING';
      guest.checkInTime = guest.status === 'ARRIVED' ? time() : undefined;
      save('guests'); render(); toast(guest.status === 'ARRIVED' ? '[' + guest.name + '] 已签到' : '已撤销 [' + guest.name + '] 的签到');
    } else if (action === 'collapse-family') {
      if (collapsed.has(groupId)) collapsed.delete(groupId); else collapsed.add(groupId);
      renderGuests();
    } else if (action === 'family-checkin') {
      const group = data.groups.find(group => group.id === groupId);
      modalState = { type: 'family', groupId };
      const dialog = showModal('family-modal-template');
      setText(dialog, 'confirm-family-name', group.name);
      setText(dialog, 'confirm-family-count', activeGuests().filter(guest => guest.groupId === groupId && guest.status === 'PENDING').length);
    } else if (action === 'confirm-family') {
      const group = data.groups.find(group => group.id === modalState.groupId);
      let count = 0; const checkInTime = time();
      for (const guest of activeGuests()) if (guest.groupId === group.id && guest.status === 'PENDING') { guest.status = 'ARRIVED'; guest.checkInTime = checkInTime; count++; }
      save('guests'); closeModal(); render(); toast('已成功将 [' + group.name + '] 的 ' + count + ' 位成员全员签到');
    } else if (action === 'open-gift' && guest) openGift(guest);
    else if (action === 'edit-guest' && guest) openEdit(guest);
    else if (action === 'family-history') openHistory({ groupId });
    else if (action === 'guest-history' && guest) openHistory(guest.groupId ? { groupId: guest.groupId } : { guestId: guest.id });
    else if (action === 'close-modal') closeModal();
    else if (action === 'gift-type') {
      modalState.giftType = button.dataset.value;
      for (const item of $$('[data-action="gift-type"]', $('#modal-root'))) item.className = 'wedding-flex-1 wedding-py-1-5 wedding-rounded-lg wedding-font-bold wedding-transition-all ' + (item === button ? 'wedding-bg-amber-700 wedding-text-white' : 'wedding-text-hex-78716C');
    } else if (action === 'gift-increment') {
      const input = $('#gift-form').elements.amount;
      input.value = (Number(input.value) || 0) + Number(button.dataset.value);
    } else if (action === 'toggle-edit-tag') {
      const id = button.dataset.id;
      modalState.tags = modalState.tags.includes(id) ? modalState.tags.filter(tag => tag !== id) : [...modalState.tags, id];
      renderEditTags();
    } else if (action === 'void-record') {
      modalState = { type: 'void', recordId: button.dataset.id };
      const dialog = showModal('void-modal-template', true);
      $('input', dialog).value = '';
    } else if (action === 'confirm-void') {
      const input = $('#modal-root').lastElementChild.querySelector('input');
      if (!input.value.trim()) { input.setCustomValidity('请填写作废原因'); input.reportValidity(); return; }
      const record = data.angpaoRecords.find(record => record.id === modalState.recordId);
      record.isVoided = true; record.voidReason = input.value.trim(); save('angpaoRecords');
      openHistory(historyScope); render(); toast('礼金记录已作废');
    } else if (action === 'delete-tag') {
      const tag = data.tags.find(tag => tag.id === button.dataset.id);
      if (confirm('确定要删除标签 [' + tag.name + '] 吗？')) { data.tags = data.tags.filter(item => item.id !== tag.id); save('tags'); render(); toast('已删除标签 [' + tag.name + ']'); }
    }
  });
  document.addEventListener('input', event => {
    if (event.target.id === 'guest-search') { filters.search = event.target.value; renderGuests(); }
    if (event.target.name === 'voidReason') event.target.setCustomValidity('');
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'table-filter') { filters.table = event.target.value; renderGuests(); }
    if (event.target.id === 'tag-filter') { filters.tag = event.target.value; renderGuests(); }
  });
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!['gift-form', 'edit-guest-form', 'tag-form', 'add-guest-form'].includes(form.id)) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    if (form.id === 'gift-form') {
      const amount = Number(values.amount);
      if (!Number.isFinite(amount) || amount <= 0) { alert('请输入正确的礼金金额'); return; }
      const guest = data.guests.find(guest => guest.id === modalState.guestId);
      const family = modalState.giftType === 'FAMILY' ? data.groups.find(group => group.id === guest.groupId) : null;
      const recipient = family || guest;
      data.angpaoRecords.unshift({ id: uid('ap'), recipientType: modalState.giftType, recipientId: recipient.id, recipientName: recipient.name, amount, notes: values.notes.trim() || undefined, recordedBy: data.currentUser?.name || '工作人员', recordedAt: timestamp(), isVoided: false });
      save('angpaoRecords'); closeModal(); render(); toast('成功登记 ' + recipient.name + ' 礼金');
    } else if (form.id === 'edit-guest-form') {
      const guest = data.guests.find(guest => guest.id === modalState.guestId);
      Object.assign(guest, values, { tags: [...modalState.tags] });
      save('guests'); closeModal(); render(); toast('已更新宾客资料');
    } else if (form.id === 'tag-form') {
      const name = values.tagName.trim(); if (!name) return;
      const palettes = ['amber', 'blue', 'emerald', 'purple', 'rose'];
      const color = palettes[data.tags.length % palettes.length];
      data.tags.push({ id: uid('tag'), name, color: 'wedding-bg-' + color + '-100 wedding-text-' + color + '-900 wedding-border-' + color + '-300' });
      save('tags'); form.reset(); render(); toast('全局标签 [' + name + '] 创建成功');
    } else if (form.id === 'add-guest-form') {
      const name = values.name.trim(); if (!name) return;
      data.guests.unshift({ id: uid('guest'), name, relationship: values.relationship.trim() || '宾客', tableNumber: values.tableNumber, side: values.side, tags: [], status: 'PENDING', isActive: true });
      save('guests'); form.reset(); render(); toast('成功登记新宾客: ' + name);
    }
  });
  document.addEventListener('keydown', event => {
    const dialog = $('#modal-root').lastElementChild;
    if (!dialog) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
    if (event.key === 'Tab') {
      const focusable = $$('button,input,select,textarea,[tabindex="0"]', dialog).filter(element => !element.disabled && element.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  window.addEventListener('storage', event => {
    if (!event.key?.startsWith(prefix) || event.newValue === null) return;
    const key = event.key.slice(prefix.length);
    if (!Object.hasOwn(data, key)) return;
    try { data[key] = JSON.parse(event.newValue); render(); } catch { /* Ignore malformed external storage updates. */ }
  });
  render();
  carry();
})();
