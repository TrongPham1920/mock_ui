// ============================================
// RIDE OPS DASHBOARD - Application Logic
// With Role-Based Access Control (RBAC)
// ============================================

let currentPage = 'dashboard';
let currentBookingType = 'ALL';
let currentFulfillmentTab = 'all';   // 'all' | 'bikecar' | 'intercity' | 'service' | 'maintenance'
let selectedDispatchBooking = null;
let selectedIntercityVehicleId = null;
let selectedIntercityDriverId = null;
let selectedDispatchDriverId = null;  // modal gán tài xế (bike/car/service/maintenance)
let _icDispatchVehicles = [];   // [{v, sameOp}] cho re-render card xe
let _icDispatchDrivers = [];    // [{d, sameOp}] cho re-render card tài xế
let _dispatchDrivers = [];      // tài xế khả dụng cho modal mặc định
let currentNotificationTab = 'history';
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
  scheduleSave(); // autosave sau mỗi lần render (mọi mutation đều kết thúc bằng render)
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
function openModal(id) {
  const el = document.getElementById(id);
  // Nâng z-index trên các modal đang mở để popup mới luôn nằm trên (vd: xem ảnh hồ sơ mở từ popup chi tiết)
  const openCount = document.querySelectorAll('.modal-overlay.show').length;
  el.style.zIndex = 200 + (openCount + 1) * 10;
  el.classList.add('show');
}
function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('show');
  el.style.zIndex = '';
}
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

// Ngày hôm nay dạng YYYY-MM-DD (so sánh hiệu lực mã ưu đãi)
function TODAY_STR() {
  const d = new Date();
  const p = x => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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

function createNotification({ type, channel = 'push', recipient, title = '', content, status = 'delivered', targetId = null, actionPage = null, readAt = null }) {
  const n = {
    id: genId('NTF', NOTIFICATIONS),
    type, channel, recipient, content, status,
    title, targetId, actionPage, readAt,
    createdAt: nowStr()
  };
  NOTIFICATIONS.unshift(n);
  return n;
}

function getBookingServiceName(booking) {
  if (!booking) return '—';
  return VEHICLE_TYPES[booking.bookingType]?.label || booking.bookingType || '—';
}

function getBookingVehicleType(booking) {
  if (!booking) return '—';
  if (booking.bookingType === 'INTERCITY' && booking.tripId) {
    const trip = INTERCITY_TRIPS.find(t => t.id === booking.tripId);
    if (trip?.vehicleType) return trip.vehicleType;
  }
  if (booking.bookingType === 'SERVICE_ORDER' && booking.serviceOrderId) {
    const reg = REGISTRATIONS.find(r => r.id === booking.serviceOrderId);
    if (reg?.vehicleType) return VEHICLE_TYPES[reg.vehicleType]?.label || reg.vehicleType;
  }
  if (booking.bookingType === 'MAINTENANCE_ORDER' && booking.maintenanceOrderId) {
    const mnt = MAINTENANCE.find(r => r.id === booking.maintenanceOrderId);
    if (mnt?.vehicleType) return VEHICLE_TYPES[mnt.vehicleType]?.label || mnt.vehicleType;
  }
  return VEHICLE_TYPES[booking.bookingType]?.label || booking.bookingType || '—';
}

function getNotificationConfig(eventType, serviceType = 'ALL', recipientGroup = '') {
  return NOTIFICATION_CONFIGS
    .filter(c => c.status === 'active' && c.eventType === eventType)
    .filter(c => {
      const serviceOk = c.serviceType === serviceType || c.serviceType === 'ALL';
      const groupOk = !recipientGroup || c.recipientGroup === recipientGroup || c.recipientGroup === 'ALL' || c.recipientGroup === 'all';
      return serviceOk && groupOk;
    })
    .sort((a, b) => {
      const score = c => (c.serviceType === serviceType ? 2 : 0) + (c.recipientGroup === recipientGroup ? 2 : 0);
      return score(b) - score(a);
    })[0];
}

function applyNotificationTemplate(template, vars) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '—');
}

function buildNotificationVars({ booking = null, driver = null, promo = null, extra = {} }) {
  const audience = promo?.audience || extra.promoAudience || '';
  return {
    bookingCode: booking?.bookingCode || booking?.id || '—',
    serviceName: getBookingServiceName(booking),
    vehicleType: extra.vehicleType || getBookingVehicleType(booking),
    customerName: booking ? getCustomerName(booking.customerId) : '—',
    driverName: driver?.name || (booking?.driverId ? getDriverName(booking.driverId) : '—'),
    pickup: booking?.pickup || '—',
    dropoff: booking?.dropoff || '—',
    amount: booking ? fmt(booking.fareSnapshot || 0) : (extra.amount || '—'),
    reason: extra.reason || '—',
    promoCode: promo?.code || extra.promoCode || '—',
    promoAudience: PROMO_AUDIENCE[audience]?.label || audience || '—',
    endDate: promo?.endDate || extra.endDate || '—',
    ...extra
  };
}

function sendConfiguredNotification({
  eventType,
  booking = null,
  recipient,
  recipientGroup = 'CUSTOMER',
  driver = null,
  promo = null,
  extra = {},
  fallbackTitle = '',
  fallbackContent = '',
  fallbackType = null,
  actionPage = null,
  targetId = null,
  channel = null
}) {
  const serviceType = booking?.bookingType || extra.serviceType || 'ALL';
  const config = getNotificationConfig(eventType, serviceType, recipientGroup) ||
    getNotificationConfig(eventType, 'ALL', recipientGroup);
  const vars = buildNotificationVars({ booking, driver, promo, extra });
  return createNotification({
    type: fallbackType || eventType,
    channel: channel || config?.channel || 'push',
    recipient,
    title: applyNotificationTemplate(config?.title || fallbackTitle, vars),
    content: applyNotificationTemplate(config?.content || fallbackContent, vars),
    targetId: targetId || booking?.id || promo?.id || null,
    actionPage: actionPage || (eventType.startsWith('driver_') ? 'fulfillment' : eventType.startsWith('promo_') ? 'promos' : 'bookings')
  });
}

function ensureNotificationConfigs() {
  if (typeof DEFAULT_NOTIFICATION_CONFIGS === 'undefined') return;
  DEFAULT_NOTIFICATION_CONFIGS.forEach(seed => {
    if (!NOTIFICATION_CONFIGS.some(c => c.id === seed.id)) {
      NOTIFICATION_CONFIGS.push({ ...seed });
    }
  });
}

const HEADER_NOTIFICATION_RECIPIENTS = ['ADMIN', 'OPERATOR', 'OPS'];
const HEADER_NOTIFICATION_TYPES = {
  admin_intercity_task_created: { label: 'Liên tỉnh', page: 'fulfillment', tab: 'intercity' },
  admin_service_task_created: { label: 'Đăng kiểm/Bảo dưỡng hộ', page: 'fulfillment', tab: 'service' },
  admin_maintenance_task_created: { label: 'Đăng kiểm/Bảo dưỡng hộ', page: 'fulfillment', tab: 'maintenance' },
  admin_driver_application_pending: { label: 'Tài xế mới', page: 'partners' },
  reschedule_requested: { label: 'Đổi lịch', page: 'bookings' }
};

function isHeaderNotification(n) {
  return HEADER_NOTIFICATION_RECIPIENTS.includes(n.recipient) || HEADER_NOTIFICATION_TYPES[n.type];
}

function isBookingWaitingAssignment(b) {
  return b &&
    b.bookingStatus === 'CONFIRMED' &&
    (b.paymentStatus === 'CONFIRMED' || b.paymentStatus === 'CASH') &&
    (!b.fulfillmentStatus || b.fulfillmentStatus === 'PENDING');
}

function isHeaderNotificationStillOpen(n) {
  if (n.type === 'admin_intercity_task_created') {
    const tripId = String(n.targetId || '').replace('TRIP-', '');
    return BOOKINGS.some(b =>
      b.bookingType === 'INTERCITY' &&
      String(b.tripId || b.id) === tripId &&
      isBookingWaitingAssignment(b)
    );
  }
  if (n.type === 'admin_service_task_created') {
    return isBookingWaitingAssignment(BOOKINGS.find(b => b.id === n.targetId && b.bookingType === 'SERVICE_ORDER'));
  }
  if (n.type === 'admin_maintenance_task_created') {
    return isBookingWaitingAssignment(BOOKINGS.find(b => b.id === n.targetId && b.bookingType === 'MAINTENANCE_ORDER'));
  }
  if (n.type === 'admin_driver_application_pending') {
    return DRIVER_APPLICATIONS.some(a => a.id === n.targetId && a.status === 'pending');
  }
  if (n.type === 'reschedule_requested') {
    return BOOKINGS.some(b => b.id === n.targetId && b.bookingStatus === 'RESCHEDULE_REQUESTED');
  }
  return true;
}

function createAdminNotification({ type, content, targetId = null, actionPage = null }) {
  const meta = HEADER_NOTIFICATION_TYPES[type] || {};
  const duplicate = targetId && NOTIFICATIONS.find(n =>
    n.type === type && n.targetId === targetId && HEADER_NOTIFICATION_RECIPIENTS.includes(n.recipient)
  );
  if (duplicate) {
    duplicate.content = content;
    duplicate.actionPage = actionPage || meta.page || duplicate.actionPage || 'notifications';
    duplicate.updatedAt = nowStr();
    return duplicate;
  }
  const n = createNotification({
    type,
    recipient: 'ADMIN',
    content,
    targetId,
    actionPage: actionPage || meta.page || 'notifications'
  });
  renderHeaderNotifications();
  return n;
}

function seedHeaderNotifications() {
  const pendingIntercityTrips = new Map();
  BOOKINGS
    .filter(b => b.bookingType === 'INTERCITY' && isBookingWaitingAssignment(b))
    .forEach(b => {
      const key = String(b.tripId || b.id);
      if (!pendingIntercityTrips.has(key)) pendingIntercityTrips.set(key, []);
      pendingIntercityTrips.get(key).push(b);
    });

  pendingIntercityTrips.forEach((items, tripKey) => {
    const first = items[0];
    const trip = INTERCITY_TRIPS.find(t => t.id === first.tripId);
    const route = trip
      ? INTERCITY_ROUTES.find(r => r.id === trip.routeId)
      : INTERCITY_ROUTES.find(r => r.id === first.routeId);
    const vehicleType = trip?.vehicleType || getBookingVehicleType(first);

    createAdminNotification({
      type: 'admin_intercity_task_created',
      targetId: `TRIP-${tripKey}`,
      actionPage: 'fulfillment',
      content: `Chuyến liên tỉnh ${route?.origin || first.pickup || '—'} → ${route?.destination || first.dropoff || '—'}${trip ? ` ngày ${trip.date} lúc ${trip.departureTime}` : ''} đang chờ phân công. Loại xe: ${vehicleType}.`
    });
  });

  BOOKINGS
    .filter(b => b.bookingType === 'SERVICE_ORDER' && isBookingWaitingAssignment(b))
    .forEach(b => {
      const order = REGISTRATIONS.find(r => r.id === b.serviceOrderId);
      createAdminNotification({
        type: 'admin_service_task_created',
        targetId: b.id,
        actionPage: 'fulfillment',
        content: `Đơn đăng kiểm hộ ${order?.id || b.bookingCode}${order?.plate ? ` (${order.plate})` : ''} đang chờ gán tài xế. Lịch hẹn ${order?.bookingDate || '—'} ${order?.bookingTime || ''}.`
      });
    });

  BOOKINGS
    .filter(b => b.bookingType === 'MAINTENANCE_ORDER' && isBookingWaitingAssignment(b))
    .forEach(b => {
      const order = MAINTENANCE.find(r => r.id === b.maintenanceOrderId);
      createAdminNotification({
        type: 'admin_maintenance_task_created',
        targetId: b.id,
        actionPage: 'fulfillment',
        content: `Đơn bảo dưỡng hộ ${order?.id || b.bookingCode}${order?.plate ? ` (${order.plate})` : ''} đang chờ gán tài xế. Lịch hẹn ${order?.bookingDate || '—'} ${order?.bookingTime || ''}.`
      });
    });

  DRIVER_APPLICATIONS
    .filter(a => a.status === 'pending')
    .forEach(a => createAdminNotification({
      type: 'admin_driver_application_pending',
      targetId: a.id,
      actionPage: 'partners',
      content: `Tài xế ${a.name} gửi hồ sơ ${a.applyType === 'bikecar' ? 'Bike/Car' : 'Liên tỉnh'} cần admin phê duyệt.`
    }));
}

function getHeaderNotifications() {
  const groups = [
    ['admin_driver_application_pending'],
    ['admin_intercity_task_created'],
    ['admin_service_task_created', 'admin_maintenance_task_created']
  ];
  const activeItems = NOTIFICATIONS
    .filter(n => isHeaderNotification(n) && isHeaderNotificationStillOpen(n))
    .slice()
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

  return groups.flatMap(types =>
    activeItems
      .filter(n => types.includes(n.type))
      .slice(0, 4)
  );
}

function renderHeaderNotifications() {
  const countEl = document.getElementById('notification-count');
  const listEl = document.getElementById('notification-dropdown-list');
  const subEl = document.getElementById('notification-dropdown-sub');
  const markBtn = document.querySelector('.notification-mark-read');
  if (!countEl || !listEl) return;

  const items = getHeaderNotifications();
  const unread = items.filter(n => !n.readAt).length;
  countEl.textContent = unread > 9 ? '9+' : String(unread);
  countEl.style.display = unread ? '' : 'none';
  if (subEl) subEl.textContent = unread ? `${unread} thông báo chưa đọc` : 'Không có thông báo mới';
  if (markBtn) markBtn.disabled = unread === 0;

  if (!items.length) {
    listEl.innerHTML = '<div class="notification-empty">Chưa có thông báo vận hành</div>';
    return;
  }

  listEl.innerHTML = items.map(n => {
    const meta = HEADER_NOTIFICATION_TYPES[n.type] || { label: n.type };
    return `<button class="notification-item ${n.readAt ? '' : 'is-unread'}" type="button" onclick="openHeaderNotification('${n.id}', event)">
      <span class="notification-item-dot" aria-hidden="true"></span>
      <span class="notification-item-top">
        <span class="notification-chip">${esc(meta.label || n.type)}</span>
        <span class="notification-item-time">${esc(n.createdAt || '')}</span>
      </span>
      <span class="notification-item-title">${esc(headerNotificationTitle(n))}</span>
      <span class="notification-item-content">${esc(n.content || '')}</span>
    </button>`;
  }).join('');
}

function headerNotificationTitle(n) {
  if (n.type === 'admin_intercity_task_created') return 'Chuyến mới cần phân công';
  if (n.type === 'admin_service_task_created') return 'Đơn đăng kiểm tạo nhiệm vụ mới';
  if (n.type === 'admin_maintenance_task_created') return 'Đơn bảo dưỡng tạo nhiệm vụ mới';
  if (n.type === 'admin_driver_application_pending') return 'Tài xế mới chờ duyệt';
  if (n.type === 'reschedule_requested') return 'Khách yêu cầu đổi lịch';
  return 'Thông báo vận hành';
}

function toggleNotificationDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('notification-dropdown');
  const trigger = document.getElementById('notification-trigger');
  if (!dropdown || !trigger) return;
  const willOpen = dropdown.style.display === 'none';
  dropdown.style.display = willOpen ? 'block' : 'none';
  trigger.setAttribute('aria-expanded', String(willOpen));
  if (willOpen) renderHeaderNotifications();
}

function closeNotificationDropdown() {
  const dropdown = document.getElementById('notification-dropdown');
  const trigger = document.getElementById('notification-trigger');
  if (!dropdown || !trigger) return;
  dropdown.style.display = 'none';
  trigger.setAttribute('aria-expanded', 'false');
}

function markHeaderNotificationRead(n) {
  if (!n.readAt) n.readAt = nowStr();
}

function markAllHeaderNotificationsRead(event) {
  if (event) event.stopPropagation();
  getHeaderNotifications().forEach(markHeaderNotificationRead);
  renderHeaderNotifications();
  scheduleSave();
}

function openHeaderNotification(id, event) {
  if (event) event.stopPropagation();
  const n = NOTIFICATIONS.find(x => x.id === id);
  if (!n) return;
  markHeaderNotificationRead(n);
  renderHeaderNotifications();
  scheduleSave();
  closeNotificationDropdown();

  const meta = HEADER_NOTIFICATION_TYPES[n.type] || {};
  const page = n.actionPage || meta.page || 'notifications';
  if (page === 'fulfillment') {
    navigateTo('fulfillment');
    if (meta.tab) switchFulfillmentTab(meta.tab);
    return;
  }
  if (n.type === 'admin_driver_application_pending' && n.targetId) {
    navigateTo('partners');
    setTimeout(() => reviewDriverApplication(n.targetId), 0);
    return;
  }
  navigateTo(page);
}

document.addEventListener('click', closeNotificationDropdown);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNotificationDropdown();
});

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
  if (sysWallet) {
    sysWallet.pendingBalance += booking.fareSnapshot;
    logTx(sysWallet, { direction: 'HOLD', type: 'HOLD', amount: booking.fareSnapshot,
      refType: 'booking', refId: booking.id, note: `Giữ tiền ${booking.bookingCode} chờ quyết toán` });
  }
  booking.paymentStatus = 'CONFIRMED';
  sendConfiguredNotification({
    eventType: 'payment_hold_user',
    booking,
    recipient: booking.customerId,
    fallbackType: 'payment_hold',
    fallbackTitle: 'Đã tạm giữ tiền',
    fallbackContent: `Hệ thống đã tạm giữ ${fmt(booking.fareSnapshot)} cho ${booking.bookingCode}`,
    actionPage: 'wallets',
    targetId: booking.id
  });
  sendConfiguredNotification({
    eventType: 'payment_confirmed_user',
    booking,
    recipient: booking.customerId,
    fallbackType: 'payment_confirmed',
    fallbackTitle: 'Thanh toán thành công',
    fallbackContent: `${booking.bookingCode}: thanh toán ${fmt(booking.fareSnapshot)} thành công`,
    actionPage: 'wallets',
    targetId: booking.id
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
  if (sysWallet) {
    sysWallet.pendingBalance = Math.max(0, sysWallet.pendingBalance - booking.fareSnapshot);
    logTx(sysWallet, { direction: 'RELEASE', type: 'RELEASE', amount: booking.fareSnapshot,
      refType: 'booking', refId: booking.id, note: `Nhả tạm giữ ${booking.bookingCode} (huỷ/hoàn)` });
  }

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
  sendConfiguredNotification({
    eventType: 'refund_completed_user',
    booking,
    recipient: booking.customerId,
    fallbackType: 'refund_completed',
    fallbackTitle: 'Hoàn tiền thành công',
    fallbackContent: `Hoàn tiền ${fmt(booking.fareSnapshot)} cho ${booking.bookingCode} thành công`,
    actionPage: 'refunds',
    targetId: refund.id
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
      logTx(sysWallet, { direction: 'RELEASE', type: 'RELEASE', amount: booking.fareSnapshot,
        refType: 'booking', refId: booking.id, note: `Nhả tạm giữ ${booking.bookingCode} (quyết toán)` });
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

  renderDriverApplications('intercity');

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
      <td><button class="btn btn-sm btn-outline" onclick="viewIntercityDriver('${d.id}')">👁️</button> <button class="btn btn-sm btn-outline" onclick="openIntercityDriverModal('${d.id}')">✏️</button></td>
    </tr>
  `).join('') || `<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Không tìm thấy</div></div></td></tr>`;
}

// ---- Tạo / chỉnh sửa / xem tài xế liên tỉnh ----
let editingIntercityDriverId = null;
let _icDriverDocDraft = {}; // bản nháp ảnh đang upload trong modal tạo/sửa

function fillIntercityOperatorSelect(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = PARTNERS.filter(p => p.status === 'active')
    .map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

// Lưới upload ảnh (không bắt buộc) cho modal tạo/sửa tài xế
function renderDriverDocsUpload() {
  const cell = (path, label) => {
    const id = path.replace(/\./g, '-');
    const url = getNestedVal(_icDriverDocDraft, path);
    return `<div class="reg-doc-cell"><div class="reg-doc-cap">${label}</div>
      <label class="reg-doc-upload">
        <img class="reg-doc-img" id="dprev-${id}" src="${url || ''}" style="${url ? '' : 'display:none'}">
        <span class="reg-doc-empty" id="dempty-${id}" style="${url ? 'display:none' : ''}">+ Chọn ảnh</span>
        <input type="file" accept="image/*" hidden onchange="onDriverDocPicked(this,'${path}')">
      </label></div>`;
  };
  return DRIVER_DOC_SECTIONS.map(s =>
    docSectionHtml(s.no, s.title, s.cells.map(([path, label]) => cell(path, label)))
  ).join('');
}

function onDriverDocPicked(input, path) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    setNestedVal(_icDriverDocDraft, path, e.target.result);
    const id = path.replace(/\./g, '-');
    const img = document.getElementById('dprev-' + id);
    const empty = document.getElementById('dempty-' + id);
    if (img) { img.src = e.target.result; img.style.display = ''; }
    if (empty) empty.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function openIntercityDriverModal(id) {
  editingIntercityDriverId = id || null;
  fillIntercityOperatorSelect('ic-driver-operator');
  const d = id ? INTERCITY_DRIVERS.find(x => x.id === id) : null;
  _icDriverDocDraft = d?.documents ? JSON.parse(JSON.stringify(d.documents)) : {};
  document.getElementById('intercity-driver-modal-title').textContent =
    d ? `Chỉnh sửa tài xế · ${d.id}` : 'Thêm tài xế liên tỉnh';
  document.getElementById('ic-driver-name').value = d?.name || '';
  document.getElementById('ic-driver-phone').value = d?.phone || '';
  document.getElementById('ic-driver-email').value = d?.email || '';
  document.getElementById('ic-driver-address').value = d?.address || '';
  document.getElementById('ic-driver-license').value = d?.licenseClass || 'D';
  document.getElementById('ic-driver-operator').value = d?.operatorId || (PARTNERS.find(p=>p.status==='active')?.id || '');
  document.getElementById('ic-driver-status').value = d?.status === 'busy' ? 'busy' : (d?.status || 'offline');
  document.getElementById('ic-driver-docs').innerHTML = renderDriverDocsUpload();
  openModal('intercity-driver-modal');
}

function saveIntercityDriver() {
  const name = document.getElementById('ic-driver-name').value.trim();
  const phone = document.getElementById('ic-driver-phone').value.trim();
  const email = document.getElementById('ic-driver-email').value.trim();
  const address = document.getElementById('ic-driver-address').value.trim();
  const licenseClass = document.getElementById('ic-driver-license').value;
  const operatorId = document.getElementById('ic-driver-operator').value;
  const status = document.getElementById('ic-driver-status').value;
  if (!name || !phone) { alert('Vui lòng nhập họ tên và số điện thoại!'); return; }
  const documents = Object.keys(_icDriverDocDraft).length ? _icDriverDocDraft : null;

  if (editingIntercityDriverId) {
    const d = INTERCITY_DRIVERS.find(x => x.id === editingIntercityDriverId);
    if (d) Object.assign(d, { name, phone, email, address, licenseClass, operatorId, status, documents });
  } else {
    INTERCITY_DRIVERS.push({
      id: nextDriverId('IDR', INTERCITY_DRIVERS), name, phone, email, address, operatorId, licenseClass,
      status, rating: 5.0, trips: 0, avatar: '👤', currentAssignmentId: null, documents
    });
  }
  closeModal('intercity-driver-modal');
  renderIntercityDrivers();
}

// Xem hồ sơ tài xế liên tỉnh (thông tin + ảnh đăng ký nếu có)
function viewIntercityDriver(id) {
  const d = INTERCITY_DRIVERS.find(x => x.id === id);
  if (!d) return;
  const row = (l, v) => `<div class="odp-cell"><div class="odp-label">${l}</div><div class="odp-value">${v}</div></div>`;
  const rowSpan = (l, v) => `<div class="odp-cell odp-span"><div class="odp-label">${l}</div><div class="odp-value">${v}</div></div>`;
  document.getElementById('ic-detail-title').textContent = `Hồ sơ tài xế · ${d.id}`;
  document.getElementById('ic-detail-body').innerHTML = `
    <div class="doc-section-title" style="margin-top:0">Thông tin tài xế</div>
    <div class="odp-grid" style="margin-bottom:6px">
      ${row('Họ và tên', `${d.avatar || ''} ${esc(d.name)}`)}
      ${row('Số điện thoại', esc(d.phone))}
      ${row('Email', esc(d.email || '—'))}
      ${rowSpan('Địa chỉ', esc(d.address || '—'))}
      ${row('Nhà xe quản lý', getPartnerName(d.operatorId))}
      ${row('Hạng GPLX', `🪪 ${d.licenseClass}`)}
      ${row('Đánh giá', `⭐ ${d.rating}`)}
      ${row('Chuyến đã chạy', d.trips.toLocaleString())}
      ${row('Trạng thái', driverBadge(d.status))}
    </div>
    <div class="doc-section-title">Hình ảnh hồ sơ đăng ký</div>
    ${renderDriverDocsView(d.documents)}
  `;
  openModal('ic-detail-modal');
}

// ============================================
// XÉT DUYỆT ĐĂNG KÝ TÀI XẾ (đơn gửi từ app)
// ============================================
const APPLY_TYPE_LABELS = { bikecar: '🏍️🚗 Bike/Car', intercity: '🧑‍✈️ Liên tỉnh' };

// Cập nhật nút "Đơn đăng ký mới (N)" trên header — chỉ hiện khi có đơn chờ.
function renderDriverApplications(applyType) {
  const btn = document.getElementById(applyType === 'bikecar' ? 'bikecar-app-btn' : 'intercity-app-btn');
  const countEl = document.getElementById(applyType === 'bikecar' ? 'bikecar-app-count' : 'intercity-app-count');
  if (!btn || !countEl) return;
  const n = DRIVER_APPLICATIONS.filter(a => a.applyType === applyType && a.status === 'pending').length;
  countEl.textContent = n;
  btn.style.display = n ? '' : 'none';
  // Nếu modal danh sách đang mở cho đúng loại này → refresh nội dung
  if (driverAppsOpenType === applyType && document.getElementById('driver-apps-modal').classList.contains('show')) {
    fillDriverAppsList(applyType);
  }
}

let driverAppsOpenType = null;

function fillDriverAppsList(applyType) {
  const pending = DRIVER_APPLICATIONS.filter(a => a.applyType === applyType && a.status === 'pending');
  document.getElementById('driver-apps-title').textContent =
    `📥 Đơn đăng ký ${applyType === 'bikecar' ? 'Bike/Car' : 'Liên tỉnh'} chờ duyệt (${pending.length})`;
  const body = document.getElementById('driver-apps-list');
  if (!pending.length) {
    body.innerHTML = `<div class="odp-empty"><div class="odp-empty-icon">📭</div>Không còn đơn nào chờ duyệt</div>`;
    return;
  }
  body.innerHTML = `<div class="app-list">${pending.map(a => `
    <div class="app-item">
      <div class="driver-avatar" style="width:36px;height:36px">${a.avatar || '👤'}</div>
      <div class="app-item-info">
        <div class="app-item-name">${esc(a.name)} <span class="text-muted">· ${a.id}</span></div>
        <div class="app-item-meta">${esc(a.phone)} · ${esc(a.email || '—')} · ${applyType === 'bikecar' ? `${VEHICLE_TYPES[a.vehicleType]?.icon || ''} ${a.plate || ''} · 🪪 ${a.licenseClass}` : `${getPartnerName(a.operatorId)} · 🪪 ${a.licenseClass}`}</div>
        <div class="app-item-time">⏱ Gửi lúc ${a.submittedAt}</div>
      </div>
      <div class="app-item-actions">
        <button class="btn btn-sm btn-outline" onclick="reviewDriverApplication('${a.id}')">👁️ Xem hồ sơ</button>
        <button class="btn btn-sm btn-primary" onclick="approveDriverApplication('${a.id}')">✓ Duyệt</button>
        <button class="btn btn-sm btn-danger" onclick="rejectDriverApplication('${a.id}')">✗ Từ chối</button>
      </div>
    </div>`).join('')}</div>`;
}

function openDriverApps(applyType) {
  driverAppsOpenType = applyType;
  fillDriverAppsList(applyType);
  openModal('driver-apps-modal');
}

// ===== Bộ giấy tờ tài xế (dùng chung: xem hồ sơ + upload khi tạo/sửa) =====
const DRIVER_DOC_SECTIONS = [
  { no: 1, title: 'Ảnh đại diện', cells: [['avatar', 'Ảnh 3×4']] },
  { no: 2, title: 'Căn cước công dân / hộ chiếu', cells: [['cccd.front', 'Mặt trước'], ['cccd.back', 'Mặt sau'], ['cccd.vnid', 'Ảnh VNeID']] },
  { no: 3, title: 'Giấy phép lái xe', cells: [['license.front', 'Mặt trước'], ['license.back', 'Mặt sau']] },
  { no: 4, title: 'Giấy đăng ký xe', cells: [['vehicleReg.front', 'Mặt trước'], ['vehicleReg.back', 'Mặt sau']] },
  { no: 5, title: 'Giấy khám sức khỏe (có kiểm tra Heroin)', cells: [['health.front', 'Mặt trước'], ['health.back', 'Mặt sau']] },
  { no: 6, title: 'Lý lịch tư pháp', cells: [['criminal.front', 'Mặt trước'], ['criminal.back', 'Mặt sau']] },
  { no: 7, title: 'Đăng kiểm xe loại kinh doanh', cells: [['inspection.front', 'Mặt trước'], ['inspection.back', 'Mặt sau']] },
  { no: 8, title: 'Bảo hiểm bắt buộc TNDS', cells: [['insurance.front', 'Mặt trước'], ['insurance.back', 'Mặt sau']] },
  { no: 9, title: 'Hình ảnh xe hiện tại', cells: [['vehiclePhotos.front', 'Phía trước'], ['vehiclePhotos.rear', 'Phía sau'], ['vehiclePhotos.right', 'Bên phải'], ['vehiclePhotos.left', 'Bên trái'], ['vehiclePhotos.interior', 'Nội thất'], ['vehiclePhotos.odometer', 'Đồng hồ đo km (Odo)']] },
  { no: 10, title: 'Phù hiệu xe hợp đồng', cells: [['badge.front', 'Mặt trước'], ['badge.back', 'Mặt sau']] },
];

function getNestedVal(obj, path) { return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj); }
function setNestedVal(obj, path, val) {
  const keys = path.split('.'); let o = obj;
  for (let i = 0; i < keys.length - 1; i++) { if (!o[keys[i]]) o[keys[i]] = {}; o = o[keys[i]]; }
  o[keys[keys.length - 1]] = val;
}

const docSectionHtml = (no, title, cells) =>
  `<div class="doc-section"><div class="doc-section-title">${no}. ${title}</div><div class="reg-doc-grid">${cells.join('')}</div></div>`;
const docViewCell = (label, url) => url
  ? `<div class="reg-doc-cell"><div class="reg-doc-cap">${label}</div><a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="${label}" class="reg-doc-img"></a></div>`
  : `<div class="reg-doc-cell"><div class="reg-doc-cap">${label}</div><div class="reg-doc-empty">Chưa có ảnh</div></div>`;

// Toàn bộ bộ giấy tờ ở chế độ xem
function renderDriverDocsView(docs) {
  const d = docs || {};
  return DRIVER_DOC_SECTIONS.map(s =>
    docSectionHtml(s.no, s.title, s.cells.map(([path, label]) => docViewCell(label, getNestedVal(d, path))))
  ).join('');
}

function reviewDriverApplication(id) {
  const a = DRIVER_APPLICATIONS.find(x => x.id === id);
  if (!a) return;
  const row = (l, v) => `<div class="odp-cell"><div class="odp-label">${l}</div><div class="odp-value">${v}</div></div>`;
  const rowSpan = (l, v) => `<div class="odp-cell odp-span"><div class="odp-label">${l}</div><div class="odp-value">${v}</div></div>`;

  document.getElementById('driver-app-title').textContent = `Xét duyệt đăng ký tài xế · ${a.id}`;
  document.getElementById('driver-app-body').innerHTML = `
    <div class="doc-section-title" style="margin-top:0">Thông tin liên hệ</div>
    <div class="odp-grid" style="margin-bottom:6px">
      ${row('Loại đăng ký', APPLY_TYPE_LABELS[a.applyType] || a.applyType)}
      ${row('Họ và tên', esc(a.name))}
      ${row('Số điện thoại', esc(a.phone))}
      ${row('Email', esc(a.email || '—'))}
      ${rowSpan('Địa chỉ', esc(a.address || '—'))}
      ${a.applyType === 'bikecar' ? row('Loại xe', `${VEHICLE_TYPES[a.vehicleType]?.icon || ''} ${VEHICLE_TYPES[a.vehicleType]?.label || a.vehicleType}`) : row('Nhà xe quản lý', getPartnerName(a.operatorId))}
      ${a.applyType === 'bikecar' ? row('Biển số', esc(a.plate || '—')) : ''}
      ${row('Hạng GPLX', `🪪 ${a.licenseClass}`)}
      ${row('Thời gian gửi', a.submittedAt)}
    </div>
    <div class="doc-section-title">Giấy tờ cá nhân</div>
    ${renderDriverDocsView(a.documents)}
  `;
  document.getElementById('driver-app-footer').innerHTML = `
    <button class="btn btn-danger" onclick="rejectDriverApplication('${a.id}', true)">✗ Từ chối</button>
    <button class="btn btn-primary" onclick="approveDriverApplication('${a.id}', true)">✓ Duyệt đăng ký</button>
  `;
  openModal('driver-app-modal');
}

function nextDriverId(prefix, arr) {
  let n = 1;
  while (arr.some(d => d.id === prefix + String(n).padStart(3, '0'))) n++;
  return prefix + String(n).padStart(3, '0');
}

function approveDriverApplication(id, fromModal) {
  const a = DRIVER_APPLICATIONS.find(x => x.id === id);
  if (!a || a.status !== 'pending') return;
  if (!confirm(`Duyệt đăng ký tài xế "${a.name}"?\nHệ thống sẽ gửi email + thông báo về app cho tài xế.`)) return;

  let newId;
  if (a.applyType === 'bikecar') {
    newId = nextDriverId('DRV', DRIVERS);
    DRIVERS.push({
      id: newId, name: a.name, phone: a.phone, vehicleType: a.vehicleType, plate: a.plate,
      status: 'offline', operatorId: null, rating: 5.0, trips: 0, avatar: a.avatar || '👤', currentAssignmentId: null
    });
  } else {
    newId = nextDriverId('IDR', INTERCITY_DRIVERS);
    INTERCITY_DRIVERS.push({
      id: newId, name: a.name, phone: a.phone, email: a.email || '', address: a.address || '',
      operatorId: a.operatorId, licenseClass: a.licenseClass,
      status: 'offline', rating: 5.0, trips: 0, avatar: a.avatar || '👤', currentAssignmentId: null,
      documents: a.documents || null
    });
  }
  a.status = 'approved';
  a.approvedDriverId = newId;

  closeModal('driver-app-modal');
  renderDriverApplications(a.applyType);
  if (a.applyType === 'bikecar') renderDrivers(); else renderIntercityDrivers();

  alert(`✅ Đã duyệt đăng ký tài xế "${a.name}".\n\n` +
    `• Tạo hồ sơ tài xế ${newId} vào danh sách ${a.applyType === 'bikecar' ? 'Bike/Car' : 'Liên tỉnh'}.\n` +
    `• 📧 Email xác nhận đã gửi tới ${a.email || '(không có email)'}.\n` +
    `• 📱 Thông báo "Đăng ký tài xế thành công" đã gửi về app.`);
}

function rejectDriverApplication(id, fromModal) {
  const a = DRIVER_APPLICATIONS.find(x => x.id === id);
  if (!a || a.status !== 'pending') return;
  const reason = prompt(`Từ chối đăng ký tài xế "${a.name}".\nNhập lý do (gửi về app + email cho tài xế):`, '');
  if (reason === null) return;
  a.status = 'rejected';
  a.rejectReason = reason;

  closeModal('driver-app-modal');
  renderDriverApplications(a.applyType);
  alert(`Đã từ chối đăng ký "${a.name}".\n📧 Email + 📱 thông báo lý do đã gửi cho tài xế.`);
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
      <td><button class="btn btn-sm btn-outline" onclick="viewIntercityVehicle('${v.id}')">👁️</button> <button class="btn btn-sm btn-outline" onclick="openIntercityVehicleModal('${v.id}')">✏️</button></td>
    </tr>
  `).join('') || `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Không tìm thấy xe</div></div></td></tr>`;
}

// ---- Tạo / chỉnh sửa / xem xe liên tỉnh ----
// Khi TẠO MỚI: ẩn "Số km" (mặc định 0); số ghế + phân loại lấy theo loại xe.
let editingIntercityVehicleId = null;
let _icVehiclePhotoDraft = {}; // bản nháp ảnh xe đang upload

const IC_VEHICLE_CATEGORY_LABELS = {
  seat: 'Ghế ngồi', sleeper: 'Giường nằm', limo_seat: 'Limousine ghế',
  limo_sleeper: 'Limousine giường', other: 'Khác'
};

// Các góc ảnh xe (không bắt buộc)
const VEHICLE_PHOTO_FIELDS = [
  ['front', 'Phía trước'], ['rear', 'Phía sau'], ['right', 'Bên phải'],
  ['left', 'Bên trái'], ['interior', 'Nội thất'], ['odometer', 'Đồng hồ đo km (Odo)']
];

function renderVehiclePhotosUpload() {
  const cell = (path, label) => {
    const url = _icVehiclePhotoDraft[path];
    return `<div class="reg-doc-cell"><div class="reg-doc-cap">${label}</div>
      <label class="reg-doc-upload">
        <img class="reg-doc-img" id="vprev-${path}" src="${url || ''}" style="${url ? '' : 'display:none'}">
        <span class="reg-doc-empty" id="vempty-${path}" style="${url ? 'display:none' : ''}">+ Chọn ảnh</span>
        <input type="file" accept="image/*" hidden onchange="onVehiclePhotoPicked(this,'${path}')">
      </label></div>`;
  };
  return `<div class="reg-doc-grid">${VEHICLE_PHOTO_FIELDS.map(([p, l]) => cell(p, l)).join('')}</div>`;
}

function onVehiclePhotoPicked(input, path) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _icVehiclePhotoDraft[path] = e.target.result;
    const img = document.getElementById('vprev-' + path);
    const empty = document.getElementById('vempty-' + path);
    if (img) { img.src = e.target.result; img.style.display = ''; }
    if (empty) empty.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function fillIntercityVehicleModelSelect() {
  const sel = document.getElementById('ic-vehicle-model');
  if (!sel) return;
  sel.innerHTML = VEHICLE_MODELS.filter(m => m.serviceType === 'INTERCITY')
    .map(m => `<option value="${m.id}" data-seats="${m.seats}" data-category="${m.category}">${m.name}</option>`).join('');
}

// Số ghế + phân loại lấy theo loại xe đã chọn, không cho chỉnh sửa.
function onIntercityVehicleModelChange() {
  const sel = document.getElementById('ic-vehicle-model');
  const opt = sel.options[sel.selectedIndex];
  document.getElementById('ic-vehicle-seats').value = opt ? `${opt.dataset.seats} chỗ` : '';
  document.getElementById('ic-vehicle-category').value =
    opt ? (IC_VEHICLE_CATEGORY_LABELS[opt.dataset.category] || opt.dataset.category) : '';
}

function openIntercityVehicleModal(id) {
  editingIntercityVehicleId = id || null;
  const isEdit = !!id;
  fillIntercityVehicleModelSelect();
  fillIntercityOperatorSelect('ic-vehicle-operator');
  const v = id ? INTERCITY_VEHICLES.find(x => x.id === id) : null;
  document.getElementById('intercity-vehicle-modal-title').textContent =
    v ? `Chỉnh sửa xe · ${v.id}` : 'Thêm xe liên tỉnh';

  // Tạo mới chỉ ẩn "Số km" (theo yêu cầu); các trường còn lại đều có.
  document.getElementById('ic-vehicle-mileage-row').style.display = isEdit ? '' : 'none';

  document.getElementById('ic-vehicle-plate').value = v?.plate || '';
  document.getElementById('ic-vehicle-model').value = v?.seatLayoutId || (VEHICLE_MODELS.find(m=>m.serviceType==='INTERCITY')?.id || '');
  onIntercityVehicleModelChange();
  document.getElementById('ic-vehicle-operator').value = v?.operatorId || (PARTNERS.find(p=>p.status==='active')?.id || '');
  document.getElementById('ic-vehicle-mileage').value = v?.mileage ?? '';
  document.getElementById('ic-vehicle-status').value = v?.status || 'idle';
  _icVehiclePhotoDraft = v?.photos ? { ...v.photos } : {};
  document.getElementById('ic-vehicle-photos').innerHTML = renderVehiclePhotosUpload();
  openModal('intercity-vehicle-modal');
}

function nextVehicleId(prefix, arr) {
  let n = 1;
  while (arr.some(v => v.id === prefix + String(n).padStart(3, '0'))) n++;
  return prefix + String(n).padStart(3, '0');
}

function saveIntercityVehicle() {
  const status = document.getElementById('ic-vehicle-status').value;
  const plate = document.getElementById('ic-vehicle-plate').value.trim();
  const modelSel = document.getElementById('ic-vehicle-model');
  const model = VEHICLE_MODELS.find(m => m.id === modelSel.value);
  const operatorId = document.getElementById('ic-vehicle-operator').value;
  if (!plate) { alert('Vui lòng nhập biển số!'); return; }
  const photos = Object.keys(_icVehiclePhotoDraft).length ? _icVehiclePhotoDraft : null;

  if (editingIntercityVehicleId) {
    const v = INTERCITY_VEHICLES.find(x => x.id === editingIntercityVehicleId);
    if (v) {
      v.plate = plate;
      v.seatLayoutId = modelSel.value;
      v.vehicleClass = model?.name || v.vehicleClass;
      v.category = model?.category || v.category;
      v.operatorId = operatorId;
      const km = parseInt(document.getElementById('ic-vehicle-mileage').value, 10);
      v.mileage = isNaN(km) ? v.mileage : km;
      v.status = status;
      v.photos = photos;
    }
  } else {
    // Tạo mới: số km mặc định 0 (không nhập); số ghế/phân loại suy ra từ loại xe.
    INTERCITY_VEHICLES.push({
      id: nextVehicleId('IV', INTERCITY_VEHICLES), plate, vehicleClass: model?.name || 'Chưa cập nhật',
      category: model?.category || null, seatLayoutId: modelSel.value, operatorId,
      status, currentAssignmentId: null, mileage: 0, photos
    });
  }
  closeModal('intercity-vehicle-modal');
  renderIntercityVehicles();
}

// Xem chi tiết xe liên tỉnh (thông tin + hình ảnh nếu có)
function viewIntercityVehicle(id) {
  const v = INTERCITY_VEHICLES.find(x => x.id === id);
  if (!v) return;
  const row = (l, val) => `<div class="odp-cell"><div class="odp-label">${l}</div><div class="odp-value">${val}</div></div>`;
  const model = VEHICLE_MODELS.find(m => m.id === v.seatLayoutId);
  const seats = model ? `${model.seats} chỗ` : '—';
  const catLabel = v.category ? (IC_VEHICLE_CATEGORY_LABELS[v.category] || v.category) : '—';
  const photos = v.photos || {};
  const hasPhoto = Object.values(photos).some(Boolean);
  document.getElementById('ic-detail-title').textContent = `Thông tin xe · ${v.id}`;
  document.getElementById('ic-detail-body').innerHTML = `
    <div class="doc-section-title" style="margin-top:0">Thông tin xe</div>
    <div class="odp-grid" style="margin-bottom:6px">
      ${row('Biển số', esc(v.plate))}
      ${row('Loại xe', esc(v.vehicleClass))}
      ${row('Số ghế', seats)}
      ${row('Phân loại', catLabel)}
      ${row('Nhà xe quản lý', getPartnerName(v.operatorId))}
      ${row('Số km', `${(v.mileage || 0).toLocaleString()} km`)}
      ${row('Trạng thái', `<span class="badge ${VEHICLE_STATUS[v.status]?.class||'badge-offline'}">${VEHICLE_STATUS[v.status]?.label||v.status}</span>`)}
      ${row('Đang gán', v.currentAssignmentId || '—')}
    </div>
    <div class="doc-section-title">Hình ảnh xe</div>
    ${hasPhoto
      ? `<div class="reg-doc-grid">${VEHICLE_PHOTO_FIELDS.map(([p, l]) => docViewCell(l, photos[p])).join('')}</div>`
      : `<div class="reg-doc-empty">Chưa có hình ảnh xe</div>`}
  `;
  openModal('ic-detail-modal');
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
  renderDriverApplications('bikecar');

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

// Lấy đơn đăng kiểm/bảo dưỡng (có ảnh hồ sơ) liên kết với 1 booking, nếu có
function getBookingDocOrder(b) {
  if (b.bookingType === 'SERVICE_ORDER' && b.serviceOrderId) {
    const order = REGISTRATIONS.find(r => r.id === b.serviceOrderId);
    if (order?.docImages && (order.docImages.front || order.docImages.back)) return { kind: 'reg', order };
  }
  if (b.bookingType === 'MAINTENANCE_ORDER' && b.maintenanceOrderId) {
    const order = MAINTENANCE.find(r => r.id === b.maintenanceOrderId);
    if (order?.docImages && (order.docImages.front || order.docImages.back)) return { kind: 'mnt', order };
  }
  return null;
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
      ${(() => { const d = getBookingDocOrder(b); return d ? `<div class="input-group full-width"><label>${d.kind === 'reg' ? 'Hồ sơ đăng kiểm' : 'Hồ sơ bảo dưỡng'}</label><div style="padding:8px 0;font-size:13px"><a href="javascript:void(0)" class="text-accent fw-600" onclick="viewOrderDocs('${d.kind}','${d.order.id}')">📷 Xem ảnh mặt trước / mặt sau</a></div></div>` : ''; })()}
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
  if (canDispatch && b.fulfillmentStatus === 'ASSIGNED') actions += `<button class="btn btn-primary" onclick="closeModal('booking-detail-modal');startTrip('${b.id}','master')">▶️ Bắt đầu chuyến</button>`;
  if (canDispatch && b.fulfillmentStatus === 'IN_PROGRESS') {
    actions += `<button class="btn btn-success" onclick="closeModal('booking-detail-modal');completeTrip('${b.id}','master')">🏁 Hoàn thành</button>`;
    actions += `<button class="btn btn-outline" onclick="closeModal('booking-detail-modal');markNoShow('${b.id}','master')">🚫 No-show</button>`;
  }
  if (canDispatch && b.bookingStatus === 'RESCHEDULE_REQUESTED') {
    actions += `<button class="btn btn-success" onclick="resolveReschedule('${b.id}',true)">✅ Duyệt đổi lịch</button>`;
    actions += `<button class="btn btn-outline" onclick="resolveReschedule('${b.id}',false)">Từ chối</button>`;
  }
  if (canCancel && ['PENDING_CONFIRMATION','CONFIRMED'].includes(b.bookingStatus) && b.fulfillmentStatus !== 'IN_PROGRESS') actions += `<button class="btn btn-danger" onclick="cancelBooking('${b.id}')">Hủy booking</button>`;
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

  sendConfiguredNotification({
    eventType: 'fulfillment_cancelled_user',
    booking: b,
    recipient: b.customerId,
    fallbackType: 'booking_cancelled',
    fallbackTitle: 'Đơn đã bị huỷ',
    fallbackContent: `Booking ${b.bookingCode} đã bị hủy. Lý do: ${reason}`,
    extra: { reason },
    actionPage: 'bookings',
    targetId: b.id
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
// BOOKING LIFECYCLE — các bước vận hành khép kín
// Gọi từ bảng Fulfillment (operator, sourceSite='master') hoặc panel mô phỏng
// app Tài xế (sourceSite='driver'). Đảm bảo data lan sang ví/quyết toán/audit.
// ============================================
function getBookingTask(bookingId) {
  const b = BOOKINGS.find(x => x.id === bookingId);
  if (!b) return { b: null, t: null };
  const t = b.fulfillmentTaskId ? FULFILLMENT_TASKS.find(x => x.id === b.fulfillmentTaskId) : null;
  return { b, t };
}

// Đồng bộ trạng thái đơn đăng kiểm / bảo dưỡng theo vòng đời booking
function syncServiceStatus(b, phase) {
  const st = { in_progress: 'confirmed', completed: 'completed' }[phase];
  if (!st) return;
  if (b.serviceOrderId) { const r = REGISTRATIONS.find(x => x.id === b.serviceOrderId); if (r) r.status = st; }
  if (b.maintenanceOrderId) { const m = MAINTENANCE.find(x => x.id === b.maintenanceOrderId); if (m) m.status = st; }
}

// TX nhận chuyến (app tài xế)
function driverAcceptTask(bookingId, sourceSite = 'driver') {
  const { b, t } = getBookingTask(bookingId);
  if (!b || !t || t.status !== 'ASSIGNED' || t.acceptedAt) return;
  t.acceptedAt = nowStr();
  const traceId = newTraceId();
  createNotification({ type: 'driver_accepted', recipient: b.customerId,
    content: `Tài xế đã nhận chuyến ${b.bookingCode}, đang đến điểm đón` });
  createAuditLog({ action: 'fulfillment.accept', target: t.id, traceId, sourceSite,
    actor: b.driverId, actorRole: 'DRIVER', before: { accepted: false }, after: { accepted: true } });
  renderPage(currentPage); updateBadges();
}

// TX từ chối → trả booking về hàng chờ phân công
function driverRejectTask(bookingId, reason = 'Tài xế từ chối', sourceSite = 'driver') {
  const { b, t } = getBookingTask(bookingId);
  if (!b || !t || t.status !== 'ASSIGNED') return;
  const traceId = newTraceId();
  const prevDriver = b.driverId;
  if (t.vehicleId) releaseVehicle(t.vehicleId);
  if (prevDriver) releaseDriver(prevDriver);
  t.status = 'CANCELLED';
  b.driverId = null;
  b.fulfillmentTaskId = null;
  b.fulfillmentStatus = 'PENDING';
  b.updatedAt = nowStr();
  sendConfiguredNotification({
    eventType: 'fulfillment_cancelled_user',
    booking: b,
    recipient: b.customerId,
    fallbackType: 'driver_rejected',
    fallbackTitle: 'Tài xế từ chối đơn',
    fallbackContent: `Đang tìm tài xế khác cho chuyến ${b.bookingCode}`,
    extra: { reason },
    actionPage: 'bookings',
    targetId: b.id
  });
  createAuditLog({ action: 'fulfillment.reject', target: t.id, traceId, sourceSite,
    actor: prevDriver, actorRole: 'DRIVER', before: { driver: prevDriver }, after: { status: 'PENDING', reason } });
  renderPage(currentPage); updateBadges();
}

// TX bắt đầu chạy → IN_PROGRESS
function startTrip(bookingId, sourceSite = 'driver') {
  const { b, t } = getBookingTask(bookingId);
  if (!b || !t || t.status !== 'ASSIGNED') return;
  const traceId = newTraceId();
  t.status = 'IN_PROGRESS';
  t.startedAt = nowStr();
  if (!t.acceptedAt) t.acceptedAt = nowStr();
  b.bookingStatus = 'IN_PROGRESS';
  b.fulfillmentStatus = 'IN_PROGRESS';
  b.updatedAt = nowStr();
  const d = findDriver(b.driverId); if (d) { d.status = 'busy'; d.currentAssignmentId = t.id; }
  if (t.vehicleId) { const v = INTERCITY_VEHICLES.find(x => x.id === t.vehicleId); if (v) { v.status = 'busy'; v.currentAssignmentId = t.id; } }
  syncServiceStatus(b, 'in_progress');
  sendConfiguredNotification({
    eventType: 'fulfillment_in_progress_user',
    booking: b,
    recipient: b.customerId,
    fallbackType: 'trip_started',
    fallbackTitle: 'Chuyến đã bắt đầu',
    fallbackContent: `Chuyến ${b.bookingCode} đã bắt đầu`,
    actionPage: 'bookings',
    targetId: b.id
  });
  createAuditLog({ action: 'booking.start', target: b.id, traceId, sourceSite,
    actor: b.driverId, actorRole: 'DRIVER', before: { status: 'CONFIRMED' }, after: { status: 'IN_PROGRESS' } });
  renderPage(currentPage); updateBadges();
}

// TX hoàn thành → COMPLETED + quyết toán
function completeTrip(bookingId, sourceSite = 'driver') {
  const { b, t } = getBookingTask(bookingId);
  if (!b || !t || t.status !== 'IN_PROGRESS') return;
  const traceId = newTraceId();
  t.status = 'COMPLETED';
  t.completedAt = nowStr();
  b.bookingStatus = 'COMPLETED';
  b.fulfillmentStatus = 'COMPLETED';
  b.updatedAt = nowStr();
  completeBookingSettlement(b, traceId);   // chiết khấu + thu nhập TX + nhả tiền giữ
  if (b.driverId) releaseDriver(b.driverId);
  if (t.vehicleId) releaseVehicle(t.vehicleId);
  syncServiceStatus(b, 'completed');
  sendConfiguredNotification({
    eventType: 'fulfillment_completed_user',
    booking: b,
    recipient: b.customerId,
    fallbackType: 'trip_completed',
    fallbackTitle: 'Đơn đã hoàn thành',
    fallbackContent: `Chuyến ${b.bookingCode} đã hoàn thành. Cảm ơn bạn!`,
    actionPage: 'bookings',
    targetId: b.id
  });
  createAuditLog({ action: 'booking.complete', target: b.id, traceId, sourceSite,
    actor: b.driverId, actorRole: 'DRIVER', before: { status: 'IN_PROGRESS' }, after: { status: 'COMPLETED' } });
  renderPage(currentPage); updateBadges();
}

// Khách không xuất hiện → huỷ, KHÔNG hoàn tiền (giữ khoản đã thu)
function markNoShow(bookingId, sourceSite = 'driver') {
  const { b, t } = getBookingTask(bookingId);
  if (!b) return;
  const traceId = newTraceId();
  if (t) { if (t.vehicleId) releaseVehicle(t.vehicleId); t.status = 'CANCELLED'; }
  if (b.driverId) releaseDriver(b.driverId);
  if (b.bookingType === 'INTERCITY' && b.tripId) {
    const trip = INTERCITY_TRIPS.find(tr => tr.id === b.tripId);
    if (trip) { const n = (b.passengerSnapshot && b.passengerSnapshot.length) || 1;
      trip.seatsAvailable = Math.min(trip.seatsTotal, trip.seatsAvailable + n);
      if (trip.seatsAvailable > 0 && trip.status === 'full') trip.status = 'available'; }
  }
  b.bookingStatus = 'CANCELLED';
  b.fulfillmentStatus = 'CANCELLED';
  b.updatedAt = nowStr();
  sendConfiguredNotification({
    eventType: 'fulfillment_cancelled_user',
    booking: b,
    recipient: b.customerId,
    fallbackType: 'booking_noshow',
    fallbackTitle: 'Đơn đã bị huỷ',
    fallbackContent: `Chuyến ${b.bookingCode} bị huỷ do khách không xuất hiện (không hoàn tiền)`,
    extra: { reason: 'Khách không xuất hiện' },
    actionPage: 'bookings',
    targetId: b.id
  });
  createAuditLog({ action: 'booking.noshow', target: b.id, traceId, sourceSite,
    actor: b.driverId, actorRole: 'DRIVER', before: { status: b.bookingStatus }, after: { status: 'CANCELLED', reason: 'no-show' } });
  renderPage(currentPage); updateBadges();
}

// Nút hành động theo trạng thái task trong bảng Fulfillment (operator)
function renderFulfillmentActions(t, canAssign, isInter) {
  if (!canAssign) return '—';
  const reassign = `<button class="btn btn-sm btn-outline" title="Gán lại" onclick="${isInter ? `openIntercityDispatchModal('${t.bookingId}')` : `openDispatchModal('${t.bookingId}')`}">🔄</button>`;
  if (t.status === 'ASSIGNED') {
    return `<div style="display:flex;gap:4px;justify-content:center">
      <button class="btn btn-sm btn-primary" title="Bắt đầu chuyến" onclick="startTrip('${t.bookingId}','master')">▶️ Bắt đầu</button>${reassign}</div>`;
  }
  if (t.status === 'IN_PROGRESS') {
    return `<div style="display:flex;gap:4px;justify-content:center">
      <button class="btn btn-sm btn-success" title="Hoàn thành" onclick="completeTrip('${t.bookingId}','master')">🏁 Xong</button>
      <button class="btn btn-sm btn-outline" title="Khách không xuất hiện" onclick="markNoShow('${t.bookingId}','master')">🚫</button></div>`;
  }
  return '—';
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
      <td>${renderFulfillmentActions(t, canAssign, isInter)}</td>
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
  selectedDispatchDriverId = null;
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
  // SERVICE/MAINTENANCE dùng chung pool INTERCITY_DRIVERS → logic hiển thị giống liên tỉnh:
  //   status !== 'offline' và rảnh trong khung giờ (không xung đột lịch khác)
  // BIKE/CAR (real-time) → chỉ TX đang online
  const isServiceType = b.bookingType === 'SERVICE_ORDER' || b.bookingType === 'MAINTENANCE_ORDER';
  _dispatchDrivers = isServiceType
    ? pool.filter(d => d.status !== 'offline' && isDriverFreeAt(d.id, window, b.fulfillmentTaskId))
    : pool.filter(d => d.status === 'online');

  document.getElementById('dispatch-modal-driver-count').textContent = `(${_dispatchDrivers.length})`;
  renderDispatchDriverCards();
  renderDispatchSelected();
  openModal('dispatch-modal');
}

// Render card tài xế cho modal gán mặc định (bike/car/service/maintenance)
function renderDispatchDriverCards() {
  const list = document.getElementById('dispatch-modal-driver-list');
  if (!_dispatchDrivers.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-text">Không có tài xế khả dụng</div></div>';
    return;
  }
  list.innerHTML = _dispatchDrivers.map(d => {
    const meta = d.plate
      ? `${VEHICLE_TYPES[d.vehicleType]?.icon || ''} ${d.plate}`
      : `🪪 GPLX ${d.licenseClass || '—'} · ${getPartnerName(d.operatorId)}`;
    const busy = d.status === 'busy' ? describeNextBusyWindow('driver', d.id) : null;
    const nBusy = _busyWindows('driver', d.id, null).length;
    const sel = d.id === selectedDispatchDriverId;
    return `<div class="dispatch-pick-card ${sel ? 'selected' : ''}" onclick="selectDispatchDriver('${d.id}')">
      <div class="driver-avatar">${d.avatar}</div>
      <div class="dispatch-pick-info">
        <div class="dispatch-pick-name">${d.name}${sel ? '<span class="dispatch-pick-check">✓</span>' : ''}</div>
        <div class="dispatch-pick-meta">${meta} · ⭐ ${d.rating}</div>
        <div class="dispatch-pick-sub">${busy ? `⏳ đang bận ${busy}${nBusy > 1 ? ` +${nBusy - 1} lịch` : ''}` : 'Sẵn sàng nhận chuyến'}</div>
      </div>
      ${driverBadge(d.status)}
    </div>`;
  }).join('');
}

function selectDispatchDriver(id) {
  selectedDispatchDriverId = (selectedDispatchDriverId === id) ? null : id;
  renderDispatchDriverCards();
  renderDispatchSelected();
}

function renderDispatchSelected() {
  const el = document.getElementById('dispatch-selected');
  const d = selectedDispatchDriverId ? findDriver(selectedDispatchDriverId) : null;
  if (!d) {
    el.innerHTML = `<div class="dispatch-sel-title">✅ Đã chọn</div><div class="dispatch-sel-box"><div class="dispatch-sel-empty">🧑‍✈️ Chưa chọn tài xế</div></div>`;
    return;
  }
  const meta = d.plate
    ? `${VEHICLE_TYPES[d.vehicleType]?.icon || ''} ${d.plate}`
    : `🪪 GPLX ${d.licenseClass || '—'} · ${getPartnerName(d.operatorId)}`;
  const exclude = selectedDispatchBooking ? selectedDispatchBooking.fulfillmentTaskId : null;
  el.innerHTML = `<div class="dispatch-sel-title">✅ Đã chọn</div>
    <div class="dispatch-sel-box filled">
      <div class="dispatch-sel-head"><span class="driver-avatar">${d.avatar}</span><div><div class="dispatch-sel-name">${d.name}</div><div class="dispatch-sel-meta">${meta} · ⭐ ${d.rating}</div></div></div>
      <div class="dispatch-sel-notes-title">${_busyNotesTitle('driver', d.id, exclude)}</div>
      <div class="dispatch-sel-notes">${_busyWindowsHtml('driver', d.id, exclude)}</div>
    </div>`;
}

// Intercity: dispatch modal với 2 dropdown — xe và tài xế độc lập
function openIntercityDispatchModal(bookingId) {
  const b = BOOKINGS.find(x => x.id === bookingId);
  if (!b || b.bookingType !== 'INTERCITY') return;
  selectedDispatchBooking = b;
  selectedIntercityVehicleId = null;
  selectedIntercityDriverId = null;

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
  // Xe chỉ được gán cho đơn cùng nhà xe quản lý (giống tài xế)
  const sameOpVehicles = operatorId ? vehiclesAvail.filter(v => v.operatorId === operatorId) : vehiclesAvail;
  _icDispatchVehicles = sameOpVehicles.map(v => ({ v, sameOp: true }));

  // Tài xế: filter theo:
  //   - status !== 'offline'
  //   - không xung đột thời gian (đang bận khung giờ khác → vẫn được)
  const driversAvail = INTERCITY_DRIVERS.filter(d =>
    d.status !== 'offline' && isDriverFreeAt(d.id, window, b.fulfillmentTaskId)
  );
  // TX chỉ được gán cho đơn cùng nhà xe quản lý
  const sameOpDrivers = operatorId ? driversAvail.filter(d => d.operatorId === operatorId) : driversAvail;
  _icDispatchDrivers = sameOpDrivers.map(d => ({ d, sameOp: true }));

  document.getElementById('intercity-dispatch-vehicle-count').textContent = `(${sameOpVehicles.length})`;
  document.getElementById('intercity-dispatch-driver-count').textContent = `(${sameOpDrivers.length})`;

  renderIcDispatchVehicleCards();
  renderIcDispatchDriverCards();
  renderIcDispatchSelected();

  openModal('intercity-dispatch-modal');
}

// Render card xe trong popup phân công (bố cục giống cột "Xe sẵn sàng")
function renderIcDispatchVehicleCards() {
  const list = document.getElementById('intercity-dispatch-vehicle-list');
  if (!_icDispatchVehicles.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-text">Không có xe khả dụng</div></div>';
    return;
  }
  list.innerHTML = _icDispatchVehicles.map(({ v }) => {
    const op = PARTNERS.find(p => p.id === v.operatorId);
    const busy = v.status === 'busy' ? describeNextBusyWindow('vehicle', v.id) : null;
    const nBusy = _busyWindows('vehicle', v.id, null).length;
    const busyTxt = busy ? `⏳ ${busy}${nBusy > 1 ? ` +${nBusy - 1} lịch` : ''}` : '';
    const sel = v.id === selectedIntercityVehicleId;
    return `<div class="dispatch-pick-card ${sel ? 'selected' : ''}" onclick="selectIcVehicle('${v.id}')">
      <div class="driver-avatar">🚐</div>
      <div class="dispatch-pick-info">
        <div class="dispatch-pick-name">${v.plate}${sel ? '<span class="dispatch-pick-check">✓</span>' : ''}</div>
        <div class="dispatch-pick-meta">${v.vehicleClass} · ${op ? op.name : '—'}</div>
        <div class="dispatch-pick-sub">${v.mileage.toLocaleString()}km${busyTxt ? ` · ${busyTxt}` : ''}</div>
      </div>
      <span class="badge ${VEHICLE_STATUS[v.status]?.class || 'badge-offline'}">${VEHICLE_STATUS[v.status]?.label || v.status}</span>
    </div>`;
  }).join('');
}

// Render card tài xế trong popup phân công (bố cục giống cột "Tài xế sẵn sàng")
function renderIcDispatchDriverCards() {
  const list = document.getElementById('intercity-dispatch-driver-list');
  if (!_icDispatchDrivers.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-text">Không có TX khả dụng</div></div>';
    return;
  }
  list.innerHTML = _icDispatchDrivers.map(({ d }) => {
    const op = PARTNERS.find(p => p.id === d.operatorId);
    const busy = d.status === 'busy' ? describeNextBusyWindow('driver', d.id) : null;
    const nBusy = _busyWindows('driver', d.id, null).length;
    const sel = d.id === selectedIntercityDriverId;
    return `<div class="dispatch-pick-card ${sel ? 'selected' : ''}" onclick="selectIcDriver('${d.id}')">
      <div class="driver-avatar">${d.avatar}</div>
      <div class="dispatch-pick-info">
        <div class="dispatch-pick-name">${d.name}${sel ? '<span class="dispatch-pick-check">✓</span>' : ''}</div>
        <div class="dispatch-pick-meta">🚌 ${op ? op.name : 'Cá nhân'} · ⭐ ${d.rating} · ${d.trips} chuyến</div>
        <div class="dispatch-pick-sub">${busy ? `⏳ đang bận ${busy}${nBusy > 1 ? ` +${nBusy - 1} lịch` : ''}` : 'Sẵn sàng nhận chuyến'}</div>
      </div>
      ${driverBadge(d.status)}
    </div>`;
  }).join('');
}

function selectIcVehicle(id) {
  selectedIntercityVehicleId = (selectedIntercityVehicleId === id) ? null : id;
  renderIcDispatchVehicleCards();
  renderIcDispatchSelected();
}

function selectIcDriver(id) {
  selectedIntercityDriverId = (selectedIntercityDriverId === id) ? null : id;
  renderIcDispatchDriverCards();
  renderIcDispatchSelected();
}

// Các khung giờ đang bận (đơn đã gán chưa hoàn thành) của 1 xe/TX — chỉ hiện thời gian,
// 1 entity có thể có nhiều lịch ở khung khác nhau. Sắp xếp tăng dần theo giờ bắt đầu.
function _busyWindows(entityType, entityId, excludeFtId) {
  return _entityActiveFts(entityType, entityId, excludeFtId)
    .map(ft => getBookingTimeWindow(BOOKINGS.find(x => x.id === ft.bookingId)))
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);
}

function _busyWindowsHtml(entityType, entityId, excludeFtId) {
  const wins = _busyWindows(entityType, entityId, excludeFtId);
  if (!wins.length) return '<div class="dispatch-note-empty">Không có lịch bận</div>';
  return wins.map((w, i) => `<div class="dispatch-note-row"><span class="dispatch-note-idx">${i + 1}</span>🕐 ${fmtBookingWindow(w)}</div>`).join('');
}

// Tiêu đề panel ghi chú kèm số lịch bận
function _busyNotesTitle(entityType, entityId, excludeFtId) {
  const n = _busyWindows(entityType, entityId, excludeFtId).length;
  return `📌 Khung giờ đang bận${n ? ` (${n})` : ''}`;
}

// Tổng quan tài xế & xe đã chọn + ghi chú đơn đang gán
function renderIcDispatchSelected() {
  const el = document.getElementById('intercity-dispatch-selected');
  const v = selectedIntercityVehicleId ? INTERCITY_VEHICLES.find(x => x.id === selectedIntercityVehicleId) : null;
  const d = selectedIntercityDriverId ? (INTERCITY_DRIVERS.find(x => x.id === selectedIntercityDriverId) || findDriver(selectedIntercityDriverId)) : null;
  const dOp = d ? PARTNERS.find(p => p.id === d.operatorId) : null;
  const vOp = v ? PARTNERS.find(p => p.id === v.operatorId) : null;

  const exclude = selectedDispatchBooking ? selectedDispatchBooking.fulfillmentTaskId : null;

  const vehicleBox = v
    ? `<div class="dispatch-sel-box filled">
        <div class="dispatch-sel-head"><span class="driver-avatar">🚐</span><div><div class="dispatch-sel-name">${v.plate}</div><div class="dispatch-sel-meta">${v.vehicleClass} · ${vOp ? vOp.name : '—'}</div></div></div>
        <div class="dispatch-sel-notes-title">${_busyNotesTitle('vehicle', v.id, exclude)}</div>
        <div class="dispatch-sel-notes">${_busyWindowsHtml('vehicle', v.id, exclude)}</div>
      </div>`
    : `<div class="dispatch-sel-box"><div class="dispatch-sel-empty">🚐 Chưa chọn xe</div></div>`;

  const driverBox = d
    ? `<div class="dispatch-sel-box filled">
        <div class="dispatch-sel-head"><span class="driver-avatar">${d.avatar}</span><div><div class="dispatch-sel-name">${d.name}</div><div class="dispatch-sel-meta">${dOp ? dOp.name : 'Cá nhân'} · ⭐ ${d.rating}</div></div></div>
        <div class="dispatch-sel-notes-title">${_busyNotesTitle('driver', d.id, exclude)}</div>
        <div class="dispatch-sel-notes">${_busyWindowsHtml('driver', d.id, exclude)}</div>
      </div>`
    : `<div class="dispatch-sel-box"><div class="dispatch-sel-empty">🧑‍✈️ Chưa chọn tài xế</div></div>`;

  el.innerHTML = `<div class="dispatch-sel-title">✅ Đã chọn</div><div class="dispatch-sel-grid">${vehicleBox}${driverBox}</div>`;
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
  const driverId = selectedDispatchDriverId;
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

  sendConfiguredNotification({
    eventType: 'driver_new_task',
    booking: b,
    recipient: driverId,
    recipientGroup: 'DRIVER',
    driver,
    fallbackType: 'driver_assigned',
    fallbackTitle: 'Có đơn mới',
    fallbackContent: `Bạn được gán chuyến ${b.bookingCode} (${b.pickup} → ${b.dropoff})`,
    actionPage: 'fulfillment',
    targetId: b.id
  });
  sendConfiguredNotification({
    eventType: 'fulfillment_assigned_user',
    booking: b,
    recipient: b.customerId,
    driver,
    fallbackType: 'driver_assigned',
    fallbackTitle: 'Đơn đã có tài xế',
    fallbackContent: `Tài xế ${driver.name}${driver.plate ? ' (' + driver.plate + ')' : ''} sẽ phục vụ chuyến ${b.bookingCode}`,
    actionPage: 'bookings',
    targetId: b.id
  });

  closeModal('dispatch-modal');
  selectedDispatchBooking = null;
  selectedDispatchDriverId = null;
  renderPage(currentPage);
  updateBadges();
}

// Intercity: gán xe + tài xế độc lập trong cùng 1 thao tác
function assignIntercityDispatch() {
  const vehicleId = selectedIntercityVehicleId;
  const driverId = selectedIntercityDriverId;
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

  sendConfiguredNotification({
    eventType: 'driver_new_task',
    booking: b,
    recipient: driverId,
    recipientGroup: 'DRIVER',
    driver,
    fallbackType: 'driver_assigned',
    fallbackTitle: 'Có chuyến liên tỉnh mới',
    fallbackContent: `Bạn được gán chuyến ${b.bookingCode} — lái xe ${vehicle.plate} (${vehicle.vehicleClass})`,
    extra: { vehicleType: vehicle.vehicleClass },
    actionPage: 'fulfillment',
    targetId: b.id
  });
  createNotification({
    type: 'vehicle_assigned', recipient: vehicle.operatorId,
    title: 'Xe được gán chuyến',
    content: `Xe ${vehicle.plate} được gán chuyến ${b.bookingCode}`,
    targetId: b.id,
    actionPage: 'fulfillment'
  });
  sendConfiguredNotification({
    eventType: 'fulfillment_assigned_user',
    booking: b,
    recipient: b.customerId,
    driver,
    fallbackType: 'driver_assigned',
    fallbackTitle: 'Đơn đã có tài xế',
    fallbackContent: `Tài xế ${driver.name} sẽ phục vụ chuyến ${b.bookingCode} (xe ${vehicle.plate})`,
    extra: { vehicleType: vehicle.vehicleClass },
    actionPage: 'bookings',
    targetId: b.id
  });
  createAuditLog({
    action: 'fulfillment.assign_intercity', target: ft.id, traceId,
    before: null, after: { driver: driverId, vehicle: vehicleId }
  });

  closeModal('intercity-dispatch-modal');
  selectedDispatchBooking = null;
  selectedIntercityVehicleId = null;
  selectedIntercityDriverId = null;
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
const OWNER_TYPE_META = {
  CUSTOMER: { label: 'Khách hàng', icon: '👤' },
  DRIVER:   { label: 'Tài xế',     icon: '🧑‍✈️' },
  PARTNER:  { label: 'Đối tác',    icon: '🤝' },
  SYSTEM:   { label: 'Hệ thống',   icon: '🖥️' },
};
let selectedWalletId = null;
let txDirFilter = '';

function renderWallets() {
  let wallets = [...WALLETS];
  const tf = document.getElementById('wallet-type-filter')?.value;
  if (tf) wallets = wallets.filter(w => w.ownerType === tf);
  const search = document.getElementById('wallet-search')?.value?.toLowerCase();
  if (search) wallets = wallets.filter(w =>
    w.ownerName.toLowerCase().includes(search) || w.id.toLowerCase().includes(search));

  // Tổng quan
  const total = WALLETS.reduce((s,w) => s + w.balance, 0);
  const pending = WALLETS.reduce((s,w) => s + w.pendingBalance, 0);
  const active = WALLETS.filter(w => w.status === 'ACTIVE').length;
  document.getElementById('wallet-stats').innerHTML = `
    <div class="stat-card accent"><div class="stat-card-header"><div class="stat-card-icon accent">💰</div><span class="stat-card-label">Tổng số dư</span></div><div class="stat-card-value">${fmt(total)}</div></div>
    <div class="stat-card success"><div class="stat-card-header"><div class="stat-card-icon success">✅</div><span class="stat-card-label">Khả dụng</span></div><div class="stat-card-value">${fmt(total - pending)}</div></div>
    <div class="stat-card warning"><div class="stat-card-header"><div class="stat-card-icon warning">🔒</div><span class="stat-card-label">Tạm giữ</span></div><div class="stat-card-value">${fmt(pending)}</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon info">📊</div><span class="stat-card-label">Ví hoạt động</span></div><div class="stat-card-value">${active}/${WALLETS.length}</div></div>
  `;

  // Danh sách ví (item bấm chọn)
  document.getElementById('wallet-list').innerHTML = wallets.map(w => {
    const om = OWNER_TYPE_META[w.ownerType] || { label: w.ownerType, icon: '💼' };
    const st = WALLET_STATUS[w.status] || { label: w.status, class: 'badge-expired' };
    return `<div class="wallet-item ${selectedWalletId === w.id ? 'active' : ''}" onclick="selectWallet('${w.id}')">
      <div class="wallet-item-avatar">${om.icon}</div>
      <div class="wallet-item-main">
        <div class="wallet-item-name">${esc(w.ownerName)}</div>
        <div class="wallet-item-sub">${w.id} · ${WALLET_TYPES[w.walletType]?.icon||''} ${WALLET_TYPES[w.walletType]?.label||w.walletType}</div>
      </div>
      <div class="wallet-item-right">
        <div class="wallet-item-balance ${w.balance>0?'text-success':'text-muted'}">${fmt(w.balance)}</div>
        <span class="badge ${st.class}" style="font-size:10px">${st.label}</span>
      </div>
    </div>`;
  }).join('') || `<div class="odp-empty"><div class="odp-empty-icon">🔍</div>Không tìm thấy ví</div>`;

  renderWalletDetail(selectedWalletId);
}

function selectWallet(id) {
  selectedWalletId = (selectedWalletId === id) ? null : id;
  txDirFilter = '';
  renderWallets();
}

// Một dòng giao dịch trong bảng chi tiết
function walletTxRow(tx, showOwner) {
  const t = TRANSACTION_TYPES[tx.type] || { label: tx.type };
  const w = WALLETS.find(w => w.id === tx.walletId);
  // HOLD/RELEASE chỉ ảnh hưởng tạm giữ, không đổi số dư → hiển thị trung tính
  let amtCls = 'text-muted', sign = '', col = fmt(tx.amount);
  if (tx.direction === 'CREDIT') { amtCls = 'text-success'; sign = '+'; }
  else if (tx.direction === 'DEBIT') { amtCls = 'text-danger'; sign = '−'; }
  else if (tx.direction === 'HOLD') { amtCls = 'text-warning'; sign = '🔒 '; }
  else if (tx.direction === 'RELEASE') { amtCls = 'text-accent'; sign = '🔓 '; }
  return `<tr>
    <td class="text-muted" style="white-space:nowrap">${tx.createdAt}</td>
    ${showOwner ? `<td class="fw-600">${esc(w ? w.ownerName : tx.walletId)}</td>` : ''}
    <td>${t.label}<div class="text-muted" style="font-size:11px;font-family:monospace">${tx.referenceType}:${tx.referenceId}</div></td>
    <td class="fw-700 ${amtCls}" style="white-space:nowrap">${sign}${col}</td>
    <td style="white-space:nowrap">${fmt(tx.balance)}</td>
    <td><span class="badge badge-${tx.status==='SUCCESS'?'completed':tx.status==='PENDING'?'pending':'cancelled'}">${tx.status}</span></td>
  </tr>`;
}

function walletTxTable(list, showOwner) {
  if (!list.length) return `<div class="odp-empty" style="padding:32px"><div class="odp-empty-icon">🧾</div>Chưa có giao dịch</div>`;
  return `<div class="table-wrapper"><table class="wallet-tx-table">
    <thead><tr><th>Thời gian</th>${showOwner?'<th>Chủ ví</th>':''}<th>Loại</th><th>Số tiền</th><th>Số dư</th><th>Trạng thái</th></tr></thead>
    <tbody>${list.map(tx => walletTxRow(tx, showOwner)).join('')}</tbody>
  </table></div>`;
}

function renderWalletDetail(id) {
  const pane = document.getElementById('wallet-detail');
  if (!pane) return;
  const sorted = arr => [...arr].sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));
  const dirSel = `<select class="input" style="height:32px;width:auto" onchange="txDirFilter=this.value;renderWalletDetail(selectedWalletId)">
      <option value="" ${txDirFilter===''?'selected':''}>Tất cả</option>
      <option value="CREDIT" ${txDirFilter==='CREDIT'?'selected':''}>↑ Tiền vào</option>
      <option value="DEBIT" ${txDirFilter==='DEBIT'?'selected':''}>↓ Tiền ra</option>
    </select>`;

  // Chưa chọn ví → feed toàn bộ giao dịch
  if (!id) {
    let txs = sorted(WALLET_TRANSACTIONS);
    if (txDirFilter) txs = txs.filter(t => t.direction === txDirFilter);
    pane.innerHTML = `
      <div class="wallet-detail-head">
        <div><div class="wallet-detail-title">🧾 Tất cả giao dịch gần đây</div>
        <div class="text-muted" style="font-size:12px">Chọn một ví bên trái để xem chi tiết & lịch sử riêng</div></div>
        <div>${dirSel}</div>
      </div>
      ${walletTxTable(txs.slice(0, 50), true)}`;
    return;
  }

  const w = WALLETS.find(x => x.id === id);
  if (!w) { selectedWalletId = null; renderWalletDetail(null); return; }
  const om = OWNER_TYPE_META[w.ownerType] || { label: w.ownerType, icon: '💼' };
  const st = WALLET_STATUS[w.status] || { label: w.status, class: 'badge-expired' };
  let txs = sorted(WALLET_TRANSACTIONS.filter(t => t.walletId === id));
  if (txDirFilter) txs = txs.filter(t => t.direction === txDirFilter);
  const locked = w.status === 'LOCKED';

  pane.innerHTML = `
    <div class="wallet-detail-head">
      <div class="wallet-detail-owner">
        <div class="wallet-item-avatar lg">${om.icon}</div>
        <div>
          <div class="wallet-detail-title">${esc(w.ownerName)}</div>
          <div class="text-muted" style="font-size:12px">${w.id} · ${om.label} · ${WALLET_TYPES[w.walletType]?.icon||''} ${WALLET_TYPES[w.walletType]?.label||w.walletType}</div>
        </div>
      </div>
      <span class="badge ${st.class}">${st.label}</span>
    </div>

    <div class="wallet-balance-tiles">
      <div class="wallet-balance-tile"><div class="wbt-label">Số dư</div><div class="wbt-value text-success">${fmt(w.balance)}</div></div>
      <div class="wallet-balance-tile"><div class="wbt-label">Khả dụng</div><div class="wbt-value">${fmt(w.balance - w.pendingBalance)}</div></div>
      <div class="wallet-balance-tile"><div class="wbt-label">Tạm giữ</div><div class="wbt-value text-warning">${fmt(w.pendingBalance)}</div></div>
    </div>

    <div class="wallet-detail-actions">
      <button class="btn btn-sm btn-primary" onclick="topupWallet('${w.id}')" ${locked?'disabled':''}>💳 Nạp tiền</button>
      <button class="btn btn-sm btn-outline" onclick="adjustWallet('${w.id}')" ${locked?'disabled':''}>🔧 Điều chỉnh</button>
      <button class="btn btn-sm btn-outline" onclick="toggleWalletLock('${w.id}')" style="color:${locked?'var(--success)':'var(--danger)'}">${locked?'🔓 Mở khóa':'🔒 Khóa ví'}</button>
      ${w.ownerType === 'DRIVER' ? `<button class="btn btn-sm btn-outline" onclick="openCashSettle('${w.id}')" ${locked?'disabled':''}>🚌 Quyết toán chuyến tiền mặt</button>` : ''}
    </div>

    <div class="wallet-detail-head" style="margin-top:6px">
      <div class="wallet-detail-title" style="font-size:14px">Lịch sử giao dịch <span class="text-muted">(${txs.length})</span></div>
      <div>${dirSel}</div>
    </div>
    ${walletTxTable(txs, false)}`;
}

function nextTxId() {
  const max = WALLET_TRANSACTIONS.reduce((m,t) => Math.max(m, parseInt(t.id.replace(/\D/g,''),10)||0), 0);
  return 'TXN' + String(max + 1).padStart(3, '0');
}

function addWalletTx(w, direction, type, amount, note) {
  w.balance += (direction === 'CREDIT' ? amount : -amount);
  WALLET_TRANSACTIONS.push({
    id: nextTxId(), walletId: w.id, direction, type, amount: Math.abs(amount),
    balance: w.balance, referenceType: 'manual', referenceId: 'CMS', status: 'SUCCESS',
    note: note || '', createdAt: nowStr()
  });
}

function topupWallet(id) {
  const w = WALLETS.find(x => x.id === id); if (!w) return;
  const v = parseInt(prompt(`Nạp tiền vào ví ${w.ownerName} (đ):`, '100000'), 10);
  if (!v || v <= 0) return;
  addWalletTx(w, 'CREDIT', 'TOPUP', v, 'Nạp tay từ CMS');
  renderWallets();
}

function adjustWallet(id) {
  const w = WALLETS.find(x => x.id === id); if (!w) return;
  const v = parseInt(prompt(`Điều chỉnh số dư ví ${w.ownerName} (đ — số âm để trừ):`, '0'), 10);
  if (!v) return;
  if (w.balance + v < 0) { alert('Số dư không đủ để trừ.'); return; }
  addWalletTx(w, v > 0 ? 'CREDIT' : 'DEBIT', 'ADJUSTMENT', v, 'Điều chỉnh tay từ CMS');
  renderWallets();
}

function toggleWalletLock(id) {
  const w = WALLETS.find(x => x.id === id); if (!w) return;
  if (w.status === 'LOCKED') { w.status = 'ACTIVE'; }
  else {
    if (!confirm(`Khóa ví ${w.ownerName}? Ví bị khóa sẽ không nạp/điều chỉnh được.`)) return;
    w.status = 'LOCKED';
  }
  renderWallets();
}

// Ghi 1 bút toán ví (linh hoạt: có thể đổi balance và/hoặc pending)
function logTx(w, { direction, type, amount, note, refType = 'trip', refId = '', balanceDelta = 0, pendingDelta = 0 }) {
  if (balanceDelta) w.balance += balanceDelta;
  if (pendingDelta) w.pendingBalance = Math.max(0, w.pendingBalance + pendingDelta);
  WALLET_TRANSACTIONS.push({
    id: nextTxId(), walletId: w.id, direction, type, amount: Math.abs(amount),
    balance: w.balance, referenceType: refType, referenceId: refId,
    status: 'SUCCESS', note: note || '', createdAt: nowStr()
  });
}

// ===== Quyết toán chuyến liên tỉnh TIỀN MẶT (tạm giữ + chỉ trừ chiết khấu) =====
let cashTrip = null; // { walletId, seats, price, rate, held, tripId }

function openCashSettle(walletId) {
  const w = WALLETS.find(x => x.id === walletId);
  if (!w || w.ownerType !== 'DRIVER') { alert('Chỉ áp dụng cho ví tài xế.'); return; }
  cashTrip = { walletId, seats: 5, price: 200000, rate: 10, held: false, noShow: [], tripId: 'TRIP-' + Date.now().toString().slice(-5) };
  renderCashSettle();
  openModal('cash-settle-modal');
}

// Tick/bỏ tick 1 khách không lên xe (lưu vào state, không đọc DOM)
function toggleCashNoShow(i) {
  cashTrip.noShow[i] = !cashTrip.noShow[i];
  renderCashSettle();
}

// Tính các bút toán theo số khách vắng đã lưu trong state.
// Với tiền mặt, hold chỉ khóa khả dụng. Khi hoàn tất phải release hold,
// rồi ví tài xế chỉ bị trừ phí hệ thống trên số khách thật sự lên xe.
function cashSettleCalc() {
  const noShow = cashTrip.noShow.slice(0, cashTrip.seats).filter(Boolean).length;
  const boarded = cashTrip.seats - noShow;
  const holdAmount = cashTrip.seats * cashTrip.price;
  const collected = boarded * cashTrip.price;
  const uncollected = noShow * cashTrip.price;
  const commission = Math.round(boarded * cashTrip.price * cashTrip.rate / 100);
  const walletDebit = commission;
  const availableRestoredOnFinalize = holdAmount - commission;
  const netIncome = collected - commission;
  return { noShow, boarded, holdAmount, collected, uncollected, commission, walletDebit, availableRestoredOnFinalize, netIncome };
}

function renderCashSettle() {
  const w = WALLETS.find(x => x.id === cashTrip.walletId);
  const c = cashSettleCalc();
  document.getElementById('cash-settle-title').textContent = `🚌 Quyết toán chuyến tiền mặt · ${w.ownerName}`;
  const seatRows = Array.from({ length: cashTrip.seats }, (_, i) => `
    <label class="cash-seat"><input type="checkbox" class="cash-noshow" ${cashTrip.noShow[i] ? 'checked' : ''} onchange="toggleCashNoShow(${i})"> Khách ${i + 1} <span class="text-muted">(${fmt(cashTrip.price)})</span> — <span class="cash-seat-state">${cashTrip.noShow[i] ? '⛔ không lên xe' : 'không lên xe'}</span></label>
  `).join('');
  const lockedInput = cashTrip.held ? 'disabled' : '';
  document.getElementById('cash-settle-body').innerHTML = `
    <div class="form-grid" style="margin-bottom:12px">
      <div class="input-group"><label>Số ghế đặt</label><input type="number" id="cash-seats" class="input" value="${cashTrip.seats}" min="1" max="45" ${lockedInput} onchange="cashTrip.seats=Math.max(1,parseInt(this.value)||1);cashTrip.noShow=[];renderCashSettle()"></div>
      <div class="input-group"><label>Giá / ghế (đ)</label><input type="number" id="cash-price" class="input" value="${cashTrip.price}" min="0" ${lockedInput} onchange="cashTrip.price=parseInt(this.value)||0;renderCashSettle()"></div>
      <div class="input-group"><label>Phí hệ thống (%)</label><input type="number" id="cash-rate" class="input" value="${cashTrip.rate}" min="0" max="100" ${lockedInput} onchange="cashTrip.rate=parseInt(this.value)||0;renderCashSettle()"></div>
    </div>
    <div class="doc-section-title" style="margin-top:0">Tích khách KHÔNG lên xe</div>
    <div class="cash-seats">${seatRows}</div>
    <div class="cash-calc">
      <div class="apply-rowx"><span>🔒 Tạm giữ khi nhận chuyến (${cashTrip.seats}×${fmt(cashTrip.price)})</span><b>${fmt(c.holdAmount)}</b></div>
      <div class="apply-rowx"><span>🔓 Nhả lại toàn bộ tạm giữ khi hoàn tất</span><b class="text-success">+ ${fmt(c.holdAmount)} khả dụng</b></div>
      <div class="apply-rowx"><span>💵 Tài xế thu tiền mặt ${c.boarded} khách lên xe</span><b>${fmt(c.collected)}</b></div>
      <div class="apply-rowx"><span>🚫 ${c.noShow} khách vắng, không thu tiền mặt</span><b class="text-muted">${fmt(c.uncollected)}</b></div>
      <div class="apply-rowx"><span>🏢 Phí hệ thống ${cashTrip.rate}% × ${c.boarded} khách lên xe</span><b class="text-danger">− ${fmt(c.commission)}</b></div>
      <div class="apply-rowx total"><span>Trừ ví thực tế</span><b>− ${fmt(c.walletDebit)}</b></div>
      <div class="text-muted" style="font-size:12px;margin-top:6px">Sau khi hoàn tất: khả dụng tăng lại ${fmt(c.availableRestoredOnFinalize)} so với lúc đang hold · thực nhận ròng ${fmt(c.netIncome)}</div>
    </div>
  `;
  document.getElementById('cash-settle-footer').innerHTML = `
    <button class="btn btn-outline" onclick="closeModal('cash-settle-modal')">Đóng</button>
    <button class="btn ${cashTrip.held ? 'btn-outline' : 'btn-primary'}" onclick="cashHold()" ${cashTrip.held ? 'disabled' : ''}>1️⃣ Nhận chuyến (tạm giữ ${fmt(c.holdAmount)})</button>
    <button class="btn btn-primary" onclick="cashFinalize()" ${cashTrip.held ? '' : 'disabled'}>2️⃣ Hoàn tất & quyết toán</button>
  `;
}

function cashHold() {
  const w = WALLETS.find(x => x.id === cashTrip.walletId);
  const c = cashSettleCalc();
  const available = w.balance - w.pendingBalance;
  if (available < c.holdAmount) {
    alert(`Số dư khả dụng không đủ để tạm giữ.\nKhả dụng: ${fmt(available)}\nCần giữ: ${fmt(c.holdAmount)}`);
    return;
  }
  logTx(w, { direction: 'HOLD', type: 'HOLD', amount: c.holdAmount, pendingDelta: c.holdAmount,
    note: `Tạm giữ 100% khi nhận chuyến (${cashTrip.seats} ghế)`, refId: cashTrip.tripId });
  cashTrip.held = true;
  renderCashSettle();
  renderWallets();
}

function cashFinalize() {
  const w = WALLETS.find(x => x.id === cashTrip.walletId);
  if (!cashTrip.held) { alert('Cần tạm giữ chuyến trước khi quyết toán.'); return; }
  const c = cashSettleCalc();
  // 1) Nhả tạm giữ: hoàn lại khả dụng, không đổi số dư.
  logTx(w, { direction: 'RELEASE', type: 'RELEASE', amount: c.holdAmount, pendingDelta: -c.holdAmount,
    note: 'Hoàn tất chuyến — nhả lại tạm giữ ban đầu', refId: cashTrip.tripId });
  // 2) Phí hệ thống trên khách lên xe.
  if (c.commission) logTx(w, { direction: 'DEBIT', type: 'COMMISSION', amount: c.commission, balanceDelta: -c.commission,
    note: `Phí hệ thống ${cashTrip.rate}% × ${c.boarded} khách`, refId: cashTrip.tripId });
  closeModal('cash-settle-modal');
  selectedWalletId = cashTrip.walletId;
  cashTrip = null;
  renderWallets();
  alert(`✅ Đã quyết toán chuyến.\nĐã nhả tạm giữ: ${fmt(c.holdAmount)}\nTrừ ví thực tế: ${fmt(c.walletDebit)} (${c.boarded} khách lên xe).`);
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
  const statusMap = { active: 'badge-active', expired: 'badge-expired', scheduled: 'badge-scheduled', paused: 'badge-pending' };
  const statusLabel = { active: '✅ Hoạt động', expired: '⛔ Hết hạn', scheduled: '📅 Lên lịch', paused: '⏸️ Tạm dừng' };
  document.getElementById('promos-table-body').innerHTML = PROMOS.map(p => {
    const pct = Math.round((p.used/p.usageLimit)*100);
    const aud = PROMO_AUDIENCE[p.audience || 'all'] || PROMO_AUDIENCE.all;
    const audExtra = p.audience === 'manual' ? ` (${(p.targetCustomers||[]).length} KH)` : '';
    const perUser = p.perUserLimit ? `${p.perUserLimit} lần` : 'Không giới hạn';
    return `<tr>
      <td><span class="text-accent fw-700" style="font-family:monospace">${p.code}</span>${p.firstOrderOnly?'<br><span class="text-muted" style="font-size:11px">🥇 Đơn đầu tiên</span>':''}</td>
      <td><span class="badge ${aud.class}">${aud.icon} ${aud.label}${audExtra}</span></td>
      <td>${p.type==='percent'?'📊 %':'💵 Cố định'}</td>
      <td class="fw-600">${p.type==='percent'?p.value+'%':fmt(p.value)}</td>
      <td>${fmt(p.maxDiscount)}</td>
      <td>${fmt(p.minOrder)}</td>
      <td class="fw-600">${perUser}</td>
      <td>${p.vehicleTypes.map(v=>`<span title="${VEHICLE_TYPES[v]?.label||v}">${VEHICLE_TYPES[v]?.icon||''}</span>`).join(' ')}</td>
      <td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:4px;background:var(--border-color);border-radius:4px;min-width:60px"><div style="height:100%;width:${pct}%;background:${pct>=90?'var(--danger)':'var(--accent)'};border-radius:4px"></div></div><span class="text-muted" style="font-size:11px">${p.used.toLocaleString()}/${p.usageLimit.toLocaleString()}</span></div></td>
      <td class="text-muted" style="font-size:12px">${p.startDate}<br>${p.endDate}</td>
      <td><span class="badge ${statusMap[p.status]||''}">${statusLabel[p.status]||p.status}</span></td>
      <td><div class="flex-center"><button class="btn-icon" title="Chỉnh sửa" onclick="openPromoEdit('${p.id}')">✏️</button>${p.status==='active'?`<button class="btn-icon" title="Tạm dừng" style="color:var(--danger)" onclick="togglePromoStatus('${p.id}')">⛔</button>`:''}${p.status==='paused'?`<button class="btn-icon" title="Kích hoạt lại" style="color:var(--success)" onclick="togglePromoStatus('${p.id}')">▶️</button>`:''}</div></td>
    </tr>`;
  }).join('');
}

let editingPromoId = null;

// Đổ dữ liệu 1 mã vào form (null = form trống để tạo mới)
function fillPromoForm(p) {
  document.getElementById('promo-code').value = p?.code || '';
  document.getElementById('promo-audience').value = p?.audience || 'all';
  document.getElementById('promo-type').value = p?.type || 'percent';
  document.getElementById('promo-value').value = p?.value ?? '';
  document.getElementById('promo-max').value = p?.maxDiscount ?? '';
  document.getElementById('promo-min').value = p?.minOrder ?? '';
  document.getElementById('promo-limit').value = p?.usageLimit ?? '';
  document.getElementById('promo-peruser').value = p?.perUserLimit ?? '';
  document.getElementById('promo-start').value = p?.startDate || '';
  document.getElementById('promo-end').value = p?.endDate || '';
  document.getElementById('promo-firstorder').checked = !!p?.firstOrderOnly;
  // Nạp danh sách khách được chỉ định (gắn nhãn từ CUSTOMERS nếu khớp)
  promoTargets = (p?.targetCustomers || []).map(v => ({ value: v, label: labelForCustomer(v) }));
  document.getElementById('promo-target-search').value = '';
  hidePromoTargetDropdown();
  renderPromoTargetChips();
  const vts = p?.vehicleTypes || [];
  document.querySelectorAll('.promo-vt').forEach(c => { c.checked = vts.includes(c.value); });
  onPromoAudienceChange();
}

// Ẩn/hiện ô danh sách khách khi đối tượng = "Chỉ định thủ công"
function onPromoAudienceChange() {
  const manual = document.getElementById('promo-audience').value === 'manual';
  document.getElementById('promo-targets-group').style.display = manual ? '' : 'none';
}

// ---- Bộ chọn khách cho mã "Chỉ định thủ công" (search → chọn → search tiếp) ----
let promoTargets = []; // [{ value, label }]

// Tìm nhãn hiển thị cho 1 giá trị (id/SĐT) dựa trên CUSTOMERS
function labelForCustomer(v) {
  const c = CUSTOMERS.find(c => c.id === v || c.phone === v);
  return c ? `${c.name} · ${c.phone}` : v;
}

function renderPromoTargetChips() {
  const box = document.getElementById('promo-target-chips');
  const cnt = document.getElementById('promo-target-count');
  if (cnt) cnt.textContent = promoTargets.length ? `(${promoTargets.length} khách)` : '';
  if (!box) return;
  box.innerHTML = promoTargets.map(t =>
    `<span class="target-chip">${esc(t.label)}<button type="button" class="target-chip-x" onclick="removePromoTarget('${esc(t.value)}')">✕</button></span>`
  ).join('') || `<span class="text-muted" style="font-size:12px">Chưa chọn khách nào</span>`;
}

function promoTargetSearch() {
  const q = document.getElementById('promo-target-search').value.trim().toLowerCase();
  const dd = document.getElementById('promo-target-dropdown');
  const chosen = new Set(promoTargets.map(t => t.value));
  let list = CUSTOMERS.filter(c => !chosen.has(c.id) && !chosen.has(c.phone));
  if (q) list = list.filter(c =>
    c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.id.toLowerCase().includes(q));
  list = list.slice(0, 8);
  if (!list.length) {
    dd.innerHTML = `<div class="target-opt muted">Không tìm thấy khách phù hợp</div>`;
  } else {
    dd.innerHTML = list.map(c =>
      `<div class="target-opt" onmousedown="addPromoTarget('${c.id}')"><b>${esc(c.name)}</b><span class="text-muted"> · ${c.phone} · ${c.id}</span></div>`
    ).join('');
  }
  dd.style.display = 'block';
}

function hidePromoTargetDropdown() {
  const dd = document.getElementById('promo-target-dropdown');
  if (dd) dd.style.display = 'none';
}

function addPromoTarget(value, label) {
  if (!promoTargets.some(t => t.value === value)) {
    promoTargets.push({ value, label: label || labelForCustomer(value) });
    renderPromoTargetChips();
  }
  const s = document.getElementById('promo-target-search');
  s.value = '';
  promoTargetSearch();
  s.focus();
}

function removePromoTarget(value) {
  promoTargets = promoTargets.filter(t => t.value !== value);
  renderPromoTargetChips();
}

// Import file .csv/.txt: mỗi token (xuống dòng / phẩy / ;) là 1 SĐT hoặc mã KH
function importPromoTargets(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const tokens = String(e.target.result).split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    let added = 0, dup = 0;
    tokens.forEach(tok => {
      // bỏ tiền tố cột nếu là header kiểu "phone"/"id"
      if (/^(phone|sdt|số điện thoại|id|ma kh|mã kh|name|tên)$/i.test(tok)) return;
      const c = CUSTOMERS.find(c => c.phone === tok || c.id === tok || c.name.toLowerCase() === tok.toLowerCase());
      const value = c ? c.id : tok;
      if (promoTargets.some(t => t.value === value)) { dup++; return; }
      promoTargets.push({ value, label: c ? `${c.name} · ${c.phone}` : tok });
      added++;
    });
    renderPromoTargetChips();
    input.value = '';
    alert(`Đã import: +${added} khách${dup ? `, bỏ ${dup} trùng` : ''}.\nTổng hiện tại: ${promoTargets.length} khách.`);
  };
  reader.readAsText(file);
}

function openPromoCreate() {
  editingPromoId = null;
  fillPromoForm(null);
  document.getElementById('promo-modal-title').textContent = 'Tạo mã ưu đãi mới';
  document.getElementById('promo-save-btn').textContent = 'Tạo mã';
  document.getElementById('promo-code').disabled = false;
  openModal('promo-modal');
}

function openPromoEdit(id) {
  const p = PROMOS.find(x => x.id === id);
  if (!p) return;
  editingPromoId = id;
  fillPromoForm(p);
  document.getElementById('promo-modal-title').textContent = 'Chỉnh sửa mã: ' + p.code;
  document.getElementById('promo-save-btn').textContent = 'Lưu thay đổi';
  document.getElementById('promo-code').disabled = true; // mã là khóa, không đổi
  openModal('promo-modal');
}

function togglePromoStatus(id) {
  const p = PROMOS.find(x => x.id === id);
  if (!p) return;
  if (p.status === 'active') {
    if (!confirm(`Tạm dừng mã ${p.code}? Khách sẽ không áp dụng được cho tới khi kích hoạt lại.`)) return;
    p.status = 'paused';
  } else if (p.status === 'paused') {
    p.status = 'active';
  }
  renderPromos();
}

// Tạo mới hoặc lưu chỉnh sửa (tùy editingPromoId)
function savePromo() {
  const editing = editingPromoId ? PROMOS.find(p => p.id === editingPromoId) : null;
  const code = document.getElementById('promo-code').value.trim().toUpperCase();
  const audience = document.getElementById('promo-audience').value;
  const type = document.getElementById('promo-type').value;
  const value = parseInt(document.getElementById('promo-value').value, 10);
  const maxDiscount = parseInt(document.getElementById('promo-max').value, 10) || 0;
  const minOrder = parseInt(document.getElementById('promo-min').value, 10) || 0;
  const usageLimit = parseInt(document.getElementById('promo-limit').value, 10);
  const perUserLimit = parseInt(document.getElementById('promo-peruser').value, 10) || null;
  const startDate = document.getElementById('promo-start').value;
  const endDate = document.getElementById('promo-end').value;
  const firstOrderOnly = document.getElementById('promo-firstorder').checked;
  const vehicleTypes = [...document.querySelectorAll('.promo-vt:checked')].map(c => c.value);
  const targetCustomers = audience === 'manual' ? promoTargets.map(t => t.value) : [];

  if (!code || !value || !usageLimit || !startDate || !endDate || !vehicleTypes.length) {
    alert('Vui lòng nhập đủ: Mã, Giá trị, Tổng lượt, Thời hạn và ít nhất 1 dịch vụ áp dụng.');
    return;
  }
  if (type === 'percent' && value > 100) { alert('Giảm theo % không vượt quá 100.'); return; }
  if (audience === 'manual' && !targetCustomers.length) { alert('Đối tượng "Chỉ định thủ công" cần nhập ít nhất 1 khách (SĐT hoặc mã KH).'); return; }
  if (PROMOS.some(p => p.code === code && p.id !== editingPromoId)) { alert('Mã ưu đãi đã tồn tại: ' + code); return; }
  if (editing && usageLimit < editing.used) { alert(`Tổng lượt phải ≥ số đã dùng (${editing.used.toLocaleString()}).`); return; }

  const computedStatus = new Date(startDate) > new Date() ? 'scheduled'
    : (new Date(endDate) < new Date() ? 'expired' : 'active');

  if (editing) {
    Object.assign(editing, {
      audience, type, value, targetCustomers,
      maxDiscount: type === 'percent' ? maxDiscount : value,
      minOrder, usageLimit, perUserLimit, firstOrderOnly, vehicleTypes, startDate, endDate,
      // giữ paused nếu đang tạm dừng; còn lại cập nhật theo ngày
      status: editing.status === 'paused' ? 'paused' : computedStatus
    });
    closeModal('promo-modal');
    renderPromos();
    alert(`✅ Đã cập nhật mã ${editing.code}.`);
  } else {
    const maxNum = PROMOS.reduce((m, p) => Math.max(m, parseInt(p.id.slice(2), 10) || 0), 0);
    PROMOS.push({
      id: 'PM' + String(maxNum + 1).padStart(3, '0'), code, type, value,
      maxDiscount: type === 'percent' ? maxDiscount : value,
      minOrder, usageLimit, used: 0, perUserLimit, audience, firstOrderOnly, targetCustomers,
      vehicleTypes, startDate, endDate, status: computedStatus
    });
    closeModal('promo-modal');
    renderPromos();
    alert(`✅ Đã tạo mã ưu đãi ${code}\n• Đối tượng: ${PROMO_AUDIENCE[audience]?.label}\n• Giảm: ${type==='percent'?value+'% (tối đa '+fmt(maxDiscount)+')':fmt(value)}\n• ${perUserLimit?perUserLimit+' lần/tài khoản':'Không giới hạn lượt/tài khoản'}\n• Dịch vụ: ${vehicleTypes.map(v=>VEHICLE_TYPES[v]?.label||v).join(', ')}`);
  }
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
function notificationTypeLabel(type) {
  const typeLabels = {
    booking_created: '📋 Booking tạo',
    payment_cash: '💵 Tiền mặt',
    payment_hold: '🔒 Tạm giữ tiền',
    payment_confirmed: '💳 Payment OK',
    payment_failed: '❌ Payment lỗi',
    driver_assigned: '👤 Gán TX',
    vehicle_assigned: '🚌 Gán xe',
    driver_accepted: '✅ TX nhận chuyến',
    driver_rejected: '↩️ TX từ chối',
    trip_started: '▶️ Bắt đầu',
    trip_completed: '🏁 Hoàn thành',
    booking_noshow: '🚫 No-show',
    booking_cancelled: '❌ Hủy',
    refund_completed: '↩️ Hoàn tiền',
    admin_intercity_task_created: '🚌 Chuyến cần phân công',
    admin_service_task_created: '📋 Đăng kiểm cần phân công',
    admin_maintenance_task_created: '🔧 Bảo dưỡng cần phân công',
    admin_driver_application_pending: '🧑‍✈️ Tài xế chờ duyệt',
    reschedule_requested: '🔁 Yêu cầu đổi lịch',
    fulfillment_assigned_user: '📌 Fulfillment assigned',
    fulfillment_in_progress_user: '▶️ Fulfillment progress',
    fulfillment_completed_user: '🏁 Fulfillment completed',
    fulfillment_cancelled_user: '❌ Fulfillment cancelled',
    driver_new_task: '🧑‍✈️ Tài xế nhận đơn',
    payment_hold_user: '🔒 Tạm giữ tiền',
    payment_confirmed_user: '💳 Đã thanh toán',
    refund_completed_user: '↩️ Hoàn tiền',
    promo_audience: '🎁 Ưu đãi'
  };
  return typeLabels[type] || type;
}

function serviceTypeLabel(type) {
  if (type === 'ALL') return 'Tất cả';
  return VEHICLE_TYPES[type]?.label || type || '—';
}

function recipientGroupLabel(group) {
  const map = {
    CUSTOMER: 'User trong đơn',
    DRIVER: 'Tài xế',
    ADMIN: 'Admin',
    all: 'Mọi người dùng',
    new_user: 'Thành viên mới',
    existing: 'Khách hiện hữu',
    vip: 'Khách VIP',
    manual: 'Chỉ định thủ công'
  };
  return map[group] || PROMO_AUDIENCE[group]?.label || group || '—';
}

function inferNotificationBookingId(n) {
  if (n.targetId && BOOKINGS.some(b => b.id === n.targetId)) return n.targetId;
  const text = `${n.title || ''} ${n.content || ''}`;
  const byId = text.match(/\bBK[\w-]*/);
  if (byId && BOOKINGS.some(b => b.id === byId[0])) return byId[0];
  const byCode = BOOKINGS.find(b => text.includes(b.bookingCode));
  return byCode?.id || null;
}

function fulfillmentTabForBooking(booking) {
  if (!booking) return 'all';
  if (booking.bookingType === 'BIKE' || booking.bookingType === 'CAR') return 'bikecar';
  if (booking.bookingType === 'INTERCITY') return 'intercity';
  if (booking.bookingType === 'SERVICE_ORDER') return 'service';
  if (booking.bookingType === 'MAINTENANCE_ORDER') return 'maintenance';
  return 'all';
}

function getNotificationAction(n) {
  const meta = HEADER_NOTIFICATION_TYPES[n.type] || {};
  const bookingId = inferNotificationBookingId(n);
  const booking = BOOKINGS.find(b => b.id === bookingId);
  if (n.type === 'admin_driver_application_pending') return { page: 'partners', label: 'Mở hồ sơ', targetId: n.targetId };
  if (meta.page === 'fulfillment') return { page: 'fulfillment', label: 'Mở nhiệm vụ', tab: meta.tab, targetId: n.targetId };
  if (n.actionPage) {
    return {
      page: n.actionPage,
      label: n.actionPage === 'fulfillment' ? 'Mở nhiệm vụ' : n.actionPage === 'bookings' ? 'Mở booking' : 'Mở',
      tab: n.actionPage === 'fulfillment' ? fulfillmentTabForBooking(booking) : meta.tab,
      bookingId,
      targetId: n.targetId
    };
  }
  if (bookingId) return { page: 'bookings', label: 'Mở booking', bookingId };
  if (n.type.includes('refund')) return { page: 'refunds', label: 'Mở hoàn tiền', targetId: n.targetId };
  if (n.type.includes('payment') || n.type.includes('wallet')) return { page: 'wallets', label: 'Mở ví', targetId: n.targetId };
  if (n.type.includes('promo')) return { page: 'promos', label: 'Mở ưu đãi', targetId: n.targetId };
  return null;
}

function openNotificationAction(id) {
  const n = NOTIFICATIONS.find(x => x.id === id);
  if (!n) return;
  markHeaderNotificationRead(n);
  const action = getNotificationAction(n);
  renderNotifications();
  scheduleSave();
  if (!action) return;
  navigateTo(action.page);
  if (action.page === 'fulfillment' && action.tab) setTimeout(() => switchFulfillmentTab(action.tab), 0);
  if (action.page === 'bookings' && action.bookingId) setTimeout(() => showBookingDetail(action.bookingId), 0);
  if (action.page === 'partners' && action.targetId) setTimeout(() => reviewDriverApplication(action.targetId), 0);
}

function switchNotificationTab(tab, btn) {
  currentNotificationTab = tab;
  document.querySelectorAll('#notification-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  (btn || document.querySelector(`#notification-tabs .tab-btn[data-ntab="${tab}"]`))?.classList.add('active');
  renderNotifications();
}

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

  document.querySelectorAll('#notification-tabs .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.ntab === currentNotificationTab));
  document.getElementById('notification-panel-history').style.display = currentNotificationTab === 'history' ? '' : 'none';
  document.getElementById('notification-panel-config').style.display = currentNotificationTab === 'config' ? '' : 'none';
  if (currentNotificationTab === 'config') renderNotificationConfig();
  else renderNotificationHistory();
}

function renderNotificationHistory() {
  const statusBadges = { delivered: 'badge-completed', failed: 'badge-cancelled', pending: 'badge-pending' };
  document.getElementById('notifications-table-body').innerHTML = NOTIFICATIONS.map(n => {
    const action = getNotificationAction(n);
    const title = n.title ? `<div class="fw-600">${esc(n.title)}</div>` : '';
    return `<tr>
    <td class="text-muted">${n.id}</td>
    <td>${notificationTypeLabel(n.type)}</td>
    <td><span class="badge badge-accepted">${n.channel.toUpperCase()}</span></td>
    <td class="fw-600">${n.recipient}</td>
    <td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title}${esc(n.content)}</td>
    <td><span class="badge ${statusBadges[n.status]||'badge-expired'}">${n.status}${n.retryCount?' (retry:'+n.retryCount+')':''}</span></td>
    <td class="text-muted">${n.createdAt}</td>
    <td>${action ? `<button class="btn btn-sm btn-outline" onclick="openNotificationAction('${n.id}')">${esc(action.label)}</button>` : '<span class="text-muted">—</span>'}</td>
  </tr>`;
  }).join('');
}

function renderNotificationConfig() {
  const statusBadges = { active: 'badge-completed', paused: 'badge-pending' };
  document.getElementById('notification-config-table-body').innerHTML = NOTIFICATION_CONFIGS.map(c => `<tr>
    <td class="text-muted">${esc(c.id)}</td>
    <td>${notificationTypeLabel(c.eventType)}</td>
    <td>${esc(serviceTypeLabel(c.serviceType))}</td>
    <td>${esc(recipientGroupLabel(c.recipientGroup))}</td>
    <td class="fw-600">${esc(c.title)}</td>
    <td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.content)}</td>
    <td><span class="badge badge-accepted">${esc(String(c.channel || 'push').toUpperCase())}</span></td>
    <td><span class="badge ${statusBadges[c.status] || 'badge-expired'}">${esc(c.status)}</span></td>
    <td><button class="btn btn-sm btn-outline" onclick="toggleNotificationConfig('${c.id}')">${c.status === 'active' ? 'Tạm dừng' : 'Bật'}</button></td>
  </tr>`).join('');
}

function addNotificationConfig() {
  const eventType = document.getElementById('notif-config-event').value;
  const serviceType = document.getElementById('notif-config-service').value;
  const recipientGroup = document.getElementById('notif-config-recipient').value;
  const channel = document.getElementById('notif-config-channel').value;
  const title = document.getElementById('notif-config-title').value.trim();
  const content = document.getElementById('notif-config-content').value.trim();
  if (!title || !content) {
    alert('Vui lòng nhập title và nội dung config thông báo.');
    return;
  }
  NOTIFICATION_CONFIGS.unshift({
    id: genId('NC', NOTIFICATION_CONFIGS),
    eventType, serviceType, recipientGroup, channel,
    title, content,
    status: 'active',
    updatedAt: nowStr()
  });
  document.getElementById('notif-config-title').value = '';
  document.getElementById('notif-config-content').value = '';
  renderNotificationConfig();
  scheduleSave();
}

function toggleNotificationConfig(id) {
  const cfg = NOTIFICATION_CONFIGS.find(c => c.id === id);
  if (!cfg) return;
  cfg.status = cfg.status === 'active' ? 'paused' : 'active';
  cfg.updatedAt = nowStr();
  renderNotificationConfig();
  scheduleSave();
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
  renderHeaderNotifications();
  scheduleSave(); // autosave: nhiều mutation kết thúc bằng updateBadges()
}

// ============================================
// INIT
// ============================================
function init() {
  // Khôi phục dữ liệu đã lưu (nếu có) TRƯỚC khi heal — để heal làm việc trên data thật.
  hydrateStore();
  ensureNotificationConfigs();

  // Heal & sync derived state trước khi render
  healData();
  seedHeaderNotifications();
  saveStore(); // chốt trạng thái sau heal (lần đầu tạo snapshot từ seed)

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
        ${o.docImages && (o.docImages.front || o.docImages.back) ? `<div class="odp-cell odp-span"><div class="odp-label">${isReg ? 'Hồ sơ đăng kiểm' : 'Hồ sơ bảo dưỡng'}</div><div class="odp-value"><a href="javascript:void(0)" class="text-accent fw-600" onclick="viewOrderDocs('${kind}','${o.id}')">📷 Xem ảnh ${isReg ? 'hồ sơ đăng kiểm' : 'hồ sơ bảo dưỡng'}</a></div></div>` : ''}
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

function viewOrderDocs(kind, id) {
  const isReg = kind === 'reg';
  const o = (isReg ? REGISTRATIONS : MAINTENANCE).find(x => x.id === id);
  if (!o || !o.docImages) return;
  const { front, back } = o.docImages;
  const cell = (label, url) => url
    ? `<div class="reg-doc-cell"><div class="reg-doc-cap">${label}</div><a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="${label}" class="reg-doc-img"></a></div>`
    : `<div class="reg-doc-cell"><div class="reg-doc-cap">${label}</div><div class="reg-doc-empty">Chưa có ảnh</div></div>`;
  const kindLabel = isReg ? 'Hồ sơ đăng kiểm' : 'Hồ sơ bảo dưỡng';
  document.getElementById('reg-docs-title').textContent = `${kindLabel} · ${o.id} · ${o.plate}`;
  document.getElementById('reg-docs-body').innerHTML =
    cell('Mặt trước', front) + cell('Mặt sau', back);
  openModal('reg-docs-modal');
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

// Đọc input file ảnh → data URL (base64), trả null nếu chưa chọn
function readFileAsDataURL(input) {
  return new Promise(resolve => {
    const file = input?.files?.[0];
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function readDocImages(frontId, backId) {
  const [front, back] = await Promise.all([
    readFileAsDataURL(document.getElementById(frontId)),
    readFileAsDataURL(document.getElementById(backId))
  ]);
  return (front || back) ? { front, back } : null;
}

async function createRegistrationOrder() {
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
  const docImages = await readDocImages('reg-doc-front', 'reg-doc-back');

  const traceId = newTraceId();
  const newReg = {
    id: genId('REG', REGISTRATIONS),
    plate, ownerName, ownerPhone,
    vehicleType: document.getElementById('reg-vehicle-type').value,
    engineType,
    pickupAddress,
    bookingDate, bookingTime, service,
    expireDate, notes,
    docImages,
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
    createAdminNotification({
      type: 'admin_service_task_created',
      targetId: booking.id,
      actionPage: 'fulfillment',
      content: `Đơn đăng kiểm ${newReg.id} (${plate}) của ${ownerName} đã tạo nhiệm vụ phân công riêng, lịch ${bookingDate} ${bookingTime}.`
    });
  }

  clearRegistrationForm();
  selectedRegId = newReg.id;
  renderRegistrations();
  updateBadges();
  alert('Tạo đơn đăng kiểm thành công!\nMã đơn: ' + newReg.id + '\nBooking: ' + booking.bookingCode);
}

function clearRegistrationForm() {
  ['reg-plate','reg-owner-name','reg-owner-phone','reg-pickup-address','reg-booking-date','reg-expire-date','reg-notes','reg-doc-front','reg-doc-back'].forEach(id => {
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

async function createMaintenanceOrder() {
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
  const docImages = await readDocImages('mnt-doc-front', 'mnt-doc-back');
  const traceId = newTraceId();

  const newMnt = {
    id: genId('MNT', MAINTENANCE),
    plate, ownerName, ownerPhone,
    vehicleType: document.getElementById('mnt-vehicle-type').value,
    engineType,
    pickupAddress,
    bookingDate, bookingTime, service,
    mileage, notes,
    docImages,
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
    createAdminNotification({
      type: 'admin_maintenance_task_created',
      targetId: booking.id,
      actionPage: 'fulfillment',
      content: `Đơn bảo dưỡng ${newMnt.id} (${plate}) của ${ownerName} đã tạo nhiệm vụ phân công riêng, lịch ${bookingDate} ${bookingTime}.`
    });
  }

  clearMaintenanceForm();
  selectedMntId = newMnt.id;
  renderMaintenance();
  updateBadges();
  alert('Tạo đơn bảo dưỡng thành công!\nMã đơn: ' + newMnt.id + '\nBooking: ' + booking.bookingCode);
}

function clearMaintenanceForm() {
  ['mnt-plate','mnt-owner-name','mnt-owner-phone','mnt-pickup-address','mnt-booking-date','mnt-notes','mnt-mileage','mnt-doc-front','mnt-doc-back'].forEach(id => {
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
  const isFirstBookingForTrip = !BOOKINGS.some(b =>
    b.tripId === trip.id && b.bookingStatus !== 'CANCELLED'
  );

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
    if (isFirstBookingForTrip) {
      createAdminNotification({
        type: 'admin_intercity_task_created',
        targetId: `TRIP-${trip.id}`,
        actionPage: 'fulfillment',
        content: `Chuyến ${route?.origin || '—'} → ${route?.destination || '—'} ngày ${trip.date} lúc ${trip.departureTime} vừa có vé đầu tiên. Đã tạo nhiệm vụ phân công. Loại xe: ${trip.vehicleType || getBookingVehicleType(newBooking)}.`
      });
    }
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

// ============================================
// SIM PANEL — mô phỏng app Tài xế & app Khách hàng
// Một mặt điều khiển để bấm chạy các sự kiện đến từ 2 app, dùng chung data
// với màn vận hành. Mỗi sự kiện gắn sourceSite ('customer' | 'driver').
// ============================================
let _simTab = 'customer';

function toggleSimPanel() {
  let panel = document.getElementById('sim-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'sim-panel';
    panel.className = 'sim-panel';
    panel.innerHTML = `
      <div class="sim-head">
        <h3>🎮 Mô phỏng App</h3>
        <button class="header-btn" onclick="toggleSimPanel()">✕</button>
      </div>
      <div class="sim-tabs">
        <div class="sim-tab" id="sim-tab-customer" onclick="switchSimTab('customer')">👤 App Khách</div>
        <div class="sim-tab" id="sim-tab-driver" onclick="switchSimTab('driver')">🧑‍✈️ App Tài xế</div>
      </div>
      <div class="sim-body" id="sim-body"></div>`;
    document.body.appendChild(panel);
  }
  const opening = !panel.classList.contains('open');
  panel.classList.toggle('open', opening);
  if (opening) { switchSimTab(_simTab); }
}

function switchSimTab(tab) {
  _simTab = tab;
  const c = document.getElementById('sim-tab-customer');
  const d = document.getElementById('sim-tab-driver');
  if (c) c.classList.toggle('active', tab === 'customer');
  if (d) d.classList.toggle('active', tab === 'driver');
  renderSimPanel();
}

function renderSimPanel() {
  const body = document.getElementById('sim-body');
  if (!body) return;
  body.innerHTML = _simTab === 'customer' ? renderSimCustomer() : renderSimDriver();
}

// ---------- TAB KHÁCH ----------
function renderSimCustomer() {
  const custOpts = CUSTOMERS.map(c => `<option value="${c.id}">${esc(c.name)} · ${c.phone}</option>`).join('');
  // Đơn đang hoạt động của khách (để huỷ / đổi lịch)
  const active = BOOKINGS.filter(b => ['PENDING_CONFIRMATION','CONFIRMED','IN_PROGRESS','RESCHEDULE_REQUESTED'].includes(b.bookingStatus));
  const cards = active.slice(0, 30).map(b => {
    const vt = VEHICLE_TYPES[b.bookingType];
    const canCancel = ['PENDING_CONFIRMATION','CONFIRMED'].includes(b.bookingStatus);
    const canReschedule = b.bookingStatus === 'CONFIRMED';
    return `<div class="sim-card">
      <div class="sc-top"><span class="sc-code">${vt?.icon||''} ${b.bookingCode}</span>${statusBadge(BOOKING_STATUSES, b.bookingStatus)}</div>
      <div class="sc-route">${esc(getCustomerName(b.customerId))} · ${esc(b.pickup)} → ${esc(b.dropoff)}</div>
      <div class="sim-actions">
        ${canCancel ? `<button class="btn btn-sm btn-danger" onclick="simCustomerCancel('${b.id}')">Huỷ chuyến</button>` : ''}
        ${canReschedule ? `<button class="btn btn-sm btn-outline" onclick="simCustomerReschedule('${b.id}')">Đổi lịch</button>` : ''}
        ${b.bookingStatus === 'RESCHEDULE_REQUESTED' ? '<span class="text-muted" style="font-size:12px">Chờ vận hành duyệt…</span>' : ''}
      </div></div>`;
  }).join('') || '<div class="sim-empty">Chưa có đơn đang hoạt động</div>';

  return `
    <div class="sim-form sim-card">
      <div class="sc-code" style="margin-bottom:4px">🚕 Đặt xe mới (như app khách)</div>
      <label>Khách hàng</label>
      <select class="input" id="sim-cust">${custOpts}</select>
      <label>Loại xe</label>
      <select class="input" id="sim-type">
        <option value="BIKE">🏍️ Xe máy</option>
        <option value="CAR">🚗 Xe hơi</option>
      </select>
      <label>Điểm đón</label>
      <input class="input" id="sim-pickup" placeholder="VD: 12 Lê Lợi, Q1" value="Vị trí hiện tại của khách">
      <label>Điểm đến</label>
      <input class="input" id="sim-dropoff" placeholder="VD: Sân bay Tân Sơn Nhất" value="Sân bay Tân Sơn Nhất">
      <label>Thanh toán</label>
      <select class="input" id="sim-pay">
        <option value="cash">💵 Tiền mặt</option>
        <option value="wallet">💰 Ví (trừ số dư)</option>
      </select>
      <button class="btn btn-primary" style="width:100%;margin-top:12px" onclick="simCreateRideBooking()">📲 Khách đặt xe</button>
    </div>
    <div class="sc-code" style="margin:14px 0 8px">Đơn đang hoạt động</div>
    ${cards}`;
}

function simCreateRideBooking() {
  const custId = document.getElementById('sim-cust').value;
  const type = document.getElementById('sim-type').value;
  const pickup = document.getElementById('sim-pickup').value.trim() || 'Vị trí khách';
  const dropoff = document.getElementById('sim-dropoff').value.trim() || 'Điểm đến';
  const method = document.getElementById('sim-pay').value === 'cash' ? 'cash' : 'wallet';
  const distance = Math.round((3 + Math.random() * 12) * 10) / 10;
  const base = type === 'BIKE' ? 12000 : 25000;
  const perKm = type === 'BIKE' ? 4500 : 11000;
  const fare = Math.round((base + distance * perKm) / 1000) * 1000;
  const traceId = newTraceId();
  const id = genId('BK', BOOKINGS);
  const b = {
    id, bookingCode: 'RB-' + id.replace('BK', ''),
    bookingType: type,
    bookingStatus: 'PENDING_CONFIRMATION', paymentStatus: 'PENDING', fulfillmentStatus: null,
    customerId: custId, agentId: null, driverId: null,
    pickup, dropoff, fareSnapshot: fare, distance,
    paymentMethod: method, paymentReference: null, fulfillmentTaskId: null,
    createdAt: nowStr(), updatedAt: nowStr()
  };
  BOOKINGS.unshift(b);
  createAuditLog({ action: 'booking.create', target: id, traceId, actor: custId, actorRole: 'CUSTOMER',
    sourceSite: 'customer', before: null, after: { type, fare } });
  createNotification({ type: 'booking_created', recipient: custId,
    content: `Đã đặt ${VEHICLE_TYPES[type].label} ${b.bookingCode}, đang xử lý thanh toán...` });
  const pay = processPayment(b, traceId);
  if (pay.success) {
    b.bookingStatus = 'CONFIRMED'; b.fulfillmentStatus = 'PENDING'; b.updatedAt = nowStr();
    createAuditLog({ action: 'booking.status_change', target: id, traceId, sourceSite: 'customer',
      before: { status: 'PENDING_CONFIRMATION' }, after: { status: 'CONFIRMED' } });
    toast(`Đặt xe thành công: ${b.bookingCode} → vào hàng chờ phân công TX`, 'success');
  } else {
    toast(`Đặt ${b.bookingCode} nhưng thanh toán thất bại (ví không đủ) — nạp ví rồi thử lại`, 'warning');
  }
  renderPage(currentPage); updateBadges(); renderSimPanel();
}

function simCustomerCancel(bookingId) {
  cancelBooking(bookingId, 'Khách huỷ qua app');
  renderSimPanel();
}

function simCustomerReschedule(bookingId) {
  const b = BOOKINGS.find(x => x.id === bookingId);
  if (!b || b.bookingStatus !== 'CONFIRMED') return;
  const traceId = newTraceId();
  b.bookingStatus = 'RESCHEDULE_REQUESTED';
  b.updatedAt = nowStr();
  createNotification({ type: 'reschedule_requested', recipient: 'OPERATOR',
    content: `Khách yêu cầu đổi lịch ${b.bookingCode}` });
  createAuditLog({ action: 'booking.reschedule_request', target: b.id, traceId, actor: b.customerId,
    actorRole: 'CUSTOMER', sourceSite: 'customer', before: { status: 'CONFIRMED' }, after: { status: 'RESCHEDULE_REQUESTED' } });
  toast(`Đã gửi yêu cầu đổi lịch ${b.bookingCode} cho vận hành`, 'info');
  renderPage(currentPage); updateBadges(); renderSimPanel();
}

// Vận hành duyệt/từ chối đổi lịch (gọi từ chi tiết booking)
function resolveReschedule(bookingId, approve) {
  const b = BOOKINGS.find(x => x.id === bookingId);
  if (!b || b.bookingStatus !== 'RESCHEDULE_REQUESTED') return;
  const traceId = newTraceId();
  b.bookingStatus = 'CONFIRMED';
  b.updatedAt = nowStr();
  createNotification({ type: 'reschedule_resolved', recipient: b.customerId,
    content: approve ? `Yêu cầu đổi lịch ${b.bookingCode} đã được duyệt` : `Yêu cầu đổi lịch ${b.bookingCode} bị từ chối, giữ lịch cũ` });
  createAuditLog({ action: approve ? 'booking.reschedule_approve' : 'booking.reschedule_reject', target: b.id, traceId,
    sourceSite: 'master', before: { status: 'RESCHEDULE_REQUESTED' }, after: { status: 'CONFIRMED', approve } });
  closeModal('booking-detail-modal');
  renderPage(currentPage); updateBadges();
  if (document.getElementById('sim-panel')) renderSimPanel();
}

// ---------- TAB TÀI XẾ ----------
function renderSimDriver() {
  const tasks = FULFILLMENT_TASKS.filter(t => ['ASSIGNED','IN_PROGRESS'].includes(t.status));
  if (!tasks.length) return '<div class="sim-empty">Chưa có nhiệm vụ nào được phân cho tài xế.<br>Hãy phân công đơn ở mục "Nhiệm vụ phân công".</div>';
  return tasks.map(t => {
    const b = BOOKINGS.find(x => x.id === t.bookingId);
    if (!b) return '';
    const vt = VEHICLE_TYPES[b.bookingType];
    let acts = '';
    if (t.status === 'ASSIGNED' && !t.acceptedAt) {
      acts = `<button class="btn btn-sm btn-success" onclick="simDriver('accept','${b.id}')">✅ Nhận</button>
              <button class="btn btn-sm btn-danger" onclick="simDriver('reject','${b.id}')">❌ Từ chối</button>`;
    } else if (t.status === 'ASSIGNED') {
      acts = `<button class="btn btn-sm btn-primary" onclick="simDriver('start','${b.id}')">▶️ Bắt đầu</button>
              <button class="btn btn-sm btn-danger" onclick="simDriver('reject','${b.id}')">❌ Từ chối</button>`;
    } else { // IN_PROGRESS
      acts = `<button class="btn btn-sm btn-success" onclick="simDriver('complete','${b.id}')">🏁 Hoàn thành</button>
              <button class="btn btn-sm btn-outline" onclick="simDriver('noshow','${b.id}')">🚫 No-show</button>`;
    }
    return `<div class="sim-card">
      <div class="sc-top"><span class="sc-code">${vt?.icon||''} ${b.bookingCode}</span>${statusBadge(FULFILLMENT_STATUSES, t.status)}</div>
      <div class="sc-route">🧑‍✈️ ${esc(getDriverName(t.driverId))}${t.vehicleId ? ' · '+esc(getVehicleName(t.vehicleId)) : ''}</div>
      <div class="sc-route">${esc(b.pickup)} → ${esc(b.dropoff)} · ${fmt(b.fareSnapshot)}${t.acceptedAt ? ' · đã nhận' : ''}</div>
      <div class="sim-actions">${acts}</div></div>`;
  }).join('');
}

function simDriver(action, bookingId) {
  ({ accept: driverAcceptTask, reject: driverRejectTask, start: startTrip,
     complete: completeTrip, noshow: markNoShow }[action] || (() => {}))(bookingId, 'driver');
  renderSimPanel();
}
