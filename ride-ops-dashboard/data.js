// ============================================
// MOCK DATA - Transportation Operations
// Based on HaHaGo Master Agent BA Document
// ============================================

// ---- BOOKING STATE MACHINE ----
// draft → searched → pending_confirmation → confirmed → in_progress → completed
// Any state can → cancelled | reschedule_requested (from confirmed)
const BOOKING_STATUSES = {
  DRAFT: { label: 'Nháp', color: '#64748B', icon: '📝', order: 0 },
  SEARCHED: { label: 'Đã tìm kiếm', color: '#94A3B8', icon: '🔍', order: 1 },
  PENDING_CONFIRMATION: { label: 'Chờ xác nhận', color: '#FFB020', icon: '⏳', order: 2 },
  CONFIRMED: { label: 'Đã xác nhận', color: '#4F8CFF', icon: '✅', order: 3 },
  IN_PROGRESS: { label: 'Đang thực hiện', color: '#14B8A6', icon: '🛣️', order: 4 },
  RESCHEDULE_REQUESTED: { label: 'Yêu cầu đổi lịch', color: '#7C5CFC', icon: '🔄', order: 3.5 },
  COMPLETED: { label: 'Hoàn thành', color: '#22C55E', icon: '🏁', order: 5 },
  CANCELLED: { label: 'Đã hủy', color: '#EF4444', icon: '❌', order: -1 }
};

// ---- PAYMENT LIFECYCLE ----
const PAYMENT_STATUSES = {
  PENDING: { label: 'Chờ thanh toán', color: '#FFB020', icon: '⏳' },
  CONFIRMED: { label: 'Đã thanh toán', color: '#22C55E', icon: '✅' },
  CASH: { label: 'Tiền mặt', color: '#7C5CFC', icon: '💵' },
  FAILED: { label: 'Thất bại', color: '#EF4444', icon: '❌' },
  CANCELLED: { label: 'Đã hủy', color: '#64748B', icon: '🚫' },
  EXPIRED: { label: 'Hết hạn', color: '#94A3B8', icon: '⏰' }
};

// ---- FULFILLMENT LIFECYCLE ----
const FULFILLMENT_STATUSES = {
  PENDING: { label: 'Chờ gán', color: '#FFB020', icon: '⏳' },
  ASSIGNED: { label: 'Đã gán TX', color: '#4F8CFF', icon: '👤' },
  IN_PROGRESS: { label: 'Đang chạy', color: '#14B8A6', icon: '🚗' },
  COMPLETED: { label: 'Hoàn thành', color: '#22C55E', icon: '✅' },
  CANCELLED: { label: 'Đã hủy', color: '#EF4444', icon: '❌' }
};

// ---- REFUND LIFECYCLE ----
const REFUND_STATUSES = {
  PENDING: { label: 'Chờ xử lý', color: '#FFB020', icon: '⏳' },
  PROCESSING: { label: 'Đang xử lý', color: '#4F8CFF', icon: '⚙️' },
  SUCCESS: { label: 'Thành công', color: '#22C55E', icon: '✅' },
  FAILED: { label: 'Thất bại', color: '#EF4444', icon: '❌' }
};

const VEHICLE_TYPES = {
  BIKE: { label: 'Xe máy', icon: '🏍️' },
  CAR: { label: 'Xe hơi', icon: '🚗' },
  INTERCITY: { label: 'Xe khách liên tỉnh', icon: '🚌' },
  SERVICE_ORDER: { label: 'Đăng kiểm hộ', icon: '📋' },
  MAINTENANCE_ORDER: { label: 'Bảo dưỡng', icon: '🔧' }
};

// ---- WALLET TYPES ----
const WALLET_TYPES = {
  MAIN: { label: 'Ví chính', icon: '💰' },
  BONUS: { label: 'Ví khuyến mãi', icon: '🎁' },
  HOLDING: { label: 'Ví tạm giữ', icon: '🔒' }
};

const WALLET_STATUS = {
  ACTIVE: { label: 'Hoạt động', class: 'badge-active' },
  LOCKED: { label: 'Đã khóa', class: 'badge-cancelled' },
  CLOSED: { label: 'Đã đóng', class: 'badge-expired' }
};

// ---- TRANSACTION TYPES ----
const TRANSACTION_TYPES = {
  TOPUP: { label: '💳 Nạp tiền', class: 'text-success', direction: 'CREDIT' },
  PAYMENT: { label: '💸 Thanh toán', class: 'text-danger', direction: 'DEBIT' },
  REFUND: { label: '↩️ Hoàn tiền', class: 'text-accent', direction: 'CREDIT' },
  ADJUSTMENT: { label: '🔧 Điều chỉnh', class: 'text-warning', direction: 'CREDIT' },
  SETTLEMENT: { label: '🏦 Quyết toán', class: 'text-info', direction: 'DEBIT' },
  EARNING: { label: '💰 Thu nhập', class: 'text-success', direction: 'CREDIT' },
  WITHDRAW: { label: '🏧 Rút tiền', class: 'text-warning', direction: 'DEBIT' }
};

// ---- ROLES & PERMISSIONS (RBAC) ----
const ROLES = [
  { id: 'ROLE001', name: 'Quản trị viên', code: 'ADMIN', permissions: ['*'], usersCount: 2, status: 'active' },
  { id: 'ROLE002', name: 'Điều hành', code: 'OPERATOR', permissions: ['booking.view', 'booking.cancel', 'fulfillment.assign', 'fulfillment.reassign', 'wallet.view', 'refund.process'], usersCount: 5, status: 'active' },
  { id: 'ROLE003', name: 'Đại lý', code: 'AGENT', permissions: ['booking.create', 'booking.view', 'booking.cancel', 'customer.manage', 'wallet.view'], usersCount: 12, status: 'active' },
  { id: 'ROLE004', name: 'Tài chính', code: 'FINANCE', permissions: ['wallet.view', 'wallet.adjust', 'refund.process', 'settlement.manage', 'report.view'], usersCount: 3, status: 'active' },
  { id: 'ROLE005', name: 'Người xem', code: 'VIEWER', permissions: ['booking.view', 'wallet.view', 'report.view'], usersCount: 4, status: 'active' }
];

const PORTAL_USERS = [
  { id: 'USR001', name: 'Nguyễn Admin', email: 'admin@rideops.vn', phone: '0901000001', roles: ['ADMIN'], status: 'active', lastLogin: '2026-03-18 15:30', tenantId: 'T001' },
  { id: 'USR002', name: 'Trần Operator', email: 'operator01@rideops.vn', phone: '0901000002', roles: ['OPERATOR'], status: 'active', lastLogin: '2026-03-18 14:45', tenantId: 'T001' },
  { id: 'USR003', name: 'Lê Agent HCM', email: 'agent.hcm@rideops.vn', phone: '0901000003', roles: ['AGENT'], status: 'active', lastLogin: '2026-03-18 16:00', tenantId: 'T001' },
  { id: 'USR004', name: 'Phạm Finance', email: 'finance@rideops.vn', phone: '0901000004', roles: ['FINANCE'], status: 'active', lastLogin: '2026-03-17 10:00', tenantId: 'T001' },
  { id: 'USR005', name: 'Võ Operator 2', email: 'operator02@rideops.vn', phone: '0901000005', roles: ['OPERATOR'], status: 'disabled', lastLogin: '2026-03-10 08:00', tenantId: 'T001' },
];

// ---- TRANSPORT MASTER DATA ----
const ROUTES = [
  { id: 'RT001', name: 'HCM - Đà Lạt', origin: 'TP.HCM', destination: 'Đà Lạt', distance: 305, duration: '7h', stops: ['BX Miền Đông', 'Dầu Giây', 'Bảo Lộc', 'BX Đà Lạt'], status: 'active', operators: ['PTR001', 'PTR002'] },
  { id: 'RT002', name: 'HCM - Cần Thơ', origin: 'TP.HCM', destination: 'Cần Thơ', distance: 170, duration: '3h30', stops: ['BX Miền Tây', 'Mỹ Thuận', 'BX Cần Thơ'], status: 'active', operators: ['PTR001'] },
  { id: 'RT003', name: 'HCM - Nha Trang', origin: 'TP.HCM', destination: 'Nha Trang', distance: 430, duration: '8h', stops: ['BX Miền Đông', 'Phan Rang', 'BX Nha Trang'], status: 'active', operators: ['PTR001', 'PTR003'] },
  { id: 'RT004', name: 'HCM - Vũng Tàu', origin: 'TP.HCM', destination: 'Vũng Tàu', distance: 120, duration: '2h30', stops: ['BX Miền Đông', 'Long Thành', 'BX Vũng Tàu'], status: 'active', operators: ['PTR005'] },
  { id: 'RT005', name: 'HCM - Đà Nẵng', origin: 'TP.HCM', destination: 'Đà Nẵng', distance: 960, duration: '18h', stops: ['BX Miền Đông', 'Nha Trang', 'Quy Nhơn', 'BX Đà Nẵng'], status: 'active', operators: ['PTR003'] },
  { id: 'RT006', name: 'HCM - Phan Thiết', origin: 'TP.HCM', destination: 'Phan Thiết', distance: 200, duration: '4h', stops: ['BX Miền Đông', 'BX Phan Thiết'], status: 'active', operators: ['PTR005'] },
];

const SCHEDULES = [
  { id: 'SCH001', routeId: 'RT001', operatorId: 'PTR001', departureTime: '06:00', arrivalTime: '13:00', seatLayoutId: 'SL001', status: 'active', daysOfWeek: ['Mon', 'Wed', 'Fri', 'Sun'] },
  { id: 'SCH002', routeId: 'RT001', operatorId: 'PTR002', departureTime: '20:00', arrivalTime: '03:00', seatLayoutId: 'SL002', status: 'active', daysOfWeek: ['Tue', 'Thu', 'Sat'] },
  { id: 'SCH003', routeId: 'RT002', operatorId: 'PTR001', departureTime: '07:00', arrivalTime: '10:30', seatLayoutId: 'SL001', status: 'active', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { id: 'SCH004', routeId: 'RT003', operatorId: 'PTR003', departureTime: '19:00', arrivalTime: '03:00', seatLayoutId: 'SL003', status: 'active', daysOfWeek: ['Mon', 'Wed', 'Fri'] },
  { id: 'SCH005', routeId: 'RT004', operatorId: 'PTR005', departureTime: '08:00', arrivalTime: '10:30', seatLayoutId: 'SL001', status: 'active', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
];

const SEAT_LAYOUTS = [
  { id: 'SL001', name: 'Ghế ngồi 45 chỗ', type: 'seat', totalSeats: 45, rows: 11, cols: 4 },
  { id: 'SL002', name: 'Giường nằm 36 chỗ', type: 'sleeper', totalSeats: 36, rows: 12, cols: 3 },
  { id: 'SL003', name: 'Limousine 22 chỗ', type: 'vip', totalSeats: 22, rows: 6, cols: 4 },
];

// ---- DRIVERS (Bike & Car) ----
// Tài xế thường — chỉ phục vụ booking BIKE/CAR. Có xe riêng (plate cố định).
const DRIVERS = [
  { id: 'DRV001', name: 'Nguyễn Văn An', phone: '0901234567', vehicleType: 'BIKE', plate: '59F1-12345', status: 'online', operatorId: null, rating: 4.8, trips: 1250, avatar: '👨', currentAssignmentId: null },
  { id: 'DRV002', name: 'Trần Minh Hoàng', phone: '0912345678', vehicleType: 'CAR', plate: '51G-23456', status: 'busy', operatorId: null, rating: 4.9, trips: 890, avatar: '👨', currentAssignmentId: 'FT002' },
  { id: 'DRV003', name: 'Lê Thị Hoa', phone: '0923456789', vehicleType: 'BIKE', plate: '59F2-34567', status: 'online', operatorId: null, rating: 4.7, trips: 650, avatar: '👩', currentAssignmentId: null },
  { id: 'DRV004', name: 'Phạm Quốc Bảo', phone: '0934567890', vehicleType: 'CAR', plate: '51H-45678', status: 'offline', operatorId: null, rating: 4.6, trips: 2100, avatar: '👨', currentAssignmentId: null },
  { id: 'DRV007', name: 'Bùi Kiều Anh', phone: '0967890123', vehicleType: 'CAR', plate: '51G-78901', status: 'online', operatorId: null, rating: 4.9, trips: 560, avatar: '👩', currentAssignmentId: null },
  { id: 'DRV008', name: 'Huỳnh Đức Long', phone: '0978901234', vehicleType: 'BIKE', plate: '59F3-89012', status: 'online', operatorId: null, rating: 4.4, trips: 420, avatar: '👨', currentAssignmentId: null },
  { id: 'DRV009', name: 'Ngô Minh Tuấn', phone: '0989012345', vehicleType: 'CAR', plate: '51G-90123', status: 'offline', operatorId: null, rating: 4.7, trips: 1560, avatar: '👨', currentAssignmentId: null },
  { id: 'DRV010', name: 'Dương Thị Mai', phone: '0990123456', vehicleType: 'BIKE', plate: '59F4-01234', status: 'online', operatorId: null, rating: 4.8, trips: 780, avatar: '👩', currentAssignmentId: null },
];

// ---- INTERCITY_DRIVERS (Tài xế liên tỉnh) ----
// Hỗ trợ booking INTERCITY + SERVICE_ORDER (đăng kiểm hộ) + MAINTENANCE_ORDER (bảo dưỡng hộ).
// Quản lý bởi nhà xe (operatorId bắt buộc), không có xe riêng — xe được gán riêng từ INTERCITY_VEHICLES.
// licenseClass: hạng GPLX (B2/C/D/E/F)
const INTERCITY_DRIVERS = [
  { id: 'DRV005', name: 'Võ Thanh Tùng', phone: '0945678901', operatorId: 'PTR001', licenseClass: 'E', status: 'busy', rating: 4.8, trips: 3200, avatar: '👨', currentAssignmentId: 'FT004' },
  { id: 'DRV006', name: 'Đỗ Ngọc Sơn', phone: '0956789012', operatorId: 'PTR002', licenseClass: 'D', status: 'busy', rating: 4.5, trips: 1800, avatar: '👨', currentAssignmentId: 'FT012' },
  { id: 'IDR001', name: 'Trương Bá Hiệp', phone: '0905111222', operatorId: 'PTR001', licenseClass: 'E', status: 'online', rating: 4.7, trips: 2150, avatar: '👨', currentAssignmentId: null },
  { id: 'IDR002', name: 'Nguyễn Hoàng Khang', phone: '0905222333', operatorId: 'PTR001', licenseClass: 'D', status: 'online', rating: 4.6, trips: 1450, avatar: '👨', currentAssignmentId: null },
  { id: 'IDR003', name: 'Lê Quang Tài', phone: '0905333444', operatorId: 'PTR002', licenseClass: 'E', status: 'online', rating: 4.9, trips: 2800, avatar: '👨', currentAssignmentId: null },
  { id: 'IDR004', name: 'Bùi Thanh Phong', phone: '0905444555', operatorId: 'PTR002', licenseClass: 'D', status: 'offline', rating: 4.5, trips: 980, avatar: '👨', currentAssignmentId: null },
  { id: 'IDR005', name: 'Hoàng Văn Tuấn', phone: '0905555666', operatorId: 'PTR003', licenseClass: 'E', status: 'online', rating: 4.8, trips: 2400, avatar: '👨', currentAssignmentId: null },
  { id: 'IDR006', name: 'Đinh Văn Quyết', phone: '0905666777', operatorId: 'PTR003', licenseClass: 'D', status: 'online', rating: 4.4, trips: 1650, avatar: '👨', currentAssignmentId: null },
  { id: 'IDR007', name: 'Phạm Quốc Đạt', phone: '0905777888', operatorId: 'PTR005', licenseClass: 'E', status: 'online', rating: 4.7, trips: 1850, avatar: '👨', currentAssignmentId: null },
  { id: 'IDR008', name: 'Trần Quốc Trung', phone: '0905888999', operatorId: 'PTR005', licenseClass: 'D', status: 'offline', rating: 4.6, trips: 1120, avatar: '👨', currentAssignmentId: null },
  { id: 'IDR009', name: 'Vũ Hồng Phúc', phone: '0905999000', operatorId: 'PTR001', licenseClass: 'E', status: 'online', rating: 4.5, trips: 720, avatar: '👨', currentAssignmentId: null },
  { id: 'IDR010', name: 'Lý Thị Hằng', phone: '0905000111', operatorId: 'PTR003', licenseClass: 'D', status: 'online', rating: 4.9, trips: 540, avatar: '👩', currentAssignmentId: null },
];

// ---- CUSTOMERS ----
const CUSTOMERS = [
  { id: 'KH001', name: 'Trịnh Hoàng Nam', phone: '0801234567', email: 'nam.trinh@gmail.com', totalBookings: 12, status: 'active' },
  { id: 'KH002', name: 'Lý Thanh Trúc', phone: '0812345678', email: 'truc.ly@gmail.com', totalBookings: 8, status: 'active' },
  { id: 'KH003', name: 'Mai Xuân Phong', phone: '0823456789', email: 'phong.mai@gmail.com', totalBookings: 5, status: 'active' },
  { id: 'KH004', name: 'Cao Thị Linh', phone: '0834567890', email: 'linh.cao@gmail.com', totalBookings: 3, status: 'active' },
  { id: 'KH005', name: 'Hồ Quang Vinh', phone: '0845678901', email: 'vinh.ho@gmail.com', totalBookings: 15, status: 'active' },
  { id: 'KH006', name: 'Đặng Minh Hải', phone: '0856789012', email: 'hai.dang@gmail.com', totalBookings: 2, status: 'active' },
  { id: 'KH007', name: 'Phan Thị Nga', phone: '0867890123', email: 'nga.phan@gmail.com', totalBookings: 7, status: 'active' },
  { id: 'KH008', name: 'Vương Đình Phúc', phone: '0878901234', email: 'phuc.vuong@gmail.com', totalBookings: 9, status: 'active' },
];

// ---- BOOKINGS (Enhanced with booking_code, payment_status, fulfillment_task_id, snapshots) ----
const BOOKINGS = [
  {
    id: 'BK001', bookingCode: 'RO-240318-001', bookingType: 'BIKE',
    bookingStatus: 'COMPLETED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'COMPLETED',
    customerId: 'KH001', agentId: 'USR003', driverId: 'DRV001',
    pickup: '227 Nguyễn Văn Cừ, Q.5', dropoff: 'Bệnh viện Chợ Rẫy, Q.5',
    fareSnapshot: 28000, distance: 3.2, paymentMethod: 'wallet', paymentReference: 'PAY001',
    fulfillmentTaskId: 'FT001',
    createdAt: '2026-03-18 14:30', updatedAt: '2026-03-18 14:52'
  },
  {
    id: 'BK002', bookingCode: 'RO-240318-002', bookingType: 'CAR',
    bookingStatus: 'IN_PROGRESS', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'IN_PROGRESS',
    customerId: 'KH002', agentId: 'USR003', driverId: 'DRV002',
    pickup: 'Vincom Đồng Khởi, Q.1', dropoff: 'Sân bay Tân Sơn Nhất',
    fareSnapshot: 185000, distance: 8.5, paymentMethod: 'wallet', paymentReference: 'PAY002',
    fulfillmentTaskId: 'FT002',
    createdAt: '2026-03-18 15:10', updatedAt: '2026-03-18 15:25'
  },
  {
    id: 'BK003', bookingCode: 'RO-240318-003', bookingType: 'BIKE',
    bookingStatus: 'PENDING_CONFIRMATION', paymentStatus: 'PENDING', fulfillmentStatus: null,
    customerId: 'KH003', agentId: 'USR003', driverId: null,
    pickup: 'ĐH Bách Khoa, Q.10', dropoff: 'Chợ Bến Thành, Q.1',
    fareSnapshot: 35000, distance: 4.1, paymentMethod: 'cash', paymentReference: 'PAY003',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 15:25', updatedAt: '2026-03-18 15:25'
  },
  {
    id: 'BK004', bookingCode: 'RO-240318-004', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'ASSIGNED',
    customerId: 'KH004', agentId: 'USR003', driverId: 'DRV005',
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'RT001', scheduleId: 'SCH001', seatNumbers: ['A1', 'A2'],
    passengerSnapshot: [{ name: 'Cao Thị Linh', phone: '0834567890' }],
    fareSnapshot: 320000, distance: 305, paymentMethod: 'momo', paymentReference: 'PAY004',
    fulfillmentTaskId: 'FT004',
    createdAt: '2026-03-18 06:00', updatedAt: '2026-03-18 06:15'
  },
  {
    id: 'BK005', bookingCode: 'RO-240318-005', bookingType: 'BIKE',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'ASSIGNED',
    customerId: 'KH005', agentId: null, driverId: 'DRV003',
    pickup: 'Landmark 81, Bình Thạnh', dropoff: 'Gigamall, Thủ Đức',
    fareSnapshot: 42000, distance: 5.8, paymentMethod: 'wallet', paymentReference: 'PAY005',
    fulfillmentTaskId: 'FT005',
    createdAt: '2026-03-18 15:30', updatedAt: '2026-03-18 15:32'
  },
  {
    id: 'BK006', bookingCode: 'RO-240318-006', bookingType: 'CAR',
    bookingStatus: 'PENDING_CONFIRMATION', paymentStatus: 'PENDING', fulfillmentStatus: null,
    customerId: 'KH006', agentId: 'USR003', driverId: null,
    pickup: 'Aeon Mall Bình Tân', dropoff: 'Q.7, Phú Mỹ Hưng',
    fareSnapshot: 155000, distance: 12.3, paymentMethod: 'wallet', paymentReference: 'PAY006',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 15:35', updatedAt: '2026-03-18 15:35'
  },
  {
    id: 'BK007', bookingCode: 'RO-240318-007', bookingType: 'SERVICE_ORDER',
    bookingStatus: 'COMPLETED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'COMPLETED',
    customerId: 'KH007', agentId: null, driverId: 'DRV004',
    pickup: 'Nguyễn Oanh, Gò Vấp', dropoff: 'TT Đăng Kiểm 50-06V',
    fareSnapshot: 500000, distance: 15, paymentMethod: 'bank', paymentReference: 'PAY007',
    fulfillmentTaskId: 'FT007',
    createdAt: '2026-03-18 08:00', updatedAt: '2026-03-18 11:30'
  },
  {
    id: 'BK008', bookingCode: 'RO-240318-008', bookingType: 'INTERCITY',
    bookingStatus: 'PENDING_CONFIRMATION', paymentStatus: 'PENDING', fulfillmentStatus: null,
    customerId: 'KH008', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Tây, TP.HCM', dropoff: 'BX Cần Thơ',
    routeId: 'RT002', scheduleId: 'SCH003', seatNumbers: ['B3'],
    passengerSnapshot: [{ name: 'Vương Đình Phúc', phone: '0878901234' }],
    fareSnapshot: 180000, distance: 170, paymentMethod: 'wallet', paymentReference: 'PAY008',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 15:40', updatedAt: '2026-03-18 15:40'
  },
  {
    id: 'BK009', bookingCode: 'RO-240318-009', bookingType: 'CAR',
    bookingStatus: 'COMPLETED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'COMPLETED',
    customerId: 'KH001', agentId: null, driverId: 'DRV002',
    pickup: 'Sân bay Tân Sơn Nhất', dropoff: 'Saigon Centre, Q.1',
    fareSnapshot: 195000, distance: 9.1, paymentMethod: 'wallet', paymentReference: 'PAY009',
    fulfillmentTaskId: 'FT009',
    createdAt: '2026-03-18 09:15', updatedAt: '2026-03-18 10:00'
  },
  {
    id: 'BK010', bookingCode: 'RO-240318-010', bookingType: 'BIKE',
    bookingStatus: 'CANCELLED', paymentStatus: 'CANCELLED', fulfillmentStatus: 'CANCELLED',
    customerId: 'KH003', agentId: null, driverId: null,
    pickup: 'Hồ Con Rùa, Q.3', dropoff: 'Thảo Cầm Viên, Q.1',
    fareSnapshot: 22000, distance: 2.5, paymentMethod: 'wallet', paymentReference: 'PAY010',
    fulfillmentTaskId: 'FT010',
    createdAt: '2026-03-18 12:00', updatedAt: '2026-03-18 12:05'
  },
  {
    id: 'BK011', bookingCode: 'RO-240318-011', bookingType: 'SERVICE_ORDER',
    bookingStatus: 'PENDING_CONFIRMATION', paymentStatus: 'PENDING', fulfillmentStatus: null,
    customerId: 'KH005', agentId: 'USR003', driverId: null,
    pickup: 'Lê Văn Sỹ, Q.3', dropoff: 'TT Đăng Kiểm 50-05V',
    fareSnapshot: 450000, distance: 10, paymentMethod: 'cash', paymentReference: 'PAY011',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 15:45', updatedAt: '2026-03-18 15:45'
  },
  {
    id: 'BK012', bookingCode: 'RO-240318-012', bookingType: 'INTERCITY',
    bookingStatus: 'IN_PROGRESS', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'IN_PROGRESS',
    customerId: 'KH002', agentId: 'USR003', driverId: 'DRV006',
    pickup: 'BX Miền Đông Mới', dropoff: 'BX Nha Trang',
    routeId: 'RT003', scheduleId: 'SCH004', seatNumbers: ['C1', 'C2'],
    passengerSnapshot: [{ name: 'Lý Thanh Trúc', phone: '0812345678' }],
    fareSnapshot: 280000, distance: 430, paymentMethod: 'momo', paymentReference: 'PAY012',
    fulfillmentTaskId: 'FT012',
    createdAt: '2026-03-18 05:30', updatedAt: '2026-03-18 19:00'
  },
  {
    id: 'BK013', bookingCode: 'RO-240318-013', bookingType: 'CAR',
    bookingStatus: 'RESCHEDULE_REQUESTED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'CANCELLED',
    customerId: 'KH005', agentId: null, driverId: null,
    pickup: 'Nhà hàng Rex, Q.1', dropoff: 'Sân bay Tân Sơn Nhất',
    fareSnapshot: 175000, distance: 7.8, paymentMethod: 'wallet', paymentReference: 'PAY013',
    fulfillmentTaskId: 'FT013',
    createdAt: '2026-03-18 11:00', updatedAt: '2026-03-18 13:00'
  },
  // ---- Bookings CONFIRMED chờ phân công (populate fulfillment queues) ----
  {
    id: 'BK030', bookingCode: 'RO-240318-030', bookingType: 'BIKE',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH006', agentId: null, driverId: null,
    pickup: 'ĐH Hutech, Bình Thạnh', dropoff: 'Chợ Tân Định, Q.1',
    fareSnapshot: 38000, distance: 4.5, paymentMethod: 'wallet', paymentReference: 'PAY030',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 16:10', updatedAt: '2026-03-18 16:11'
  },
  {
    id: 'BK031', bookingCode: 'RO-240318-031', bookingType: 'CAR',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CASH', fulfillmentStatus: 'PENDING',
    customerId: 'KH007', agentId: null, driverId: null,
    pickup: 'Crescent Mall, Q.7', dropoff: 'Sân bay Tân Sơn Nhất',
    fareSnapshot: 165000, distance: 11.2, paymentMethod: 'cash', paymentReference: 'CASH-BK031',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 16:15', updatedAt: '2026-03-18 16:15'
  },
  {
    id: 'BK032', bookingCode: 'RO-240318-032', bookingType: 'CAR',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH008', agentId: null, driverId: null,
    pickup: 'Diamond Plaza, Q.1', dropoff: 'Vincom Mega Mall, Thủ Đức',
    fareSnapshot: 140000, distance: 9.5, paymentMethod: 'momo', paymentReference: 'PAY032',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 16:20', updatedAt: '2026-03-18 16:21'
  },
  {
    id: 'BK033', bookingCode: 'RO-240318-033', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH002', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'RT001', tripId: 'TRP005', scheduleId: null,
    seatNumbers: ['B5','B6'],
    passengerSnapshot: [{ name: 'Lý Thanh Trúc', phone: '0812345678' }, { name: 'Bạn KH', phone: '0812345679' }],
    fareSnapshot: 580000, distance: 305, paymentMethod: 'wallet', paymentReference: 'PAY033',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 16:25', updatedAt: '2026-03-18 16:26'
  },
  {
    id: 'BK034', bookingCode: 'RO-240318-034', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CASH', fulfillmentStatus: 'PENDING',
    customerId: 'KH005', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Tây, TP.HCM', dropoff: 'BX Cần Thơ',
    routeId: 'RT002', tripId: 'TRP006', scheduleId: null,
    seatNumbers: ['A3'],
    passengerSnapshot: [{ name: 'Hồ Quang Vinh', phone: '0845678901' }],
    fareSnapshot: 150000, distance: 170, paymentMethod: 'cash', paymentReference: 'CASH-BK034',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 16:30', updatedAt: '2026-03-18 16:30'
  },
  {
    id: 'BK035', bookingCode: 'RO-240318-035', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH004', agentId: null, driverId: null,
    pickup: 'BX Miền Đông Mới', dropoff: 'BX Vũng Tàu',
    routeId: 'RT004', tripId: 'TRP012', scheduleId: null,
    seatNumbers: ['C2'],
    passengerSnapshot: [{ name: 'Cao Thị Linh', phone: '0834567890' }],
    fareSnapshot: 120000, distance: 120, paymentMethod: 'momo', paymentReference: 'PAY035',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 16:35', updatedAt: '2026-03-18 16:35'
  },

  // ===== HÔM NAY 2026-05-27 — TEST TIME-CONFLICT =====
  // BK100: ĐANG TRONG CHUYẾN — IDR001 + IV001 phục vụ 08:00–15:00 hôm nay
  {
    id: 'BK100', bookingCode: 'RO-260527-100', bookingType: 'INTERCITY',
    bookingStatus: 'IN_PROGRESS', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'IN_PROGRESS',
    customerId: 'KH001', agentId: null, driverId: 'IDR001',
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'INT001', tripId: 'TRP100', scheduleId: null,
    seatNumbers: ['A1','A2'],
    passengerSnapshot: [{ name: 'Trịnh Hoàng Nam', phone: '0801234567' }],
    fareSnapshot: 640000, distance: 305, paymentMethod: 'momo', paymentReference: 'PAY100',
    fulfillmentTaskId: 'FT100',
    createdAt: '2026-05-26 18:00', updatedAt: '2026-05-27 08:00'
  },
  // BK101: CHỜ PHÂN CÔNG, 10:00-18:00 → OVERLAP với BK100. IDR001+IV001 KHÔNG xuất hiện trong dropdown
  {
    id: 'BK101', bookingCode: 'RO-260527-101', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH002', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Nha Trang',
    routeId: 'INT003', tripId: 'TRP101', scheduleId: null,
    seatNumbers: ['B1'],
    passengerSnapshot: [{ name: 'Lý Thanh Trúc', phone: '0812345678' }],
    fareSnapshot: 280000, distance: 430, paymentMethod: 'wallet', paymentReference: 'PAY101',
    fulfillmentTaskId: null,
    createdAt: '2026-05-27 07:00', updatedAt: '2026-05-27 07:00'
  },
  // BK102: CHỜ PHÂN CÔNG, 20:00-03:00+1 → KHÔNG overlap với BK100. IDR001+IV001 HIỆN trong dropdown kèm hint "đang bận 27/05 08:00-15:00"
  {
    id: 'BK102', bookingCode: 'RO-260527-102', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CASH', fulfillmentStatus: 'PENDING',
    customerId: 'KH003', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'INT001', tripId: 'TRP102', scheduleId: null,
    seatNumbers: ['C3'],
    passengerSnapshot: [{ name: 'Mai Xuân Phong', phone: '0823456789' }],
    fareSnapshot: 290000, distance: 305, paymentMethod: 'cash', paymentReference: 'CASH-BK102',
    fulfillmentTaskId: null,
    createdAt: '2026-05-27 08:30', updatedAt: '2026-05-27 08:30'
  },
  // BK103: CHỜ PHÂN CÔNG, khác nhà xe (PTR005, Vũng Tàu) — test pool nhà xe khác
  {
    id: 'BK103', bookingCode: 'RO-260527-103', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH005', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Vũng Tàu',
    routeId: 'INT005', tripId: 'TRP103', scheduleId: null,
    seatNumbers: ['A5'],
    passengerSnapshot: [{ name: 'Hồ Quang Vinh', phone: '0845678901' }],
    fareSnapshot: 120000, distance: 120, paymentMethod: 'momo', paymentReference: 'PAY103',
    fulfillmentTaskId: null,
    createdAt: '2026-05-27 09:00', updatedAt: '2026-05-27 09:00'
  },
  // BK104: CHỜ PHÂN CÔNG, 07:00-14:00 nhà xe Thành Bưởi → OVERLAP với BK100 (chỉ về thời gian, khác nhà xe)
  {
    id: 'BK104', bookingCode: 'RO-260527-104', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH006', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Bảo Lộc',
    routeId: 'INT011', tripId: 'TRP104', scheduleId: null,
    seatNumbers: ['B4'],
    passengerSnapshot: [{ name: 'Đặng Minh Hải', phone: '0856789012' }],
    fareSnapshot: 220000, distance: 200, paymentMethod: 'wallet', paymentReference: 'PAY104',
    fulfillmentTaskId: null,
    createdAt: '2026-05-27 06:00', updatedAt: '2026-05-27 06:00'
  },
  // BK-MNT-LIVE: ĐANG LÀM bảo dưỡng — IDR002 phục vụ MNT100 (09:00-13:00 hôm nay, gói 'full' = 4h buffer)
  {
    id: 'BK-MNT-LIVE', bookingCode: 'RO-MNT-LIVE', bookingType: 'MAINTENANCE_ORDER',
    bookingStatus: 'IN_PROGRESS', paymentStatus: 'CASH', fulfillmentStatus: 'IN_PROGRESS',
    customerId: 'KH001', agentId: null, driverId: 'IDR002',
    pickup: '5 Test Ave', dropoff: 'Gara A1 (Q.1)',
    fareSnapshot: 1200000, distance: 0,
    paymentMethod: 'cash', paymentReference: 'CASH-BK-MNT-LIVE',
    fulfillmentTaskId: 'FT-MNT-LIVE',
    maintenanceOrderId: 'MNT100',
    createdAt: '2026-05-26 20:30', updatedAt: '2026-05-27 09:00'
  },
];

// ---- FULFILLMENT TASKS ----
// Có thêm field vehicleId — chỉ INTERCITY booking sử dụng (xe & tài xế tách biệt)
const FULFILLMENT_TASKS = [
  { id: 'FT001', bookingId: 'BK001', driverId: 'DRV001', vehicleId: null, status: 'COMPLETED', assignedAt: '2026-03-18 14:32', startedAt: '2026-03-18 14:38', completedAt: '2026-03-18 14:52' },
  { id: 'FT002', bookingId: 'BK002', driverId: 'DRV002', vehicleId: null, status: 'IN_PROGRESS', assignedAt: '2026-03-18 15:12', startedAt: '2026-03-18 15:25', completedAt: null },
  { id: 'FT004', bookingId: 'BK004', driverId: 'DRV005', vehicleId: 'IV002', status: 'ASSIGNED', assignedAt: '2026-03-18 06:15', startedAt: null, completedAt: null },
  { id: 'FT005', bookingId: 'BK005', driverId: 'DRV003', vehicleId: null, status: 'ASSIGNED', assignedAt: '2026-03-18 15:32', startedAt: null, completedAt: null },
  { id: 'FT007', bookingId: 'BK007', driverId: 'DRV004', vehicleId: null, status: 'COMPLETED', assignedAt: '2026-03-18 08:10', startedAt: '2026-03-18 08:30', completedAt: '2026-03-18 11:30' },
  { id: 'FT009', bookingId: 'BK009', driverId: 'DRV002', vehicleId: null, status: 'COMPLETED', assignedAt: '2026-03-18 09:18', startedAt: '2026-03-18 09:25', completedAt: '2026-03-18 10:00' },
  { id: 'FT010', bookingId: 'BK010', driverId: 'DRV008', vehicleId: null, status: 'CANCELLED', assignedAt: '2026-03-18 12:02', startedAt: null, completedAt: null },
  { id: 'FT012', bookingId: 'BK012', driverId: 'DRV006', vehicleId: 'IV007', status: 'IN_PROGRESS', assignedAt: '2026-03-18 05:35', startedAt: '2026-03-18 19:00', completedAt: null },
  { id: 'FT013', bookingId: 'BK013', driverId: 'DRV007', vehicleId: null, status: 'CANCELLED', assignedAt: '2026-03-18 11:10', startedAt: null, completedAt: null },
  // ===== HÔM NAY 2026-05-27 — FT IN_PROGRESS để test time-conflict =====
  // IDR001 + IV001 đang chạy chuyến BK100 từ 08:00-15:00 → heal sẽ set busy
  { id: 'FT100', bookingId: 'BK100', driverId: 'IDR001', vehicleId: 'IV001', status: 'IN_PROGRESS', assignedAt: '2026-05-26 18:30', startedAt: '2026-05-27 08:00', completedAt: null },
  // IDR002 đang làm MNT100 (bảo dưỡng 09:00-13:00)
  { id: 'FT-MNT-LIVE', bookingId: 'BK-MNT-LIVE', driverId: 'IDR002', vehicleId: null, status: 'IN_PROGRESS', assignedAt: '2026-05-26 21:00', startedAt: '2026-05-27 09:00', completedAt: null },
];

// ---- INTERCITY VEHICLES ----
// Xe liên tỉnh quản lý độc lập với tài xế. 1 xe có thể gán nhiều tài xế khác nhau theo từng chuyến,
// và 1 tài xế có thể lái nhiều xe khác nhau.
const INTERCITY_VEHICLES = [
  { id: 'IV001', plate: '51B-10001', vehicleClass: 'Ghế ngồi 45 chỗ', seatLayoutId: 'SL001', operatorId: 'PTR001', status: 'idle', currentAssignmentId: null, mileage: 125000 },
  { id: 'IV002', plate: '51B-10002', vehicleClass: 'Giường nằm 36 chỗ', seatLayoutId: 'SL002', operatorId: 'PTR001', status: 'busy', currentAssignmentId: 'FT004', mileage: 95000 },
  { id: 'IV003', plate: '51B-10003', vehicleClass: 'Giường nằm 36 chỗ', seatLayoutId: 'SL002', operatorId: 'PTR002', status: 'idle', currentAssignmentId: null, mileage: 87000 },
  { id: 'IV004', plate: '51B-10004', vehicleClass: 'Limousine 22 chỗ', seatLayoutId: 'SL003', operatorId: 'PTR001', status: 'idle', currentAssignmentId: null, mileage: 45000 },
  { id: 'IV005', plate: '51B-10005', vehicleClass: 'Ghế ngồi 45 chỗ', seatLayoutId: 'SL001', operatorId: 'PTR002', status: 'maintenance', currentAssignmentId: null, mileage: 230000 },
  { id: 'IV006', plate: '51B-10006', vehicleClass: 'Giường nằm 36 chỗ', seatLayoutId: 'SL002', operatorId: 'PTR003', status: 'idle', currentAssignmentId: null, mileage: 67000 },
  { id: 'IV007', plate: '51B-10007', vehicleClass: 'Limousine 22 chỗ', seatLayoutId: 'SL003', operatorId: 'PTR003', status: 'busy', currentAssignmentId: 'FT012', mileage: 110000 },
  { id: 'IV008', plate: '51B-10008', vehicleClass: 'Ghế ngồi 45 chỗ', seatLayoutId: 'SL001', operatorId: 'PTR005', status: 'idle', currentAssignmentId: null, mileage: 33000 },
  { id: 'IV009', plate: '51B-10009', vehicleClass: 'Limousine 22 chỗ', seatLayoutId: 'SL003', operatorId: 'PTR002', status: 'idle', currentAssignmentId: null, mileage: 28000 },
  { id: 'IV010', plate: '51B-10010', vehicleClass: 'Ghế ngồi 45 chỗ', seatLayoutId: 'SL001', operatorId: 'PTR001', status: 'idle', currentAssignmentId: null, mileage: 156000 },
];

const VEHICLE_STATUS = {
  idle: { label: 'Sẵn sàng', class: 'badge-online' },
  busy: { label: 'Đang chạy', class: 'badge-busy' },
  maintenance: { label: 'Bảo dưỡng', class: 'badge-pending' }
};

// ---- OPERATORS (Partners / Nhà xe) ----
const PARTNERS = [
  { id: 'PTR001', name: 'Nhà xe Phương Trang', contact: 'Nguyễn Văn Phương', phone: '0281234567', vehicles: 45, drivers: 32, routes: ['HCM - Đà Lạt', 'HCM - Cần Thơ', 'HCM - Nha Trang'], status: 'active', commission: 15, joinedDate: '2024-01-15' },
  { id: 'PTR002', name: 'Nhà xe Thành Bưởi', contact: 'Trần Thị Bưởi', phone: '0282345678', vehicles: 30, drivers: 22, routes: ['HCM - Đà Lạt', 'HCM - Bảo Lộc'], status: 'active', commission: 12, joinedDate: '2024-03-20' },
  { id: 'PTR003', name: 'Nhà xe Hoàng Long', contact: 'Lê Hoàng Long', phone: '0283456789', vehicles: 60, drivers: 48, routes: ['HCM - Hà Nội', 'HCM - Đà Nẵng', 'HCM - Huế'], status: 'active', commission: 18, joinedDate: '2023-11-10' },
  { id: 'PTR004', name: 'Nhà xe Kumho Samco', contact: 'Park Jin Ho', phone: '0284567890', vehicles: 25, drivers: 18, routes: ['HCM - Phnom Penh'], status: 'inactive', commission: 20, joinedDate: '2024-06-01' },
  { id: 'PTR005', name: 'Nhà xe Việt Thanh', contact: 'Phạm Việt Thanh', phone: '0285678901', vehicles: 15, drivers: 12, routes: ['HCM - Vũng Tàu', 'HCM - Phan Thiết'], status: 'active', commission: 14, joinedDate: '2024-09-15' },
];

// ---- PROMOS ----
const PROMOS = [
  { id: 'PM001', code: 'WELCOME50', type: 'percent', value: 50, maxDiscount: 30000, minOrder: 20000, usageLimit: 1000, used: 756, vehicleTypes: ['BIKE', 'CAR'], startDate: '2026-03-01', endDate: '2026-03-31', status: 'active' },
  { id: 'PM002', code: 'RIDE20K', type: 'fixed', value: 20000, maxDiscount: 20000, minOrder: 50000, usageLimit: 500, used: 423, vehicleTypes: ['CAR'], startDate: '2026-03-10', endDate: '2026-03-25', status: 'active' },
  { id: 'PM003', code: 'INTERCITY100', type: 'fixed', value: 100000, maxDiscount: 100000, minOrder: 200000, usageLimit: 200, used: 200, vehicleTypes: ['INTERCITY'], startDate: '2026-02-15', endDate: '2026-03-15', status: 'expired' },
  { id: 'PM004', code: 'NEWUSER', type: 'percent', value: 30, maxDiscount: 50000, minOrder: 0, usageLimit: 5000, used: 3210, vehicleTypes: ['BIKE', 'CAR', 'INTERCITY'], startDate: '2026-01-01', endDate: '2026-06-30', status: 'active' },
  { id: 'PM005', code: 'DKFREE', type: 'fixed', value: 200000, maxDiscount: 200000, minOrder: 400000, usageLimit: 100, used: 45, vehicleTypes: ['SERVICE_ORDER'], startDate: '2026-03-01', endDate: '2026-04-30', status: 'active' },
  { id: 'PM006', code: 'SUMMER25', type: 'percent', value: 25, maxDiscount: 40000, minOrder: 30000, usageLimit: 2000, used: 0, vehicleTypes: ['BIKE', 'CAR'], startDate: '2026-06-01', endDate: '2026-08-31', status: 'scheduled' },
];

// ---- WALLETS (Enhanced with wallet_type, pending_balance, wallet_status) ----
const WALLETS = [
  { id: 'W001', ownerId: 'KH001', ownerName: 'Trịnh Hoàng Nam', ownerType: 'CUSTOMER', walletType: 'MAIN', balance: 250000, pendingBalance: 0, status: 'ACTIVE' },
  { id: 'W002', ownerId: 'KH002', ownerName: 'Lý Thanh Trúc', ownerType: 'CUSTOMER', walletType: 'MAIN', balance: 180000, pendingBalance: 0, status: 'ACTIVE' },
  { id: 'W003', ownerId: 'DRV001', ownerName: 'Nguyễn Văn An', ownerType: 'DRIVER', walletType: 'MAIN', balance: 1520000, pendingBalance: 0, status: 'ACTIVE' },
  { id: 'W004', ownerId: 'DRV002', ownerName: 'Trần Minh Hoàng', ownerType: 'DRIVER', walletType: 'MAIN', balance: 3250000, pendingBalance: 185000, status: 'ACTIVE' },
  { id: 'W005', ownerId: 'KH003', ownerName: 'Mai Xuân Phong', ownerType: 'CUSTOMER', walletType: 'MAIN', balance: 0, pendingBalance: 0, status: 'ACTIVE' },
  { id: 'W006', ownerId: 'DRV005', ownerName: 'Võ Thanh Tùng', ownerType: 'DRIVER', walletType: 'MAIN', balance: 8900000, pendingBalance: 320000, status: 'ACTIVE' },
  { id: 'W007', ownerId: 'KH005', ownerName: 'Hồ Quang Vinh', ownerType: 'CUSTOMER', walletType: 'MAIN', balance: 75000, pendingBalance: 0, status: 'ACTIVE' },
  { id: 'W008', ownerId: 'DRV007', ownerName: 'Bùi Kiều Anh', ownerType: 'DRIVER', walletType: 'MAIN', balance: 2100000, pendingBalance: 0, status: 'ACTIVE' },
  { id: 'W009', ownerId: 'PTR001', ownerName: 'Nhà xe Phương Trang', ownerType: 'PARTNER', walletType: 'MAIN', balance: 45000000, pendingBalance: 2500000, status: 'ACTIVE' },
  { id: 'W010', ownerId: 'SYS', ownerName: 'Hệ thống RideOps', ownerType: 'SYSTEM', walletType: 'HOLDING', balance: 12500000, pendingBalance: 0, status: 'ACTIVE' },
  { id: 'W011', ownerId: 'KH001', ownerName: 'Trịnh Hoàng Nam', ownerType: 'CUSTOMER', walletType: 'BONUS', balance: 50000, pendingBalance: 0, status: 'ACTIVE' },
];

// ---- TRANSACTIONS (Enhanced with direction, transaction_type, reference) ----
const WALLET_TRANSACTIONS = [
  { id: 'TXN001', walletId: 'W001', direction: 'CREDIT', type: 'TOPUP', amount: 500000, balance: 250000, referenceType: 'momo', referenceId: 'MOMO-001', status: 'SUCCESS', note: 'Nạp ví qua MoMo', createdAt: '2026-03-18 10:00' },
  { id: 'TXN002', walletId: 'W001', direction: 'DEBIT', type: 'PAYMENT', amount: 28000, balance: 222000, referenceType: 'booking', referenceId: 'BK001', status: 'SUCCESS', note: 'Thanh toán BK001', createdAt: '2026-03-18 14:52' },
  { id: 'TXN003', walletId: 'W003', direction: 'CREDIT', type: 'EARNING', amount: 23800, balance: 1520000, referenceType: 'booking', referenceId: 'BK001', status: 'SUCCESS', note: 'Thu nhập chuyến BK001 (sau chiết khấu)', createdAt: '2026-03-18 14:52' },
  { id: 'TXN004', walletId: 'W002', direction: 'CREDIT', type: 'TOPUP', amount: 200000, balance: 180000, referenceType: 'bank', referenceId: 'VCB-002', status: 'SUCCESS', note: 'Nạp ví qua ngân hàng', createdAt: '2026-03-17 08:30' },
  { id: 'TXN005', walletId: 'W004', direction: 'DEBIT', type: 'WITHDRAW', amount: 2000000, balance: 3250000, referenceType: 'bank', referenceId: 'VCB-003', status: 'SUCCESS', note: 'Rút tiền về ngân hàng', createdAt: '2026-03-17 18:00' },
  { id: 'TXN006', walletId: 'W010', direction: 'CREDIT', type: 'SETTLEMENT', amount: 5600, balance: 12500000, referenceType: 'booking', referenceId: 'BK001', status: 'SUCCESS', note: 'Chiết khấu 20% từ BK001', createdAt: '2026-03-18 14:52' },
  { id: 'TXN007', walletId: 'W011', direction: 'CREDIT', type: 'ADJUSTMENT', amount: 50000, balance: 50000, referenceType: 'promo', referenceId: 'PM001', status: 'SUCCESS', note: 'Thưởng ví bonus cho KH001', createdAt: '2026-03-18 15:00' },
];

// ---- REFUNDS ----
const REFUNDS = [
  { id: 'RF001', bookingId: 'BK010', bookingCode: 'RO-240318-010', customerId: 'KH003', paymentReference: 'PAY010', amount: 22000, reason: 'Khách hủy trước khi đón', status: 'SUCCESS', refundMethod: 'wallet', processedBy: 'USR002', createdAt: '2026-03-18 12:10', processedAt: '2026-03-18 12:15' },
  { id: 'RF002', bookingId: 'BK013', bookingCode: 'RO-240318-013', customerId: 'KH005', paymentReference: 'PAY013', amount: 175000, reason: 'Đổi lịch - hoàn tiền rồi đặt lại', status: 'PROCESSING', refundMethod: 'wallet', processedBy: 'USR002', createdAt: '2026-03-18 13:05', processedAt: null },
  { id: 'RF003', bookingId: 'BK010', bookingCode: 'RO-240318-010', customerId: 'KH003', paymentReference: 'PAY010', amount: 5000, reason: 'Bồi thường bất tiện', status: 'PENDING', refundMethod: 'bonus_wallet', processedBy: null, createdAt: '2026-03-18 13:30', processedAt: null },
];

// ---- NOTIFICATIONS ----
const NOTIFICATIONS = [
  { id: 'NTF001', type: 'booking_created', channel: 'push', recipient: 'KH001', content: 'Booking BK001 đã được tạo thành công', status: 'delivered', createdAt: '2026-03-18 14:30' },
  { id: 'NTF002', type: 'payment_confirmed', channel: 'sms', recipient: 'KH001', content: 'Thanh toán 28.000đ cho BK001 thành công', status: 'delivered', createdAt: '2026-03-18 14:31' },
  { id: 'NTF003', type: 'driver_assigned', channel: 'push', recipient: 'DRV001', content: 'Bạn được gán chuyến BK001', status: 'delivered', createdAt: '2026-03-18 14:32' },
  { id: 'NTF004', type: 'trip_completed', channel: 'push', recipient: 'KH001', content: 'Chuyến BK001 hoàn thành. Cảm ơn bạn!', status: 'delivered', createdAt: '2026-03-18 14:52' },
  { id: 'NTF005', type: 'booking_cancelled', channel: 'push', recipient: 'KH003', content: 'Booking BK010 đã bị hủy', status: 'delivered', createdAt: '2026-03-18 12:05' },
  { id: 'NTF006', type: 'refund_completed', channel: 'sms', recipient: 'KH003', content: 'Hoàn tiền 22.000đ cho BK010 thành công', status: 'delivered', createdAt: '2026-03-18 12:15' },
  { id: 'NTF007', type: 'driver_assigned', channel: 'push', recipient: 'DRV005', content: 'Bạn được gán chuyến BK004 - tuyến HCM-Đà Lạt', status: 'failed', retryCount: 2, createdAt: '2026-03-18 06:15' },
  { id: 'NTF008', type: 'booking_created', channel: 'push', recipient: 'KH006', content: 'Booking BK006 đã được tạo', status: 'pending', createdAt: '2026-03-18 15:35' },
];

// ---- AUDIT LOGS ----
const AUDIT_LOGS = [
  { id: 'AL001', action: 'booking.create', actor: 'USR003', actorRole: 'AGENT', target: 'BK001', sourceSite: 'agent', traceId: 'tr-001', before: null, after: '{"status":"DRAFT"}', timestamp: '2026-03-18 14:30' },
  { id: 'AL002', action: 'payment.confirm', actor: 'SYSTEM', actorRole: 'SYSTEM', target: 'PAY001', sourceSite: 'system', traceId: 'tr-001', before: '{"status":"PENDING"}', after: '{"status":"CONFIRMED"}', timestamp: '2026-03-18 14:31' },
  { id: 'AL003', action: 'fulfillment.assign', actor: 'USR002', actorRole: 'OPERATOR', target: 'FT001', sourceSite: 'master', traceId: 'tr-001', before: '{"driver":null}', after: '{"driver":"DRV001"}', timestamp: '2026-03-18 14:32' },
  { id: 'AL004', action: 'booking.status_change', actor: 'SYSTEM', actorRole: 'SYSTEM', target: 'BK001', sourceSite: 'system', traceId: 'tr-001', before: '{"status":"IN_PROGRESS"}', after: '{"status":"COMPLETED"}', timestamp: '2026-03-18 14:52' },
  { id: 'AL005', action: 'booking.cancel', actor: 'USR003', actorRole: 'AGENT', target: 'BK010', sourceSite: 'agent', traceId: 'tr-010', before: '{"status":"CONFIRMED"}', after: '{"status":"CANCELLED"}', timestamp: '2026-03-18 12:05' },
  { id: 'AL006', action: 'refund.create', actor: 'USR002', actorRole: 'OPERATOR', target: 'RF001', sourceSite: 'master', traceId: 'tr-010', before: null, after: '{"amount":22000}', timestamp: '2026-03-18 12:10' },
  { id: 'AL007', action: 'wallet.adjust', actor: 'USR004', actorRole: 'FINANCE', target: 'W011', sourceSite: 'master', traceId: 'tr-adj-001', before: '{"balance":0}', after: '{"balance":50000}', timestamp: '2026-03-18 15:00' },
  { id: 'AL008', action: 'fulfillment.reassign', actor: 'USR002', actorRole: 'OPERATOR', target: 'FT013', sourceSite: 'master', traceId: 'tr-013', before: '{"driver":"DRV007"}', after: '{"driver":null,"status":"CANCELLED"}', timestamp: '2026-03-18 13:00' },
  { id: 'AL009', action: 'user.disable', actor: 'USR001', actorRole: 'ADMIN', target: 'USR005', sourceSite: 'master', traceId: 'tr-usr-001', before: '{"status":"active"}', after: '{"status":"disabled"}', timestamp: '2026-03-10 08:00' },
];

// ---- COMMISSIONS ----
const COMMISSIONS = [
  { id: 'CM001', vehicleType: 'BIKE', rate: 20, description: 'Chiết khấu xe máy tiêu chuẩn' },
  { id: 'CM002', vehicleType: 'CAR', rate: 22, description: 'Chiết khấu xe hơi tiêu chuẩn' },
  { id: 'CM003', vehicleType: 'INTERCITY', rate: 15, description: 'Chiết khấu xe khách liên tỉnh' },
  { id: 'CM004', vehicleType: 'SERVICE_ORDER', rate: 10, description: 'Chiết khấu dịch vụ đăng kiểm' },
  { id: 'CM005', vehicleType: 'MAINTENANCE_ORDER', rate: 12, description: 'Chiết khấu dịch vụ bảo dưỡng' },
];

// ---- MAINTENANCE (Bảo dưỡng hộ) — song song với REGISTRATIONS, mock data riêng ----
const MAINTENANCE = [
  { id: 'MNT001', plate: '51A-456.78', ownerName: 'Phạm Trung Hiếu', ownerPhone: '0911223344', vehicleType: 'car', address: '12 Hai Bà Trưng, Q.1, TP.HCM', center: 'GARA-A1', centerName: 'Gara A1 (Q.1)', bookingDate: '2026-03-22', bookingTime: '09:00', service: 'basic', price: 400000, status: 'pending', createdAt: '2026-03-18 12:00' },
  { id: 'MNT002', plate: '51B-987.65', ownerName: 'Đinh Khánh Linh', ownerPhone: '0922334455', vehicleType: 'car', address: '88 Cách Mạng Tháng 8, Q.3', center: 'GARA-B2', centerName: 'Gara B2 (Q.3)', bookingDate: '2026-03-20', bookingTime: '10:00', service: 'full', price: 1200000, status: 'confirmed', createdAt: '2026-03-18 13:30' },
  { id: 'MNT003', plate: '52C-321.45', ownerName: 'Trương Văn Đức', ownerPhone: '0933445566', vehicleType: 'truck', address: '45 Trường Chinh, Tân Bình', center: 'GARA-C3', centerName: 'Gara C3 (Tân Bình)', bookingDate: '2026-03-23', bookingTime: '07:00', service: 'oil_change', price: 250000, status: 'pending', createdAt: '2026-03-18 15:00' },
  { id: 'MNT004', plate: '60D-789.12', ownerName: 'Lý Thị Hồng', ownerPhone: '0944556677', vehicleType: 'car', address: '202 Nguyễn Văn Linh, Q.7', center: 'GARA-D4', centerName: 'Gara D4 (Q.7)', bookingDate: '2026-03-19', bookingTime: '14:00', service: 'tire', price: 800000, status: 'completed', createdAt: '2026-03-17 11:00' },
  { id: 'MNT005', plate: '65E-234.56', ownerName: 'Nguyễn Quốc Khánh', ownerPhone: '0955667788', vehicleType: 'car', address: '99 Phan Đăng Lưu, Phú Nhuận', center: 'GARA-E5', centerName: 'Gara E5 (Phú Nhuận)', bookingDate: '2026-03-24', bookingTime: '13:00', service: 'basic', price: 400000, status: 'pending', createdAt: '2026-03-18 10:15' },
  { id: 'MNT006', plate: '43F-555.99', ownerName: 'Vũ Thanh Hà', ownerPhone: '0966778899', vehicleType: 'bus', address: '150 Lý Tự Trọng, Q.1', center: 'GARA-A1', centerName: 'Gara A1 (Q.1)', bookingDate: '2026-03-21', bookingTime: '15:00', service: 'full', price: 1500000, status: 'cancelled', createdAt: '2026-03-16 09:30' },
  { id: 'MNT007', plate: '51M-456.78', ownerName: 'Bùi Quốc Việt', ownerPhone: '0933110011', vehicleType: 'car', address: '12 Bà Triệu, Tân Bình', center: 'GARA-B2', centerName: 'Gara B2 (Q.3)', bookingDate: '2026-03-22', bookingTime: '11:00', service: 'basic', price: 400000, status: 'confirmed', createdAt: '2026-03-18 14:20' },
  { id: 'MNT008', plate: '51N-789.12', ownerName: 'Nguyễn Thị Quỳnh', ownerPhone: '0944220022', vehicleType: 'car', address: '76 Lê Lai, Q.1', center: 'GARA-E5', centerName: 'Gara E5 (Phú Nhuận)', bookingDate: '2026-03-23', bookingTime: '15:00', service: 'tire', price: 800000, status: 'confirmed', createdAt: '2026-03-18 16:00' },
  // ===== HÔM NAY 2026-05-27 — TEST TIME-CONFLICT cho dịch vụ =====
  // MNT100: ĐANG LÀM (IDR002 đang phục vụ 09:00-13:00 — `full` service = 4h buffer)
  { id: 'MNT100', plate: '51X-100.10', ownerName: 'Khách Hiện Tại', ownerPhone: '0900100100', vehicleType: 'car', address: '5 Test Ave', center: 'GARA-A1', centerName: 'Gara A1 (Q.1)', bookingDate: '2026-05-27', bookingTime: '09:00', service: 'full', price: 1200000, status: 'confirmed', createdAt: '2026-05-26 20:00', bookingId: 'BK-MNT-LIVE' },
  // MNT101: CHỜ PHÂN CÔNG, 10:00 → OVERLAP với MNT100. IDR002 KHÔNG xuất hiện
  { id: 'MNT101', plate: '51X-100.20', ownerName: 'Khách Chờ Sớm', ownerPhone: '0900200200', vehicleType: 'car', address: '20 Test St', center: 'GARA-B2', centerName: 'Gara B2 (Q.3)', bookingDate: '2026-05-27', bookingTime: '10:00', service: 'basic', price: 400000, status: 'confirmed', createdAt: '2026-05-27 07:00' },
  // MNT102: CHỜ PHÂN CÔNG, 16:00 → KHÔNG overlap. IDR002 xuất hiện với hint "đang bận 27/05 09:00-13:00"
  { id: 'MNT102', plate: '51X-100.30', ownerName: 'Khách Chờ Chiều', ownerPhone: '0900300300', vehicleType: 'car', address: '30 Test Blvd', center: 'GARA-D4', centerName: 'Gara D4 (Q.7)', bookingDate: '2026-05-27', bookingTime: '16:00', service: 'oil_change', price: 250000, status: 'confirmed', createdAt: '2026-05-27 07:30' },
];

// ---- REGISTRATIONS (Đăng kiểm hộ) ----
const REGISTRATIONS = [
  { id: 'REG001', plate: '51A-123.45', ownerName: 'Nguyễn Văn Minh', ownerPhone: '0901234567', vehicleType: 'car', address: '123 Lê Lợi, Q.1, TP.HCM', center: '50-05V', centerName: 'TTĐK 50-05V (Q.3)', bookingDate: '2026-03-20', bookingTime: '08:00', service: 'normal', price: 350000, status: 'pending', createdAt: '2026-03-18 10:30' },
  { id: 'REG002', plate: '51B-678.90', ownerName: 'Trần Thị Hương', ownerPhone: '0912345678', vehicleType: 'car', address: '456 Nguyễn Trãi, Q.5, TP.HCM', center: '50-06V', centerName: 'TTĐK 50-06V (Q.6)', bookingDate: '2026-03-19', bookingTime: '09:00', service: 'express', price: 500000, status: 'confirmed', createdAt: '2026-03-18 11:00' },
  { id: 'REG003', plate: '52C-111.22', ownerName: 'Lê Hoàng Nam', ownerPhone: '0923456789', vehicleType: 'car', address: '789 Pasteur, Q.1, TP.HCM', center: '50-07V', centerName: 'TTĐK 50-07V (Thủ Đức)', bookingDate: '2026-03-21', bookingTime: '10:00', service: 'normal', price: 350000, status: 'pending', createdAt: '2026-03-18 14:15' },
  { id: 'REG004', plate: '60D-333.44', ownerName: 'Phạm Thị Mai', ownerPhone: '0934567890', vehicleType: 'truck', address: '321 Quang Trung, Q.Gò Vấp', center: '50-08V', centerName: 'TTĐK 50-08V (Bình Thạnh)', bookingDate: '2026-03-19', bookingTime: '07:00', service: 'home', price: 700000, status: 'completed', createdAt: '2026-03-17 16:00' },
  { id: 'REG005', plate: '65E-555.66', ownerName: 'Võ Văn Hùng', ownerPhone: '0945678901', vehicleType: 'car', address: '555 Lý Thường Kiệt, Q.Tân Bình', center: '50-05V', centerName: 'TTĐK 50-05V (Q.3)', bookingDate: '2026-03-22', bookingTime: '13:00', service: 'express', price: 500000, status: 'pending', createdAt: '2026-03-18 09:45' },
  { id: 'REG006', plate: '43F-777.88', ownerName: 'Ngô Thị Lan', ownerPhone: '0956789012', vehicleType: 'bus', address: '100 Điện Biên Phủ, Q.Bình Thạnh', center: '50-06V', centerName: 'TTĐK 50-06V (Q.6)', bookingDate: '2026-03-20', bookingTime: '14:00', service: 'normal', price: 350000, status: 'cancelled', createdAt: '2026-03-16 11:30' },
  { id: 'REG007', plate: '51K-888.11', ownerName: 'Đào Văn Quân', ownerPhone: '0921110011', vehicleType: 'car', address: '88 Trần Hưng Đạo, Q.1', center: '50-07V', centerName: 'TTĐK 50-07V (Thủ Đức)', bookingDate: '2026-03-21', bookingTime: '08:00', service: 'express', price: 500000, status: 'confirmed', createdAt: '2026-03-18 14:00' },
  { id: 'REG008', plate: '51L-222.33', ownerName: 'Tô Mỹ Linh', ownerPhone: '0922220022', vehicleType: 'car', address: '55 Võ Văn Tần, Q.3', center: '50-05V', centerName: 'TTĐK 50-05V (Q.3)', bookingDate: '2026-03-22', bookingTime: '09:00', service: 'home', price: 700000, status: 'confirmed', createdAt: '2026-03-18 15:30' },
];

const COMMISSION_HISTORY = [
  { id: 'CH001', bookingId: 'BK001', driverId: 'DRV001', vehicleType: 'BIKE', tripPrice: 28000, rate: 20, amount: 5600, createdAt: '2026-03-18 14:52' },
  { id: 'CH002', bookingId: 'BK009', driverId: 'DRV002', vehicleType: 'CAR', tripPrice: 195000, rate: 22, amount: 42900, createdAt: '2026-03-18 10:00' },
  { id: 'CH003', bookingId: 'BK007', driverId: 'DRV004', vehicleType: 'SERVICE_ORDER', tripPrice: 500000, rate: 10, amount: 50000, createdAt: '2026-03-18 11:30' },
  { id: 'CH004', bookingId: 'BK004', driverId: 'DRV005', vehicleType: 'INTERCITY', tripPrice: 320000, rate: 15, amount: 48000, createdAt: '2026-03-18 06:00' },
];

// ---- SYSTEM MONITORING ----
const SYSTEM_SERVICES = [
  { name: 'mobility-service', status: 'healthy', uptime: '99.98%', latency: '45ms', errorRate: '0.02%' },
  { name: 'wallet-payment-service', status: 'healthy', uptime: '99.99%', latency: '32ms', errorRate: '0.01%' },
  { name: 'fulfillment-service', status: 'healthy', uptime: '99.95%', latency: '58ms', errorRate: '0.05%' },
  { name: 'transport-master-service', status: 'healthy', uptime: '99.99%', latency: '28ms', errorRate: '0.00%' },
  { name: 'users-service', status: 'healthy', uptime: '100%', latency: '22ms', errorRate: '0.00%' },
  { name: 'notification-service', status: 'warning', uptime: '99.80%', latency: '120ms', errorRate: '0.20%' },
];

// Dashboard stats
const DASHBOARD_STATS = {
  todayBookings: 48,
  todayRevenue: 12850000,
  onlineDrivers: 23,
  pendingBookings: 4,
  completedBookings: 35,
  cancelledBookings: 5,
  slaViolations: 2,
  refundsPending: 1,
  hourlyTrips: [2, 1, 0, 1, 3, 5, 8, 12, 15, 10, 8, 7, 9, 11, 14, 12, 0, 0, 0, 0, 0, 0, 0, 0]
};

// ---- KPI MONITORING (From BA Document) ----
const KPI_TARGETS = {
  digitizationRate: { label: 'Tỷ lệ booking số hóa', target: 95, current: 96.5, unit: '%', description: 'Tỷ lệ booking được tạo qua hệ thống' },
  confirmationSla: { label: 'SLA xác nhận booking', target: 120, current: 98, unit: 'giây', description: 'Thời gian trung bình xác nhận booking', isTime: true },
  driverAssignmentSla: { label: 'SLA gán tài xế', target: 600, current: 542, unit: 'giây', description: 'Thời gian trung bình gán tài xế', isTime: true },
  paymentSuccessRate: { label: 'Tỷ lệ thanh toán thành công', target: 98, current: 98.7, unit: '%', description: 'Tỷ lệ payment thành công' },
  refundTime: { label: 'Thời gian xử lý refund', target: 86400, current: 43200, unit: 'giây', description: 'Thời gian trung bình xử lý refund', isTime: true },
  portalAvailability: { label: 'Độ sẵn sàng portal', target: 99.9, current: 99.95, unit: '%', description: 'Uptime hệ thống' },
  auditCoverage: { label: 'Audit coverage', target: 100, current: 100, unit: '%', description: 'Tỷ lệ thao tác được ghi log' }
};

// ---- SLA MONITORING ----
const SLA_STATUS = {
  green: { label: 'On Track', color: '#22C55E', icon: '✓' },
  yellow: { label: 'At Risk', color: '#FFB020', icon: '!' },
  red: { label: 'Violated', color: '#EF4444', icon: '✗' }
};

const SLA_METRICS = [
  { id: 'SLA001', name: 'Booking Confirmation', target: '≤ 2 phút', current: '1m 38s', avg: '1m 22s', status: 'green', total: 156, passed: 153, failed: 3 },
  { id: 'SLA002', name: 'Driver Assignment', target: '≤ 10 phút', current: '9m 02s', avg: '8m 45s', status: 'green', total: 89, passed: 85, failed: 4 },
  { id: 'SLA003', name: 'Payment Processing', target: '≤ 30 giây', current: '12s', avg: '15s', status: 'green', total: 312, passed: 310, failed: 2 },
  { id: 'SLA004', name: 'Refund Processing', target: '≤ 24 giờ', current: '12h', avg: '8h', status: 'green', total: 12, passed: 12, failed: 0 },
  { id: 'SLA005', name: 'Notification Delivery', target: '≤ 60 giây', current: '45s', avg: '38s', status: 'yellow', total: 428, passed: 412, failed: 16 },
  { id: 'SLA006', name: 'System Availability', target: '≥ 99.9%', current: '99.95%', avg: '99.92%', status: 'green', total: 1, passed: 1, failed: 0 }
];

// ---- AGENT DATA ----
const AGENTS = [
  { id: 'AGT001', name: 'Lê Agent HCM', code: 'AGENT_HCM_001', phone: '0901000003', email: 'agent.hcm@rideops.vn', status: 'active', walletBalance: 1500000, todayBookings: 12, todayRevenue: 3200000, joinedDate: '2024-06-15' },
  { id: 'AGT002', name: 'Nguyễn Agent DN', code: 'AGENT_DN_001', phone: '0901000011', email: 'agent.dn@rideops.vn', status: 'active', walletBalance: 850000, todayBookings: 8, todayRevenue: 2100000, joinedDate: '2024-08-20' },
  { id: 'AGT003', name: 'Trần Agent HN', code: 'AGENT_HN_001', phone: '0901000022', email: 'agent.hn@rideops.vn', status: 'active', walletBalance: 2100000, todayBookings: 15, todayRevenue: 4500000, joinedDate: '2024-05-10' },
];

// ---- LOCATIONS (Cây hành chính 2 cấp: Tỉnh/TP — Huyện) ----
// - TP trực thuộc TW (HCM/HN/DN/HP/CT): type='city', parentId=null → 1 cấp, dropdown hiển thị thẳng.
// - Tỉnh: type='province', parentId=null → là parent group.
// - Huyện/TP thuộc tỉnh: type='district', parentId=<tỉnh-id> → dropdown nested dưới tỉnh.
// Route chỉ trỏ về leaf (city hoặc district), không trỏ thẳng vào province.
const LOCATIONS = [
  // ===== 5 TP trực thuộc TW (1 cấp) =====
  { id: 'HCM',  name: 'TP.HCM',            type: 'city', parentId: null },
  { id: 'HN',   name: 'Hà Nội',            type: 'city', parentId: null },
  { id: 'DN',   name: 'Đà Nẵng',           type: 'city', parentId: null },
  { id: 'HP',   name: 'Hải Phòng',         type: 'city', parentId: null },
  { id: 'CT',   name: 'Cần Thơ',           type: 'city', parentId: null },

  // ===== Lâm Đồng =====
  { id: 'LD',   name: 'Lâm Đồng',          type: 'province', parentId: null },
  { id: 'DL',   name: 'Đà Lạt',            type: 'district', parentId: 'LD' },
  { id: 'BL',   name: 'Bảo Lộc',           type: 'district', parentId: 'LD' },
  { id: 'DD',   name: 'Đức Trọng',         type: 'district', parentId: 'LD' },

  // ===== Khánh Hòa =====
  { id: 'KH',   name: 'Khánh Hòa',         type: 'province', parentId: null },
  { id: 'NT',   name: 'Nha Trang',         type: 'district', parentId: 'KH' },
  { id: 'CR',   name: 'Cam Ranh',          type: 'district', parentId: 'KH' },

  // ===== Bà Rịa - Vũng Tàu =====
  { id: 'BRVT', name: 'Bà Rịa - Vũng Tàu', type: 'province', parentId: null },
  { id: 'VT',   name: 'Vũng Tàu',          type: 'district', parentId: 'BRVT' },
  { id: 'BR',   name: 'Bà Rịa',            type: 'district', parentId: 'BRVT' },
  { id: 'LT',   name: 'Long Điền',         type: 'district', parentId: 'BRVT' },

  // ===== Bình Thuận =====
  { id: 'BT',   name: 'Bình Thuận',        type: 'province', parentId: null },
  { id: 'PT',   name: 'Phan Thiết',        type: 'district', parentId: 'BT' },
  { id: 'LG',   name: 'La Gi',             type: 'district', parentId: 'BT' },
  { id: 'MN',   name: 'Mũi Né',            type: 'district', parentId: 'BT' },

  // ===== Quảng Nam =====
  { id: 'QN',   name: 'Quảng Nam',         type: 'province', parentId: null },
  { id: 'HA',   name: 'Hội An',            type: 'district', parentId: 'QN' },
  { id: 'TK',   name: 'Tam Kỳ',            type: 'district', parentId: 'QN' },

  // ===== Đồng Nai =====
  { id: 'DON',  name: 'Đồng Nai',          type: 'province', parentId: null },
  { id: 'BH',   name: 'Biên Hòa',          type: 'district', parentId: 'DON' },
  { id: 'LK',   name: 'Long Khánh',        type: 'district', parentId: 'DON' },
];

// ---- INTERCITY ROUTES ----
// originId/destinationId trỏ về LOCATIONS (leaf: city hoặc district).
// origin/destination giữ lại làm text hiển thị (backward-compat với booking cũ).
const INTERCITY_ROUTES = [
  { id: 'INT001', originId: 'HCM', destinationId: 'DL', origin: 'TP.HCM', destination: 'Đà Lạt',    operators: ['PTR001','PTR002'], priceFrom: 280000, duration: '7h',   distance: 305,  schedules: 4  },
  { id: 'INT002', originId: 'HCM', destinationId: 'CT', origin: 'TP.HCM', destination: 'Cần Thơ',   operators: ['PTR001'],          priceFrom: 150000, duration: '3h30', distance: 170,  schedules: 7  },
  { id: 'INT003', originId: 'HCM', destinationId: 'NT', origin: 'TP.HCM', destination: 'Nha Trang', operators: ['PTR001','PTR003'], priceFrom: 250000, duration: '8h',   distance: 430,  schedules: 3  },
  { id: 'INT004', originId: 'HCM', destinationId: 'DN', origin: 'TP.HCM', destination: 'Đà Nẵng',   operators: ['PTR003'],          priceFrom: 450000, duration: '18h',  distance: 960,  schedules: 2  },
  { id: 'INT005', originId: 'HCM', destinationId: 'VT', origin: 'TP.HCM', destination: 'Vũng Tàu',  operators: ['PTR005'],          priceFrom: 120000, duration: '2h30', distance: 120,  schedules: 10 },
  { id: 'INT006', originId: 'HCM', destinationId: 'PT', origin: 'TP.HCM', destination: 'Phan Thiết',operators: ['PTR005'],          priceFrom: 180000, duration: '4h',   distance: 200,  schedules: 6  },
  { id: 'INT007', originId: 'HCM', destinationId: 'HN', origin: 'TP.HCM', destination: 'Hà Nội',    operators: ['PTR003'],          priceFrom: 850000, duration: '32h',  distance: 1700, schedules: 2  },
  { id: 'INT008', originId: 'HN',  destinationId: 'DN', origin: 'Hà Nội', destination: 'Đà Nẵng',   operators: ['PTR003'],          priceFrom: 380000, duration: '14h',  distance: 760,  schedules: 3  },
  { id: 'INT009', originId: 'HN',  destinationId: 'HP', origin: 'Hà Nội', destination: 'Hải Phòng', operators: ['PTR005'],          priceFrom: 150000, duration: '2h',   distance: 120,  schedules: 8  },
  { id: 'INT010', originId: 'DN',  destinationId: 'HA', origin: 'Đà Nẵng',destination: 'Hội An',    operators: ['PTR005'],          priceFrom: 80000,  duration: '1h',   distance: 30,   schedules: 10 },
  // Thêm tuyến để demo dropdown 2 cấp nhiều huyện trong cùng tỉnh
  { id: 'INT011', originId: 'HCM', destinationId: 'BL', origin: 'TP.HCM', destination: 'Bảo Lộc',   operators: ['PTR002'],          priceFrom: 220000, duration: '5h',   distance: 200,  schedules: 4  },
  { id: 'INT012', originId: 'HCM', destinationId: 'MN', origin: 'TP.HCM', destination: 'Mũi Né',    operators: ['PTR005'],          priceFrom: 200000, duration: '4h30', distance: 220,  schedules: 3  },
  { id: 'INT013', originId: 'HCM', destinationId: 'BH', origin: 'TP.HCM', destination: 'Biên Hòa',  operators: ['PTR001'],          priceFrom: 80000,  duration: '1h',   distance: 30,   schedules: 12 },
];

// ---- INTERCITY TRIPS ----
const INTERCITY_TRIPS = [
  // TP.HCM - Đà Lạt
  { id: 'TRP001', routeId: 'INT001', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '06:00', arrivalTime: '13:00', vehicleType: 'Ghế ngồi 45 chỗ', price: 320000, seatsTotal: 45, seatsAvailable: 12, status: 'available', date: '2026-03-19' },
  { id: 'TRP002', routeId: 'INT001', operatorId: 'PTR002', operatorName: 'Nhà xe Thành Bưởi', departureTime: '20:00', arrivalTime: '03:00', vehicleType: 'Giường nằm 36 chỗ', price: 280000, seatsTotal: 36, seatsAvailable: 8, status: 'available', date: '2026-03-19' },
  { id: 'TRP003', routeId: 'INT001', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '21:00', arrivalTime: '04:00', vehicleType: 'Giường nằm 36 chỗ', price: 300000, seatsTotal: 36, seatsAvailable: 0, status: 'full', date: '2026-03-19' },
  { id: 'TRP004', routeId: 'INT001', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '22:00', arrivalTime: '05:00', vehicleType: 'Limousine 22 chỗ', price: 450000, seatsTotal: 22, seatsAvailable: 3, status: 'available', date: '2026-03-19' },
  { id: 'TRP005', routeId: 'INT001', operatorId: 'PTR002', operatorName: 'Nhà xe Thành Bưởi', departureTime: '08:00', arrivalTime: '15:00', vehicleType: 'Ghế ngồi 45 chỗ', price: 290000, seatsTotal: 45, seatsAvailable: 22, status: 'available', date: '2026-03-20' },
  // TP.HCM - Cần Thơ
  { id: 'TRP006', routeId: 'INT002', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '07:00', arrivalTime: '10:30', vehicleType: 'Ghế ngồi 45 chỗ', price: 150000, seatsTotal: 45, seatsAvailable: 28, status: 'available', date: '2026-03-19' },
  { id: 'TRP007', routeId: 'INT002', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '14:00', arrivalTime: '17:30', vehicleType: 'Ghế ngồi 45 chỗ', price: 150000, seatsTotal: 45, seatsAvailable: 35, status: 'available', date: '2026-03-19' },
  { id: 'TRP008', routeId: 'INT002', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '05:30', arrivalTime: '09:00', vehicleType: 'Limousine 22 chỗ', price: 220000, seatsTotal: 22, seatsAvailable: 5, status: 'available', date: '2026-03-20' },
  // TP.HCM - Nha Trang
  { id: 'TRP009', routeId: 'INT003', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '19:00', arrivalTime: '03:00', vehicleType: 'Giường nằm 36 chỗ', price: 280000, seatsTotal: 36, seatsAvailable: 15, status: 'available', date: '2026-03-19' },
  { id: 'TRP010', routeId: 'INT003', operatorId: 'PTR003', operatorName: 'Nhà xe Hoàng Long', departureTime: '20:00', arrivalTime: '04:00', vehicleType: 'Limousine 22 chỗ', price: 350000, seatsTotal: 22, seatsAvailable: 2, status: 'available', date: '2026-03-19' },
  { id: 'TRP011', routeId: 'INT003', operatorId: 'PTR003', operatorName: 'Nhà xe Hoàng Long', departureTime: '21:00', arrivalTime: '05:00', vehicleType: 'Giường nằm 36 chỗ', price: 290000, seatsTotal: 36, seatsAvailable: 0, status: 'full', date: '2026-03-20' },
  // TP.HCM - Vũng Tàu
  { id: 'TRP012', routeId: 'INT005', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '08:00', arrivalTime: '10:30', vehicleType: 'Ghế ngồi 45 chỗ', price: 120000, seatsTotal: 45, seatsAvailable: 38, status: 'available', date: '2026-03-19' },
  { id: 'TRP013', routeId: 'INT005', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '10:00', arrivalTime: '12:30', vehicleType: 'Ghế ngồi 45 chỗ', price: 120000, seatsTotal: 45, seatsAvailable: 42, status: 'available', date: '2026-03-19' },
  { id: 'TRP014', routeId: 'INT005', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '14:00', arrivalTime: '16:30', vehicleType: 'Ghế ngồi 45 chỗ', price: 120000, seatsTotal: 45, seatsAvailable: 40, status: 'available', date: '2026-03-19' },
  // TP.HCM - Phan Thiết
  { id: 'TRP015', routeId: 'INT006', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '07:00', arrivalTime: '11:00', vehicleType: 'Ghế ngồi 45 chỗ', price: 180000, seatsTotal: 45, seatsAvailable: 25, status: 'available', date: '2026-03-19' },
  { id: 'TRP016', routeId: 'INT006', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '13:00', arrivalTime: '17:00', vehicleType: 'Ghế ngồi 45 chỗ', price: 180000, seatsTotal: 45, seatsAvailable: 30, status: 'available', date: '2026-03-19' },
  // TP.HCM - Đà Nẵng
  { id: 'TRP017', routeId: 'INT004', operatorId: 'PTR003', operatorName: 'Nhà xe Hoàng Long', departureTime: '16:00', arrivalTime: '10:00+1', vehicleType: 'Giường nằm 36 chỗ', price: 450000, seatsTotal: 36, seatsAvailable: 8, status: 'available', date: '2026-03-19' },
  { id: 'TRP018', routeId: 'INT004', operatorId: 'PTR003', operatorName: 'Nhà xe Hoàng Long', departureTime: '18:00', arrivalTime: '12:00+1', vehicleType: 'Limousine 22 chỗ', price: 550000, seatsTotal: 22, seatsAvailable: 4, status: 'available', date: '2026-03-20' },
  // TP.HCM - Hà Nội
  { id: 'TRP019', routeId: 'INT007', operatorId: 'PTR003', operatorName: 'Nhà xe Hoàng Long', departureTime: '15:00', arrivalTime: '23:00+1', vehicleType: 'Giường nằm 40 chỗ', price: 850000, seatsTotal: 40, seatsAvailable: 12, status: 'available', date: '2026-03-19' },
  { id: 'TRP020', routeId: 'INT007', operatorId: 'PTR003', operatorName: 'Nhà xe Hoàng Long', departureTime: '17:00', arrivalTime: '01:00+2', vehicleType: 'Giường nằm 36 chỗ', price: 780000, seatsTotal: 36, seatsAvailable: 5, status: 'available', date: '2026-03-20' },
  // HN - Đà Nẵng
  { id: 'TRP021', routeId: 'INT008', operatorId: 'PTR003', operatorName: 'Nhà xe Hoàng Long', departureTime: '20:00', arrivalTime: '10:00', vehicleType: 'Giường nằm 36 chỗ', price: 380000, seatsTotal: 36, seatsAvailable: 18, status: 'available', date: '2026-03-19' },
  { id: 'TRP022', routeId: 'INT008', operatorId: 'PTR003', operatorName: 'Nhà xe Hoàng Long', departureTime: '22:00', arrivalTime: '12:00', vehicleType: 'Limousine 22 chỗ', price: 450000, seatsTotal: 22, seatsAvailable: 7, status: 'available', date: '2026-03-19' },
  // HN - Hải Phòng
  { id: 'TRP023', routeId: 'INT009', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '07:00', arrivalTime: '09:00', vehicleType: 'Ghế ngồi 45 chỗ', price: 150000, seatsTotal: 45, seatsAvailable: 40, status: 'available', date: '2026-03-19' },
  { id: 'TRP024', routeId: 'INT009', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '14:00', arrivalTime: '16:00', vehicleType: 'Ghế ngồi 45 chỗ', price: 150000, seatsTotal: 45, seatsAvailable: 44, status: 'available', date: '2026-03-19' },
  // DN - Hội An
  { id: 'TRP025', routeId: 'INT010', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '08:00', arrivalTime: '09:00', vehicleType: 'Ghế ngồi 16 chỗ', price: 80000, seatsTotal: 16, seatsAvailable: 10, status: 'available', date: '2026-03-19' },
  { id: 'TRP026', routeId: 'INT010', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '10:00', arrivalTime: '11:00', vehicleType: 'Ghế ngồi 16 chỗ', price: 80000, seatsTotal: 16, seatsAvailable: 12, status: 'available', date: '2026-03-19' },
  { id: 'TRP027', routeId: 'INT010', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '14:00', arrivalTime: '15:00', vehicleType: 'Ghế ngồi 16 chỗ', price: 80000, seatsTotal: 16, seatsAvailable: 14, status: 'available', date: '2026-03-19' },

  // ===== TRIPS HÔM NAY (2026-05-27) — để test time-conflict =====
  // TRP100: PTR001, 08:00-15:00 → ĐANG CHẠY (IDR001 + IV001 đang phục vụ BK100)
  { id: 'TRP100', routeId: 'INT001', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '08:00', arrivalTime: '15:00', vehicleType: 'Ghế ngồi 45 chỗ', price: 320000, seatsTotal: 45, seatsAvailable: 0,  status: 'full',      date: '2026-05-27' },
  // TRP101: PTR001, 10:00-18:00 → OVERLAP với TRP100 (cùng nhà xe, cùng khung)
  { id: 'TRP101', routeId: 'INT003', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '10:00', arrivalTime: '18:00', vehicleType: 'Giường nằm 36 chỗ', price: 280000, seatsTotal: 36, seatsAvailable: 30, status: 'available', date: '2026-05-27' },
  // TRP102: PTR001, 20:00-03:00+1 → SAU TRP100 (không overlap)
  { id: 'TRP102', routeId: 'INT001', operatorId: 'PTR001', operatorName: 'Nhà xe Phương Trang', departureTime: '20:00', arrivalTime: '03:00+1', vehicleType: 'Ghế ngồi 45 chỗ', price: 290000, seatsTotal: 45, seatsAvailable: 40, status: 'available', date: '2026-05-27' },
  // TRP103: PTR005, 14:00-16:30 → khác nhà xe, dùng để demo dispatch không bị conflict
  { id: 'TRP103', routeId: 'INT005', operatorId: 'PTR005', operatorName: 'Nhà xe Việt Thanh', departureTime: '14:00', arrivalTime: '16:30', vehicleType: 'Ghế ngồi 45 chỗ', price: 120000, seatsTotal: 45, seatsAvailable: 30, status: 'available', date: '2026-05-27' },
  // TRP104: PTR001, 07:00-14:00 → OVERLAP MẠNH với TRP100
  { id: 'TRP104', routeId: 'INT011', operatorId: 'PTR002', operatorName: 'Nhà xe Thành Bưởi', departureTime: '07:00', arrivalTime: '14:00', vehicleType: 'Giường nằm 36 chỗ', price: 220000, seatsTotal: 36, seatsAvailable: 25, status: 'available', date: '2026-05-27' },
];

// ---- SEAT LAYOUTS ----
const SEAT_MAPS = {
  'SL001': { name: 'Ghế ngồi 45 chỗ', rows: 11, cols: 4, seats: generateSeats(11, 4) },
  'SL002': { name: 'Giường nằm 36 chỗ', rows: 12, cols: 3, seats: generateSeats(12, 3) },
  'SL003': { name: 'Limousine 22 chỗ', rows: 6, cols: 4, seats: generateSeats(6, 4) },
};

function generateSeats(rows, cols) {
  const seats = [];
  const rows_letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      seats.push({
        id: `${rows_letters[r]}${c}`,
        row: r + 1,
        col: c,
        status: Math.random() > 0.6 ? 'occupied' : 'available',
        price: 0
      });
    }
  }
  return seats;
}

// ---- AGENT CUSTOMERS ----
const AGENT_CUSTOMERS = [
  { id: 'AC001', name: 'Trịnh Hoàng Nam', phone: '0801234567', email: 'nam.trinh@gmail.com', totalBookings: 28, totalSpent: 8500000, lastBooking: '2026-03-18', status: 'active', points: 1250, level: 'VIP' },
  { id: 'AC002', name: 'Lý Thanh Trúc', phone: '0812345678', email: 'truc.ly@gmail.com', totalBookings: 15, totalSpent: 4200000, lastBooking: '2026-03-17', status: 'active', points: 680, level: 'Regular' },
  { id: 'AC003', name: 'Mai Xuân Phong', phone: '0823456789', email: 'phong.mai@gmail.com', totalBookings: 8, totalSpent: 1800000, lastBooking: '2026-03-15', status: 'active', points: 320, level: 'Regular' },
  { id: 'AC004', name: 'Cao Thị Linh', phone: '0834567890', email: 'linh.cao@gmail.com', totalBookings: 22, totalSpent: 7200000, lastBooking: '2026-03-18', status: 'active', points: 980, level: 'Gold' },
  { id: 'AC005', name: 'Hồ Quang Vinh', phone: '0845678901', email: 'vinh.ho@gmail.com', totalBookings: 5, totalSpent: 950000, lastBooking: '2026-03-10', status: 'inactive', points: 150, level: 'Bronze' },
];

// ---- REPORTING DATA ----
const REPORTS = {
  daily: {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    bookings: [42, 38, 55, 48, 62, 35, 28],
    revenue: [12000000, 10500000, 15800000, 13200000, 17500000, 9800000, 7500000],
    customers: [15, 12, 22, 18, 25, 10, 8]
  },
  weekly: {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
    bookings: [285, 312, 298, 348],
    revenue: [82000000, 89000000, 85600000, 98000000],
    customers: [85, 92, 88, 105]
  },
  monthly: {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    bookings: [1250, 1380, 1520, 1420, 1680, 1850, 1920, 2100, 1980, 2150, 2080, 2350],
    revenue: [350000000, 385000000, 425000000, 398000000, 468000000, 515000000, 535000000, 585000000, 552000000, 598000000, 578000000, 652000000],
    customers: [380, 420, 465, 435, 510, 565, 585, 640, 605, 685, 655, 720]
  }
};

// ---- BOOKING STATE MACHINE ----
const BOOKING_STATE_MACHINE = [
  { key: 'DRAFT', label: 'Nháp', icon: '📝', description: 'Booking được tạo' },
  { key: 'SEARCHED', label: 'Đã tìm kiếm', icon: '🔍', description: 'Khách hàng tìm kiếm chuyến' },
  { key: 'PENDING_CONFIRMATION', label: 'Chờ xác nhận', icon: '⏳', description: 'Chờ operator xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: '✅', description: 'Booking được xác nhận' },
  { key: 'IN_PROGRESS', label: 'Đang thực hiện', icon: '🛣️', description: 'Tài xế đang thực hiện' },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: '🏁', description: 'Chuyến đi hoàn tất' }
];

// ---- SITE TYPES ----
const SITE_TYPES = {
  MASTER: { id: 'master', name: 'Master Site', description: 'Quản lý & Vận hành', color: '#4F8CFF' },
  AGENT: { id: 'agent', name: 'Agent Site', description: 'Bán hàng & Booking', color: '#22C55E' }
};

// ---- PAYMENT INTENT TYPES ----
const PAYMENT_INTENT_STATUS = {
  PENDING: { label: 'Chờ thanh toán', color: '#FFB020' },
  PROCESSING: { label: 'Đang xử lý', color: '#4F8CFF' },
  SUCCEEDED: { label: 'Thành công', color: '#22C55E' },
  FAILED: { label: 'Thất bại', color: '#EF4444' },
  CANCELLED: { label: 'Đã hủy', color: '#64748B' },
  REFUNDED: { label: 'Đã hoàn tiền', color: '#7C5CFC' }
};
