// ============================================
// RIDE OPS DASHBOARD - Application Logic
// With Role-Based Access Control (RBAC)
// ============================================

let currentPage = 'dashboard';
let currentBookingType = 'ALL';
let currentFulfillmentTab = 'all';   // 'all' | 'bikecar' | 'intercity' | 'service' | 'maintenance'
let selectedDispatchBooking = null;
let selectedIntercityVehicleId = null;
let currentRole = 'ADMIN';
let currentUser = null;

// Role configurations
const ROLE_CONFIG = {
  ADMIN: { name: 'Quản trị viên', permissions: ['*'], pages: ['dashboard','users','routes','partners','bookings','fulfillment','intercity','wallets','refunds','promos','commissions','notifications','audit','monitoring'] },
  OPERATOR: { name: 'Điều hành', permissions: ['booking.view','booking.cancel','fulfillment.assign','wallet.view','refund.process','master.view','partner.view','driver.view'], pages: ['dashboard','routes','partners','bookings','fulfillment','wallets','refunds','promos','notifications','monitoring'] },
  AGENT: { name: 'Đại lý', permissions: ['booking.create','booking.view','customer.manage','wallet.view','driver.view','driver.manage'], pages: ['dashboard','bookings','intercity','partners','wallets'] },
  FINANCE: { name: 'Tài chính', permissions: ['wallet.view','wallet.adjust','refund.process','settlement.manage','report.view','commission.view','audit.view','booking.view','system.view'], pages: ['dashboard','bookings','wallets','refunds','commissions','audit','monitoring'] },
  VIEWER: { name: 'Người xem', permissions: ['booking.view','wallet.view','report.view','system.view'], pages: ['dashboard','bookings','wallets','monitoring'] }
};

const ROLE_USERS = {
  ADMIN: { id: 'USR001', name: 'Nguyễn Admin' },
  OPERATOR: { id: 'USR002', name: 'Trần Operator' },
  AGENT: { id: 'USR003', name: 'Lê Agent HCM' },
  FINANCE: { id: 'USR004', name: 'Phạm Finance' },
  VIEWER: { id: 'USR005', name: 'Võ Viewer' }
};

// ---- Permissions ----
function hasPermission(perm) {
  const config = ROLE_CONFIG[currentRole];
  if (!config) return false;
  if (config.permissions.includes('*')) return true;
  return config.permissions.includes(perm);
}

// ---- Role Switch ----
function switchRole(role) {
  currentRole = role;
  currentUser = ROLE_USERS[role];

  // Update UI
  document.getElementById('current-role').textContent = ROLE_CONFIG[role].name;
  document.getElementById('current-user-name').textContent = currentUser.name;

  // Filter sidebar by permissions
  document.querySelectorAll('.nav-item, .nav-section-title').forEach(el => {
    const roles = el.dataset.roles || '';
    const perms = el.dataset.perm || '';

    if (el.classList.contains('nav-section-title')) {
      // Show/hide section titles based on child items
      const sectionItems = document.querySelectorAll(`.nav-item[data-perm^="${perms}"]`);
      el.style.display = sectionItems.length > 0 ? 'block' : 'none';
      return;
    }

    if (roles.includes(role) || role === 'ADMIN') {
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  });

  // Navigate to dashboard
  navigateTo('dashboard');
}

// ---- Navigation ----
function navigateTo(page) {
  // Check permission
  const config = ROLE_CONFIG[currentRole];
  if (!config.pages.includes(page) && currentRole !== 'ADMIN') {
    alert('Bạn không có quyền truy cập trang này!');
    return;
  }

  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));

  const titles = {
    dashboard: 'Tổng quan', users: 'Người dùng & Vai trò', routes: 'Tuyến & Lịch Chạy',
    partners: 'Nhà xe & Tài xế',
    bookings: 'Giám sát đơn hàng', fulfillment: 'Nhiệm vụ phân công', intercity: 'Đặt vé',
    wallets: 'Ví & Thanh toán', refunds: 'Hoàn tiền', promos: 'Mã Ưu Đãi',
    commissions: 'Chiết Khấu', notifications: 'Thông báo',
    audit: 'Nhật ký hoạt động', monitoring: 'Giám sát hệ thống'
  };
  document.getElementById('page-title').textContent = titles[page] || page;
  renderPage(page);
}

function renderPage(page) {
  const renderers = {
    dashboard: renderDashboard, users: renderUsers, routes: renderRoutes,
    partners: renderPartners, drivers: renderDrivers, bookings: renderBookings,
    fulfillment: renderFulfillment, intercity: renderBookingTabs,
    wallets: renderWallets, refunds: renderRefunds,
    promos: renderPromos, commissions: renderCommissions, notifications: renderNotifications,
    audit: renderAudit, monitoring: renderMonitoring
  };
  if (renderers[page]) renderers[page]();
}

// ---- Helpers ----
function fmt(amount) { return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'; }
// Escape chuỗi người dùng nhập trước khi nhúng vào innerHTML (chống chèn HTML)
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---- Toast (thay alert) ----
function toast(message, type = 'info', timeout = 3200) {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-msg">${esc(message)}</span>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 260);
  }, timeout);
}
// Tương thích ngược: chuyển alert() sang toast (đoán loại theo nội dung)
function alert(msg) {
  const s = String(msg);
  const type = /thất bại|lỗi|không|chưa|vui lòng|sai|hủy/i.test(s)
    ? (/thành công/i.test(s) ? 'success' : 'warning')
    : (/thành công/i.test(s) ? 'success' : 'info');
  toast(s.replace(/\n/g, ' · '), type, 3800);
}
function getCustomer(id) { return CUSTOMERS.find(c => c.id === id); }
function getCustomerName(id) { const c = getCustomer(id); return c ? c.name : '—'; }
// Tra cứu tài xế ở cả 2 pool (BIKE/CAR và INTERCITY)
function findDriver(id) {
  if (!id) return null;
  return DRIVERS.find(d => d.id === id) ||
         (typeof INTERCITY_DRIVERS !== 'undefined' ? INTERCITY_DRIVERS.find(d => d.id === id) : null);
}
function getDriverName(id) { if (!id) return '—'; const d = findDriver(id); return d ? d.name : '—'; }
function getPartnerName(id) { if (!id) return 'Cá nhân'; const p = PARTNERS.find(p => p.id === id); return p ? p.name : '—'; }
function getRouteName(id) {
  if (!id) return '';
  const r = ROUTES.find(r => r.id === id);
  if (r) return r.name;
  const ir = typeof INTERCITY_ROUTES !== 'undefined' ? INTERCITY_ROUTES.find(x => x.id === id) : null;
  return ir ? `${ir.origin} → ${ir.destination}` : id;
}
function getUserName(id) { if (!id) return '—'; if (id === 'SYSTEM') return 'Hệ thống'; const u = PORTAL_USERS.find(u => u.id === id); return u ? u.name : id; }

// ---- Driver pool selection theo loại booking / tab ----
// BIKE/CAR  → DRIVERS (TX có xe riêng)
// INTERCITY/SERVICE_ORDER/MAINTENANCE_ORDER → INTERCITY_DRIVERS (TX hạng cao, không có xe cố định)
function getDriverPoolForBooking(bookingType) {
  if (bookingType === 'BIKE' || bookingType === 'CAR') return DRIVERS;
  if (bookingType === 'INTERCITY' || bookingType === 'SERVICE_ORDER' || bookingType === 'MAINTENANCE_ORDER') return INTERCITY_DRIVERS;
  return DRIVERS;
}
function getDriverPoolForTab(tab) {
  if (tab === 'bikecar') return DRIVERS;
  if (tab === 'intercity' || tab === 'service' || tab === 'maintenance') return INTERCITY_DRIVERS;
  return [...DRIVERS, ...INTERCITY_DRIVERS]; // all
}

function statusBadge(statusMap, key) {
  const s = statusMap[key];
  if (!s) return `<span class="badge badge-expired">${key || '—'}</span>`;
  const colorClass = {
    '#22C55E': 'badge-completed', '#4F8CFF': 'badge-accepted', '#FFB020': 'badge-pending',
    '#EF4444': 'badge-cancelled', '#7C5CFC': 'badge-picking', '#14B8A6': 'badge-progress',
    '#64748B': 'badge-expired', '#94A3B8': 'badge-offline'
  };
  return `<span class="badge ${colorClass[s.color] || 'badge-expired'}">${s.icon} ${s.label}</span>`;
}

function driverBadge(status) {
  const m = { online: 'badge-online Online', offline: 'badge-offline Offline', busy: 'badge-busy Đang chạy' };
  const [cls, label] = (m[status] || 'badge-offline ?').split(' ');
  return `<span class="badge ${cls}">${label}</span>`;
}

// ---- Modal ----
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.remove('show'); }));

// ---- Sidebar toggle ----
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

// ---- Clock ----
function updateClock() {
  document.getElementById('header-time').textContent = new Date().toLocaleString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
setInterval(updateClock, 1000);
updateClock();

// ============================================
// SIDE-EFFECT CHAIN HELPERS
// Mỗi action sẽ chain: booking → payment → wallet → notification → audit
// ============================================
const TRIP_HORIZON_DAYS = 7;
const DAY_REVERSE = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function nowStr() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

function genId(prefix, list) {
  let max = 0;
  list.forEach(item => {
    const m = (item.id || '').match(new RegExp('^' + prefix + '(\\d+)'));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return prefix + String(max + 1).padStart(3, '0');
}

function findWalletByOwner(ownerId, walletType = 'MAIN') {
  return WALLETS.find(w => w.ownerId === ownerId && w.walletType === walletType);
}

function getSystemHoldingWallet() {
  return WALLETS.find(w => w.ownerType === 'SYSTEM' && w.walletType === 'HOLDING');
}

function getCommissionRate(vehicleType) {
  const c = COMMISSIONS.find(c => c.vehicleType === vehicleType);
  return c ? c.rate : 20;
}

function newTraceId() { return 'tr-' + Math.random().toString(36).slice(2, 8); }

// Trip có đang diễn ra (hoặc sắp diễn ra trong 30 phút tới) không?
function isWindowCurrent(window) {
  if (!window) return false;
  const now = Date.now();
  return window.start <= now + 30 * 60 * 1000 && window.end > now;
}

// ============================================
// TIME-WINDOW HELPERS — phân công có ý thức về lịch
// TX/xe đang trong chuyến hiện tại VẪN có thể nhận chuyến tương lai nếu không xung đột thời gian.
// ============================================
const SERVICE_DURATION_HOURS = { normal: 2, express: 1.5, home: 3, basic: 2, full: 4, oil_change: 1, tire: 3 };
const DEFAULT_TRIP_DURATION_HRS = 1; // BIKE/CAR fallback

function parseDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  let dayOffset = 0;
  let cleanTime = String(timeStr);
  const plusMatch = cleanTime.match(/^(\d{1,2}:\d{2})\+(\d+)$/);
  if (plusMatch) {
    cleanTime = plusMatch[1];
    dayOffset = parseInt(plusMatch[2], 10);
  }
  const d = new Date(dateStr + 'T' + cleanTime + ':00');
  if (isNaN(d.getTime())) return null;
  if (dayOffset) d.setDate(d.getDate() + dayOffset);
  return d.getTime();
}

// Trả về {start, end} dạng ms timestamp; null nếu không xác định được
function getBookingTimeWindow(booking) {
  if (!booking) return null;
  // INTERCITY → từ trip
  if (booking.bookingType === 'INTERCITY' && booking.tripId) {
    const trip = INTERCITY_TRIPS.find(t => t.id === booking.tripId);
    if (trip && trip.date) {
      const start = parseDateTime(trip.date, trip.departureTime);
      let end = parseDateTime(trip.date, trip.arrivalTime);
      if (start && end && end <= start) end = start + 8 * 3600 * 1000; // arrival hôm sau, fallback 8h
      return start && end ? { start, end } : null;
    }
  }
  // SERVICE_ORDER (đăng kiểm) → từ registration
  if (booking.bookingType === 'SERVICE_ORDER' && booking.serviceOrderId) {
    const reg = REGISTRATIONS.find(r => r.id === booking.serviceOrderId);
    if (reg && reg.bookingDate) {
      const start = parseDateTime(reg.bookingDate, reg.bookingTime || '08:00');
      const dur = SERVICE_DURATION_HOURS[reg.service] || 2;
      return start ? { start, end: start + dur * 3600 * 1000 } : null;
    }
  }
  // MAINTENANCE_ORDER (bảo dưỡng) → từ maintenance
  if (booking.bookingType === 'MAINTENANCE_ORDER' && booking.maintenanceOrderId) {
    const mnt = MAINTENANCE.find(r => r.id === booking.maintenanceOrderId);
    if (mnt && mnt.bookingDate) {
      const start = parseDateTime(mnt.bookingDate, mnt.bookingTime || '08:00');
      const dur = SERVICE_DURATION_HOURS[mnt.service] || 2;
      return start ? { start, end: start + dur * 3600 * 1000 } : null;
    }
  }
  // BIKE/CAR → realtime: từ createdAt + default duration
  if (booking.createdAt) {
    const d = new Date(booking.createdAt.replace(' ', 'T') + ':00');
    if (!isNaN(d.getTime())) {
      const start = d.getTime();
      return { start, end: start + DEFAULT_TRIP_DURATION_HRS * 3600 * 1000 };
    }
  }
  return null;
}

function hasTimeOverlap(a, b) {
  if (!a || !b) return false;
  return a.start < b.end && a.end > b.start;
}

// Lấy các FT đang chiếm dụng entity (driver hoặc vehicle), loại bỏ FT đang xét
function _entityActiveFts(entityType, entityId, excludeFtId) {
  return FULFILLMENT_TASKS.filter(t =>
    t.id !== excludeFtId &&
    ['ASSIGNED', 'IN_PROGRESS'].includes(t.status) &&
    (entityType === 'driver' ? t.driverId === entityId : t.vehicleId === entityId)
  );
}

// driver/vehicle có rảnh trong khoảng [window.start, window.end] không?
function isDriverFreeAt(driverId, window, excludeFtId) {
  if (!window) return true; // không xác định được window → coi như rảnh
  const fts = _entityActiveFts('driver', driverId, excludeFtId);
  return !fts.some(ft => {
    const b = BOOKINGS.find(x => x.id === ft.bookingId);
    return hasTimeOverlap(window, getBookingTimeWindow(b));
  });
}

function isVehicleFreeAt(vehicleId, window, excludeFtId) {
  if (!window) return true;
  const fts = _entityActiveFts('vehicle', vehicleId, excludeFtId);
  return !fts.some(ft => {
    const b = BOOKINGS.find(x => x.id === ft.bookingId);
    return hasTimeOverlap(window, getBookingTimeWindow(b));
  });
}

// Hiển thị thời gian conflicts hiện tại của entity
function describeNextBusyWindow(entityType, entityId) {
  const fts = _entityActiveFts(entityType, entityId, null);
  const windows = fts.map(ft => {
    const b = BOOKINGS.find(x => x.id === ft.bookingId);
    return { ft, window: getBookingTimeWindow(b) };
  }).filter(x => x.window).sort((a, b) => a.window.start - b.window.start);
  if (!windows.length) return null;
  const w = windows[0].window;
  const s = new Date(w.start), e = new Date(w.end);
  const sameDay = s.toDateString() === e.toDateString();
  const fmtTime = d => String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  const fmtDate = d => String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0');
  return sameDay
    ? `${fmtDate(s)} ${fmtTime(s)}–${fmtTime(e)}`
    : `${fmtDate(s)} ${fmtTime(s)} → ${fmtDate(e)} ${fmtTime(e)}`;
}

function fmtBookingWindow(window) {
  if (!window) return '—';
  const s = new Date(window.start), e = new Date(window.end);
  const sameDay = s.toDateString() === e.toDateString();
  const fmtTime = d => String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  const fmtDate = d => String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
  return sameDay
    ? `${fmtDate(s)} ${fmtTime(s)} – ${fmtTime(e)}`
    : `${fmtDate(s)} ${fmtTime(s)} → ${fmtDate(e)} ${fmtTime(e)}`;
}

function ensureWallet(ownerId, ownerName, ownerType) {
  let w = findWalletByOwner(ownerId, 'MAIN');
  if (w) return w;
  w = {
    id: genId('W', WALLETS),
    ownerId, ownerName, ownerType,
    walletType: 'MAIN', balance: 0, pendingBalance: 0, status: 'ACTIVE'
  };
  WALLETS.push(w);
  return w;
}

function createAuditLog({ action, target, before = null, after = null, traceId, actor, actorRole, sourceSite = 'master' }) {
  const log = {
    id: genId('AL', AUDIT_LOGS),
    action,
    actor: actor || currentUser?.id || 'SYSTEM',
    actorRole: actorRole || (currentRole || 'SYSTEM'),
    target, sourceSite,
    traceId: traceId || newTraceId(),
    before: before ? JSON.stringify(before) : null,
    after: after ? JSON.stringify(after) : null,
    timestamp: nowStr()
  };
  AUDIT_LOGS.unshift(log);
  return log;
}

function createNotification({ type, channel = 'push', recipient, content, status = 'delivered' }) {
  const n = {
    id: genId('NTF', NOTIFICATIONS),
    type, channel, recipient, content, status,
    createdAt: nowStr()
  };
  NOTIFICATIONS.unshift(n);
  return n;
}

function createWalletTxn({ walletId, direction, type, amount, referenceType, referenceId, note }) {
  const wallet = WALLETS.find(w => w.id === walletId);
  if (!wallet) return null;
  if (direction === 'CREDIT') wallet.balance += amount;
  else wallet.balance = Math.max(0, wallet.balance - amount);
  const txn = {
    id: genId('TXN', WALLET_TRANSACTIONS),
    walletId, direction, type, amount,
    balance: wallet.balance,
    referenceType, referenceId,
    status: 'SUCCESS', note: note || '',
    createdAt: nowStr()
  };
  WALLET_TRANSACTIONS.unshift(txn);
  return txn;
}

// Payment: cash skip success check; non-cash trừ ví KH + tạm giữ system
// Cash → paymentStatus = 'CASH' (UI phân biệt với CONFIRMED), vẫn pass điều kiện cho gán tài xế
function processPayment(booking, traceId) {
  if (booking.paymentMethod === 'cash') {
    booking.paymentStatus = 'CASH';
    if (!booking.paymentReference) booking.paymentReference = 'CASH-' + booking.id;
    createNotification({
      type: 'payment_cash', recipient: booking.customerId,
      content: `${booking.bookingCode}: thu tiền mặt ${fmt(booking.fareSnapshot)} khi hoàn tất`
    });
    createAuditLog({
      action: 'payment.cash', target: booking.paymentReference, traceId,
      actor: 'SYSTEM', actorRole: 'SYSTEM', sourceSite: 'system',
      before: { method: 'cash', status: 'PENDING' }, after: { status: 'CASH' }
    });
    return { success: true };
  }
  const customerWallet = ensureWallet(booking.customerId, getCustomerName(booking.customerId), 'CUSTOMER');
  if (customerWallet.balance < booking.fareSnapshot) {
    booking.paymentStatus = 'FAILED';
    createNotification({
      type: 'payment_failed', recipient: booking.customerId,
      content: `${booking.bookingCode}: thanh toán ${fmt(booking.fareSnapshot)} thất bại - số dư không đủ`
    });
    createAuditLog({
      action: 'payment.fail', target: booking.paymentReference || booking.id, traceId,
      actor: 'SYSTEM', actorRole: 'SYSTEM', sourceSite: 'system',
      before: { status: 'PENDING' }, after: { status: 'FAILED', reason: 'insufficient' }
    });
    return { success: false, reason: 'insufficient' };
  }
  if (!booking.paymentReference) {
    booking.paymentReference = 'PAY' + booking.id.replace('BK', '') + '-' + Date.now().toString().slice(-4);
  }
  createWalletTxn({
    walletId: customerWallet.id, direction: 'DEBIT', type: 'PAYMENT',
    amount: booking.fareSnapshot,
    referenceType: 'booking', referenceId: booking.id,
    note: `Thanh toán ${booking.bookingCode}`
  });
  const sysWallet = getSystemHoldingWallet();
  if (sysWallet) sysWallet.pendingBalance += booking.fareSnapshot;
  booking.paymentStatus = 'CONFIRMED';
  createNotification({
    type: 'payment_confirmed', recipient: booking.customerId,
    content: `${booking.bookingCode}: thanh toán ${fmt(booking.fareSnapshot)} thành công`
  });
  createAuditLog({
    action: 'payment.confirm', target: booking.paymentReference, traceId,
    actor: 'SYSTEM', actorRole: 'SYSTEM', sourceSite: 'system',
    before: { status: 'PENDING' }, after: { status: 'CONFIRMED' }
  });
  return { success: true };
}

function createOrUpdateFulfillmentTask(booking, driverId, vehicleId, traceId) {
  let task = FULFILLMENT_TASKS.find(t => t.id === booking.fulfillmentTaskId);
  const before = task ? { driver: task.driverId, vehicle: task.vehicleId, status: task.status } : null;
  if (!task) {
    task = {
      id: genId('FT', FULFILLMENT_TASKS),
      bookingId: booking.id, driverId, vehicleId: vehicleId || null,
      status: 'ASSIGNED',
      assignedAt: nowStr(), startedAt: null, completedAt: null
    };
    FULFILLMENT_TASKS.unshift(task);
    booking.fulfillmentTaskId = task.id;
  } else {
    task.driverId = driverId;
    task.vehicleId = vehicleId || null;
    task.status = 'ASSIGNED';
    task.assignedAt = nowStr(); task.startedAt = null; task.completedAt = null;
  }
  createAuditLog({
    action: 'fulfillment.assign', target: task.id, traceId,
    before, after: { driver: driverId, vehicle: vehicleId || null, status: 'ASSIGNED' }
  });
  return task;
}

function releaseDriver(driverId) {
  if (!driverId) return;
  const d = findDriver(driverId);
  if (!d) return;
  d.currentAssignmentId = null;
  if (d.status === 'busy') d.status = 'online';
}

function refundBooking(booking, reason = 'Khách hủy', traceId) {
  if (booking.paymentMethod === 'cash') return null;
  if (booking.paymentStatus !== 'CONFIRMED') return null;
  const customerWallet = findWalletByOwner(booking.customerId, 'MAIN');
  if (!customerWallet) return null;

  createWalletTxn({
    walletId: customerWallet.id, direction: 'CREDIT', type: 'REFUND',
    amount: booking.fareSnapshot,
    referenceType: 'booking', referenceId: booking.id,
    note: `Hoàn tiền ${booking.bookingCode}`
  });
  const sysWallet = getSystemHoldingWallet();
  if (sysWallet) sysWallet.pendingBalance = Math.max(0, sysWallet.pendingBalance - booking.fareSnapshot);

  const refund = {
    id: genId('RF', REFUNDS),
    bookingId: booking.id, bookingCode: booking.bookingCode,
    customerId: booking.customerId,
    paymentReference: booking.paymentReference,
    amount: booking.fareSnapshot, reason,
    status: 'SUCCESS', refundMethod: 'wallet',
    processedBy: currentUser?.id || 'SYSTEM',
    createdAt: nowStr(), processedAt: nowStr()
  };
  REFUNDS.unshift(refund);
  booking.paymentStatus = 'CANCELLED';
  createNotification({
    type: 'refund_completed', channel: 'sms', recipient: booking.customerId,
    content: `Hoàn tiền ${fmt(booking.fareSnapshot)} cho ${booking.bookingCode} thành công`
  });
  createAuditLog({
    action: 'refund.create', target: refund.id, traceId,
    before: null, after: { amount: refund.amount, method: 'wallet' }
  });
  return refund;
}

function completeBookingSettlement(booking, traceId) {
  if (!booking.driverId) return;
  const rate = getCommissionRate(booking.bookingType);
  const commission = Math.round(booking.fareSnapshot * rate / 100);
  const earning = booking.fareSnapshot - commission;
  const driverWallet = findWalletByOwner(booking.driverId, 'MAIN');
  const sysWallet = getSystemHoldingWallet();

  if (booking.paymentMethod === 'cash') {
    if (driverWallet) createWalletTxn({
      walletId: driverWallet.id, direction: 'DEBIT', type: 'SETTLEMENT',
      amount: commission, referenceType: 'booking', referenceId: booking.id,
      note: `Chiết khấu ${rate}% ${booking.bookingCode} (tiền mặt)`
    });
    if (sysWallet) createWalletTxn({
      walletId: sysWallet.id, direction: 'CREDIT', type: 'SETTLEMENT',
      amount: commission, referenceType: 'booking', referenceId: booking.id,
      note: `Chiết khấu ${rate}% từ ${booking.bookingCode}`
    });
  } else {
    if (sysWallet) {
      sysWallet.pendingBalance = Math.max(0, sysWallet.pendingBalance - booking.fareSnapshot);
      createWalletTxn({
        walletId: sysWallet.id, direction: 'DEBIT', type: 'SETTLEMENT',
        amount: earning, referenceType: 'booking', referenceId: booking.id,
        note: `Trả thu nhập TX ${booking.bookingCode}`
      });
      createWalletTxn({
        walletId: sysWallet.id, direction: 'CREDIT', type: 'SETTLEMENT',
        amount: commission, referenceType: 'booking', referenceId: booking.id,
        note: `Chiết khấu ${rate}% từ ${booking.bookingCode}`
      });
    }
    if (driverWallet) createWalletTxn({
      walletId: driverWallet.id, direction: 'CREDIT', type: 'EARNING',
      amount: earning, referenceType: 'booking', referenceId: booking.id,
      note: `Thu nhập ${booking.bookingCode} (sau ${rate}% chiết khấu)`
    });
  }
  COMMISSION_HISTORY.unshift({
    id: genId('CH', COMMISSION_HISTORY),
    bookingId: booking.id, driverId: booking.driverId,
    vehicleType: booking.bookingType, tripPrice: booking.fareSnapshot,
    rate, amount: commission, createdAt: nowStr()
  });
  createAuditLog({
    action: 'booking.settle', target: booking.id, traceId,
    before: { status: 'IN_PROGRESS' }, after: { status: 'COMPLETED', commission, earning }
  });
}

function generateTripsFromSchedule(schedule, opts = {}) {
  if (schedule.status !== 'active') return [];
  const route = ROUTES.find(r => r.id === schedule.routeId);
  const seatLayout = SEAT_LAYOUTS.find(l => l.id === schedule.seatLayoutId);
  const operator = PARTNERS.find(p => p.id === schedule.operatorId);
  if (!route || !seatLayout) return [];
  const intercityRoute = INTERCITY_ROUTES.find(r =>
    r.origin === route.origin && r.destination === route.destination
  );
  const routeId = intercityRoute ? intercityRoute.id : schedule.routeId;
  const price = opts.price || (intercityRoute ? intercityRoute.priceFrom : 250000);
  const out = [];
  const today = new Date();
  for (let i = 0; i < TRIP_HORIZON_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayCode = DAY_REVERSE[d.getDay()];
    if (!schedule.daysOfWeek.includes(dayCode)) continue;
    const dateStr = d.toISOString().slice(0, 10);
    if (INTERCITY_TRIPS.some(t => t.scheduleId === schedule.id && t.date === dateStr)) continue;
    const trip = {
      id: genId('TRP', INTERCITY_TRIPS),
      scheduleId: schedule.id, routeId,
      operatorId: schedule.operatorId,
      operatorName: operator?.name || 'Nhà xe',
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      vehicleType: seatLayout.name,
      price,
      seatsTotal: seatLayout.totalSeats,
      seatsAvailable: seatLayout.totalSeats,
      status: 'available', date: dateStr
    };
    INTERCITY_TRIPS.unshift(trip);
    out.push(trip);
  }
  return out;
}

// ---- Heal data trên init: sync các derived state ----
function healData() {
  // 1. currentAssignmentId trỏ về FT IN_PROGRESS (đang chạy thực), không tính FT ASSIGNED tương lai
  DRIVERS.forEach(d => { d.currentAssignmentId = null; });
  if (typeof INTERCITY_DRIVERS !== 'undefined') {
    INTERCITY_DRIVERS.forEach(d => { d.currentAssignmentId = null; });
  }
  if (typeof INTERCITY_VEHICLES !== 'undefined') {
    INTERCITY_VEHICLES.forEach(v => { v.currentAssignmentId = null; });
  }
  FULFILLMENT_TASKS.forEach(t => {
    if (t.status !== 'IN_PROGRESS') return;
    const d = findDriver(t.driverId);
    if (d) d.currentAssignmentId = t.id;
    if (t.vehicleId && typeof INTERCITY_VEHICLES !== 'undefined') {
      const v = INTERCITY_VEHICLES.find(x => x.id === t.vehicleId);
      if (v) v.currentAssignmentId = t.id;
    }
  });
  // 2. Vehicle status: IN_PROGRESS → busy, otherwise idle (giữ maintenance)
  if (typeof INTERCITY_VEHICLES !== 'undefined') {
    INTERCITY_VEHICLES.forEach(v => {
      if (v.status === 'maintenance') return;
      v.status = v.currentAssignmentId ? 'busy' : 'idle';
    });
  }
  // 3. Driver status: offline giữ; IN_PROGRESS → busy; có FT ASSIGNED nhưng chưa start → online (có lịch)
  const syncDriverStatus = d => {
    if (d.status === 'offline') return;
    d.status = d.currentAssignmentId ? 'busy' : 'online';
  };
  DRIVERS.forEach(syncDriverStatus);
  if (typeof INTERCITY_DRIVERS !== 'undefined') INTERCITY_DRIVERS.forEach(syncDriverStatus);
  // 3. Mỗi REGISTRATION phải có 1 SERVICE_ORDER booking liên kết
  REGISTRATIONS.forEach(reg => {
    const existing = reg.bookingId && BOOKINGS.find(b => b.id === reg.bookingId);
    if (existing) return;
    const linked = BOOKINGS.find(b => b.serviceOrderId === reg.id);
    if (linked) { reg.bookingId = linked.id; return; }

    let cust = CUSTOMERS.find(c => c.phone === reg.ownerPhone);
    if (!cust) {
      cust = {
        id: 'KH' + String(CUSTOMERS.length + 1).padStart(3, '0'),
        name: reg.ownerName, phone: reg.ownerPhone, email: '',
        totalBookings: 1, status: 'active'
      };
      CUSTOMERS.push(cust);
    }
    const sm = ({
      pending:   { booking: 'PENDING_CONFIRMATION', payment: 'PENDING', fulfillment: null },
      confirmed: { booking: 'CONFIRMED',            payment: 'CASH',    fulfillment: 'PENDING' },
      completed: { booking: 'COMPLETED',            payment: 'CONFIRMED', fulfillment: 'COMPLETED' },
      cancelled: { booking: 'CANCELLED',            payment: 'CANCELLED', fulfillment: 'CANCELLED' }
    })[reg.status] || { booking: 'PENDING_CONFIRMATION', payment: 'PENDING', fulfillment: null };
    const b = {
      id: genId('BK', BOOKINGS),
      bookingCode: 'RO-SVC-' + reg.id,
      bookingType: 'SERVICE_ORDER',
      bookingStatus: sm.booking, paymentStatus: sm.payment, fulfillmentStatus: sm.fulfillment,
      customerId: cust.id, agentId: null, driverId: null,
      pickup: reg.pickupAddress, dropoff: reg.pickupAddress,
      fareSnapshot: reg.price, distance: 0,
      paymentMethod: 'cash',
      paymentReference: reg.status === 'pending' ? null : 'PAY-' + reg.id,
      fulfillmentTaskId: null,
      serviceOrderId: reg.id,
      createdAt: reg.createdAt, updatedAt: reg.createdAt
    };
    BOOKINGS.push(b);
    reg.bookingId = b.id;
  });
  // 4. Tạo ví MAIN cho mọi customer/driver chưa có
  CUSTOMERS.forEach(c => ensureWallet(c.id, c.name, 'CUSTOMER'));
  DRIVERS.forEach(d => ensureWallet(d.id, d.name, 'DRIVER'));
  if (typeof INTERCITY_DRIVERS !== 'undefined') {
    INTERCITY_DRIVERS.forEach(d => ensureWallet(d.id, d.name, 'DRIVER'));
  }
  // 5. SERVICE_ORDER booking nào không có serviceOrderId → tự tạo REGISTRATION tương ứng
  BOOKINGS.filter(b => b.bookingType === 'SERVICE_ORDER' && !b.serviceOrderId).forEach(b => {
    const cust = CUSTOMERS.find(c => c.id === b.customerId);
    const regStatusMap = {
      PENDING_CONFIRMATION: 'pending', CONFIRMED: 'confirmed',
      IN_PROGRESS: 'confirmed', COMPLETED: 'completed', CANCELLED: 'cancelled'
    };
    const reg = {
      id: genId('REG', REGISTRATIONS),
      plate: 'XX-XXX.XX',
      ownerName: cust?.name || '—',
      ownerPhone: cust?.phone || '—',
      vehicleType: 'car',
      address: b.pickup,
      center: '50-06V',
      centerName: b.dropoff,
      bookingDate: b.createdAt ? b.createdAt.slice(0, 10) : '',
      bookingTime: b.createdAt ? b.createdAt.slice(11, 16) : '',
      service: b.fareSnapshot >= 700000 ? 'home' : (b.fareSnapshot >= 500000 ? 'express' : 'normal'),
      price: b.fareSnapshot,
      status: regStatusMap[b.bookingStatus] || 'pending',
      createdAt: b.createdAt,
      bookingId: b.id
    };
    REGISTRATIONS.push(reg);
    b.serviceOrderId = reg.id;
  });

  // 6. Mỗi MAINTENANCE phải có 1 MAINTENANCE_ORDER booking liên kết
  MAINTENANCE.forEach(mnt => {
    const existing = mnt.bookingId && BOOKINGS.find(b => b.id === mnt.bookingId);
    if (existing) return;
    const linked = BOOKINGS.find(b => b.maintenanceOrderId === mnt.id);
    if (linked) { mnt.bookingId = linked.id; return; }

    let cust = CUSTOMERS.find(c => c.phone === mnt.ownerPhone);
    if (!cust) {
      cust = {
        id: 'KH' + String(CUSTOMERS.length + 1).padStart(3, '0'),
        name: mnt.ownerName, phone: mnt.ownerPhone, email: '',
        totalBookings: 1, status: 'active'
      };
      CUSTOMERS.push(cust);
    }
    const sm = ({
      pending:   { booking: 'PENDING_CONFIRMATION', payment: 'PENDING', fulfillment: null },
      confirmed: { booking: 'CONFIRMED',            payment: 'CASH',    fulfillment: 'PENDING' },
      completed: { booking: 'COMPLETED',            payment: 'CONFIRMED', fulfillment: 'COMPLETED' },
      cancelled: { booking: 'CANCELLED',            payment: 'CANCELLED', fulfillment: 'CANCELLED' }
    })[mnt.status] || { booking: 'PENDING_CONFIRMATION', payment: 'PENDING', fulfillment: null };
    const b = {
      id: genId('BK', BOOKINGS),
      bookingCode: 'RO-MNT-' + mnt.id,
      bookingType: 'MAINTENANCE_ORDER',
      bookingStatus: sm.booking, paymentStatus: sm.payment, fulfillmentStatus: sm.fulfillment,
      customerId: cust.id, agentId: null, driverId: null,
      pickup: mnt.pickupAddress, dropoff: mnt.pickupAddress,
      fareSnapshot: mnt.price, distance: 0,
      paymentMethod: 'cash',
      paymentReference: mnt.status === 'pending' ? null : 'PAY-' + mnt.id,
      fulfillmentTaskId: null,
      maintenanceOrderId: mnt.id,
      createdAt: mnt.createdAt, updatedAt: mnt.createdAt
    };
    BOOKINGS.push(b);
    mnt.bookingId = b.id;
  });

  // 7. MAINTENANCE_ORDER booking nào không có maintenanceOrderId → tạo MAINTENANCE record
  BOOKINGS.filter(b => b.bookingType === 'MAINTENANCE_ORDER' && !b.maintenanceOrderId).forEach(b => {
    const cust = CUSTOMERS.find(c => c.id === b.customerId);
    const mntStatusMap = {
      PENDING_CONFIRMATION: 'pending', CONFIRMED: 'confirmed',
      IN_PROGRESS: 'confirmed', COMPLETED: 'completed', CANCELLED: 'cancelled'
    };
    const mnt = {
      id: genId('MNT', MAINTENANCE),
      plate: 'XX-XXX.XX',
      ownerName: cust?.name || '—',
      ownerPhone: cust?.phone || '—',
      vehicleType: 'car',
      address: b.pickup,
      center: 'GARA-A1',
      centerName: b.dropoff,
      bookingDate: b.createdAt ? b.createdAt.slice(0, 10) : '',
      bookingTime: b.createdAt ? b.createdAt.slice(11, 16) : '',
      service: b.fareSnapshot >= 1000000 ? 'full' : (b.fareSnapshot >= 600000 ? 'tire' : (b.fareSnapshot >= 350000 ? 'basic' : 'oil_change')),
      price: b.fareSnapshot,
      status: mntStatusMap[b.bookingStatus] || 'pending',
      createdAt: b.createdAt,
      bookingId: b.id
    };
    MAINTENANCE.push(mnt);
    b.maintenanceOrderId = mnt.id;
  });
}

// ============================================
// DASHBOARD
// ============================================
function renderDashboard() {
  const s = DASHBOARD_STATS;
  document.getElementById('dashboard-stats').innerHTML = `
    <div class="stat-card accent"><div class="stat-card-header"><div class="stat-card-icon accent">📋</div><span class="stat-card-label">Bookings hôm nay</span></div><div class="stat-card-value">${s.todayBookings}</div><div class="stat-card-sub">+12% so với hôm qua</div></div>
    <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">💰</div><span class="stat-card-label">Doanh thu</span></div><div class="stat-card-value">${fmt(s.todayRevenue)}</div><div class="stat-card-sub">+8.5% so với hôm qua</div></div>
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">⏳</div><span class="stat-card-label">Chờ xử lý</span></div><div class="stat-card-value">${s.pendingBookings}</div><div class="stat-card-sub">Cần điều phối ngay</div></div>
    <div class="stat-card danger"><div class="stat-card-header"><div class="stat-card-icon danger">⚠️</div><span class="stat-card-label">SLA Violations</span></div><div class="stat-card-value">${s.slaViolations}</div><div class="stat-card-sub">Vượt SLA xử lý</div></div>
  `;

  // Chart
  const max = Math.max(...s.hourlyTrips, 1);
  document.getElementById('hourly-chart').innerHTML = s.hourlyTrips.map(v => `<div class="mini-chart-bar" style="height:${Math.max((v/max)*100,2)}%" data-value="${v}"></div>`).join('');
  document.getElementById('hourly-labels').innerHTML = s.hourlyTrips.map((_,i) => `<span>${String(i).padStart(2,'0')}</span>`).join('');

  // Recent bookings
  const recent = [...BOOKINGS].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,8);
  document.getElementById('recent-bookings').innerHTML = recent.map(b => {
    const vt = VEHICLE_TYPES[b.bookingType];
    return `<div class="recent-trip-item" onclick="showBookingDetail('${b.id}')">
      <span class="recent-trip-icon">${vt?.icon||'🚗'}</span>
      <div class="recent-trip-info"><div class="route">${b.pickup} → ${b.dropoff}</div><div class="meta">${b.bookingCode} · ${getCustomerName(b.customerId)} · ${b.createdAt.split(' ')[1]}</div></div>
      ${statusBadge(BOOKING_STATUSES, b.bookingStatus)}
      <span class="recent-trip-price">${fmt(b.fareSnapshot)}</span>
    </div>`;
  }).join('');

  // Service health mini
  document.getElementById('service-health-mini').innerHTML = SYSTEM_SERVICES.map(s => {
    const color = s.status === 'healthy' ? 'var(--success)' : s.status === 'warning' ? 'var(--warning)' : 'var(--danger)';
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;margin-bottom:4px;background:var(--bg-input);border-radius:var(--radius-sm)">
      <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></span>
      <span style="flex:1;font-size:12px">${s.name}</span>
      <span style="font-size:11px;color:var(--text-muted)">${s.latency}</span>
    </div>`;
  }).join('');

  // Online drivers — gồm cả bike/car + intercity
  const onlineBC = DRIVERS.filter(d => d.status === 'online');
  const onlineIC = (typeof INTERCITY_DRIVERS !== 'undefined') ? INTERCITY_DRIVERS.filter(d => d.status === 'online') : [];
  const online = [...onlineBC, ...onlineIC];
  document.getElementById('online-count').textContent = `${online.length} online`;
  document.getElementById('online-drivers-dash').innerHTML = online.map(d => {
    const meta = d.plate
      ? `${VEHICLE_TYPES[d.vehicleType]?.icon||''} ${d.plate} · ⭐ ${d.rating}`
      : `🚌 GPLX ${d.licenseClass||'—'} · ${getPartnerName(d.operatorId)} · ⭐ ${d.rating}`;
    return `<div class="driver-item"><div class="driver-avatar">${d.avatar}</div>
      <div class="driver-info"><div class="name">${d.name}</div><div class="meta">${meta}</div></div>${driverBadge(d.status)}</div>`;
  }).join('');
}

// ============================================
// USERS & RBAC
// ============================================
function switchUserTab(tab, btn) {
  document.querySelectorAll('#page-users .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('users-tab-users').style.display = tab === 'users' ? 'block' : 'none';
  document.getElementById('users-tab-roles').style.display = tab === 'roles' ? 'block' : 'none';
}

function switchPartnerTab(tab, btn) {
  document.querySelectorAll('#page-partners .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['partners','drivers','intercity-drivers','intercity-vehicles'].forEach(t => {
    const el = document.getElementById('partners-tab-' + t);
    if (el) el.style.display = tab === t ? 'block' : 'none';
  });
  if (tab === 'intercity-drivers') renderIntercityDrivers();
  if (tab === 'intercity-vehicles') renderIntercityVehicles();
}

function switchRouteTab(tab, btn) {
  document.querySelectorAll('#page-routes > .tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['schedules','routes','vehicle-models','stops'].forEach(t => {
    const el = document.getElementById('routes-tab-' + t);
    if (el) el.style.display = (t === tab) ? 'block' : 'none';
  });
}

function createUser() {
  const name = document.getElementById('new-user-name').value.trim();
  const email = document.getElementById('new-user-email').value.trim();
  const phone = document.getElementById('new-user-phone').value.trim();
  const role = document.getElementById('new-user-role').value;

  if (!name || !email || !phone) {
    alert('Vui lòng điền đầy đủ thông tin');
    return;
  }

  const newUser = {
    id: 'USR' + String(PORTAL_USERS.length + 1).padStart(3, '0'),
    name, email, phone, roles: [role], status: 'active', lastLogin: '—', tenantId: 'T001'
  };

  PORTAL_USERS.unshift(newUser);
  closeModal('user-create-modal');
  document.getElementById('new-user-name').value = '';
  document.getElementById('new-user-email').value = '';
  document.getElementById('new-user-phone').value = '';
  renderUsers();
  alert('Tạo user thành công!');
}

function createRole() {
  const name = document.getElementById('new-role-name').value.trim();
  const code = document.getElementById('new-role-code').value.trim().toUpperCase();
  const checkboxes = document.querySelectorAll('#role-create-modal input[type="checkbox"]:checked');
  const permissions = Array.from(checkboxes).map(cb => cb.value);

  if (!name || !code) {
    alert('Vui lòng điền tên và mã vai trò');
    return;
  }

  const newRole = {
    id: 'ROLE' + String(ROLES.length + 1).padStart(3, '0'),
    name, code, permissions, usersCount: 0, status: 'active'
  };

  ROLES.unshift(newRole);
  closeModal('role-create-modal');
  document.getElementById('new-role-name').value = '';
  document.getElementById('new-role-code').value = '';
  checkboxes.forEach(cb => cb.checked = false);
  renderUsers();
  alert('Tạo vai trò thành công!');
}

function renderUsers() {
  document.getElementById('user-stats').innerHTML = `
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon accent">👥</div><span class="stat-card-label">Tổng Users</span></div><div class="stat-card-value">${PORTAL_USERS.length}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon success">🔑</div><span class="stat-card-label">Roles</span></div><div class="stat-card-value">${ROLES.length}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon warning">🟢</div><span class="stat-card-label">Active Users</span></div><div class="stat-card-value">${PORTAL_USERS.filter(u=>u.status==='active').length}</div></div>
  `;
  document.getElementById('roles-table-body').innerHTML = ROLES.map(r => `<tr>
    <td><span class="text-accent fw-600">${r.id}</span></td>
    <td class="fw-600">${r.name}</td>
    <td><code>${r.code}</code></td>
    <td><div style="display:flex;flex-wrap:wrap;gap:3px">${r.permissions.slice(0,4).map(p=>`<span class="route-tag" style="font-size:10px">${p}</span>`).join('')}${r.permissions.length>4?`<span class="text-muted" style="font-size:10px">+${r.permissions.length-4}</span>`:''}</div></td>
    <td class="fw-600">${r.usersCount}</td>
    <td><span class="badge badge-active">✅ Hoạt động</span></td>
    <td><button class="btn btn-sm btn-outline">✏️</button></td>
  </tr>`).join('');

  document.getElementById('users-table-body').innerHTML = PORTAL_USERS.map(u => `<tr>
    <td><span class="text-accent fw-600">${u.id}</span></td>
    <td class="fw-600">${u.name}</td>
    <td>${u.email}</td>
    <td>${u.phone}</td>
    <td>${u.roles.map(r=>`<span class="badge badge-accepted">${r}</span>`).join(' ')}</td>
    <td class="text-muted">${u.lastLogin}</td>
    <td><span class="badge ${u.status==='active'?'badge-active':'badge-cancelled'}">${u.status==='active'?'✅ Hoạt động':'⛔ Bị khóa'}</span></td>
    <td><button class="btn btn-sm btn-outline">✏️</button></td>
  </tr>`).join('');
}

// ============================================
// ROUTES & SCHEDULES
// ============================================
function populateScheduleOptions() {
  const routeSelect = document.getElementById('schedule-route');
  if (routeSelect) {
    routeSelect.innerHTML = '<option value="">Chọn tuyến</option>' +
      ROUTES.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
  }
  const opSelect = document.getElementById('schedule-operator');
  if (opSelect) {
    opSelect.innerHTML = '<option value="">Chọn nhà xe</option>' +
      PARTNERS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  }
  const vmSelect = document.getElementById('schedule-vehicle-model');
  if (vmSelect) {
    vmSelect.innerHTML = '<option value="">Chọn loại xe</option>' +
      VEHICLE_MODELS.filter(v => v.status === 'active').map(v => {
        const cat = VEHICLE_CATEGORIES[v.category]?.label || v.category;
        return `<option value="${v.id}">${v.name} — ${cat} (${v.seats} chỗ)</option>`;
      }).join('');
    vmSelect.onchange = () => {
      const v = VEHICLE_MODELS.find(x => x.id === vmSelect.value);
      const info = document.getElementById('schedule-vehicle-info');
      if (info) info.textContent = v ? `${VEHICLE_CATEGORIES[v.category]?.icon||''} ${VEHICLE_CATEGORIES[v.category]?.label||''} · ${v.seats} chỗ${v.luggage?' · Hành lý: '+v.luggage:''}` : '';
    };
  }
}

function openScheduleCreate() {
  populateScheduleOptions();
  openModal('schedule-create-modal');
}

function createSchedule() {
  const routeId = document.getElementById('schedule-route').value;
  const operatorId = document.getElementById('schedule-operator').value;
  const departure = document.getElementById('schedule-departure').value;
  const arrival = document.getElementById('schedule-arrival').value;
  const vehicleModelId = document.getElementById('schedule-vehicle-model').value;
  const daySelect = document.getElementById('schedule-days');
  const selectedDays = Array.from(daySelect.selectedOptions).map(o => o.value);
  const status = document.getElementById('schedule-status').value;

  if (!routeId || !operatorId || !departure || !arrival || !vehicleModelId || selectedDays.length === 0) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc (gồm Loại xe)');
    return;
  }

  const newSchedule = {
    id: genId('SCH', SCHEDULES),
    routeId, operatorId,
    departureTime: departure, arrivalTime: arrival,
    vehicleModelId, seatLayoutId: vehicleModelId, // backward compat
    status,
    daysOfWeek: selectedDays
  };
  SCHEDULES.unshift(newSchedule);

  // Tự động sinh chuyến (INTERCITY_TRIPS) cho TRIP_HORIZON_DAYS ngày tới
  const trips = generateTripsFromSchedule(newSchedule);

  createAuditLog({
    action: 'schedule.create', target: newSchedule.id,
    before: null,
    after: { route: routeId, operator: operatorId, days: selectedDays, tripsGenerated: trips.length }
  });

  closeModal('schedule-create-modal');
  renderRoutes();
  alert(`Tạo lịch chạy thành công! Đã sinh ${trips.length} chuyến trong ${TRIP_HORIZON_DAYS} ngày tới.`);
}

function renderRoutes() {
  populateScheduleOptions();
  document.getElementById('routes-table-body').innerHTML = ROUTES.map(r => {
    const stopIds = r.stopIds || [];
    const stops = stopIds.map(id => STOPS.find(s => s.id === id)?.name || id);
    return `<tr>
      <td><span class="text-accent fw-600">${r.id}</span></td>
      <td class="fw-600">${r.name}</td>
      <td>${r.distance} km</td>
      <td>${r.duration}</td>
      <td><div class="fw-600">${r.originDistrict || '—'}</div><div class="text-muted" style="font-size:11px">${r.originProvince || ''}</div></td>
      <td><div class="fw-600">${r.destDistrict || '—'}</div><div class="text-muted" style="font-size:11px">${r.destProvince || ''}</div></td>
      <td><div style="display:flex;flex-wrap:wrap;gap:3px">${stops.map(s=>`<span class="route-tag" style="font-size:10px">${s}</span>`).join('')}</div></td>
      <td><span class="badge badge-${r.status==='active'?'active':'expired'}">${r.status==='active'?'Hoạt động':'Tạm ngừng'}</span></td>
    </tr>`;
  }).join('');

  document.getElementById('schedules-table-body').innerHTML = SCHEDULES.map(s => {
    const vm = VEHICLE_MODELS.find(v => v.id === (s.vehicleModelId || s.seatLayoutId));
    const cat = vm ? (VEHICLE_CATEGORIES[vm.category]?.label || vm.category) : '';
    return `<tr>
      <td><span class="text-accent fw-600">${s.id}</span></td>
      <td>${getRouteName(s.routeId)}</td>
      <td>${getPartnerName(s.operatorId)}</td>
      <td class="fw-600">${s.departureTime}</td>
      <td>${s.arrivalTime}</td>
      <td>${vm ? `<div class="fw-600">${vm.name}</div><div class="text-muted" style="font-size:11px">${cat} · ${vm.seats} chỗ</div>` : (s.vehicleModelId || s.seatLayoutId)}</td>
      <td><div style="display:flex;flex-wrap:wrap;gap:2px">${s.daysOfWeek.map(d=>`<span style="padding:1px 5px;background:var(--accent-glow);color:var(--accent);border-radius:4px;font-size:10px">${d}</span>`).join('')}</div></td>
      <td><button class="btn btn-sm btn-outline">✏️</button></td>
    </tr>`;
  }).join('');

  renderVehicleModels();
  renderStops();
}

function renderVehicleModels() {
  const body = document.getElementById('vehicle-models-table-body');
  if (!body) return;
  const serviceLabels = { BIKE: '🏍️ Xe máy', CAR: '🚗 Xe hơi', INTERCITY: '🚌 Liên tỉnh' };
  body.innerHTML = VEHICLE_MODELS.map(v => {
    const cat = VEHICLE_CATEGORIES[v.category] || { label: v.category, icon: '' };
    return `<tr>
      <td><span class="text-accent fw-600">${v.id}</span></td>
      <td class="fw-600">${v.name}</td>
      <td>${serviceLabels[v.serviceType] || v.serviceType}</td>
      <td>${cat.icon} ${cat.label}</td>
      <td class="fw-600">${v.seats}</td>
      <td class="text-muted">${v.luggage || '—'}</td>
      <td class="text-muted">${v.description || '—'}</td>
      <td><span class="badge badge-${v.status==='active'?'active':'expired'}">${v.status==='active'?'Hoạt động':'Tạm ngừng'}</span></td>
      <td><button class="btn btn-sm btn-outline" onclick="deleteVehicleModel('${v.id}')">🗑️</button></td>
    </tr>`;
  }).join('');
}

function renderStops() {
  const body = document.getElementById('stops-table-body');
  if (!body) return;
  body.innerHTML = STOPS.map(s => `<tr>
    <td><span class="text-accent fw-600">${s.id}</span></td>
    <td class="fw-600">${s.name}</td>
    <td>${s.address}</td>
    <td>${s.district}</td>
    <td>${s.province}</td>
    <td><button class="btn btn-sm btn-outline" onclick="deleteStop('${s.id}')">🗑️</button></td>
  </tr>`).join('');
}

// ===== Vehicle Model CRUD =====
function openVehicleModelCreate() {
  ['vm-name','vm-seats','vm-luggage','vm-description'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('vm-service-type').value = 'INTERCITY';
  document.getElementById('vm-category').value = 'seat';
  document.getElementById('vm-status').value = 'active';
  openModal('vehicle-model-modal');
}

function createVehicleModel() {
  const name = document.getElementById('vm-name').value.trim();
  const serviceType = document.getElementById('vm-service-type').value;
  const category = document.getElementById('vm-category').value;
  const seats = parseInt(document.getElementById('vm-seats').value, 10);
  const status = document.getElementById('vm-status').value;
  const luggage = document.getElementById('vm-luggage').value.trim();
  const description = document.getElementById('vm-description').value.trim();
  if (!name || !serviceType || !category || isNaN(seats) || seats < 1) {
    return alert('Vui lòng nhập đủ Tên, Loại dịch vụ, Phân loại và Số ghế.');
  }
  const id = genId('VM', VEHICLE_MODELS);
  VEHICLE_MODELS.push({ id, name, serviceType, category, seats, status, luggage, description });
  createAuditLog({ action: 'vehicle_model.create', target: id, before: null, after: { name, serviceType, category, seats } });
  closeModal('vehicle-model-modal');
  renderVehicleModels();
  populateScheduleOptions();
}

function deleteVehicleModel(id) {
  if (!confirm('Xoá loại xe ' + id + '?')) return;
  const idx = VEHICLE_MODELS.findIndex(v => v.id === id);
  if (idx < 0) return;
  VEHICLE_MODELS.splice(idx, 1);
  renderVehicleModels();
  populateScheduleOptions();
}

// ===== Stop CRUD =====
function openStopCreate() {
  ['stop-name','stop-address','stop-district','stop-province'].forEach(i => document.getElementById(i).value = '');
  openModal('stop-modal');
}

function createStop() {
  const name = document.getElementById('stop-name').value.trim();
  const address = document.getElementById('stop-address').value.trim();
  const district = document.getElementById('stop-district').value.trim();
  const province = document.getElementById('stop-province').value.trim();
  if (!name || !address || !district || !province) return alert('Vui lòng nhập đủ Tên, Địa chỉ, Quận/Huyện, Tỉnh/Thành.');
  const id = genId('ST', STOPS);
  STOPS.push({ id, name, address, district, province });
  createAuditLog({ action: 'stop.create', target: id, before: null, after: { name, district, province } });
  closeModal('stop-modal');
  renderStops();
}

function deleteStop(id) {
  if (!confirm('Xoá điểm dừng ' + id + '?')) return;
  const idx = STOPS.findIndex(s => s.id === id);
  if (idx < 0) return;
  STOPS.splice(idx, 1);
  renderStops();
}

// ===== Route CRUD =====
function openRouteCreate() {
  ['route-name','route-distance','route-duration','route-origin-district','route-origin-province','route-dest-district','route-dest-province'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('route-status').value = 'active';
  filterRouteStops();
  openModal('route-modal');
}

function filterRouteStops() {
  const origin = document.getElementById('route-origin-district').value.trim().toLowerCase();
  const dest = document.getElementById('route-dest-district').value.trim().toLowerCase();
  const picker = document.getElementById('route-stops-picker');
  if (!picker) return;
  if (!origin && !dest) {
    picker.innerHTML = '<div class="text-muted" style="font-size:12px">Nhập quận của Điểm đi & Điểm đến để hiển thị điểm dừng phù hợp.</div>';
    return;
  }
  const matched = STOPS.filter(s => {
    const d = s.district.toLowerCase();
    return (origin && d.includes(origin)) || (dest && d.includes(dest));
  });
  // Sắp xếp: origin → others → dest (tuần tự)
  matched.sort((a, b) => {
    const ao = a.district.toLowerCase().includes(origin) ? 0 : (a.district.toLowerCase().includes(dest) ? 2 : 1);
    const bo = b.district.toLowerCase().includes(origin) ? 0 : (b.district.toLowerCase().includes(dest) ? 2 : 1);
    return ao - bo;
  });
  if (!matched.length) {
    picker.innerHTML = '<div class="text-muted" style="font-size:12px">Không có điểm dừng nào trong các quận đã nhập. (Thêm Điểm dừng ở tab "Điểm dừng" trước.)</div>';
    return;
  }
  picker.innerHTML = matched.map(s => `
    <label style="display:flex;gap:8px;align-items:center;padding:6px;border-radius:6px;cursor:pointer">
      <input type="checkbox" class="route-stop-cb" value="${s.id}">
      <div style="flex:1">
        <div class="fw-600">${s.name} <span class="text-muted" style="font-weight:400">— ${s.district}, ${s.province}</span></div>
        <div class="text-muted" style="font-size:11px">${s.address}</div>
      </div>
    </label>`).join('');
}

function createRoute() {
  const name = document.getElementById('route-name').value.trim();
  const distance = parseInt(document.getElementById('route-distance').value, 10);
  const duration = document.getElementById('route-duration').value.trim();
  const originDistrict = document.getElementById('route-origin-district').value.trim();
  const originProvince = document.getElementById('route-origin-province').value.trim();
  const destDistrict = document.getElementById('route-dest-district').value.trim();
  const destProvince = document.getElementById('route-dest-province').value.trim();
  const status = document.getElementById('route-status').value;
  const stopIds = Array.from(document.querySelectorAll('.route-stop-cb:checked')).map(cb => cb.value);
  if (!name || isNaN(distance) || !duration || !originDistrict || !originProvince || !destDistrict || !destProvince) {
    return alert('Vui lòng điền đủ các trường bắt buộc.');
  }
  const id = genId('RT', ROUTES);
  ROUTES.push({ id, name, distance, duration, originDistrict, originProvince, destDistrict, destProvince, stopIds, status });
  createAuditLog({ action: 'route.create', target: id, before: null, after: { name, distance, duration, stopIds: stopIds.length } });
  closeModal('route-modal');
  renderRoutes();
}

// ============================================
// PARTNERS
// ============================================
function renderPartners() {
  // Render partners table
  document.getElementById('partners-table-body').innerHTML = PARTNERS.map(p => `<tr>
    <td><span class="text-accent fw-600">${p.id}</span></td><td class="fw-600">${p.name}</td><td>${p.contact}</td><td>${p.phone}</td>
    <td class="fw-600">${p.vehicles}</td><td class="fw-600">${p.drivers}</td>
    <td><div class="partner-routes">${p.routes.map(r=>`<span class="route-tag">${r}</span>`).join('')}</div></td>
    <td class="fw-600">${p.commission}%</td>
    <td><span class="badge badge-${p.status}">${p.status==='active'?'✅ Hoạt động':'⛔ Ngừng'}</span></td>
    <td><div class="flex-center"><button class="btn-icon">👁️</button><button class="btn-icon">✏️</button></div></td>
  </tr>`).join('');

  // Render các bảng kia
  renderDrivers();
  renderIntercityDrivers();
  renderIntercityVehicles();
}

// ---- Tài xế liên tỉnh ----
function renderIntercityDrivers() {
  let items = [...INTERCITY_DRIVERS];
  const sf = document.getElementById('intercity-driver-status-filter')?.value;
  if (sf) items = items.filter(d => d.status === sf);
  const opf = document.getElementById('intercity-driver-operator-filter')?.value;
  if (opf) items = items.filter(d => d.operatorId === opf);
  const search = document.getElementById('intercity-driver-search')?.value?.toLowerCase();
  if (search) items = items.filter(d =>
    d.name.toLowerCase().includes(search) || d.id.toLowerCase().includes(search) || d.phone.includes(search));

  // Populate operator filter once
  const opSelect = document.getElementById('intercity-driver-operator-filter');
  if (opSelect && opSelect.options.length <= 1) {
    PARTNERS.filter(p => p.status === 'active').forEach(p => {
      const o = document.createElement('option');
      o.value = p.id; o.textContent = p.name;
      opSelect.appendChild(o);
    });
  }

  // Stats
  const statsEl = document.getElementById('intercity-driver-stats');
  if (statsEl) statsEl.innerHTML = `
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon accent">🧑‍✈️</div><span class="stat-card-label">Tổng TX liên tỉnh</span></div><div class="stat-card-value">${INTERCITY_DRIVERS.length}</div></div>
    <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">🟢</div><span class="stat-card-label">Online</span></div><div class="stat-card-value">${INTERCITY_DRIVERS.filter(d=>d.status==='online').length}</div></div>
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">🚗</div><span class="stat-card-label">Đang chạy</span></div><div class="stat-card-value">${INTERCITY_DRIVERS.filter(d=>d.status==='busy').length}</div></div>
    <div class="stat-card danger"><div class="stat-card-header"><div class="stat-card-icon danger">⚫</div><span class="stat-card-label">Offline</span></div><div class="stat-card-value">${INTERCITY_DRIVERS.filter(d=>d.status==='offline').length}</div></div>
  `;

  const body = document.getElementById('intercity-drivers-table-body');
  if (!body) return;
  body.innerHTML = items.map(d => `
    <tr>
      <td><span class="text-accent fw-600">${d.id}</span></td>
      <td><div class="flex-center"><div class="driver-avatar" style="width:28px;height:28px;font-size:14px">${d.avatar}</div><span class="fw-600" style="margin-left:8px">${d.name}</span></div></td>
      <td>${d.phone}</td>
      <td>${getPartnerName(d.operatorId)}</td>
      <td><span class="badge badge-accepted">🪪 ${d.licenseClass}</span></td>
      <td>⭐ ${d.rating}</td>
      <td class="fw-600">${d.trips.toLocaleString()}</td>
      <td>${driverBadge(d.status)}</td>
      <td>${d.currentAssignmentId ? `<span class="text-muted">${d.currentAssignmentId}</span>` : '—'}</td>
      <td><button class="btn btn-sm btn-outline">✏️</button></td>
    </tr>
  `).join('') || `<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Không tìm thấy</div></div></td></tr>`;
}

// ---- Xe liên tỉnh ----
function renderIntercityVehicles() {
  let items = [...INTERCITY_VEHICLES];
  const sf = document.getElementById('intercity-vehicle-status-filter')?.value;
  if (sf) items = items.filter(v => v.status === sf);
  const opf = document.getElementById('intercity-vehicle-operator-filter')?.value;
  if (opf) items = items.filter(v => v.operatorId === opf);
  const search = document.getElementById('intercity-vehicle-search')?.value?.toLowerCase();
  if (search) items = items.filter(v =>
    v.plate.toLowerCase().includes(search) || v.id.toLowerCase().includes(search) || v.vehicleClass.toLowerCase().includes(search));

  const opSelect = document.getElementById('intercity-vehicle-operator-filter');
  if (opSelect && opSelect.options.length <= 1) {
    PARTNERS.filter(p => p.status === 'active').forEach(p => {
      const o = document.createElement('option');
      o.value = p.id; o.textContent = p.name;
      opSelect.appendChild(o);
    });
  }

  const statsEl = document.getElementById('intercity-vehicle-stats');
  if (statsEl) statsEl.innerHTML = `
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon accent">🚐</div><span class="stat-card-label">Tổng xe</span></div><div class="stat-card-value">${INTERCITY_VEHICLES.length}</div></div>
    <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">🟢</div><span class="stat-card-label">Sẵn sàng</span></div><div class="stat-card-value">${INTERCITY_VEHICLES.filter(v=>v.status==='idle').length}</div></div>
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">🛣️</div><span class="stat-card-label">Đang chạy</span></div><div class="stat-card-value">${INTERCITY_VEHICLES.filter(v=>v.status==='busy').length}</div></div>
    <div class="stat-card danger"><div class="stat-card-header"><div class="stat-card-icon danger">🔧</div><span class="stat-card-label">Bảo dưỡng</span></div><div class="stat-card-value">${INTERCITY_VEHICLES.filter(v=>v.status==='maintenance').length}</div></div>
  `;

  const body = document.getElementById('intercity-vehicles-table-body');
  if (!body) return;
  body.innerHTML = items.map(v => `
    <tr>
      <td><span class="text-accent fw-600">${v.id}</span></td>
      <td class="fw-600">${v.plate}</td>
      <td>${v.vehicleClass}</td>
      <td>${getPartnerName(v.operatorId)}</td>
      <td>${v.mileage.toLocaleString()} km</td>
      <td><span class="badge ${VEHICLE_STATUS[v.status]?.class||'badge-offline'}">${VEHICLE_STATUS[v.status]?.label||v.status}</span></td>
      <td>${v.currentAssignmentId ? `<span class="text-muted">${v.currentAssignmentId}</span>` : '—'}</td>
      <td><button class="btn btn-sm btn-outline">✏️</button></td>
    </tr>
  `).join('') || `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Không tìm thấy xe</div></div></td></tr>`;
}

// ============================================
// DRIVERS
// ============================================
function renderDrivers() {
  let drivers = [...DRIVERS];
  const sf = document.getElementById('driver-status-filter')?.value;
  if (sf) drivers = drivers.filter(d => d.status === sf);
  const search = document.getElementById('driver-search')?.value?.toLowerCase();
  if (search) drivers = drivers.filter(d => d.name.toLowerCase().includes(search) || d.id.toLowerCase().includes(search) || d.plate.toLowerCase().includes(search));

  document.getElementById('driver-stats').innerHTML = `
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon accent">👥</div><span class="stat-card-label">Tổng tài xế</span></div><div class="stat-card-value">${DRIVERS.length}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon success">🟢</div><span class="stat-card-label">Online</span></div><div class="stat-card-value">${DRIVERS.filter(d=>d.status==='online').length}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon warning">🚗</div><span class="stat-card-label">Đang chạy</span></div><div class="stat-card-value">${DRIVERS.filter(d=>d.status==='busy').length}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon danger">⚫</div><span class="stat-card-label">Offline</span></div><div class="stat-card-value">${DRIVERS.filter(d=>d.status==='offline').length}</div></div>
  `;
  document.getElementById('drivers-table-body').innerHTML = drivers.map(d => `<tr>
    <td><span class="text-accent fw-600">${d.id}</span></td>
    <td><div class="flex-center"><div class="driver-avatar" style="width:28px;height:28px;font-size:14px">${d.avatar}</div><span class="fw-600">${d.name}</span></div></td>
    <td>${d.phone}</td><td>${VEHICLE_TYPES[d.vehicleType]?.icon||''} ${VEHICLE_TYPES[d.vehicleType]?.label||d.vehicleType}</td>
    <td class="fw-600">${d.plate}</td><td>${getPartnerName(d.operatorId)}</td><td>⭐ ${d.rating}</td><td class="fw-600">${d.trips.toLocaleString()}</td>
    <td>${driverBadge(d.status)}</td>
    <td><button class="btn btn-sm btn-outline" onclick="editDriver('${d.id}')">✏️</button></td>
  </tr>`).join('') || `<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Không tìm thấy tài xế</div></div></td></tr>`;
}

function editDriver(driverId) {
  const driver = DRIVERS.find(d => d.id === driverId);
  if (!driver) return;
  alert('Chỉnh sửa tài xế: ' + driver.name);
}

function addDriver() {
  const name = document.getElementById('driver-name').value;
  const phone = document.getElementById('driver-phone').value;
  const vehicleType = document.getElementById('driver-vehicle-type').value;
  const plate = document.getElementById('driver-plate').value;
  const operatorId = document.getElementById('driver-operator').value;
  const status = document.getElementById('driver-status').value;

  if (!name || !phone || !plate) {
    alert('Vui lòng nhập đầy đủ thông tin!');
    return;
  }

  const newDriver = {
    id: 'DRV' + String(DRIVERS.length + 1).padStart(3, '0'),
    name: name,
    phone: phone,
    vehicleType: vehicleType,
    plate: plate,
    operatorId: operatorId || null,
    status: status,
    rating: 5.0,
    trips: 0,
    avatar: '👤',
    currentAssignmentId: null
  };

  DRIVERS.push(newDriver);
  closeModal('driver-modal');
  renderDrivers();

  // Clear form
  document.getElementById('driver-name').value = '';
  document.getElementById('driver-phone').value = '';
  document.getElementById('driver-plate').value = '';
}

// ============================================
// BOOKING MONITORING
// ============================================
function filterBookings(type) {
  if (type && type !== currentBookingType) {
    currentBookingType = type;
    document.querySelectorAll('#booking-tabs .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  }
  renderBookings();
}

function renderBookings() {
  let bookings = [...BOOKINGS];
  if (currentBookingType !== 'ALL') bookings = bookings.filter(b => b.bookingType === currentBookingType);
  const sf = document.getElementById('booking-status-filter')?.value;
  if (sf) bookings = bookings.filter(b => b.bookingStatus === sf);
  const search = document.getElementById('booking-search')?.value?.toLowerCase();
  if (search) bookings = bookings.filter(b => b.bookingCode.toLowerCase().includes(search) || b.pickup.toLowerCase().includes(search) || b.dropoff.toLowerCase().includes(search) || getCustomerName(b.customerId).toLowerCase().includes(search));

  const canDispatch = hasPermission('fulfillment.assign') || currentRole === 'ADMIN';

  document.getElementById('bookings-table-body').innerHTML = bookings.map(b => {
    const vt = VEHICLE_TYPES[b.bookingType];
    return `<tr>
      <td><span class="text-accent fw-600">${b.bookingCode}</span></td>
      <td>${vt?vt.icon+' '+vt.label:b.bookingType}</td>
      <td>${getCustomerName(b.customerId)}</td>
      <td>${statusBadge(BOOKING_STATUSES, b.bookingStatus)}</td>
      <td>${statusBadge(PAYMENT_STATUSES, b.paymentStatus)}</td>
      <td>${b.fulfillmentStatus ? statusBadge(FULFILLMENT_STATUSES, b.fulfillmentStatus) : '<span class="text-muted">—</span>'}</td>
      <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${b.pickup}">${b.pickup}</td>
      <td class="fw-600">${fmt(b.fareSnapshot)}</td>
      <td class="text-muted">${b.createdAt}</td>
      <td><div class="flex-center">
        <button class="btn-icon" title="Chi tiết" onclick="showBookingDetail('${b.id}')">👁️</button>
        ${canDispatch && b.bookingStatus==='PENDING_CONFIRMATION'?`<button class="btn-icon" title="Điều phối" onclick="openDispatchModal('${b.id}')" style="border-color:var(--warning);color:var(--warning)">📡</button>`:''}
      </div></td>
    </tr>`;
  }).join('') || `<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Không tìm thấy booking</div></div></td></tr>`;
}

function showBookingDetail(id) {
  const b = BOOKINGS.find(x => x.id === id);
  if (!b) return;
  const vt = VEHICLE_TYPES[b.bookingType];
  const customer = getCustomer(b.customerId);
  const driver = b.driverId ? DRIVERS.find(d => d.id === b.driverId) : null;

  // Build state timeline
  const bookingStates = ['DRAFT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
  const currentIdx = bookingStates.indexOf(b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'RESCHEDULE_REQUESTED' ? 'CONFIRMED' : b.bookingStatus);

  document.getElementById('booking-detail-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <span style="font-size:32px">${vt?.icon||'🚗'}</span>
      <div><div class="fw-700" style="font-size:16px">${b.bookingCode}</div><div class="text-muted">${vt?.label||''} · ${b.id}</div></div>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
      ${statusBadge(BOOKING_STATUSES, b.bookingStatus)}
      ${statusBadge(PAYMENT_STATUSES, b.paymentStatus)}
      ${b.fulfillmentStatus ? statusBadge(FULFILLMENT_STATUSES, b.fulfillmentStatus) : ''}
    </div>

    <div class="form-grid" style="gap:12px">
      <div class="input-group"><label>Khách hàng</label><div style="padding:8px 0;font-size:13px">${customer ? customer.name+' · '+customer.phone : '—'}</div></div>
      <div class="input-group"><label>Tài xế</label><div style="padding:8px 0;font-size:13px">${driver ? driver.name+' · '+driver.phone : '<span class="text-warning">Chưa gán</span>'}</div></div>
      <div class="input-group full-width"><label>📍 Điểm đón</label><div style="padding:8px 0;font-size:13px">${b.pickup}</div></div>
      <div class="input-group full-width"><label>🏁 Điểm đến</label><div style="padding:8px 0;font-size:13px">${b.dropoff}</div></div>
      <div class="input-group"><label>Giá</label><div style="padding:8px 0;font-size:16px;font-weight:700;color:var(--success)">${fmt(b.fareSnapshot)}</div></div>
      <div class="input-group"><label>Khoảng cách</label><div style="padding:8px 0;font-size:13px">${b.distance} km</div></div>
      <div class="input-group"><label>Payment Ref</label><div style="padding:8px 0;font-size:13px;font-family:monospace">${b.paymentReference}</div></div>
      <div class="input-group"><label>Fulfillment Task</label><div style="padding:8px 0;font-size:13px;font-family:monospace">${b.fulfillmentTaskId||'—'}</div></div>
      ${b.seatNumbers ? `<div class="input-group"><label>Ghế</label><div style="padding:8px 0;font-size:13px">${b.seatNumbers.join(', ')}</div></div>` : ''}
      ${b.routeId ? `<div class="input-group"><label>Tuyến</label><div style="padding:8px 0;font-size:13px">${getRouteName(b.routeId)}</div></div>` : ''}
    </div>

    <div style="margin-top:20px"><label style="font-size:12px;font-weight:500;color:var(--text-secondary);display:block;margin-bottom:12px">Booking Lifecycle</label>
      <div style="display:flex;gap:4px">${bookingStates.map((key, i) => {
        const s = BOOKING_STATUSES[key];
        const active = i <= currentIdx;
        const current = key === b.bookingStatus;
        return `<div style="flex:1;text-align:center"><div style="height:4px;border-radius:4px;background:${active?s.color:'var(--border-color)'};margin-bottom:6px"></div><div style="font-size:10px;color:${current?s.color:'var(--text-muted)'};font-weight:${current?'600':'400'}">${s.icon} ${s.label}</div></div>`;
      }).join('')}</div>
      ${b.bookingStatus === 'CANCELLED' ? '<div style="margin-top:8px;text-align:center;color:var(--danger);font-size:12px;font-weight:600">❌ Booking đã bị hủy</div>' : ''}
      ${b.bookingStatus === 'RESCHEDULE_REQUESTED' ? '<div style="margin-top:8px;text-align:center;color:var(--purple);font-size:12px;font-weight:600">🔄 Yêu cầu đổi lịch đang chờ xử lý</div>' : ''}
    </div>
  `;

  const canDispatch = hasPermission('fulfillment.assign') || currentRole === 'ADMIN';
  const canCancel = hasPermission('booking.cancel') || currentRole === 'ADMIN';

  let actions = '<button class="btn btn-outline" onclick="closeModal(\'booking-detail-modal\')">Đóng</button>';
  if (canDispatch && b.bookingStatus === 'PENDING_CONFIRMATION') actions += `<button class="btn btn-primary" onclick="closeModal('booking-detail-modal');openDispatchModal('${b.id}')">📡 Điều phối</button>`;
  if (canCancel && ['PENDING_CONFIRMATION','CONFIRMED'].includes(b.bookingStatus)) actions += `<button class="btn btn-danger" onclick="cancelBooking('${b.id}')">Hủy booking</button>`;
  document.getElementById('booking-detail-actions').innerHTML = actions;
  openModal('booking-detail-modal');
}

function cancelBooking(id, reason = 'Khách hủy') {
  const b = BOOKINGS.find(x => x.id === id);
  if (!b) return;
  const traceId = newTraceId();
  const before = { status: b.bookingStatus, payment: b.paymentStatus, fulfillment: b.fulfillmentStatus };

  // Refund nếu non-cash đã CONFIRMED. Cash: chỉ đánh dấu CANCELLED (không thu/không hoàn).
  if (b.paymentMethod !== 'cash' && b.paymentStatus === 'CONFIRMED') {
    refundBooking(b, reason, traceId);
  } else {
    b.paymentStatus = 'CANCELLED';
  }

  // Cancel FT + release driver + release vehicle (intercity)
  if (b.fulfillmentTaskId) {
    const ft = FULFILLMENT_TASKS.find(t => t.id === b.fulfillmentTaskId);
    if (ft) {
      if (ft.vehicleId) releaseVehicle(ft.vehicleId);
      ft.status = 'CANCELLED';
    }
  }
  if (b.driverId) releaseDriver(b.driverId);

  // Trả ghế nếu là chuyến intercity
  if (b.bookingType === 'INTERCITY' && b.tripId) {
    const trip = INTERCITY_TRIPS.find(t => t.id === b.tripId);
    if (trip) {
      const seatsCount = (b.passengerSnapshot && b.passengerSnapshot.length) || 1;
      trip.seatsAvailable = Math.min(trip.seatsTotal, trip.seatsAvailable + seatsCount);
      if (trip.seatsAvailable > 0 && trip.status === 'full') trip.status = 'available';
    }
  }

  b.bookingStatus = 'CANCELLED';
  b.fulfillmentStatus = 'CANCELLED';
  b.updatedAt = nowStr();

  // Sync registration / maintenance status nếu là service / maintenance order
  if (b.serviceOrderId) {
    const reg = REGISTRATIONS.find(r => r.id === b.serviceOrderId);
    if (reg) reg.status = 'cancelled';
  }
  if (b.maintenanceOrderId) {
    const mnt = MAINTENANCE.find(r => r.id === b.maintenanceOrderId);
    if (mnt) mnt.status = 'cancelled';
  }

  createNotification({
    type: 'booking_cancelled', recipient: b.customerId,
    content: `Booking ${b.bookingCode} đã bị hủy. Lý do: ${reason}`
  });
  createAuditLog({
    action: 'booking.cancel', target: b.id, traceId,
    before, after: { status: 'CANCELLED', reason }
  });

  closeModal('booking-detail-modal');
  renderPage(currentPage);
  updateBadges();
}

// ============================================
// FULFILLMENT TASKS
// ============================================
// ---- Filter helpers theo tab ----
function bookingMatchesFulfillmentTab(b, tab) {
  if (tab === 'all') return true;
  if (tab === 'bikecar') return b.bookingType === 'BIKE' || b.bookingType === 'CAR';
  if (tab === 'intercity') return b.bookingType === 'INTERCITY';
  if (tab === 'service') return b.bookingType === 'SERVICE_ORDER';
  if (tab === 'maintenance') return b.bookingType === 'MAINTENANCE_ORDER';
  return true;
}

// Đã không còn cần filter theo field trên 1 array vì 2 pool tách hẳn — giữ lại để backward compat
function driverMatchesFulfillmentTab(d, tab) {
  if (tab === 'all') return true;
  if (tab === 'bikecar') return DRIVERS.includes(d);
  if (tab === 'intercity' || tab === 'service' || tab === 'maintenance') return INTERCITY_DRIVERS.includes(d);
  return true;
}

function getVehicleName(vehicleId) {
  if (!vehicleId) return '—';
  const v = INTERCITY_VEHICLES.find(x => x.id === vehicleId);
  return v ? v.plate : vehicleId;
}

function switchFulfillmentTab(tab, btn) {
  currentFulfillmentTab = tab;
  document.querySelectorAll('#fulfillment-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else document.querySelector(`#fulfillment-tabs .tab-btn[data-ftab="${tab}"]`)?.classList.add('active');
  renderFulfillment();
}

function renderFulfillment() {
  const tab = currentFulfillmentTab;
  const isIntercity = tab === 'intercity';
  const canAssign = hasPermission('fulfillment.assign') || currentRole === 'ADMIN';

  // Filter chung
  const allPending = BOOKINGS.filter(b =>
    b.bookingStatus === 'CONFIRMED' &&
    (b.paymentStatus === 'CONFIRMED' || b.paymentStatus === 'CASH') &&
    (!b.fulfillmentStatus || b.fulfillmentStatus === 'PENDING') &&
    bookingMatchesFulfillmentTab(b, tab)
  );
  const pool = getDriverPoolForTab(tab);
  const availableDrivers = pool.filter(d => d.status === 'online');

  // Stats theo tab
  const tasksInTab = FULFILLMENT_TASKS.filter(t => {
    const b = BOOKINGS.find(x => x.id === t.bookingId);
    return b && bookingMatchesFulfillmentTab(b, tab);
  });
  document.getElementById('fulfillment-stats').innerHTML = `
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">⏳</div><span class="stat-card-label">Chờ phân công</span></div><div class="stat-card-value">${allPending.length}</div></div>
    <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">🟢</div><span class="stat-card-label">TX sẵn sàng</span></div><div class="stat-card-value">${availableDrivers.length}</div></div>
    ${isIntercity ? `<div class="stat-card accent"><div class="stat-card-header"><div class="stat-card-icon accent">🚐</div><span class="stat-card-label">Xe sẵn sàng</span></div><div class="stat-card-value">${INTERCITY_VEHICLES.filter(v => v.status === 'idle').length}</div></div>` : ''}
    <div class="stat-card accent"><div class="stat-card-header"><div class="stat-card-icon accent">🛣️</div><span class="stat-card-label">Đang chạy</span></div><div class="stat-card-value">${tasksInTab.filter(t=>t.status==='IN_PROGRESS').length}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon info">✅</div><span class="stat-card-label">Hoàn thành</span></div><div class="stat-card-value">${tasksInTab.filter(t=>t.status==='COMPLETED').length}</div></div>
  `;

  // Show / hide các cụm card
  document.getElementById('fulfillment-cards-default').style.display = isIntercity ? 'none' : 'grid';
  document.getElementById('fulfillment-cards-intercity').style.display = isIntercity ? 'grid' : 'none';

  if (isIntercity) {
    renderFulfillmentIntercity(allPending, availableDrivers, canAssign);
  } else {
    renderFulfillmentDefault(allPending, availableDrivers, canAssign);
  }

  // Bảng FT tasks
  const tableTitle = { all: 'Tất cả Fulfillment Tasks', bikecar: 'FT — Bike & Car', intercity: 'FT — Liên tỉnh', service: 'FT — Đăng kiểm', maintenance: 'FT — Bảo dưỡng' };
  document.getElementById('fulfillment-table-title').textContent = tableTitle[tab] || 'Fulfillment Tasks';

  document.getElementById('fulfillment-table-body').innerHTML = tasksInTab.map(t => {
    const b = BOOKINGS.find(x => x.id === t.bookingId);
    const vt = b ? VEHICLE_TYPES[b.bookingType] : null;
    const isInter = b && b.bookingType === 'INTERCITY';
    return `<tr>
      <td><span class="text-accent fw-600">${t.id}</span></td>
      <td>${b ? b.bookingCode : t.bookingId}</td>
      <td>${vt ? vt.icon + ' ' + vt.label : '—'}</td>
      <td class="fw-600">${isInter ? getVehicleName(t.vehicleId) : '—'}</td>
      <td class="fw-600">${getDriverName(t.driverId)}</td>
      <td>${statusBadge(FULFILLMENT_STATUSES, t.status)}</td>
      <td class="text-muted">${t.assignedAt}</td>
      <td class="text-muted">${t.startedAt||'—'}</td>
      <td class="text-muted">${t.completedAt||'—'}</td>
      <td>${canAssign && t.status==='ASSIGNED'?`<button class="btn btn-sm btn-outline" title="Gán lại" onclick="${isInter ? `openIntercityDispatchModal('${t.bookingId}')` : `openDispatchModal('${t.bookingId}')`}">🔄 Gán lại</button>`:'—'}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Chưa có task</div></div></td></tr>`;
}

function renderFulfillmentDefault(allPending, availableDrivers, canAssign) {
  document.getElementById('dispatch-pending-count').textContent = `${allPending.length} chuyến`;
  document.getElementById('dispatch-pending-list').innerHTML = allPending.length ? allPending.map(b => {
    const vt = VEHICLE_TYPES[b.bookingType];
    return `<div class="dispatch-item" ${canAssign ? `onclick="openDispatchModal('${b.id}')"` : ''}>
      <div class="dispatch-item-header"><span class="dispatch-item-id">${b.bookingCode}</span><span class="dispatch-item-type">${vt?.icon||'🚗'}</span></div>
      <div class="dispatch-item-route"><span class="pickup">${b.pickup}</span><span class="dropoff">${b.dropoff}</span></div>
      <div class="dispatch-item-footer"><span class="dispatch-item-price">${fmt(b.fareSnapshot)}</span>${canAssign ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openDispatchModal('${b.id}')">Gán tài xế</button>` : '<span class="text-muted" style="font-size:12px">Chỉ xem</span>'}</div>
    </div>`;
  }).join('') : '<div class="empty-state"><div class="empty-state-icon">🎉</div><div class="empty-state-text">Tất cả đã được gán</div></div>';

  document.getElementById('dispatch-driver-count').textContent = `${availableDrivers.length} tài xế`;
  document.getElementById('dispatch-driver-list').innerHTML = availableDrivers.length ? availableDrivers.map(d => {
    const meta = d.plate
      ? `${VEHICLE_TYPES[d.vehicleType]?.icon||''} ${d.plate} · ⭐ ${d.rating} · ${d.trips} chuyến`
      : `🪪 GPLX ${d.licenseClass||'—'} · ${getPartnerName(d.operatorId)} · ⭐ ${d.rating} · ${d.trips} chuyến`;
    return `<div class="driver-item"><div class="driver-avatar">${d.avatar}</div>
      <div class="driver-info"><div class="name">${d.name}</div><div class="meta">${meta}</div></div>${driverBadge(d.status)}</div>`;
  }).join('') : '<div class="empty-state"><div class="empty-state-text">Không có tài xế</div></div>';
}

function renderFulfillmentIntercity(allPending, availableDrivers, canAssign) {
  // Chờ phân công (booking INTERCITY)
  document.getElementById('intercity-pending-count').textContent = `${allPending.length} chuyến`;
  document.getElementById('intercity-pending-list').innerHTML = allPending.length ? allPending.map(b => {
    const trip = INTERCITY_TRIPS.find(t => t.id === b.tripId);
    const operator = trip ? PARTNERS.find(p => p.id === trip.operatorId) : null;
    return `<div class="dispatch-item" ${canAssign ? `onclick="openIntercityDispatchModal('${b.id}')"` : ''}>
      <div class="dispatch-item-header"><span class="dispatch-item-id">${b.bookingCode}</span><span class="dispatch-item-type">🚌</span></div>
      <div class="dispatch-item-route"><span class="pickup">${b.pickup}</span><span class="dropoff">${b.dropoff}</span></div>
      <div style="font-size:11px;color:var(--text-muted);margin:4px 0">${operator ? operator.name : ''} ${trip ? '· ' + trip.vehicleType : ''}</div>
      <div class="dispatch-item-footer"><span class="dispatch-item-price">${fmt(b.fareSnapshot)}</span>${canAssign ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openIntercityDispatchModal('${b.id}')">Phân công</button>` : '<span class="text-muted" style="font-size:12px">Chỉ xem</span>'}</div>
    </div>`;
  }).join('') : '<div class="empty-state"><div class="empty-state-icon">🎉</div><div class="empty-state-text">Đã phân công hết</div></div>';

  // Xe sẵn sàng
  const idleVehicles = INTERCITY_VEHICLES.filter(v => v.status === 'idle');
  document.getElementById('intercity-vehicle-count').textContent = `${idleVehicles.length} xe`;
  document.getElementById('intercity-vehicle-list').innerHTML = idleVehicles.length ? idleVehicles.map(v => {
    const op = PARTNERS.find(p => p.id === v.operatorId);
    return `<div class="driver-item"><div class="driver-avatar">🚐</div>
      <div class="driver-info"><div class="name">${v.plate}</div><div class="meta">${v.vehicleClass} · ${op ? op.name : '—'} · ${v.mileage.toLocaleString()}km</div></div>
      <span class="badge ${VEHICLE_STATUS[v.status]?.class||'badge-offline'}">${VEHICLE_STATUS[v.status]?.label||v.status}</span></div>`;
  }).join('') : '<div class="empty-state"><div class="empty-state-text">Không có xe rảnh</div></div>';

  // Tài xế intercity sẵn sàng
  document.getElementById('intercity-driver-count').textContent = `${availableDrivers.length} TX`;
  document.getElementById('intercity-driver-list').innerHTML = availableDrivers.length ? availableDrivers.map(d => {
    const op = PARTNERS.find(p => p.id === d.operatorId);
    return `<div class="driver-item"><div class="driver-avatar">${d.avatar}</div>
      <div class="driver-info"><div class="name">${d.name}</div><div class="meta">🚌 ${op ? op.name : 'Cá nhân'} · ⭐ ${d.rating} · ${d.trips} chuyến</div></div>${driverBadge(d.status)}</div>`;
  }).join('') : '<div class="empty-state"><div class="empty-state-text">Không có TX intercity online</div></div>';
}

function openDispatchModal(bookingId) {
  const b = BOOKINGS.find(x => x.id === bookingId);
  if (!b) return;
  // INTERCITY có flow phân công riêng (xe + tài xế độc lập)
  if (b.bookingType === 'INTERCITY') {
    return openIntercityDispatchModal(bookingId);
  }
  selectedDispatchBooking = b;
  const vt = VEHICLE_TYPES[b.bookingType];
  const window = getBookingTimeWindow(b);
  const scheduleHtml = window
    ? `<div style="font-size:12px;color:var(--accent);margin-top:6px">🕐 Khung giờ: ${fmtBookingWindow(window)}</div>`
    : '';
  document.getElementById('dispatch-trip-info').innerHTML = `
    <div class="flex-center" style="margin-bottom:8px"><span style="font-size:20px">${vt?.icon||'🚗'}</span><span class="fw-600">${b.bookingCode}</span><span class="text-muted">·</span><span>${vt?.label||''}</span><span class="recent-trip-price" style="margin-left:auto">${fmt(b.fareSnapshot)}</span></div>
    <div style="font-size:12px;color:var(--text-secondary)">📍 ${b.pickup}<br>🏁 ${b.dropoff}</div>${scheduleHtml}`;
  // Pool tài xế phù hợp với loại booking
  const pool = getDriverPoolForBooking(b.bookingType);
  // Với booking có lịch (SERVICE/MAINTENANCE) → filter theo time-conflict thay vì status
  // Với BIKE/CAR (real-time) → filter theo status='online'
  const hasSchedule = (b.bookingType === 'SERVICE_ORDER' || b.bookingType === 'MAINTENANCE_ORDER') && window;
  const avail = hasSchedule
    ? pool.filter(d => d.status !== 'offline' && isDriverFreeAt(d.id, window, b.fulfillmentTaskId))
    : pool.filter(d => d.status === 'online');

  document.getElementById('dispatch-driver-select').innerHTML = `<option value="">-- Chọn tài xế --</option>` + avail.map(d => {
    const meta = d.plate
      ? `${VEHICLE_TYPES[d.vehicleType]?.icon||''} ${d.plate}`
      : `🪪 GPLX ${d.licenseClass || '—'} · ${getPartnerName(d.operatorId)}`;
    const busy = d.status === 'busy' ? describeNextBusyWindow('driver', d.id) : null;
    const busyHint = busy ? ` · ⏳ đang bận ${busy}` : '';
    return `<option value="${d.id}">${d.avatar} ${d.name} · ${meta} · ⭐${d.rating}${busyHint}</option>`;
  }).join('');
  openModal('dispatch-modal');
}

// Intercity: dispatch modal với 2 dropdown — xe và tài xế độc lập
function openIntercityDispatchModal(bookingId) {
  const b = BOOKINGS.find(x => x.id === bookingId);
  if (!b || b.bookingType !== 'INTERCITY') return;
  selectedDispatchBooking = b;
  selectedIntercityVehicleId = null;

  const trip = INTERCITY_TRIPS.find(t => t.id === b.tripId);
  const operator = trip ? PARTNERS.find(p => p.id === trip.operatorId) : null;
  const route = INTERCITY_ROUTES.find(r => r.id === b.routeId);
  const window = getBookingTimeWindow(b);

  document.getElementById('intercity-dispatch-trip-info').innerHTML = `
    <div class="flex-center" style="margin-bottom:8px">
      <span style="font-size:20px">🚌</span>
      <span class="fw-600">${b.bookingCode}</span>
      <span class="text-muted">·</span>
      <span>${operator ? operator.name : ''}</span>
      <span class="recent-trip-price" style="margin-left:auto">${fmt(b.fareSnapshot)}</span>
    </div>
    <div style="font-size:12px;color:var(--text-secondary)">
      📍 ${route ? route.origin : b.pickup} → 🏁 ${route ? route.destination : b.dropoff}<br>
      ${trip ? '🕐 ' + trip.departureTime + ' - ' + trip.arrivalTime + ' · ' + trip.date + ' · ' + trip.vehicleType : ''}
    </div>
    ${window ? `<div style="font-size:12px;color:var(--accent);margin-top:6px">🕐 Khung giờ: ${fmtBookingWindow(window)}</div>` : ''}`;

  // Xe: filter theo:
  //   - status !== 'maintenance' (xe đang sửa: loại)
  //   - không xung đột thời gian với FT khác (cho phép xe đang busy ở khung giờ khác)
  const operatorId = trip ? trip.operatorId : null;
  const vehiclesAvail = INTERCITY_VEHICLES.filter(v =>
    v.status !== 'maintenance' && isVehicleFreeAt(v.id, window, b.fulfillmentTaskId)
  );
  const sameOpVehicles = operatorId ? vehiclesAvail.filter(v => v.operatorId === operatorId) : vehiclesAvail;
  const otherVehicles = operatorId ? vehiclesAvail.filter(v => v.operatorId !== operatorId) : [];

  const renderVehicleOption = v => {
    const op = PARTNERS.find(p => p.id === v.operatorId);
    const busy = v.status === 'busy' ? describeNextBusyWindow('vehicle', v.id) : null;
    const busyHint = busy ? ` · ⏳ đang chạy ${busy}` : '';
    return `<option value="${v.id}">${v.plate} · ${v.vehicleClass} · ${op ? op.name : ''}${busyHint}</option>`;
  };
  const vsel = document.getElementById('intercity-dispatch-vehicle-select');
  vsel.innerHTML = '<option value="">-- Chọn xe --</option>' +
    sameOpVehicles.map(renderVehicleOption).join('') +
    (otherVehicles.length ? '<optgroup label="--- Xe khác nhà xe ---">' +
      otherVehicles.map(renderVehicleOption).join('') + '</optgroup>' : '');

  // Tài xế: filter theo:
  //   - status !== 'offline'
  //   - không xung đột thời gian (đang bận khung giờ khác → vẫn được)
  const driversAvail = INTERCITY_DRIVERS.filter(d =>
    d.status !== 'offline' && isDriverFreeAt(d.id, window, b.fulfillmentTaskId)
  );
  const sameOpDrivers = operatorId ? driversAvail.filter(d => d.operatorId === operatorId) : driversAvail;
  const otherDrivers = operatorId ? driversAvail.filter(d => d.operatorId !== operatorId) : [];
  const renderDriverOption = d => {
    const op = PARTNERS.find(p => p.id === d.operatorId);
    const busy = d.status === 'busy' ? describeNextBusyWindow('driver', d.id) : null;
    const busyHint = busy ? ` · ⏳ đang bận ${busy}` : '';
    return `<option value="${d.id}">${d.avatar} ${d.name} · ${op ? op.name : 'Cá nhân'} · ⭐${d.rating}${busyHint}</option>`;
  };
  const dsel = document.getElementById('intercity-dispatch-driver-select');
  dsel.innerHTML = '<option value="">-- Chọn tài xế --</option>' +
    sameOpDrivers.map(renderDriverOption).join('') +
    (otherDrivers.length ? '<optgroup label="--- TX khác nhà xe ---">' +
      otherDrivers.map(renderDriverOption).join('') + '</optgroup>' : '');

  openModal('intercity-dispatch-modal');
}

// Helper validate trước khi gán bất kỳ
function _validateAssign(b) {
  if (b.bookingStatus !== 'CONFIRMED') {
    alert('Booking chưa được xác nhận. Cần xác nhận thanh toán trước khi gán tài xế.');
    return false;
  }
  if (b.paymentStatus !== 'CONFIRMED' && b.paymentStatus !== 'CASH') {
    alert('Booking đang ở trạng thái "' + (PAYMENT_STATUSES[b.paymentStatus]?.label || b.paymentStatus) + '". Cần thanh toán hoặc xác nhận tiền mặt trước khi gán tài xế.');
    return false;
  }
  return true;
}

function assignDriver() {
  const driverId = document.getElementById('dispatch-driver-select').value;
  if (!driverId || !selectedDispatchBooking) return;
  const b = selectedDispatchBooking;
  if (!_validateAssign(b)) return;
  const driver = findDriver(driverId);
  if (!driver) { alert('Không tìm thấy tài xế'); return; }

  const traceId = newTraceId();
  if (b.driverId && b.driverId !== driverId) releaseDriver(b.driverId);

  b.driverId = driverId;
  b.fulfillmentStatus = 'ASSIGNED';
  b.updatedAt = nowStr();
  createOrUpdateFulfillmentTask(b, driverId, null, traceId);

  // Chỉ set busy nếu trip đang/sắp chạy. Trip tương lai → status giữ nguyên (TX vẫn online nhận chuyến khác trong khung khác)
  const window = getBookingTimeWindow(b);
  if (isWindowCurrent(window)) {
    driver.status = 'busy';
    driver.currentAssignmentId = b.fulfillmentTaskId;
  }

  createNotification({
    type: 'driver_assigned', recipient: driverId,
    content: `Bạn được gán chuyến ${b.bookingCode} (${b.pickup} → ${b.dropoff})`
  });
  createNotification({
    type: 'driver_assigned', recipient: b.customerId,
    content: `Tài xế ${driver.name}${driver.plate ? ' (' + driver.plate + ')' : ''} sẽ phục vụ chuyến ${b.bookingCode}`
  });

  closeModal('dispatch-modal');
  selectedDispatchBooking = null;
  renderPage(currentPage);
  updateBadges();
}

// Intercity: gán xe + tài xế độc lập trong cùng 1 thao tác
function assignIntercityDispatch() {
  const vehicleId = document.getElementById('intercity-dispatch-vehicle-select').value;
  const driverId = document.getElementById('intercity-dispatch-driver-select').value;
  if (!vehicleId || !driverId) {
    alert('Vui lòng chọn cả xe lẫn tài xế');
    return;
  }
  if (!selectedDispatchBooking) return;
  const b = selectedDispatchBooking;
  if (!_validateAssign(b)) return;

  const driver = INTERCITY_DRIVERS.find(d => d.id === driverId) || findDriver(driverId);
  const vehicle = INTERCITY_VEHICLES.find(v => v.id === vehicleId);
  if (!driver) { alert('Không tìm thấy tài xế'); return; }
  if (!vehicle) { alert('Không tìm thấy xe'); return; }
  if (vehicle.status === 'maintenance') { alert('Xe ' + vehicle.plate + ' đang bảo dưỡng - không khả dụng'); return; }

  // Time-conflict check (xe/TX có thể đang busy hiện tại nhưng phải rảnh ở khung giờ chuyến)
  const bookingWindow = getBookingTimeWindow(b);
  if (!isVehicleFreeAt(vehicleId, bookingWindow, b.fulfillmentTaskId)) {
    alert('Xe ' + vehicle.plate + ' đã có lịch trong khung giờ này');
    return;
  }
  if (!isDriverFreeAt(driverId, bookingWindow, b.fulfillmentTaskId)) {
    alert('Tài xế ' + driver.name + ' đã có lịch trong khung giờ này');
    return;
  }

  const traceId = newTraceId();

  // Release driver/vehicle cũ nếu re-assign
  const oldFt = b.fulfillmentTaskId ? FULFILLMENT_TASKS.find(t => t.id === b.fulfillmentTaskId) : null;
  if (oldFt) {
    if (oldFt.driverId && oldFt.driverId !== driverId) releaseDriver(oldFt.driverId);
    if (oldFt.vehicleId && oldFt.vehicleId !== vehicleId) releaseVehicle(oldFt.vehicleId);
  }

  b.driverId = driverId;
  b.fulfillmentStatus = 'ASSIGNED';
  b.updatedAt = nowStr();
  const ft = createOrUpdateFulfillmentTask(b, driverId, vehicleId, traceId);

  // Chỉ mark busy nếu trip đang/sắp diễn ra. Trip tương lai → giữ nguyên status để TX/xe có thể nhận chuyến khác không xung đột.
  if (isWindowCurrent(bookingWindow)) {
    driver.status = 'busy';
    driver.currentAssignmentId = ft.id;
    vehicle.status = 'busy';
    vehicle.currentAssignmentId = ft.id;
  }

  createNotification({
    type: 'driver_assigned', recipient: driverId,
    content: `Bạn được gán chuyến ${b.bookingCode} — lái xe ${vehicle.plate} (${vehicle.vehicleClass})`
  });
  createNotification({
    type: 'vehicle_assigned', recipient: vehicle.operatorId,
    content: `Xe ${vehicle.plate} được gán chuyến ${b.bookingCode}`
  });
  createNotification({
    type: 'driver_assigned', recipient: b.customerId,
    content: `Tài xế ${driver.name} sẽ phục vụ chuyến ${b.bookingCode} (xe ${vehicle.plate})`
  });
  createAuditLog({
    action: 'fulfillment.assign_intercity', target: ft.id, traceId,
    before: null, after: { driver: driverId, vehicle: vehicleId }
  });

  closeModal('intercity-dispatch-modal');
  selectedDispatchBooking = null;
  selectedIntercityVehicleId = null;
  renderPage(currentPage);
  updateBadges();
}

function releaseVehicle(vehicleId) {
  if (!vehicleId) return;
  const v = INTERCITY_VEHICLES.find(x => x.id === vehicleId);
  if (!v) return;
  v.currentAssignmentId = null;
  if (v.status === 'busy') v.status = 'idle';
}

// ============================================
// WALLETS
// ============================================
function renderWallets() {
  let wallets = [...WALLETS];
  const tf = document.getElementById('wallet-type-filter')?.value;
  if (tf) wallets = wallets.filter(w => w.ownerType === tf);
  const search = document.getElementById('wallet-search')?.value?.toLowerCase();
  if (search) wallets = wallets.filter(w => w.ownerName.toLowerCase().includes(search));

  const total = WALLETS.reduce((s,w) => s + w.balance, 0);
  const pending = WALLETS.reduce((s,w) => s + w.pendingBalance, 0);
  document.getElementById('wallet-stats').innerHTML = `
    <div class="stat-card accent"><div class="stat-card-header"><div class="stat-card-icon accent">💰</div><span class="stat-card-label">Tổng số dư</span></div><div class="stat-card-value">${fmt(total)}</div></div>
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">🔒</div><span class="stat-card-label">Tạm giữ</span></div><div class="stat-card-value">${fmt(pending)}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon success">📊</div><span class="stat-card-label">Tổng ví</span></div><div class="stat-card-value">${WALLETS.length}</div></div>
  `;

  const ownerTypeLabels = { CUSTOMER: '👤 Khách hàng', DRIVER: '🧑‍✈️ Tài xế', PARTNER: '🤝 Đối tác', SYSTEM: '🖥️ Hệ thống' };
  document.getElementById('wallets-table-body').innerHTML = wallets.map(w => `<tr>
    <td><span class="text-accent fw-600">${w.id}</span></td><td class="fw-600">${w.ownerName}</td>
    <td><span class="badge badge-accepted">${ownerTypeLabels[w.ownerType]||w.ownerType}</span></td>
    <td><span class="badge ${w.walletType==='MAIN'?'badge-accepted':w.walletType==='BONUS'?'badge-pending':'badge-picking'}">${WALLET_TYPES[w.walletType]?.icon||''} ${WALLET_TYPES[w.walletType]?.label||w.walletType}</span></td>
    <td class="fw-700 ${w.balance>0?'text-success':'text-muted'}">${fmt(w.balance)}</td>
    <td class="${w.pendingBalance>0?'text-warning':'text-muted'}">${fmt(w.pendingBalance)}</td>
    <td><span class="badge ${WALLET_STATUS[w.status]?.class||'badge-expired'}">${WALLET_STATUS[w.status]?.label||w.status}</span></td>
    <td><div class="flex-center"><button class="btn btn-sm btn-outline">💳 Nạp</button><button class="btn-icon">📋</button></div></td>
  </tr>`).join('');

  document.getElementById('transactions-table-body').innerHTML = WALLET_TRANSACTIONS.map(tx => {
    const t = TRANSACTION_TYPES[tx.type] || { label: tx.type, class: '' };
    const w = WALLETS.find(w => w.id === tx.walletId);
    return `<tr>
      <td class="text-muted">${tx.id}</td><td class="fw-600">${w?w.ownerName:tx.walletId}</td>
      <td><span class="badge ${tx.direction==='CREDIT'?'badge-completed':'badge-cancelled'}">${tx.direction==='CREDIT'?'↑ CREDIT':'↓ DEBIT'}</span></td>
      <td>${t.label}</td>
      <td class="fw-700 ${tx.direction==='CREDIT'?'text-success':'text-danger'}">${tx.direction==='CREDIT'?'+':'−'}${fmt(tx.amount)}</td>
      <td>${fmt(tx.balance)}</td>
      <td class="text-muted" style="font-family:monospace;font-size:11px">${tx.referenceType}:${tx.referenceId}</td>
      <td><span class="badge badge-${tx.status==='SUCCESS'?'completed':tx.status==='PENDING'?'pending':'cancelled'}">${tx.status}</span></td>
      <td class="text-muted">${tx.createdAt}</td>
    </tr>`;
  }).join('');
}

// ============================================
// REFUNDS
// ============================================
function renderRefunds() {
  const pending = REFUNDS.filter(r => r.status === 'PENDING').length;
  const processing = REFUNDS.filter(r => r.status === 'PROCESSING').length;
  const success = REFUNDS.filter(r => r.status === 'SUCCESS').length;
  const totalAmt = REFUNDS.filter(r=>r.status==='SUCCESS').reduce((s,r)=>s+r.amount,0);

  document.getElementById('refund-stats').innerHTML = `
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">⏳</div><span class="stat-card-label">Chờ xử lý</span></div><div class="stat-card-value">${pending}</div></div>
    <div class="stat-card accent"><div class="stat-card-header"><div class="stat-card-icon accent">⚙️</div><span class="stat-card-label">Đang xử lý</span></div><div class="stat-card-value">${processing}</div></div>
    <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">✅</div><span class="stat-card-label">Thành công</span></div><div class="stat-card-value">${success}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon info">💸</div><span class="stat-card-label">Tổng hoàn tiền</span></div><div class="stat-card-value">${fmt(totalAmt)}</div></div>
  `;

  document.getElementById('refunds-table-body').innerHTML = REFUNDS.map(r => `<tr>
    <td><span class="text-accent fw-600">${r.id}</span></td>
    <td><span class="fw-600">${r.bookingCode}</span></td>
    <td>${getCustomerName(r.customerId)}</td>
    <td class="fw-700 text-warning">${fmt(r.amount)}</td>
    <td>${r.reason}</td>
    <td><span class="badge badge-accepted">${r.refundMethod==='wallet'?'💰 Ví chính':'🎁 Ví bonus'}</span></td>
    <td>${getUserName(r.processedBy)}</td>
    <td>${statusBadge(REFUND_STATUSES, r.status)}</td>
    <td class="text-muted">${r.createdAt}</td>
    <td>${r.status==='PENDING'?'<button class="btn btn-sm btn-primary">Xử lý</button>':''}</td>
  </tr>`).join('');
}

// ============================================
// PROMOS
// ============================================
function renderPromos() {
  const active = PROMOS.filter(p => p.status === 'active');
  const totalUsed = PROMOS.reduce((s,p) => s + p.used, 0);
  document.getElementById('promo-stats').innerHTML = `
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon accent">🎫</div><span class="stat-card-label">Tổng mã</span></div><div class="stat-card-value">${PROMOS.length}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon success">✅</div><span class="stat-card-label">Đang hoạt động</span></div><div class="stat-card-value">${active.length}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon warning">📊</div><span class="stat-card-label">Lượt sử dụng</span></div><div class="stat-card-value">${totalUsed.toLocaleString()}</div></div>
  `;
  const statusMap = { active: 'badge-active', expired: 'badge-expired', scheduled: 'badge-scheduled' };
  const statusLabel = { active: '✅ Hoạt động', expired: '⛔ Hết hạn', scheduled: '📅 Lên lịch' };
  document.getElementById('promos-table-body').innerHTML = PROMOS.map(p => {
    const pct = Math.round((p.used/p.usageLimit)*100);
    return `<tr>
      <td><span class="text-accent fw-700" style="font-family:monospace">${p.code}</span></td>
      <td>${p.type==='percent'?'📊 %':'💵 Cố định'}</td>
      <td class="fw-600">${p.type==='percent'?p.value+'%':fmt(p.value)}</td>
      <td>${fmt(p.maxDiscount)}</td>
      <td>${fmt(p.minOrder)}</td>
      <td>${p.vehicleTypes.map(v=>VEHICLE_TYPES[v]?.icon||'').join(' ')}</td>
      <td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:4px;background:var(--border-color);border-radius:4px;min-width:60px"><div style="height:100%;width:${pct}%;background:${pct>=90?'var(--danger)':'var(--accent)'};border-radius:4px"></div></div><span class="text-muted" style="font-size:11px">${p.used}/${p.usageLimit}</span></div></td>
      <td class="text-muted" style="font-size:12px">${p.startDate}<br>${p.endDate}</td>
      <td><span class="badge ${statusMap[p.status]||''}">${statusLabel[p.status]||p.status}</span></td>
      <td><div class="flex-center"><button class="btn-icon">✏️</button>${p.status==='active'?'<button class="btn-icon" style="color:var(--danger)">⛔</button>':''}</div></td>
    </tr>`;
  }).join('');
}

// ============================================
// COMMISSIONS
// ============================================
function renderCommissions() {
  document.getElementById('commission-config').innerHTML = COMMISSIONS.map(c => {
    const vt = VEHICLE_TYPES[c.vehicleType];
    const feeRate = c.rate;            // % phí dịch vụ (platform giữ)
    const driverRate = 100 - feeRate;  // % tài xế thực nhận = chiết khấu
    return `<div class="commission-card">
      <div class="commission-card-header">
        <span class="commission-card-icon">${vt?.icon||'🚗'}</span>
        <div>
          <div class="commission-card-title">${vt?.label||c.vehicleType}</div>
          <div class="commission-card-subtitle">${c.description}</div>
        </div>
      </div>
      <div class="commission-split">
        <div class="commission-split-row driver">
          <div class="commission-split-label">💸 Tài xế nhận<span class="commission-split-hint">(chiết khấu)</span></div>
          <div class="commission-split-value">${driverRate}%</div>
        </div>
        <div class="commission-split-bar"><div class="commission-split-bar-fill" style="width:${driverRate}%"></div></div>
        <div class="commission-split-row fee">
          <div class="commission-split-label">🏢 Phí dịch vụ<span class="commission-split-hint">(hệ thống giữ)</span></div>
          <div class="commission-split-value">${feeRate}%</div>
        </div>
        <div class="commission-split-example">Ví dụ chuyến 100.000đ → TX nhận <b class="text-success">${fmt(1000*driverRate)}</b>, phí <b class="text-warning">${fmt(1000*feeRate)}</b></div>
      </div>
      <button class="btn btn-outline btn-sm" style="width:100%" onclick="openCommissionEdit('${c.id}')">✏️ Chỉnh sửa</button>
    </div>`;
  }).join('');

  document.getElementById('commission-history-body').innerHTML = COMMISSION_HISTORY.map(ch => {
    const vt = VEHICLE_TYPES[ch.vehicleType];
    const b = BOOKINGS.find(x => x.id === ch.bookingId);
    const feeRate = ch.rate;
    const driverRate = 100 - feeRate;
    const driverAmount = ch.tripPrice - ch.amount; // tài xế nhận = tổng - phí
    return `<tr>
      <td class="text-muted">${ch.id}</td>
      <td><span class="text-accent fw-600">${b?b.bookingCode:ch.bookingId}</span></td>
      <td class="fw-600">${getDriverName(ch.driverId)}</td>
      <td>${vt?.icon||''} ${vt?.label||ch.vehicleType}</td>
      <td class="fw-600">${fmt(ch.tripPrice)}</td>
      <td class="fw-700 text-success">${fmt(driverAmount)} <span class="text-muted" style="font-weight:400">(${driverRate}%)</span></td>
      <td class="fw-700 text-warning">${fmt(ch.amount)} <span class="text-muted" style="font-weight:400">(${feeRate}%)</span></td>
      <td class="text-muted">${ch.createdAt}</td>
    </tr>`;
  }).join('');

  // Mặc định render tab pricing cho BIKE
  renderPricingPanel('BIKE');
}

function openCommissionEdit(id) {
  const c = COMMISSIONS.find(x => x.id === id);
  if (!c) return;
  const vt = VEHICLE_TYPES[c.vehicleType];
  document.getElementById('ce-id').value = c.id;
  document.getElementById('ce-service').innerHTML = `${vt?.icon||''} ${vt?.label||c.vehicleType}`;
  document.getElementById('ce-desc').value = c.description || '';
  const feeRate = c.rate;
  const driverRate = 100 - feeRate;
  document.getElementById('ce-driver-rate').value = driverRate;
  document.getElementById('ce-fee-rate').value = feeRate;
  updateCommissionPreview(driverRate, feeRate);
  openModal('commission-edit-modal');
}

function syncCommissionEdit(source) {
  const driverEl = document.getElementById('ce-driver-rate');
  const feeEl = document.getElementById('ce-fee-rate');
  let driver = parseInt(driverEl.value, 10);
  let fee = parseInt(feeEl.value, 10);
  if (source === 'driver') {
    if (isNaN(driver)) return;
    driver = Math.max(0, Math.min(100, driver));
    fee = 100 - driver;
    feeEl.value = fee;
  } else {
    if (isNaN(fee)) return;
    fee = Math.max(0, Math.min(100, fee));
    driver = 100 - fee;
    driverEl.value = driver;
  }
  updateCommissionPreview(driver, fee);
}

function updateCommissionPreview(driverRate, feeRate) {
  document.getElementById('ce-preview-driver').textContent = fmt(1000 * driverRate);
  document.getElementById('ce-preview-fee').textContent = fmt(1000 * feeRate);
}

function saveCommissionEdit() {
  const id = document.getElementById('ce-id').value;
  const c = COMMISSIONS.find(x => x.id === id);
  if (!c) return;
  const fee = parseInt(document.getElementById('ce-fee-rate').value, 10);
  const driver = parseInt(document.getElementById('ce-driver-rate').value, 10);
  if (isNaN(fee) || isNaN(driver) || fee + driver !== 100 || fee < 0 || fee > 100) {
    alert('Tỉ lệ không hợp lệ. Tổng "Tài xế nhận" + "Phí dịch vụ" phải bằng 100%.');
    return;
  }
  const desc = document.getElementById('ce-desc').value.trim();
  const before = { rate: c.rate, description: c.description };
  c.rate = fee;
  if (desc) c.description = desc;
  if (typeof createAuditLog === 'function') {
    createAuditLog({
      action: 'commission.update', target: c.id,
      before, after: { rate: c.rate, description: c.description }
    });
  }
  closeModal('commission-edit-modal');
  renderCommissions();
}

function switchCommissionTab(tab, btn) {
  document.querySelectorAll('#page-commissions > .tabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('#page-commissions .commissions-tab-panel').forEach(el => el.classList.remove('is-active'));
  const target = document.getElementById('commissions-tab-' + tab);
  if (target) target.classList.add('is-active');
  if (tab === 'pricing') {
    const activeSub = document.querySelector('#pricing-sub-tabs .tab-btn.active');
    renderPricingPanel(activeSub ? activeSub.dataset.ptab : 'BIKE');
  }
}

function switchPricingTab(type, btn) {
  document.querySelectorAll('#pricing-sub-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPricingPanel(type);
}

function renderPricingPanel(type) {
  const p = PRICING[type];
  if (!p) return;
  const panel = document.getElementById('pricing-panel');
  let html = '';

  const rowActions = (kind, id) => `
    <button class="btn btn-outline btn-sm" onclick="openPricingForm('${type}','${kind}','${id}')">✏️</button>
    <button class="btn btn-outline btn-sm" onclick="deletePricingRow('${type}','${kind}','${id}')">🗑️</button>`;

  // 1) Giá gốc theo dịch vụ (chỉ với SERVICE/MAINTENANCE)
  if (p.mode === 'service') {
    html += `<div class="table-container" style="margin-bottom:20px">
      <div class="table-header">
        <span class="table-title">💰 Giá mỗi dịch vụ</span>
        <div class="table-actions"><button class="btn btn-primary btn-sm" onclick="openPricingForm('${type}','services')">➕ Thêm dịch vụ</button></div>
      </div>
      <div class="table-wrapper">
        <table><thead><tr><th>Mã</th><th>Tên dịch vụ</th><th>Giá (đ)</th><th>Thao tác</th></tr></thead>
        <tbody>${p.services.map(s => `<tr>
          <td class="text-muted">${s.code}</td>
          <td class="fw-600">${s.name}</td>
          <td class="fw-700 text-success">${fmt(s.price)}</td>
          <td>${rowActions('services', s.id)}</td>
        </tr>`).join('')}</tbody></table>
      </div>
    </div>`;
  }

  // 2) Khung KM (chỉ với BIKE/CAR)
  if (p.mode === 'km') {
    html += `<div class="table-container" style="margin-bottom:20px">
      <div class="table-header">
        <span class="table-title">📏 Giá theo cây số (mở cửa + khung km tiếp theo)</span>
        <div class="table-actions"><button class="btn btn-primary btn-sm" onclick="openPricingForm('${type}','km')">➕ Thêm khung km</button></div>
      </div>
      <div class="table-wrapper">
        <table><thead><tr><th>Từ km</th><th>Đến km</th><th>Giá / km (đ)</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
        <tbody>${p.km.map(k => `<tr>
          <td class="fw-600">${k.fromKm}</td>
          <td class="fw-600">${k.toKm === null ? '∞' : k.toKm}</td>
          <td class="fw-700 text-success">${fmt(k.pricePerKm)}</td>
          <td class="text-muted">${k.note || ''}</td>
          <td>${rowActions('km', k.id)}</td>
        </tr>`).join('')}</tbody></table>
      </div>
    </div>`;
  }

  // 3) Khung giờ
  const slotTarget = p.mode === 'ticket' ? 'giá vé' : (p.mode === 'service' ? 'giá dịch vụ' : 'giá/km');
  html += `<div class="table-container" style="margin-bottom:20px">
    <div class="table-header">
      <span class="table-title">⏰ Phụ phí theo khung giờ (cộng vào ${slotTarget})</span>
      <div class="table-actions"><button class="btn btn-primary btn-sm" onclick="openPricingForm('${type}','timeSlot')">➕ Thêm khung giờ</button></div>
    </div>
    <div class="table-wrapper">
      <table><thead><tr><th>Từ</th><th>Đến</th><th>Phụ phí (đ)</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
      <tbody>${p.timeSlot.map(t => `<tr>
        <td class="fw-600">${t.from}</td>
        <td class="fw-600">${t.to}</td>
        <td class="fw-700 text-warning">+ ${fmt(t.surcharge)}</td>
        <td class="text-muted">${t.note || ''}</td>
        <td>${rowActions('timeSlot', t.id)}</td>
      </tr>`).join('')}</tbody></table>
    </div>
  </div>`;

  // 4) Thời điểm (ngày đặc biệt / cuối tuần / lễ)
  html += `<div class="table-container">
    <div class="table-header">
      <span class="table-title">📅 Phụ phí theo thời điểm (cộng vào ${slotTarget})</span>
      <div class="table-actions"><button class="btn btn-primary btn-sm" onclick="openPricingForm('${type}','period')">➕ Thêm thời điểm</button></div>
    </div>
    <div class="table-wrapper">
      <table><thead><tr><th>Tên</th><th>Loại</th><th>Khoảng thời gian</th><th>Phụ phí (đ)</th><th>Thao tác</th></tr></thead>
      <tbody>${p.period.map(pe => `<tr>
        <td class="fw-600">${pe.name}</td>
        <td>${pe.type === 'weekend' ? '🗓️ Cuối tuần' : (pe.type === 'date_range' ? '📌 Khoảng ngày' : pe.type)}</td>
        <td class="text-muted">${pe.type === 'date_range' ? (pe.from + ' → ' + pe.to) : '—'}</td>
        <td class="fw-700 text-warning">+ ${fmt(pe.surcharge)}</td>
        <td>${rowActions('period', pe.id)}</td>
      </tr>`).join('')}</tbody></table>
    </div>
  </div>`;

  panel.innerHTML = html;
}

// ===== Pricing form (Add / Edit) =====
const PRICING_KIND_META = {
  services: { title: 'dịch vụ', icon: '💰', prefix: 'SV' },
  km: { title: 'khung km', icon: '📏', prefix: 'KM' },
  timeSlot: { title: 'khung giờ', icon: '⏰', prefix: 'TS' },
  period: { title: 'thời điểm', icon: '📅', prefix: 'PR' },
};

function genPricingId(type, kind) {
  const prefix = PRICING_KIND_META[kind].prefix;
  const tcode = type.charAt(0); // B/C/I/S/M
  let n = 1;
  const arr = PRICING[type][kind] || [];
  const used = new Set(arr.map(x => x.id));
  while (used.has(`${prefix}-${tcode}${n}`)) n++;
  return `${prefix}-${tcode}${n}`;
}

function buildPricingFormBody(kind, item) {
  const v = item || {};
  if (kind === 'services') {
    return `
      <div class="input-group mb-20"><label>Mã code</label><input type="text" id="pf-code" placeholder="basic" value="${v.code||''}"></div>
      <div class="input-group mb-20"><label>Tên dịch vụ</label><input type="text" id="pf-name" placeholder="Bảo dưỡng cơ bản" value="${v.name||''}"></div>
      <div class="input-group mb-20"><label>Giá (đ)</label><input type="number" id="pf-price" min="0" step="1000" placeholder="400000" value="${v.price||''}"></div>`;
  }
  if (kind === 'km') {
    return `
      <div class="input-group mb-20"><label>Từ km</label><input type="number" id="pf-fromKm" min="0" step="0.5" placeholder="0" value="${v.fromKm??''}"></div>
      <div class="input-group mb-20"><label>Đến km (để trống = ∞)</label><input type="number" id="pf-toKm" min="0" step="0.5" placeholder="10" value="${v.toKm??''}"></div>
      <div class="input-group mb-20"><label>Giá / km (đ)</label><input type="number" id="pf-pricePerKm" min="0" step="500" placeholder="4500" value="${v.pricePerKm||''}"></div>
      <div class="input-group mb-20"><label>Ghi chú</label><input type="text" id="pf-note" placeholder="Giá mở cửa / Từ km X..." value="${v.note||''}"></div>`;
  }
  if (kind === 'timeSlot') {
    return `
      <div class="input-group mb-20"><label>Từ giờ (HH:MM)</label><input type="time" id="pf-from" value="${v.from||''}"></div>
      <div class="input-group mb-20"><label>Đến giờ (HH:MM)</label><input type="time" id="pf-to" value="${v.to||''}"></div>
      <div class="input-group mb-20"><label>Phụ phí (đ)</label><input type="number" id="pf-surcharge" min="0" step="1000" placeholder="5000" value="${v.surcharge||''}"></div>
      <div class="input-group mb-20"><label>Ghi chú</label><input type="text" id="pf-note" placeholder="Cao điểm sáng..." value="${v.note||''}"></div>`;
  }
  if (kind === 'period') {
    const isRange = v.type === 'date_range' || !v.type;
    return `
      <div class="input-group mb-20"><label>Tên</label><input type="text" id="pf-name" placeholder="Tết Nguyên Đán" value="${v.name||''}"></div>
      <div class="input-group mb-20"><label>Loại</label>
        <select id="pf-type" onchange="togglePricingPeriodRange()">
          <option value="date_range" ${v.type==='date_range'?'selected':''}>📌 Khoảng ngày</option>
          <option value="weekend" ${v.type==='weekend'?'selected':''}>🗓️ Cuối tuần</option>
        </select>
      </div>
      <div class="input-group mb-20" id="pf-range-from-wrap" style="${isRange?'':'display:none'}"><label>Từ ngày</label><input type="date" id="pf-from" value="${v.from||''}"></div>
      <div class="input-group mb-20" id="pf-range-to-wrap" style="${isRange?'':'display:none'}"><label>Đến ngày</label><input type="date" id="pf-to" value="${v.to||''}"></div>
      <div class="input-group mb-20"><label>Phụ phí (đ)</label><input type="number" id="pf-surcharge" min="0" step="1000" placeholder="20000" value="${v.surcharge||''}"></div>`;
  }
  return '';
}

function togglePricingPeriodRange() {
  const isRange = document.getElementById('pf-type').value === 'date_range';
  document.getElementById('pf-range-from-wrap').style.display = isRange ? '' : 'none';
  document.getElementById('pf-range-to-wrap').style.display = isRange ? '' : 'none';
}

function openPricingForm(type, kind, id) {
  const meta = PRICING_KIND_META[kind];
  const item = id ? PRICING[type][kind].find(x => x.id === id) : null;
  document.getElementById('pf-type-input').value = type;
  document.getElementById('pf-kind-input').value = kind;
  document.getElementById('pf-id-input').value = id || '';
  document.getElementById('pf-title').textContent = `${meta.icon} ${id ? 'Sửa' : 'Thêm'} ${meta.title} — ${PRICING[type].label}`;
  document.getElementById('pf-body').innerHTML = buildPricingFormBody(kind, item);
  openModal('pricing-form-modal');
}

function savePricingForm() {
  const type = document.getElementById('pf-type-input').value;
  const kind = document.getElementById('pf-kind-input').value;
  const id = document.getElementById('pf-id-input').value;
  const arr = PRICING[type][kind];
  const get = (k) => document.getElementById('pf-' + k);
  let payload = {};
  if (kind === 'services') {
    const code = get('code').value.trim();
    const name = get('name').value.trim();
    const price = parseInt(get('price').value, 10);
    if (!code || !name || isNaN(price) || price < 0) return alert('Nhập đủ Mã, Tên và Giá hợp lệ.');
    payload = { code, name, price };
  } else if (kind === 'km') {
    const fromKm = parseFloat(get('fromKm').value);
    const toKmRaw = get('toKm').value;
    const toKm = toKmRaw === '' ? null : parseFloat(toKmRaw);
    const pricePerKm = parseInt(get('pricePerKm').value, 10);
    if (isNaN(fromKm) || isNaN(pricePerKm) || pricePerKm < 0) return alert('Nhập đủ Từ km và Giá/km.');
    if (toKm !== null && toKm <= fromKm) return alert('Đến km phải > Từ km (hoặc để trống = ∞).');
    payload = { fromKm, toKm, pricePerKm, note: get('note').value.trim() };
  } else if (kind === 'timeSlot') {
    const from = get('from').value;
    const to = get('to').value;
    const surcharge = parseInt(get('surcharge').value, 10);
    if (!from || !to || isNaN(surcharge) || surcharge < 0) return alert('Nhập đủ Từ giờ, Đến giờ và Phụ phí.');
    payload = { from, to, surcharge, note: get('note').value.trim() };
  } else if (kind === 'period') {
    const name = get('name').value.trim();
    const ptype = get('type').value;
    const surcharge = parseInt(get('surcharge').value, 10);
    if (!name || isNaN(surcharge) || surcharge < 0) return alert('Nhập đủ Tên và Phụ phí.');
    payload = { name, type: ptype, surcharge };
    if (ptype === 'date_range') {
      const from = get('from').value;
      const to = get('to').value;
      if (!from || !to) return alert('Nhập đủ Từ ngày và Đến ngày.');
      payload.from = from; payload.to = to;
    }
  }

  if (id) {
    const idx = arr.findIndex(x => x.id === id);
    if (idx >= 0) arr[idx] = { ...arr[idx], ...payload };
  } else {
    arr.push({ id: genPricingId(type, kind), ...payload });
  }
  if (typeof createAuditLog === 'function') {
    createAuditLog({ action: 'pricing.' + (id ? 'update' : 'create'), target: `${type}.${kind}.${id || '(new)'}`, before: null, after: payload });
  }
  closeModal('pricing-form-modal');
  renderPricingPanel(type);
}

function deletePricingRow(type, kind, id) {
  const arr = PRICING[type][kind];
  const idx = arr.findIndex(x => x.id === id);
  if (idx < 0) return;
  const item = arr[idx];
  const label = item.name || item.code || item.note || id;
  if (!confirm(`Xoá "${label}" khỏi ${PRICING_KIND_META[kind].title} của ${PRICING[type].label}?`)) return;
  arr.splice(idx, 1);
  if (typeof createAuditLog === 'function') {
    createAuditLog({ action: 'pricing.delete', target: `${type}.${kind}.${id}`, before: item, after: null });
  }
  renderPricingPanel(type);
}

// ============================================
// NOTIFICATIONS
// ============================================
function renderNotifications() {
  const delivered = NOTIFICATIONS.filter(n => n.status === 'delivered').length;
  const failed = NOTIFICATIONS.filter(n => n.status === 'failed').length;
  const pending = NOTIFICATIONS.filter(n => n.status === 'pending').length;
  document.getElementById('notification-stats').innerHTML = `
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon accent">🔔</div><span class="stat-card-label">Tổng</span></div><div class="stat-card-value">${NOTIFICATIONS.length}</div></div>
    <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">✅</div><span class="stat-card-label">Delivered</span></div><div class="stat-card-value">${delivered}</div></div>
    <div class="stat-card danger"><div class="stat-card-header"><div class="stat-card-icon danger">❌</div><span class="stat-card-label">Failed</span></div><div class="stat-card-value">${failed}</div></div>
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">⏳</div><span class="stat-card-label">Pending</span></div><div class="stat-card-value">${pending}</div></div>
  `;
  const typeLabels = { booking_created: '📋 Booking tạo', payment_confirmed: '💳 Payment OK', driver_assigned: '👤 Gán TX', trip_completed: '🏁 Hoàn thành', booking_cancelled: '❌ Hủy', refund_completed: '↩️ Hoàn tiền' };
  const statusBadges = { delivered: 'badge-completed', failed: 'badge-cancelled', pending: 'badge-pending' };

  document.getElementById('notifications-table-body').innerHTML = NOTIFICATIONS.map(n => `<tr>
    <td class="text-muted">${n.id}</td>
    <td>${typeLabels[n.type]||n.type}</td>
    <td><span class="badge badge-accepted">${n.channel.toUpperCase()}</span></td>
    <td class="fw-600">${n.recipient}</td>
    <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.content}</td>
    <td><span class="badge ${statusBadges[n.status]||'badge-expired'}">${n.status}${n.retryCount?' (retry:'+n.retryCount+')':''}</span></td>
    <td class="text-muted">${n.createdAt}</td>
  </tr>`).join('');
}

// ============================================
// AUDIT LOGS
// ============================================
function renderAudit() {
  let logs = [...AUDIT_LOGS];
  const af = document.getElementById('audit-action-filter')?.value;
  if (af) logs = logs.filter(l => l.action.startsWith(af));
  const search = document.getElementById('audit-search')?.value?.toLowerCase();
  if (search) logs = logs.filter(l => l.traceId.toLowerCase().includes(search) || l.target.toLowerCase().includes(search) || l.action.toLowerCase().includes(search));

  const actionColors = { 'booking': 'badge-accepted', 'payment': 'badge-completed', 'fulfillment': 'badge-picking', 'refund': 'badge-pending', 'wallet': 'badge-progress', 'user': 'badge-cancelled' };

  document.getElementById('audit-table-body').innerHTML = logs.map(l => {
    const actionType = l.action.split('.')[0];
    return `<tr>
      <td class="text-muted" style="font-size:12px">${l.timestamp}</td>
      <td><span class="badge ${actionColors[actionType]||'badge-expired'}">${l.action}</span></td>
      <td class="fw-600">${getUserName(l.actor)}</td>
      <td><span class="badge badge-expired">${l.actorRole}</span></td>
      <td><span class="text-accent fw-600">${l.target}</span></td>
      <td>${l.sourceSite}</td>
      <td style="font-family:monospace;font-size:11px;color:var(--text-muted)">${l.traceId}</td>
      <td style="font-size:11px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${l.before ? `<span class="text-danger">${l.before}</span> → ` : ''}
        <span class="text-success">${l.after||''}</span>
      </td>
    </tr>`;
  }).join('');
}

// ============================================
// SYSTEM MONITORING
// ============================================
function renderMonitoring() {
  const healthy = SYSTEM_SERVICES.filter(s => s.status === 'healthy').length;
  const warning = SYSTEM_SERVICES.filter(s => s.status === 'warning').length;
  document.getElementById('monitoring-stats').innerHTML = `
    <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">💚</div><span class="stat-card-label">Healthy</span></div><div class="stat-card-value">${healthy}</div></div>
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">⚠️</div><span class="stat-card-label">Warning</span></div><div class="stat-card-value">${warning}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon accent">🖥️</div><span class="stat-card-label">Tổng Services</span></div><div class="stat-card-value">${SYSTEM_SERVICES.length}</div></div>
  `;

  document.getElementById('services-table-body').innerHTML = SYSTEM_SERVICES.map(s => {
    const color = s.status === 'healthy' ? 'var(--success)' : 'var(--warning)';
    return `<tr>
      <td class="fw-600"><div class="flex-center"><span style="width:10px;height:10px;border-radius:50%;background:${color}"></span>${s.name}</div></td>
      <td><span class="badge ${s.status==='healthy'?'badge-completed':'badge-pending'}">${s.status.toUpperCase()}</span></td>
      <td class="fw-600 text-success">${s.uptime}</td>
      <td>${s.latency}</td>
      <td class="${parseFloat(s.errorRate)>0?'text-warning':'text-success'}">${s.errorRate}</td>
    </tr>`;
  }).join('');
}

// ============================================
// BADGES
// ============================================
function updateBadges() {
  const pending = BOOKINGS.filter(b => b.bookingStatus === 'PENDING_CONFIRMATION').length;
  const el1 = document.getElementById('pending-badge');
  const el2 = document.getElementById('fulfillment-badge');
  const el3 = document.getElementById('refund-badge');
  if (el1) { el1.textContent = pending; el1.style.display = pending > 0 ? '' : 'none'; }
  if (el2) { el2.textContent = pending; el2.style.display = pending > 0 ? '' : 'none'; }
  const refPending = REFUNDS.filter(r => r.status === 'PENDING').length;
  if (el3) { el3.textContent = refPending; el3.style.display = refPending > 0 ? '' : 'none'; }
}

// ============================================
// INIT
// ============================================
function init() {
  // Heal & sync derived state trước khi render
  healData();

  // Initialize role
  switchRole('ADMIN');

  // Update badges
  updateBadges();

  // Handle responsive
  const mq = window.matchMedia('(max-width: 768px)');
  function handleResize(e) { document.getElementById('menu-toggle').style.display = e.matches ? 'flex' : 'none'; }
  mq.addEventListener('change', handleResize);
  handleResize(mq);
}
document.addEventListener('DOMContentLoaded', init);

// ============================================
// KPI & SLA RENDERING
// ============================================
function renderKPI() {
  const kpiHTML = Object.entries(KPI_TARGETS).map(([key, kpi]) => {
    let progress = (kpi.current / kpi.target) * 100;
    let status = 'success';
    if (key === 'digitizationRate' || key === 'paymentSuccessRate' || key === 'portalAvailability' || key === 'auditCoverage') {
      if (progress < 100) status = 'warning';
      if (progress < 95) status = 'danger';
    } else {
      // For time-based KPIs, lower is better
      if (progress > 100) status = 'danger';
      if (progress > 90 && progress <= 100) status = 'warning';
    }
    const displayValue = kpi.isTime ? formatTime(kpi.current) : kpi.current + kpi.unit;
    return `
      <div class="kpi-card ${status}">
        <div class="kpi-label">${kpi.label}</div>
        <div class="kpi-value">${displayValue}</div>
        <div class="kpi-target">Target: ${kpi.isTime ? formatTime(kpi.target) : kpi.target + kpi.unit}</div>
        <div class="kpi-progress">
          <div class="kpi-progress-bar ${status}" style="width: ${Math.min(progress, 100)}%"></div>
        </div>
      </div>
    `;
  }).join('');
  return kpiHTML;
}

function formatTime(seconds) {
  if (seconds < 60) return seconds + 's';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
  return Math.floor(seconds / 3600) + 'h ' + Math.floor((seconds % 3600) / 60) + 'm';
}

function renderSLA() {
  return SLA_METRICS.map(sla => {
    const status = SLA_STATUS[sla.status];
    return `
      <tr>
        <td><span class="text-accent fw-600">${sla.id}</span></td>
        <td class="fw-600">${sla.name}</td>
        <td><span class="badge badge-pending" style="background: ${status.color}20; color: ${status.color}">${status.icon} ${status.label}</span></td>
        <td>${sla.target}</td>
        <td>${sla.current}</td>
        <td>${sla.avg}</td>
        <td>${sla.passed}/${sla.total}</td>
        <td class="${sla.failed > 0 ? 'text-danger' : 'text-success'}">${sla.failed}</td>
      </tr>
    `;
  }).join('');
}

function renderBookingStateMachine(currentStatus) {
  const statusOrder = ['DRAFT', 'SEARCHED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
  const currentIdx = statusOrder.indexOf(currentStatus);

  return BOOKING_STATE_MACHINE.map((state, idx) => {
    let stepClass = '';
    if (currentStatus === 'CANCELLED' || currentStatus === 'RESCHEDULE_REQUESTED') {
      if (idx < currentIdx) stepClass = 'completed';
    } else {
      if (idx < currentIdx) stepClass = 'completed';
      if (idx === currentIdx) stepClass = 'active';
    }

    return `
      <div class="state-step ${stepClass}">
        <div class="state-icon">${state.icon}</div>
        <div class="state-label">${state.label}</div>
      </div>
      ${idx < BOOKING_STATE_MACHINE.length - 1 ? `<div class="state-connector ${stepClass}"></div>` : ''}
    `;
  }).join('');
}

// ============================================
// AGENT SITE PAGES
// ============================================
function renderAgentDashboard() {
  document.getElementById('dashboard-stats').innerHTML = `
    <div class="stat-card accent"><div class="stat-card-header"><div class="stat-card-icon accent">📋</div><span class="stat-card-label">Bookings hôm nay</span></div><div class="stat-card-value">${AGENTS[0].todayBookings}</div><div class="stat-card-sub">+20% so với hôm qua</div></div>
    <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">💰</div><span class="stat-card-label">Doanh thu hôm nay</span></div><div class="stat-card-value">${fmt(AGENTS[0].todayRevenue)}</div><div class="stat-card-sub">+15% so với hôm qua</div></div>
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">👥</div><span class="stat-card-label">Khách hàng mới</span></div><div class="stat-card-value">3</div><div class="stat-card-sub">Tuần này</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon info">💳</div><span class="stat-card-label">Số dư ví</span></div><div class="stat-card-value">${fmt(AGENTS[0].walletBalance)}</div><div class="stat-card-sub">Sẵn sàng rút</div></div>
  `;

  // Recent Agent Bookings
  const recent = [...BOOKINGS].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,6);
  document.getElementById('recent-bookings').innerHTML = recent.map(b => {
    const vt = VEHICLE_TYPES[b.bookingType];
    return `<div class="recent-trip-item" onclick="showBookingDetail('${b.id}')">
      <span class="recent-trip-icon">${vt?.icon||'🚗'}</span>
      <div class="recent-trip-info"><div class="route">${b.pickup} → ${b.dropoff}</div><div class="meta">${b.bookingCode} · ${getCustomerName(b.customerId)}</div></div>
      ${statusBadge(BOOKING_STATUSES, b.bookingStatus)}
    </div>`;
  }).join('');

  // Mini chart
  const max = Math.max(...DASHBOARD_STATS.hourlyTrips, 1);
  document.getElementById('hourly-chart').innerHTML = DASHBOARD_STATS.hourlyTrips.map(v => `<div class="mini-chart-bar" style="height:${Math.max((v/max)*100,2)}%" data-value="${v}"></div>`).join('');
  document.getElementById('hourly-labels').innerHTML = DASHBOARD_STATS.hourlyTrips.map((_,i) => `<span>${String(i).padStart(2,'0')}</span>`).join('');
}

// ---- Locations dropdown ----
function getLocation(id) { return LOCATIONS.find(l => l.id === id); }

// Hiển thị label đầy đủ cho 1 location:
// - city (TP trực thuộc TW) → "TP.HCM"
// - district → "Tỉnh - Huyện" (vd: "Lâm Đồng - Đà Lạt")
function locationLabel(loc) {
  if (!loc) return '';
  if (loc.type === 'city' || !loc.parentId) return loc.name;
  const parent = getLocation(loc.parentId);
  return parent ? `${parent.name} - ${loc.name}` : loc.name;
}

// Build options cho <select> theo cây tỉnh-huyện.
// TP trực thuộc TW → option phẳng. Tỉnh → optgroup chứa các huyện.
function buildLocationOptions(locIds, includeBlank = true) {
  const ids = Array.from(new Set(locIds)).filter(Boolean);
  const items = ids.map(id => getLocation(id)).filter(Boolean);

  // Tách: TPs (parentId=null, type=city) vs Districts (có parentId)
  const cities = items.filter(l => l.type === 'city' && !l.parentId);
  const districts = items.filter(l => l.parentId);

  // Group districts theo parent (tỉnh)
  const districtsByProv = {};
  districts.forEach(d => {
    (districtsByProv[d.parentId] = districtsByProv[d.parentId] || []).push(d);
  });

  let html = includeBlank ? '<option value="">-- Chọn --</option>' : '';

  // Cities trước
  cities
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .forEach(c => { html += `<option value="${c.id}">${c.name}</option>`; });

  // Sau đó các tỉnh có district (sort theo tên tỉnh)
  Object.keys(districtsByProv)
    .sort((a, b) => {
      const pa = getLocation(a)?.name || a;
      const pb = getLocation(b)?.name || b;
      return pa.localeCompare(pb, 'vi');
    })
    .forEach(provId => {
      const prov = getLocation(provId);
      const locs = districtsByProv[provId].slice().sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      html += `<optgroup label="${prov?.name || provId}">`;
      locs.forEach(l => { html += `<option value="${l.id}">${l.name}</option>`; });
      html += '</optgroup>';
    });
  return html;
}

function populateIntercityLocations() {
  const originSel = document.getElementById('intercity-origin');
  const destSel = document.getElementById('intercity-destination');
  if (!originSel || !destSel) return;
  // Origins: lấy từ INTERCITY_ROUTES.originId; Destinations: từ destinationId
  originSel.innerHTML = buildLocationOptions(INTERCITY_ROUTES.map(r => r.originId));
  destSel.innerHTML = buildLocationOptions(INTERCITY_ROUTES.map(r => r.destinationId));
}

function renderBookingTabs() {
  // Tab nằm trong #page-intercity, không phải #page-bookings
  const activeTab = document.querySelector('#page-intercity .tab-btn.active');
  if (!activeTab) {
    document.querySelector('#page-intercity .tab-btn[data-tab="intercity"]')?.classList.add('active');
    document.getElementById('booking-tab-intercity').style.display = 'block';
    document.getElementById('booking-tab-registration').style.display = 'none';
    const mntEl = document.getElementById('booking-tab-maintenance');
    if (mntEl) mntEl.style.display = 'none';
  }
  populateIntercityLocations();
  populateTripCreateOptions();
  renderIntercityBooking();
  renderRegistrations();
  renderMaintenance();
}

function populateTripCreateOptions() {
  // Populate route dropdown
  const routeSelect = document.getElementById('trip-route');
  if (routeSelect && routeSelect.options.length <= 1) {
    INTERCITY_ROUTES.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.origin} → ${r.destination}`;
      routeSelect.appendChild(opt);
    });
  }

  // Populate operator dropdown
  const opSelect = document.getElementById('trip-operator');
  if (opSelect && opSelect.options.length <= 1) {
    PARTNERS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      opSelect.appendChild(opt);
    });
  }
}

function createIntercityTrip() {
  const routeId = document.getElementById('trip-route').value;
  const operatorId = document.getElementById('trip-operator').value;
  const date = document.getElementById('trip-date').value;
  const departureTime = document.getElementById('trip-departure-time').value;
  const arrivalTime = document.getElementById('trip-arrival-time').value;
  const vehicleType = document.getElementById('trip-vehicle-type').value;
  const price = parseInt(document.getElementById('trip-price').value);
  const seatsTotal = parseInt(document.getElementById('trip-seats').value);

  if (!routeId || !operatorId || !date || !departureTime || !arrivalTime || !price || !seatsTotal) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc');
    return;
  }

  const operator = PARTNERS.find(p => p.id === operatorId);

  // Calculate duration
  const depH = parseInt(departureTime.split(':')[0]);
  const arrH = parseInt(arrivalTime.split(':')[0]);
  const durationHours = arrH >= depH ? arrH - depH : (24 - depH) + arrH;

  const newTrip = {
    id: 'TRP' + String(INTERCITY_TRIPS.length + 1).padStart(3, '0'),
    routeId,
    operatorId,
    operatorName: operator?.name || 'Nhà xe mới',
    departureTime,
    arrivalTime,
    duration: durationHours + 'h',
    vehicleType,
    price,
    seatsTotal,
    seatsAvailable: seatsTotal,
    status: 'available',
    date
  };

  INTERCITY_TRIPS.unshift(newTrip);
  closeModal('trip-create-modal');
  renderIntercityBooking();
  alert('Tạo chuyến xe thành công!');
}

// Card chuyến xe dùng chung cho mọi danh sách (mặc định / tìm kiếm / xem tất cả)
function intercityTripCardHTML(t) {
  const route = INTERCITY_ROUTES.find(r => r.id === t.routeId);
  const sold = t.seatsTotal - t.seatsAvailable;
  const percent = Math.round((sold / t.seatsTotal) * 100);
  const textColor = percent >= 90 ? 'var(--danger)' : percent >= 70 ? 'var(--warning)' : 'var(--success)';
  const isFull = t.seatsAvailable <= 0;
  return `
    <div class="trip-card" onclick="showTripDetail('${t.id}')" style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-weight:600;font-size:14px;color:var(--text-primary)">${route?.origin || '—'} → ${route?.destination || '—'}</div>
          <div style="font-size:12px;color:var(--text-muted)">${t.operatorName}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;font-size:15px;color:var(--success)">${fmt(t.price)}</div>
          <div style="font-size:11px;color:var(--text-muted)">/khách</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div><div style="font-size:11px;color:var(--text-muted)">🕐 Giờ chạy</div><div style="font-weight:600;font-size:13px">${t.departureTime} - ${t.arrivalTime}</div></div>
        <div><div style="font-size:11px;color:var(--text-muted)">📅 Ngày chạy</div><div style="font-weight:600;font-size:13px">${t.date}</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:12px;padding:2px 8px;background:var(--accent-glow);color:var(--accent);border-radius:4px">${t.vehicleType}</span>
        <span style="font-size:12px;color:var(--text-muted)">${t.seatsAvailable} chỗ trống</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:6px;background:var(--border-color);border-radius:3px">
          <div style="height:100%;width:${percent}%;background:${textColor};border-radius:3px"></div>
        </div>
        <span style="font-size:11px;color:${textColor};font-weight:600">${sold}/${t.seatsTotal}</span>
      </div>
      ${isFull ? '<div style="color:var(--danger);font-weight:600;margin-top:8px;font-size:12px">⚠️ Hết vé</div>' : ''}
    </div>
  `;
}

function renderIntercityTripGrid(trips, emptyText) {
  const el = document.getElementById('intercity-results');
  if (!el) return;
  if (!trips.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🚌</div><div class="empty-state-text">${emptyText}</div></div>`;
    return;
  }
  el.innerHTML = '<div class="trip-grid">' + trips.map(intercityTripCardHTML).join('') + '</div>';
}

function renderIntercityBooking() {
  // Mặc định: hiển thị chuyến từ origin được chọn (hoặc HCM)
  const originId = document.getElementById('intercity-origin')?.value || 'HCM';
  const originLoc = getLocation(originId);
  const trips = INTERCITY_TRIPS.filter(t => {
    const route = INTERCITY_ROUTES.find(r => r.id === t.routeId);
    return route && route.originId === originId && t.status === 'available';
  });
  renderIntercityTripGrid(trips, `Chưa có chuyến nào từ ${originLoc ? locationLabel(originLoc) : originId}`);
}

// ---- Tab Switching ----
function switchBookingTab(tab, btn) {
  document.querySelectorAll('#page-intercity .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('booking-tab-intercity').style.display = tab === 'intercity' ? 'block' : 'none';
  document.getElementById('booking-tab-registration').style.display = tab === 'registration' ? 'block' : 'none';
  const mntEl = document.getElementById('booking-tab-maintenance');
  if (mntEl) mntEl.style.display = tab === 'maintenance' ? 'block' : 'none';
  if (tab === 'intercity') renderIntercityBooking();
  if (tab === 'registration') renderRegistrations();
  if (tab === 'maintenance') renderMaintenance();
}

// ---- REGISTRATIONS ----
let selectedRegId = null;
let selectedMntId = null;

const REG_SERVICE_LABELS = { normal: 'Đăng kiểm thường', express: 'Đăng kiểm nhanh', home: 'Đăng kiểm tại nhà' };
const MNT_SERVICE_LABELS = { basic: 'Bảo dưỡng cơ bản', full: 'Bảo dưỡng toàn diện', oil_change: 'Thay nhớt', tire: 'Lốp & cân chỉnh' };
const ORDER_ENGINE_LABELS = { gasoline: '⛽ Xăng', electric: '🔋 Điện', diesel: '🛢️ Dầu', hybrid: '⚡ Hybrid' };
const ORDER_STATUS_LABELS = {
  pending: { label: 'Chờ xác nhận', class: 'badge-pending' },
  confirmed: { label: 'Đã xác nhận', class: 'badge-active' },
  completed: { label: 'Hoàn thành', class: 'badge-success' },
  cancelled: { label: 'Đã hủy', class: 'badge-cancelled' }
};

function orderDetailEmpty(icon, text) {
  return `<div class="odp-empty"><div class="odp-empty-icon">${icon}</div>${text}</div>`;
}

// URL mã QR (dùng dịch vụ ảnh QR; data là chuỗi tra cứu đơn)
function qrUrl(data, size = 120) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${encodeURIComponent(data)}`;
}

function orderQrData(o, kind) {
  const type = kind === 'reg' ? 'DANGKIEM' : 'BAODUONG';
  return `HAHAGO|${type}|${o.id}|${o.plate}|${o.ownerName}|${o.bookingDate} ${o.bookingTime}|${o.price}`;
}

function orderDetailHTML(o, kind) {
  const isReg = kind === 'reg';
  const serviceLabel = (isReg ? REG_SERVICE_LABELS : MNT_SERVICE_LABELS)[o.service] || o.service;
  const st = ORDER_STATUS_LABELS[o.status] || { label: o.status, class: '' };
  const fn = isReg ? 'Registration' : 'Maintenance';
  return `
    <div class="odp-head">
      <span class="odp-title">${isReg ? '📋' : '🔧'} ${o.id}</span>
      <span class="badge ${st.class}">${st.label}</span>
    </div>
    <div class="odp-body">
      <div class="odp-grid">
        <div class="odp-cell"><div class="odp-label">Biển số</div><div class="odp-value">${esc(o.plate)}</div></div>
        <div class="odp-cell"><div class="odp-label">Động cơ</div><div class="odp-value">${ORDER_ENGINE_LABELS[o.engineType] || '—'}</div></div>
        <div class="odp-cell"><div class="odp-label">Chủ xe</div><div class="odp-value">${esc(o.ownerName)}</div></div>
        <div class="odp-cell"><div class="odp-label">SĐT</div><div class="odp-value">${esc(o.ownerPhone)}</div></div>
        <div class="odp-cell odp-span"><div class="odp-label">Địa chỉ nhận xe</div><div class="odp-value">${esc(o.pickupAddress || o.centerName || '—')}</div></div>
        <div class="odp-cell"><div class="odp-label">Lịch hẹn</div><div class="odp-value">${o.bookingDate} ${o.bookingTime}</div></div>
        <div class="odp-cell"><div class="odp-label">Dịch vụ</div><div class="odp-value">${serviceLabel}</div></div>
        <div class="odp-cell"><div class="odp-label">Giá</div><div class="odp-value text-success">${fmt(o.price)}</div></div>
        ${isReg && o.expireDate ? `<div class="odp-cell"><div class="odp-label">Hết hạn ĐK</div><div class="odp-value">${o.expireDate}</div></div>` : ''}
        ${!isReg && o.mileage ? `<div class="odp-cell"><div class="odp-label">Số km</div><div class="odp-value">${esc(o.mileage)}</div></div>` : ''}
        ${o.bookingId ? `<div class="odp-cell"><div class="odp-label">Booking</div><div class="odp-value">${o.bookingId}</div></div>` : ''}
        ${o.notes ? `<div class="odp-cell odp-span"><div class="odp-label">Ghi chú</div><div class="odp-value">${esc(o.notes)}</div></div>` : ''}
      </div>
      <div class="odp-qr">
        <img src="${qrUrl(orderQrData(o, kind), 120)}" alt="QR ${o.id}" width="120" height="120" loading="lazy">
        <div class="odp-qr-cap">Quét QR tra cứu đơn</div>
      </div>
    </div>
    <div class="odp-actions">
      ${o.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="confirm${fn}('${o.id}')">✓ Xác nhận</button>` : ''}
      <button class="btn btn-sm btn-outline" onclick="exportOrderTicket('${kind}','${o.id}', false)">🖨️ Xuất vé</button>
      <button class="btn btn-sm btn-outline" onclick="exportOrderTicket('${kind}','${o.id}', true)">📥 Tải PDF</button>
    </div>
  `;
}

function renderRegistrationDetail(id) {
  const pane = document.getElementById('registration-detail');
  if (!pane) return;
  const o = id ? REGISTRATIONS.find(x => x.id === id) : null;
  pane.innerHTML = o ? orderDetailHTML(o, 'reg')
    : orderDetailEmpty('📋', 'Chọn một đơn ở danh sách bên dưới để xem chi tiết');
}

function renderMaintenanceDetail(id) {
  const pane = document.getElementById('maintenance-detail');
  if (!pane) return;
  const o = id ? MAINTENANCE.find(x => x.id === id) : null;
  pane.innerHTML = o ? orderDetailHTML(o, 'mnt')
    : orderDetailEmpty('🔧', 'Chọn một đơn ở danh sách bên dưới để xem chi tiết');
}

function selectRegistration(id) {
  selectedRegId = id;
  renderRegistrations();
}

function selectMaintenance(id) {
  selectedMntId = id;
  renderMaintenance();
}

function exportOrderTicket(kind, id, autoPrint) {
  const isReg = kind === 'reg';
  const o = (isReg ? REGISTRATIONS : MAINTENANCE).find(x => x.id === id);
  if (!o) return;
  const serviceLabel = (isReg ? REG_SERVICE_LABELS : MNT_SERVICE_LABELS)[o.service] || o.service;
  const engineLabel = (ORDER_ENGINE_LABELS[o.engineType] || '—').replace(/[^\p{L} ]/gu, '').trim() || '—';
  const title = isReg ? 'PHIẾU ĐĂNG KIỂM HỘ' : 'PHIẾU BẢO DƯỠNG HỘ';
  const row = (l, v) => `<tr><td class="l">${esc(l)}</td><td class="v">${esc(v)}</td></tr>`;
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${o.id}</title>
    <style>
      *{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;box-sizing:border-box}
      body{margin:0;padding:28px;color:#1a1a2e}
      .ticket{max-width:520px;margin:0 auto;border:2px solid #2d2d44;border-radius:12px;padding:24px}
      .brand{font-size:13px;letter-spacing:1px;color:#6b7280}
      h1{font-size:18px;margin:4px 0 2px}
      .code{font-size:13px;color:#6b7280;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      td{padding:7px 4px;border-bottom:1px dashed #e2e2ec;font-size:14px;vertical-align:top}
      td.l{color:#6b7280;width:42%}
      td.v{font-weight:600;text-align:right}
      .total{margin-top:14px;display:flex;justify-content:space-between;font-size:16px;font-weight:700}
      .qr{margin-top:18px;text-align:center}
      .qr img{width:140px;height:140px}
      .qr .cap{font-size:11px;color:#9ca3af;margin-top:6px}
      .foot{margin-top:18px;font-size:11px;color:#9ca3af;text-align:center}
    </style></head><body>
    <div class="ticket">
      <div class="brand">RIDEOPS · DỊCH VỤ XE</div>
      <h1>${title}</h1>
      <div class="code">Mã đơn: ${o.id}${o.bookingId ? ' · Booking: ' + o.bookingId : ''}</div>
      <table>
        ${row('Biển số xe', o.plate)}
        ${row('Chủ xe', o.ownerName)}
        ${row('Số điện thoại', o.ownerPhone)}
        ${row('Loại động cơ', engineLabel)}
        ${row('Địa chỉ nhận xe', o.pickupAddress || o.centerName || '—')}
        ${row('Lịch hẹn', o.bookingDate + ' ' + o.bookingTime)}
        ${row('Dịch vụ', serviceLabel)}
        ${row('Trạng thái', (ORDER_STATUS_LABELS[o.status]?.label) || o.status)}
      </table>
      <div class="total"><span>Tổng tiền</span><span>${fmt(o.price)}</span></div>
      <div class="qr">
        <img src="${qrUrl(orderQrData(o, kind), 140)}" alt="QR ${o.id}">
        <div class="cap">Quét mã QR để tra cứu đơn ${o.id}</div>
      </div>
      <div class="foot">Phiếu in lúc ${nowStr()} · Cảm ơn quý khách</div>
    </div>
    ${autoPrint ? '<script>window.onload=function(){window.print()}<\/script>' : ''}
    </body></html>`;
  const w = window.open('', '_blank', 'width=560,height=720');
  if (!w) { alert('Trình duyệt chặn cửa sổ. Vui lòng cho phép pop-up để xuất vé.'); return; }
  w.document.write(html);
  w.document.close();
}

function openRegistrationCreate() {
  clearRegistrationForm();
  openModal('registration-create-modal');
}

function renderRegistrations() {
  const search = document.getElementById('registration-search')?.value?.toLowerCase() || '';
  const statusFilter = document.getElementById('registration-status-filter')?.value || '';
  let regs = REGISTRATIONS.filter(r =>
    (r.plate.toLowerCase().includes(search) ||
     r.ownerName.toLowerCase().includes(search) ||
     r.ownerPhone.includes(search)) &&
    (statusFilter ? r.status === statusFilter : true)
  );

  const statusMap = {
    pending: { label: 'Chờ xác nhận', class: 'badge-pending' },
    confirmed: { label: 'Đã xác nhận', class: 'badge-active' },
    completed: { label: 'Hoàn thành', class: 'badge-success' },
    cancelled: { label: 'Đã hủy', class: 'badge-cancelled' }
  };
  const serviceLabels = { normal: 'Thường', express: 'Nhanh', home: 'Tại nhà' };
  const engineLabels = { gasoline: '⛽ Xăng', electric: '🔋 Điện', diesel: '🛢️ Dầu', hybrid: '⚡ Hybrid' };

  document.getElementById('registrations-table-body').innerHTML = regs.map(r => `
    <tr class="row-clickable ${selectedRegId === r.id ? 'row-selected' : ''}" onclick="selectRegistration('${r.id}')">
      <td><span class="text-accent fw-600">${r.id}</span></td>
      <td><span class="fw-600">${esc(r.plate)}</span></td>
      <td>${esc(r.ownerName)}</td>
      <td>${esc(r.ownerPhone)}</td>
      <td>${esc(r.pickupAddress || r.centerName || '—')}</td>
      <td>${engineLabels[r.engineType] || '—'}</td>
      <td>${r.bookingDate} ${r.bookingTime}</td>
      <td>${serviceLabels[r.service]}</td>
      <td class="fw-600 text-success">${fmt(r.price)}</td>
      <td><span class="badge ${statusMap[r.status]?.class || ''}">${statusMap[r.status]?.label || r.status}</span></td>
      <td>
        ${r.status === 'pending' ? `<button class="btn btn-sm btn-primary" title="Xác nhận" onclick="event.stopPropagation();confirmRegistration('${r.id}')">✓</button>` : ''}
      </td>
    </tr>
  `).join('') || `<tr><td colspan="11"><div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Không tìm thấy đơn đăng kiểm</div></div></td></tr>`;
  renderRegistrationDetail(selectedRegId);
}

function createRegistrationOrder() {
  const plate = document.getElementById('reg-plate').value.trim();
  const ownerName = document.getElementById('reg-owner-name').value.trim();
  const ownerPhone = document.getElementById('reg-owner-phone').value.trim();
  const pickupAddress = document.getElementById('reg-pickup-address').value.trim();
  const engineType = document.getElementById('reg-engine-type').value;
  const bookingDate = document.getElementById('reg-booking-date').value;
  const bookingTime = document.getElementById('reg-booking-time').value;
  const service = document.getElementById('reg-service').value;
  const expireDate = document.getElementById('reg-expire-date')?.value || '';
  const notes = document.getElementById('reg-notes')?.value.trim() || '';

  if (!plate || !ownerName || !ownerPhone || !pickupAddress || !engineType || !bookingDate || !bookingTime) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc (gồm Địa chỉ nhận xe và Loại động cơ)');
    return;
  }

  const servicePrices = { normal: 350000, express: 500000, home: 700000 };

  const traceId = newTraceId();
  const newReg = {
    id: genId('REG', REGISTRATIONS),
    plate, ownerName, ownerPhone,
    vehicleType: document.getElementById('reg-vehicle-type').value,
    engineType,
    pickupAddress,
    bookingDate, bookingTime, service,
    expireDate, notes,
    price: servicePrices[service],
    status: 'pending',
    createdAt: nowStr(),
    bookingId: null
  };
  REGISTRATIONS.unshift(newReg);

  // Tìm hoặc tạo khách
  let cust = CUSTOMERS.find(c => c.phone === ownerPhone);
  if (!cust) {
    cust = {
      id: 'KH' + String(CUSTOMERS.length + 1).padStart(3, '0'),
      name: ownerName, phone: ownerPhone, email: '',
      totalBookings: 1, status: 'active'
    };
    CUSTOMERS.push(cust);
    ensureWallet(cust.id, cust.name, 'CUSTOMER');
  }

  // Tạo booking SERVICE_ORDER liên kết với reg
  const booking = {
    id: genId('BK', BOOKINGS),
    bookingCode: 'RO-SVC-' + newReg.id,
    bookingType: 'SERVICE_ORDER',
    bookingStatus: 'PENDING_CONFIRMATION',
    paymentStatus: 'PENDING',
    fulfillmentStatus: null,
    customerId: cust.id, agentId: currentUser?.id || null,
    driverId: null,
    pickup: pickupAddress, dropoff: pickupAddress,
    fareSnapshot: servicePrices[service], distance: 0,
    paymentMethod: 'cash',  // đăng kiểm thường thu khi hoàn tất
    paymentReference: null,
    fulfillmentTaskId: null,
    serviceOrderId: newReg.id,
    createdAt: nowStr(), updatedAt: nowStr()
  };
  BOOKINGS.push(booking);
  newReg.bookingId = booking.id;

  createAuditLog({
    action: 'booking.create', target: booking.id, traceId,
    before: null, after: { type: 'SERVICE_ORDER', regId: newReg.id, fare: booking.fareSnapshot }
  });
  createNotification({
    type: 'booking_created', recipient: cust.id,
    content: `Đơn đăng kiểm ${newReg.id} đã tạo, lịch hẹn ${bookingDate} ${bookingTime} — nhận xe tại ${pickupAddress}`
  });

  // Cash → auto CONFIRMED
  const pay = processPayment(booking, traceId);
  if (pay.success) {
    booking.bookingStatus = 'CONFIRMED';
    booking.fulfillmentStatus = 'PENDING';
  }

  clearRegistrationForm();
  selectedRegId = newReg.id;
  renderRegistrations();
  updateBadges();
  alert('Tạo đơn đăng kiểm thành công!\nMã đơn: ' + newReg.id + '\nBooking: ' + booking.bookingCode);
}

function clearRegistrationForm() {
  ['reg-plate','reg-owner-name','reg-owner-phone','reg-pickup-address','reg-booking-date','reg-expire-date','reg-notes'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('reg-engine-type', 'gasoline');
  set('reg-vehicle-type', 'car');
  set('reg-service', 'normal');
  set('reg-booking-time', '07:00');
}

function confirmRegistration(id) {
  const r = REGISTRATIONS.find(x => x.id === id);
  if (!r) return;
  r.status = 'confirmed';
  // Đồng bộ booking liên kết
  if (r.bookingId) {
    const b = BOOKINGS.find(x => x.id === r.bookingId);
    if (b && b.bookingStatus === 'PENDING_CONFIRMATION') {
      const traceId = newTraceId();
      const before = { status: b.bookingStatus };
      b.bookingStatus = 'CONFIRMED';
      b.fulfillmentStatus = b.fulfillmentStatus || 'PENDING';
      b.updatedAt = nowStr();
      // Cash: payment cũng coi như đã ok
      if (b.paymentMethod === 'cash' && b.paymentStatus !== 'CASH' && b.paymentStatus !== 'CONFIRMED') {
        processPayment(b, traceId);
      }
      createAuditLog({
        action: 'booking.confirm', target: b.id, traceId,
        before, after: { status: 'CONFIRMED' }
      });
      createNotification({
        type: 'booking_confirmed', recipient: b.customerId,
        content: `Đơn đăng kiểm ${r.id} đã được xác nhận`
      });
    }
  }
  renderRegistrations();
  updateBadges();
  alert('Xác nhận đơn thành công!');
}

// ============================================
// MAINTENANCE (Bảo dưỡng) — song song với REGISTRATIONS
// Cùng flow nhưng dùng mock data riêng (MAINTENANCE) và bookingType riêng (MAINTENANCE_ORDER)
// ============================================
function openMaintenanceCreate() {
  clearMaintenanceForm();
  openModal('maintenance-create-modal');
}

function renderMaintenance() {
  const search = document.getElementById('maintenance-search')?.value?.toLowerCase() || '';
  const statusFilter = document.getElementById('maintenance-status-filter')?.value || '';
  let items = MAINTENANCE.filter(r =>
    (r.plate.toLowerCase().includes(search) ||
     r.ownerName.toLowerCase().includes(search) ||
     r.ownerPhone.includes(search)) &&
    (statusFilter ? r.status === statusFilter : true)
  );

  const statusMap = {
    pending: { label: 'Chờ xác nhận', class: 'badge-pending' },
    confirmed: { label: 'Đã xác nhận', class: 'badge-active' },
    completed: { label: 'Hoàn thành', class: 'badge-success' },
    cancelled: { label: 'Đã hủy', class: 'badge-cancelled' }
  };
  const serviceLabels = { basic: 'Cơ bản', full: 'Toàn diện', oil_change: 'Thay nhớt', tire: 'Lốp & cân chỉnh' };
  const engineLabels = { gasoline: '⛽ Xăng', electric: '🔋 Điện', diesel: '🛢️ Dầu', hybrid: '⚡ Hybrid' };

  const body = document.getElementById('maintenance-table-body');
  if (!body) return;
  body.innerHTML = items.map(r => `
    <tr class="row-clickable ${selectedMntId === r.id ? 'row-selected' : ''}" onclick="selectMaintenance('${r.id}')">
      <td><span class="text-accent fw-600">${r.id}</span></td>
      <td><span class="fw-600">${esc(r.plate)}</span></td>
      <td>${esc(r.ownerName)}</td>
      <td>${esc(r.ownerPhone)}</td>
      <td>${esc(r.pickupAddress || r.centerName || '—')}</td>
      <td>${engineLabels[r.engineType] || '—'}</td>
      <td>${r.bookingDate} ${r.bookingTime}</td>
      <td>${serviceLabels[r.service] || r.service}</td>
      <td class="fw-600 text-success">${fmt(r.price)}</td>
      <td><span class="badge ${statusMap[r.status]?.class || ''}">${statusMap[r.status]?.label || r.status}</span></td>
      <td>
        ${r.status === 'pending' ? `<button class="btn btn-sm btn-primary" title="Xác nhận" onclick="event.stopPropagation();confirmMaintenance('${r.id}')">✓</button>` : ''}
      </td>
    </tr>
  `).join('') || `<tr><td colspan="11"><div class="empty-state"><div class="empty-state-icon">🔧</div><div class="empty-state-text">Không tìm thấy đơn bảo dưỡng</div></div></td></tr>`;
  renderMaintenanceDetail(selectedMntId);
}

function createMaintenanceOrder() {
  const plate = document.getElementById('mnt-plate').value.trim();
  const ownerName = document.getElementById('mnt-owner-name').value.trim();
  const ownerPhone = document.getElementById('mnt-owner-phone').value.trim();
  const pickupAddress = document.getElementById('mnt-pickup-address').value.trim();
  const engineType = document.getElementById('mnt-engine-type').value;
  const bookingDate = document.getElementById('mnt-booking-date').value;
  const bookingTime = document.getElementById('mnt-booking-time').value;
  const service = document.getElementById('mnt-service').value;
  const mileage = document.getElementById('mnt-mileage')?.value || '';
  const notes = document.getElementById('mnt-notes')?.value.trim() || '';

  if (!plate || !ownerName || !ownerPhone || !pickupAddress || !engineType || !bookingDate || !bookingTime) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc (gồm Địa chỉ nhận xe và Loại động cơ)'); return;
  }

  const servicePrices = { basic: 400000, full: 1200000, oil_change: 250000, tire: 800000 };
  const traceId = newTraceId();

  const newMnt = {
    id: genId('MNT', MAINTENANCE),
    plate, ownerName, ownerPhone,
    vehicleType: document.getElementById('mnt-vehicle-type').value,
    engineType,
    pickupAddress,
    bookingDate, bookingTime, service,
    mileage, notes,
    price: servicePrices[service],
    status: 'pending',
    createdAt: nowStr(),
    bookingId: null
  };
  MAINTENANCE.unshift(newMnt);

  // Tìm hoặc tạo customer
  let cust = CUSTOMERS.find(c => c.phone === ownerPhone);
  if (!cust) {
    cust = {
      id: 'KH' + String(CUSTOMERS.length + 1).padStart(3, '0'),
      name: ownerName, phone: ownerPhone, email: '',
      totalBookings: 1, status: 'active'
    };
    CUSTOMERS.push(cust);
    ensureWallet(cust.id, cust.name, 'CUSTOMER');
  }

  // Tạo booking MAINTENANCE_ORDER liên kết
  const booking = {
    id: genId('BK', BOOKINGS),
    bookingCode: 'RO-MNT-' + newMnt.id,
    bookingType: 'MAINTENANCE_ORDER',
    bookingStatus: 'PENDING_CONFIRMATION',
    paymentStatus: 'PENDING',
    fulfillmentStatus: null,
    customerId: cust.id, agentId: currentUser?.id || null,
    driverId: null,
    pickup: pickupAddress, dropoff: pickupAddress,
    fareSnapshot: servicePrices[service], distance: 0,
    paymentMethod: 'cash',  // bảo dưỡng cũng thu khi xong
    paymentReference: null,
    fulfillmentTaskId: null,
    maintenanceOrderId: newMnt.id,
    createdAt: nowStr(), updatedAt: nowStr()
  };
  BOOKINGS.push(booking);
  newMnt.bookingId = booking.id;

  createAuditLog({
    action: 'booking.create', target: booking.id, traceId,
    before: null, after: { type: 'MAINTENANCE_ORDER', mntId: newMnt.id, fare: booking.fareSnapshot }
  });
  createNotification({
    type: 'booking_created', recipient: cust.id,
    content: `Đơn bảo dưỡng ${newMnt.id} đã tạo, lịch hẹn ${bookingDate} ${bookingTime} — nhận xe tại ${pickupAddress}`
  });

  // Cash → auto CASH status (skip pending payment)
  const pay = processPayment(booking, traceId);
  if (pay.success) {
    booking.bookingStatus = 'CONFIRMED';
    booking.fulfillmentStatus = 'PENDING';
  }

  clearMaintenanceForm();
  selectedMntId = newMnt.id;
  renderMaintenance();
  updateBadges();
  alert('Tạo đơn bảo dưỡng thành công!\nMã đơn: ' + newMnt.id + '\nBooking: ' + booking.bookingCode);
}

function clearMaintenanceForm() {
  ['mnt-plate','mnt-owner-name','mnt-owner-phone','mnt-pickup-address','mnt-booking-date','mnt-notes','mnt-mileage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('mnt-engine-type', 'gasoline');
  set('mnt-vehicle-type', 'car');
  set('mnt-service', 'basic');
  set('mnt-booking-time', '07:00');
}

function confirmMaintenance(id) {
  const r = MAINTENANCE.find(x => x.id === id);
  if (!r) return;
  r.status = 'confirmed';
  if (r.bookingId) {
    const b = BOOKINGS.find(x => x.id === r.bookingId);
    if (b && b.bookingStatus === 'PENDING_CONFIRMATION') {
      const traceId = newTraceId();
      const before = { status: b.bookingStatus };
      b.bookingStatus = 'CONFIRMED';
      b.fulfillmentStatus = b.fulfillmentStatus || 'PENDING';
      b.updatedAt = nowStr();
      if (b.paymentMethod === 'cash' && b.paymentStatus !== 'CASH' && b.paymentStatus !== 'CONFIRMED') {
        processPayment(b, traceId);
      }
      createAuditLog({
        action: 'booking.confirm', target: b.id, traceId,
        before, after: { status: 'CONFIRMED' }
      });
      createNotification({
        type: 'booking_confirmed', recipient: b.customerId,
        content: `Đơn bảo dưỡng ${r.id} đã được xác nhận`
      });
    }
  }
  renderMaintenance();
  updateBadges();
  alert('Xác nhận đơn bảo dưỡng thành công!');
}

function renderAgentCustomers() {
  const container = document.getElementById('page-customers');
  if (container) {
    container.innerHTML = `
      <div class="stats-grid" style="margin-bottom: 20px">
        <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon accent">👥</div><span class="stat-card-label">Tổng khách hàng</span></div><div class="stat-card-value">${AGENT_CUSTOMERS.length}</div></div>
        <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">🟢</div><span class="stat-card-label">Hoạt động</span></div><div class="stat-card-value">${AGENT_CUSTOMERS.filter(c => c.status === 'active').length}</div></div>
        <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">⭐</div><span class="stat-card-label">VIP Members</span></div><div class="stat-card-value">${AGENT_CUSTOMERS.filter(c => c.level === 'VIP').length}</div></div>
      </div>
      <div class="table-container">
        <div class="table-header"><span class="table-title">Danh sách khách hàng</span>
          <div class="table-actions">
            <div class="search-box"><input type="search" placeholder="Tìm khách hàng..." id="customer-search" oninput="renderAgentCustomersList()"></div>
          </div>
        </div>
        <div class="table-wrapper">
          <table><thead><tr><th>ID</th><th>Khách hàng</th><th>Liên hệ</th><th>Booking</th><th>Tổng chi tiêu</th><th>Cấp độ</th><th>Đặt cuối</th><th>Trạng thái</th></tr></thead>
            <tbody id="customers-table-body"></tbody></table>
        </div>
      </div>
    `;
    renderAgentCustomersList();
  }
}

function renderAgentCustomersList() {
  const search = document.getElementById('customer-search')?.value?.toLowerCase();
  let customers = [...AGENT_CUSTOMERS];
  if (search) customers = customers.filter(c => c.name.toLowerCase().includes(search) || c.phone.includes(search));

  const levelColors = { VIP: '#FFB020', Gold: '#FFD700', Regular: '#94A3B8', Bronze: '#CD7F32' };
  document.getElementById('customers-table-body').innerHTML = customers.map(c => `
    <tr>
      <td><span class="text-accent fw-600">${c.id}</span></td>
      <td><div class="flex-center"><div class="driver-avatar" style="width:28px;height:28px;font-size:12px">👤</div><span class="fw-600" style="margin-left:8px">${c.name}</span></div></td>
      <td>${c.phone}</td>
      <td class="fw-600">${c.totalBookings}</td>
      <td class="fw-600 text-success">${fmt(c.totalSpent)}</td>
      <td><span class="badge" style="background:${levelColors[c.level]}20;color:${levelColors[c.level]}">${c.level}</span></td>
      <td class="text-muted">${c.lastBooking}</td>
      <td><span class="badge ${c.status === 'active' ? 'badge-active' : 'badge-inactive'}">${c.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span></td>
    </tr>
  `).join('');
}

function renderReports() {
  const container = document.getElementById('page-reports');
  if (container) {
    container.innerHTML = `
      <div class="tabs" style="margin-bottom:20px">
        <button class="tab-btn active" onclick="switchReportTab('daily', this)">Hàng ngày</button>
        <button class="tab-btn" onclick="switchReportTab('weekly', this)">Hàng tuần</button>
        <button class="tab-btn" onclick="switchReportTab('monthly', this)">Hàng tháng</button>
      </div>
      <div class="report-grid">
        <div class="report-card">
          <div class="report-title">Số lượng booking</div>
          <div class="report-chart" id="report-booking-chart"></div>
          <div class="report-labels" id="report-booking-labels"></div>
        </div>
        <div class="report-card">
          <div class="report-title">Doanh thu (triệu đ)</div>
          <div class="report-chart" id="report-revenue-chart"></div>
          <div class="report-labels" id="report-revenue-labels"></div>
        </div>
        <div class="report-card">
          <div class="report-title">Khách hàng mới</div>
          <div class="report-chart" id="report-customer-chart"></div>
          <div class="report-labels" id="report-customer-labels"></div>
        </div>
      </div>
      <div class="table-container">
        <div class="table-header"><span class="table-title">Chi tiết báo cáo</span></div>
        <div class="table-wrapper">
          <table><thead><tr><th>STT</th><th>Loại</th><th>Booking</th><th>Doanh thu</th><th>Khách hàng</th><th>Tăng trưởng</th></tr></thead>
            <tbody id="report-detail-body"></tbody></table>
        </div>
      </div>
    `;
    switchReportTab('daily');
  }
}

function switchReportTab(period, btn) {
  document.querySelectorAll('.tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const data = REPORTS[period];
  const maxBookings = Math.max(...data.bookings);
  const maxRevenue = Math.max(...data.revenue);
  const maxCustomers = Math.max(...data.customers);

  document.getElementById('report-booking-chart').innerHTML = data.bookings.map(v => `<div class="report-bar" style="height:${(v/maxBookings)*100}%" data-value="${v}"></div>`).join('');
  document.getElementById('report-booking-labels').innerHTML = data.labels.map(l => `<span>${l}</span>`).join('');

  document.getElementById('report-revenue-chart').innerHTML = data.revenue.map(v => `<div class="report-bar" style="height:${(v/maxRevenue)*100}%" data-value="${v/1000000}M"></div>`).join('');
  document.getElementById('report-revenue-labels').innerHTML = data.labels.map(l => `<span>${l}</span>`).join('');

  document.getElementById('report-customer-chart').innerHTML = data.customers.map(v => `<div class="report-bar" style="height:${(v/maxCustomers)*100}%" data-value="${v}"></div>`).join('');
  document.getElementById('report-customer-labels').innerHTML = data.labels.map(l => `<span>${l}</span>`).join('');

  const totals = {
    bookings: data.bookings.reduce((a,b) => a+b, 0),
    revenue: data.revenue.reduce((a,b) => a+b, 0),
    customers: data.customers.reduce((a,b) => a+b, 0)
  };

  document.getElementById('report-detail-body').innerHTML = `
    <tr>
      <td>1</td>
      <td class="fw-600">Tổng cộng</td>
      <td class="fw-600">${totals.bookings.toLocaleString()}</td>
      <td class="fw-600 text-success">${fmt(totals.revenue)}</td>
      <td class="fw-600">${totals.customers}</td>
      <td><span class="badge badge-completed">+12.5%</span></td>
    </tr>
  `;
}

// ============================================
// INTERCITY BOOKING FUNCTIONS
// ============================================
function swapRoute() {
  const origin = document.getElementById('intercity-origin');
  const destination = document.getElementById('intercity-destination');
  const temp = origin.value;
  origin.value = destination.value;
  destination.value = temp;
}

function searchIntercityTrips() {
  const originId = document.getElementById('intercity-origin').value;
  const destinationId = document.getElementById('intercity-destination').value;
  const date = document.getElementById('intercity-date').value;
  const passengers = document.getElementById('intercity-passengers').value;

  if (!originId || !destinationId) {
    alert('Vui lòng chọn điểm đi và điểm đến');
    return;
  }
  if (originId === destinationId) {
    alert('Điểm đi và điểm đến không được trùng');
    return;
  }

  // Filter trips theo route có originId/destinationId khớp
  const trips = INTERCITY_TRIPS.filter(t => {
    const route = INTERCITY_ROUTES.find(r => r.id === t.routeId);
    if (!route) return false;
    if (route.originId !== originId) return false;
    if (route.destinationId !== destinationId) return false;
    if (date && t.date !== date) return false;
    return t.status === 'available';
  });

  renderIntercityTripGrid(trips, 'Không tìm thấy chuyến nào phù hợp');
}

function clearIntercityFilter() {
  const dest = document.getElementById('intercity-destination');
  const date = document.getElementById('intercity-date');
  const pax = document.getElementById('intercity-passengers');
  if (dest) dest.value = '';
  if (date) date.value = '';
  if (pax) pax.value = '1';
  showAllIntercityTrips();
}

function showAllIntercityTrips() {
  const trips = INTERCITY_TRIPS.filter(t => t.status === 'available');
  renderIntercityTripGrid(trips, 'Chưa có chuyến nào');
}

function renderTripBookingList(tripId) {
  const list = BOOKINGS.filter(b => b.bookingType === 'INTERCITY' && b.tripId === tripId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const statusLabels = {
    PENDING_CONFIRMATION: { t: 'Chờ xác nhận', c: 'badge-pending' },
    CONFIRMED: { t: 'Đã xác nhận', c: 'badge-active' },
    COMPLETED: { t: 'Hoàn thành', c: 'badge-success' },
    CANCELLED: { t: 'Đã hủy', c: 'badge-cancelled' }
  };
  if (list.length === 0) {
    return `<div class="odp-empty"><div class="odp-empty-icon">🎫</div>Chưa có vé nào cho chuyến này</div>`;
  }
  return list.map(b => {
    const cust = CUSTOMERS.find(c => c.id === b.customerId);
    const pax = b.passengerSnapshot?.length || 1;
    const st = statusLabels[b.bookingStatus] || { t: b.bookingStatus, c: '' };
    return `
      <div class="tb-booking-item">
        <div class="tb-bi-head">
          <span>${esc(cust?.name || b.passengerSnapshot?.[0]?.name || '—')}</span>
          <span class="badge ${st.c}">${st.t}</span>
        </div>
        <div style="display:flex;justify-content:space-between;color:var(--text-muted)">
          <span>📞 ${esc(cust?.phone || b.passengerSnapshot?.[0]?.phone || '—')} · 👥 ${pax} vé</span>
          <span class="text-success fw-600">${fmt(b.fareSnapshot)}</span>
        </div>
        <div style="color:var(--text-muted);margin-top:2px">${esc(b.bookingCode)}</div>
      </div>
    `;
  }).join('');
}

function showTripDetail(tripId) {
  const trip = INTERCITY_TRIPS.find(t => t.id === tripId);
  if (!trip) return;

  const passengers = document.getElementById('intercity-passengers')?.value || '1';
  const route = INTERCITY_ROUTES.find(r => r.id === trip.routeId);
  const sold = trip.seatsTotal - trip.seatsAvailable;
  const total = trip.price * parseInt(passengers);

  document.getElementById('trip-book-title').textContent =
    `🎫 ${route ? route.origin + ' → ' + route.destination : 'Đặt vé'} · ${trip.operatorName}`;

  document.getElementById('trip-book-body').innerHTML = `
    <div class="trip-book-grid">
      <div>
        <div class="trip-card selected" style="cursor:default">
          <div class="trip-header">
            <span class="trip-operator">${trip.operatorName}</span>
            <span class="trip-price">${fmt(trip.price)}</span>
          </div>
          <div class="trip-times">
            <span class="trip-time">${trip.departureTime}</span>
            <span class="trip-duration">${trip.duration}</span>
            <span class="trip-time">${trip.arrivalTime}</span>
          </div>
          <div class="trip-info" style="margin-top:12px">
            <span>${trip.vehicleType}</span>
            <span>📅 ${trip.date} · ${trip.seatsAvailable} chỗ trống</span>
          </div>
        </div>
        <div class="form-grid" style="margin-top:16px">
          <div class="input-group"><label>Số khách</label><input type="number" class="input" id="booking-passengers" value="${passengers}" min="1" max="${trip.seatsAvailable}" onchange="updateBookingTotal('${trip.id}', this.value)"></div>
          <div class="input-group"><label>Tổng tiền</label><div style="font-size:22px;font-weight:700;color:var(--success);padding:6px 0" id="booking-total">${fmt(total)}</div></div>
          <div class="input-group full-width"><label>Họ tên khách</label><input type="text" class="input" id="customer-name" placeholder="Nguyễn Văn A"></div>
          <div class="input-group full-width"><label>Số điện thoại</label><input type="text" class="input" id="customer-phone" placeholder="090xxxxxxx"></div>
          <div class="input-group full-width"><label>Thanh toán</label><select class="input" id="booking-payment-method"><option value="wallet">Ví khách hàng</option><option value="cash">Tiền mặt</option></select></div>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="createIntercityBooking('${trip.id}')">🎫 Tạo đơn vé</button>
      </div>
      <div>
        <div class="inline-form-card-header" style="margin-bottom:12px"><span class="inline-form-card-title">👥 Vé đã đặt (${sold}/${trip.seatsTotal})</span></div>
        <div class="tb-booking-list" id="trip-book-list">${renderTripBookingList(trip.id)}</div>
      </div>
    </div>
  `;
  openModal('trip-book-modal');
}

function updateBookingTotal(tripId, passengers) {
  const trip = INTERCITY_TRIPS.find(t => t.id === tripId);
  if (!trip) return;
  const total = trip.price * parseInt(passengers);
  document.getElementById('booking-total').textContent = fmt(total);
}

function createIntercityBooking(tripId) {
  const trip = INTERCITY_TRIPS.find(t => t.id === tripId);
  if (!trip) return;

  const passengers = parseInt(document.getElementById('booking-passengers').value);
  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  // Payment method: ưu tiên dropdown (nếu có), default 'wallet'
  const paymentMethod = document.getElementById('booking-payment-method')?.value || 'wallet';

  if (!customerName || !customerPhone) {
    alert('Vui lòng nhập thông tin khách hàng!'); return;
  }
  if (passengers > trip.seatsAvailable) {
    alert('Số lượng vé không đủ!'); return;
  }

  // Tìm hoặc tạo khách
  let cust = CUSTOMERS.find(c => c.phone === customerPhone);
  if (!cust) {
    cust = {
      id: 'KH' + String(CUSTOMERS.length + 1).padStart(3, '0'),
      name: customerName, phone: customerPhone, email: '',
      totalBookings: 1, status: 'active'
    };
    CUSTOMERS.push(cust);
    ensureWallet(cust.id, cust.name, 'CUSTOMER');
  } else {
    cust.totalBookings = (cust.totalBookings || 0) + 1;
  }

  const traceId = newTraceId();
  const route = INTERCITY_ROUTES.find(r => r.id === trip.routeId);

  const newBooking = {
    id: genId('BK', BOOKINGS),
    bookingCode: 'RO-' + new Date().toISOString().slice(2,10).replace(/-/g,'') + '-' + String(BOOKINGS.length + 1).padStart(3, '0'),
    bookingType: 'INTERCITY',
    bookingStatus: 'PENDING_CONFIRMATION',
    paymentStatus: 'PENDING',
    fulfillmentStatus: null,
    customerId: cust.id,
    agentId: currentUser?.id || 'USR003',
    driverId: null,
    pickup: 'BX ' + trip.operatorName + (route ? ' (' + route.origin + ')' : ''),
    dropoff: route?.destination || '',
    routeId: trip.routeId,
    scheduleId: trip.scheduleId || null,
    tripId: trip.id,
    seatNumbers: [],
    passengerSnapshot: Array.from({ length: passengers }, () => ({ name: customerName, phone: customerPhone })),
    fareSnapshot: trip.price * passengers,
    distance: route?.distance || 0,
    paymentMethod,
    paymentReference: null,
    fulfillmentTaskId: null,
    createdAt: nowStr(), updatedAt: nowStr()
  };

  BOOKINGS.push(newBooking);
  trip.seatsAvailable -= passengers;
  if (trip.seatsAvailable <= 0) trip.status = 'full';

  createAuditLog({
    action: 'booking.create', target: newBooking.id, traceId,
    actor: currentUser?.id || 'USR003', actorRole: 'AGENT', sourceSite: 'agent',
    before: null, after: { type: 'INTERCITY', fare: newBooking.fareSnapshot, tripId: trip.id }
  });
  createNotification({
    type: 'booking_created', recipient: cust.id,
    content: `Booking ${newBooking.bookingCode} đã tạo, chờ thanh toán...`
  });

  // Payment chain: cash → CONFIRMED ngay; non-cash → check ví KH
  const pay = processPayment(newBooking, traceId);
  if (pay.success) {
    newBooking.bookingStatus = 'CONFIRMED';
    newBooking.fulfillmentStatus = 'PENDING';
    newBooking.updatedAt = nowStr();
    createAuditLog({
      action: 'booking.status_change', target: newBooking.id, traceId,
      before: { status: 'PENDING_CONFIRMATION' }, after: { status: 'CONFIRMED' }
    });
  }

  updateBadges();
  alert('Tạo đơn vé thành công! Mã booking: ' + newBooking.bookingCode +
        (pay.success ? '' : '\n⚠️ Thanh toán thất bại - đơn ở trạng thái chờ xác nhận'));

  // Cập nhật danh sách vé đã đặt trong popup + reset form khách
  const listEl = document.getElementById('trip-book-list');
  if (listEl) {
    listEl.innerHTML = renderTripBookingList(trip.id);
    const nameEl = document.getElementById('customer-name');
    const phoneEl = document.getElementById('customer-phone');
    if (nameEl) nameEl.value = '';
    if (phoneEl) phoneEl.value = '';
    if (trip.seatsAvailable <= 0) closeModal('trip-book-modal');
  }
  // Làm mới kết quả tìm chuyến phía dưới (cập nhật số vé/chỗ trống)
  const destSel = document.getElementById('intercity-destination');
  if (destSel && destSel.value) { searchIntercityTrips(); } else { renderIntercityBooking(); }
}
