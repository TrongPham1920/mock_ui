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
  WITHDRAW: { label: '🏧 Rút tiền', class: 'text-warning', direction: 'DEBIT' },
  HOLD: { label: '🔒 Tạm giữ', class: 'text-warning', direction: 'HOLD' },
  RELEASE: { label: '🔓 Nhả tạm giữ', class: 'text-accent', direction: 'RELEASE' },
  COMMISSION: { label: '🏢 Phí hệ thống', class: 'text-danger', direction: 'DEBIT' }
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
// ---- VEHICLE_CATEGORIES — phân loại xe (chung cho mọi serviceType) ----
const VEHICLE_CATEGORIES = {
  seat:          { label: 'Ghế ngồi',     icon: '💺' },
  sleeper:       { label: 'Giường nằm',   icon: '🛏️' },
  limo_seat:     { label: 'Limousine ngồi', icon: '🚐' },
  limo_sleeper:  { label: 'Limousine nằm',  icon: '🛌' },
  other:         { label: 'Khác',         icon: '🚗' },
};

// ---- VEHICLE_MODELS (Loại xe) — thay thế Ghế cũ, đi chung với SCHEDULE ----
// Lưu ý: giữ ID SL001/SL002/SL003 để tương thích dữ liệu cũ.
const VEHICLE_MODELS = [
  { id: 'SL001', name: 'Ghế ngồi 45 chỗ',    serviceType: 'INTERCITY', category: 'seat',         seats: 45, status: 'active', luggage: '20kg/khách', description: 'Xe khách 45 chỗ tiêu chuẩn', rows: 11, cols: 4 },
  { id: 'SL002', name: 'Giường nằm 36 chỗ',  serviceType: 'INTERCITY', category: 'sleeper',      seats: 36, status: 'active', luggage: '25kg/khách', description: 'Giường nằm 2 tầng', rows: 12, cols: 3 },
  { id: 'SL003', name: 'Limousine 22 chỗ',   serviceType: 'INTERCITY', category: 'limo_seat',    seats: 22, status: 'active', luggage: '15kg/khách', description: 'Limousine cao cấp', rows: 6, cols: 4 },
  { id: 'VM004', name: 'Limousine nằm 18 chỗ', serviceType: 'INTERCITY', category: 'limo_sleeper', seats: 18, status: 'active', luggage: '20kg/khách', description: 'Limousine giường nằm cao cấp', rows: 6, cols: 3 },
  { id: 'VM005', name: 'Xe máy phổ thông',   serviceType: 'BIKE',      category: 'other',        seats: 1,  status: 'active', luggage: '', description: 'Xe máy 2 bánh chở 1 khách' },
  { id: 'VM006', name: 'Xe hơi 4 chỗ',       serviceType: 'CAR',       category: 'seat',         seats: 4,  status: 'active', luggage: '2 vali', description: 'Sedan 4 chỗ' },
  { id: 'VM007', name: 'Xe hơi 7 chỗ',       serviceType: 'CAR',       category: 'seat',         seats: 7,  status: 'active', luggage: '3 vali', description: 'SUV/MPV 7 chỗ' },
];
// Backward compat alias
const SEAT_LAYOUTS = VEHICLE_MODELS.map(v => ({ id: v.id, name: v.name, type: v.category === 'seat' ? 'seat' : (v.category === 'sleeper' ? 'sleeper' : 'vip'), totalSeats: v.seats, rows: v.rows, cols: v.cols }));

// ---- STOPS (Điểm dừng) — phụ trợ cho ROUTE ----
const STOPS = [
  { id: 'ST001', name: 'BX Miền Đông',    address: '292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh, TP.HCM', district: 'Bình Thạnh',  province: 'TP.HCM' },
  { id: 'ST002', name: 'BX Miền Tây',     address: '395 Kinh Dương Vương, P.An Lạc, Q.Bình Tân, TP.HCM', district: 'Bình Tân', province: 'TP.HCM' },
  { id: 'ST003', name: 'BX Đà Lạt',       address: '01 Tô Hiến Thành, P.3, TP.Đà Lạt, Lâm Đồng', district: 'TP.Đà Lạt', province: 'Lâm Đồng' },
  { id: 'ST004', name: 'BX Cần Thơ',      address: '36 Nguyễn Văn Linh, Q.Hưng Lợi, TP.Cần Thơ', district: 'Hưng Lợi', province: 'Cần Thơ' },
  { id: 'ST005', name: 'BX Nha Trang',    address: '58 Đường 23/10, P.Phương Sài, TP.Nha Trang, Khánh Hoà', district: 'TP.Nha Trang', province: 'Khánh Hoà' },
  { id: 'ST006', name: 'BX Vũng Tàu',     address: '192 Nam Kỳ Khởi Nghĩa, P.3, TP.Vũng Tàu, BR-VT', district: 'TP.Vũng Tàu', province: 'BR-VT' },
  { id: 'ST007', name: 'BX Đà Nẵng',      address: '201 Tôn Đức Thắng, P.Hoà Minh, Q.Liên Chiểu, TP.Đà Nẵng', district: 'Liên Chiểu', province: 'Đà Nẵng' },
  { id: 'ST008', name: 'BX Phan Thiết',   address: 'Tôn Đức Thắng, P.Phú Thuỷ, TP.Phan Thiết, Bình Thuận', district: 'TP.Phan Thiết', province: 'Bình Thuận' },
  { id: 'ST009', name: 'Trạm Dầu Giây',   address: 'QL1A, TT.Dầu Giây, H.Thống Nhất, Đồng Nai', district: 'Thống Nhất', province: 'Đồng Nai' },
  { id: 'ST010', name: 'Trạm Bảo Lộc',    address: 'QL20, P.Lộc Sơn, TP.Bảo Lộc, Lâm Đồng', district: 'TP.Bảo Lộc', province: 'Lâm Đồng' },
  { id: 'ST011', name: 'Trạm Mỹ Thuận',   address: 'QL1A, H.Cái Bè, Tiền Giang', district: 'Cái Bè', province: 'Tiền Giang' },
  { id: 'ST012', name: 'Trạm Phan Rang',  address: 'QL1A, TP.Phan Rang-Tháp Chàm, Ninh Thuận', district: 'TP.Phan Rang', province: 'Ninh Thuận' },
  { id: 'ST013', name: 'Trạm Long Thành', address: 'QL51, H.Long Thành, Đồng Nai', district: 'Long Thành', province: 'Đồng Nai' },
  { id: 'ST014', name: 'Trạm Quy Nhơn',   address: 'QL1A, TP.Quy Nhơn, Bình Định', district: 'TP.Quy Nhơn', province: 'Bình Định' },
];

// ---- ROUTES (Tuyến đường) — KHÔNG còn nhà xe; có origin/dest theo quận-tỉnh ----
const ROUTES = [
  { id: 'RT001', name: 'HCM - Đà Lạt',   distance: 305, duration: '7h',   originDistrict: 'Bình Thạnh',  originProvince: 'TP.HCM', destDistrict: 'TP.Đà Lạt',     destProvince: 'Lâm Đồng',     stopIds: ['ST001','ST009','ST010','ST003'], status: 'active' },
  { id: 'RT002', name: 'HCM - Cần Thơ',  distance: 170, duration: '3h30', originDistrict: 'Bình Tân',    originProvince: 'TP.HCM', destDistrict: 'Hưng Lợi',      destProvince: 'Cần Thơ',      stopIds: ['ST002','ST011','ST004'], status: 'active' },
  { id: 'RT003', name: 'HCM - Nha Trang',distance: 430, duration: '8h',   originDistrict: 'Bình Thạnh',  originProvince: 'TP.HCM', destDistrict: 'TP.Nha Trang',  destProvince: 'Khánh Hoà',    stopIds: ['ST001','ST012','ST005'], status: 'active' },
  { id: 'RT004', name: 'HCM - Vũng Tàu', distance: 120, duration: '2h30', originDistrict: 'Bình Thạnh',  originProvince: 'TP.HCM', destDistrict: 'TP.Vũng Tàu',   destProvince: 'BR-VT',        stopIds: ['ST001','ST013','ST006'], status: 'active' },
  { id: 'RT005', name: 'HCM - Đà Nẵng',  distance: 960, duration: '18h',  originDistrict: 'Bình Thạnh',  originProvince: 'TP.HCM', destDistrict: 'Liên Chiểu',    destProvince: 'Đà Nẵng',      stopIds: ['ST001','ST005','ST014','ST007'], status: 'active' },
  { id: 'RT006', name: 'HCM - Phan Thiết',distance: 200, duration: '4h',  originDistrict: 'Bình Thạnh',  originProvince: 'TP.HCM', destDistrict: 'TP.Phan Thiết', destProvince: 'Bình Thuận',   stopIds: ['ST001','ST008'], status: 'active' },
];

const SCHEDULES = [
  { id: 'SCH001', routeId: 'RT001', operatorId: 'PTR001', departureTime: '06:00', arrivalTime: '13:00', vehicleModelId: 'SL001', seatLayoutId: 'SL001', status: 'active', daysOfWeek: ['Mon', 'Wed', 'Fri', 'Sun'] },
  { id: 'SCH002', routeId: 'RT001', operatorId: 'PTR002', departureTime: '20:00', arrivalTime: '03:00', vehicleModelId: 'SL002', seatLayoutId: 'SL002', status: 'active', daysOfWeek: ['Tue', 'Thu', 'Sat'] },
  { id: 'SCH003', routeId: 'RT002', operatorId: 'PTR001', departureTime: '07:00', arrivalTime: '10:30', vehicleModelId: 'SL001', seatLayoutId: 'SL001', status: 'active', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { id: 'SCH004', routeId: 'RT003', operatorId: 'PTR003', departureTime: '19:00', arrivalTime: '03:00', vehicleModelId: 'SL003', seatLayoutId: 'SL003', status: 'active', daysOfWeek: ['Mon', 'Wed', 'Fri'] },
  { id: 'SCH005', routeId: 'RT004', operatorId: 'PTR005', departureTime: '08:00', arrivalTime: '10:30', vehicleModelId: 'SL001', seatLayoutId: 'SL001', status: 'active', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
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

// ---- DRIVER_APPLICATIONS (Đơn đăng ký tài xế gửi từ app, chờ CMS xét duyệt) ----
// applyType: 'bikecar' (Bike/Car) | 'intercity' (liên tỉnh — gồm cả đăng kiểm/bảo dưỡng hộ).
// status: 'pending' | 'approved' | 'rejected'. Khi duyệt → tạo record vào DRIVERS / INTERCITY_DRIVERS.
// documents: bộ giấy tờ khách upload từ app (theo đúng form đăng ký tài xế trên app).

// Sinh URL ảnh placeholder cho 1 ô giấy tờ (demo — khi tích hợp app thật thay bằng link/base64 thực).
function _docImg(label, name, color) {
  return `https://placehold.co/600x400/${color}/ffffff.png?text=${encodeURIComponent(label)}%0A${encodeURIComponent(name)}`;
}
// Sinh đầy đủ bộ giấy tờ tài xế theo form app.
function _buildDriverDocs(name) {
  const c1 = '1e3a8a', c2 = '166534', c3 = '7c2d12', c4 = '4c1d95';
  return {
    avatar: _docImg('Anh 3x4', name, '475569'),
    cccd: { front: _docImg('CCCD mat truoc', name, c1), back: _docImg('CCCD mat sau', name, c2), vnid: _docImg('Anh VNeID', name, c4) },
    license: { front: _docImg('GPLX mat truoc', name, c1), back: _docImg('GPLX mat sau', name, c2) },
    vehicleReg: { front: _docImg('Dang ky xe truoc', name, c1), back: _docImg('Dang ky xe sau', name, c2) },
    health: { front: _docImg('Giay kham SK truoc', name, c3), back: _docImg('Giay kham SK sau', name, c4) },
    criminal: { front: _docImg('Ly lich tu phap truoc', name, c3), back: _docImg('Ly lich tu phap sau', name, c4) },
    inspection: { front: _docImg('Dang kiem truoc', name, c1), back: _docImg('Dang kiem sau', name, c2) },
    insurance: { front: _docImg('BH TNDS truoc', name, c3), back: _docImg('BH TNDS sau', name, c4) },
    vehiclePhotos: {
      front: _docImg('Xe phia truoc', name, '0f766e'), rear: _docImg('Xe phia sau', name, '0f766e'),
      right: _docImg('Xe ben phai', name, '0f766e'), left: _docImg('Xe ben trai', name, '0f766e'),
      interior: _docImg('Noi that', name, '0f766e'), odometer: _docImg('Dong ho km Odo', name, '0f766e')
    },
    badge: { front: _docImg('Phu hieu truoc', name, c1), back: _docImg('Phu hieu sau', name, c2) }
  };
}

const DRIVER_APPLICATIONS = [
  {
    id: 'APP001', applyType: 'bikecar', name: 'Trần Văn Lộc', phone: '0931112223', email: 'loc.tran@gmail.com',
    address: '12 Nguyễn Trãi, P.Bến Thành, Q.1, TP.HCM',
    vehicleType: 'BIKE', plate: '59X1-456.78', licenseClass: 'A1', avatar: '👨',
    status: 'pending', submittedAt: '2026-05-30 08:15', documents: _buildDriverDocs('Tran Van Loc')
  },
  {
    id: 'APP002', applyType: 'bikecar', name: 'Nguyễn Thị Cẩm', phone: '0932223334', email: 'cam.nguyen@gmail.com',
    address: '88 Cách Mạng Tháng 8, P.6, Q.3, TP.HCM',
    vehicleType: 'CAR', plate: '51K-789.01', licenseClass: 'B2', avatar: '👩',
    status: 'pending', submittedAt: '2026-05-30 14:40', documents: _buildDriverDocs('Nguyen Thi Cam')
  },
  {
    id: 'APP003', applyType: 'intercity', name: 'Phạm Hồng Sơn', phone: '0933334445', email: 'son.pham@gmail.com',
    address: '45 Trường Chinh, P.13, Q.Tân Bình, TP.HCM',
    operatorId: 'PTR001', licenseClass: 'E', avatar: '👨',
    status: 'pending', submittedAt: '2026-05-31 07:50', documents: _buildDriverDocs('Pham Hong Son')
  },
  {
    id: 'APP004', applyType: 'intercity', name: 'Đặng Quốc Huy', phone: '0934445556', email: 'huy.dang@gmail.com',
    address: '202 Nguyễn Văn Linh, P.Tân Phong, Q.7, TP.HCM',
    operatorId: 'PTR002', licenseClass: 'D', avatar: '👨',
    status: 'pending', submittedAt: '2026-05-31 09:20', documents: _buildDriverDocs('Dang Quoc Huy')
  },
  // ===== Bổ sung nhiều đơn để kiểm tra hiển thị danh sách dài =====
  { id: 'APP005', applyType: 'bikecar', name: 'Lê Minh Quân', phone: '0935556667', email: 'quan.le@gmail.com', address: '5 Lê Lợi, Q.1, TP.HCM', vehicleType: 'BIKE', plate: '59Y2-112.33', licenseClass: 'A1', avatar: '👨', status: 'pending', submittedAt: '2026-05-31 10:05', documents: _buildDriverDocs('Le Minh Quan') },
  { id: 'APP006', applyType: 'bikecar', name: 'Trịnh Thu Hà', phone: '0936667778', email: 'ha.trinh@gmail.com', address: '20 Hai Bà Trưng, Q.1, TP.HCM', vehicleType: 'CAR', plate: '51L-223.44', licenseClass: 'B2', avatar: '👩', status: 'pending', submittedAt: '2026-05-31 10:40', documents: _buildDriverDocs('Trinh Thu Ha') },
  { id: 'APP007', applyType: 'bikecar', name: 'Phan Văn Đạt', phone: '0937778889', email: 'dat.phan@gmail.com', address: '77 Trần Hưng Đạo, Q.5, TP.HCM', vehicleType: 'BIKE', plate: '59Z3-334.55', licenseClass: 'A1', avatar: '👨', status: 'pending', submittedAt: '2026-05-31 11:15', documents: _buildDriverDocs('Phan Van Dat') },
  { id: 'APP008', applyType: 'bikecar', name: 'Võ Thị Kim Ngân', phone: '0938889990', email: 'ngan.vo@gmail.com', address: '102 Nguyễn Thị Minh Khai, Q.3, TP.HCM', vehicleType: 'CAR', plate: '51M-445.66', licenseClass: 'B2', avatar: '👩', status: 'pending', submittedAt: '2026-05-31 11:50', documents: _buildDriverDocs('Vo Thi Kim Ngan') },
  { id: 'APP009', applyType: 'bikecar', name: 'Hoàng Anh Tú', phone: '0939990001', email: 'tu.hoang@gmail.com', address: '8 Cộng Hòa, Q.Tân Bình, TP.HCM', vehicleType: 'BIKE', plate: '59A4-556.77', licenseClass: 'A1', avatar: '👨', status: 'pending', submittedAt: '2026-05-31 12:30', documents: _buildDriverDocs('Hoang Anh Tu') },
  { id: 'APP010', applyType: 'bikecar', name: 'Nguyễn Hải Đăng', phone: '0931002003', email: 'dang.nguyen@gmail.com', address: '33 Phan Xích Long, Q.Phú Nhuận, TP.HCM', vehicleType: 'CAR', plate: '51N-667.88', licenseClass: 'B2', avatar: '👨', status: 'pending', submittedAt: '2026-05-31 13:05', documents: _buildDriverDocs('Nguyen Hai Dang') },
  { id: 'APP011', applyType: 'intercity', name: 'Bùi Tấn Phát', phone: '0935111222', email: 'phat.bui@gmail.com', address: '14 Quang Trung, Q.Gò Vấp, TP.HCM', operatorId: 'PTR001', licenseClass: 'E', avatar: '👨', status: 'pending', submittedAt: '2026-05-31 09:45', documents: _buildDriverDocs('Bui Tan Phat') },
  { id: 'APP012', applyType: 'intercity', name: 'Dương Văn Thắng', phone: '0935222333', email: 'thang.duong@gmail.com', address: '56 Lý Thường Kiệt, Q.10, TP.HCM', operatorId: 'PTR003', licenseClass: 'D', avatar: '👨', status: 'pending', submittedAt: '2026-05-31 10:20', documents: _buildDriverDocs('Duong Van Thang') },
  { id: 'APP013', applyType: 'intercity', name: 'Lý Hoàng Phúc', phone: '0935333444', email: 'phuc.ly@gmail.com', address: '90 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', operatorId: 'PTR002', licenseClass: 'E', avatar: '👨', status: 'pending', submittedAt: '2026-05-31 11:00', documents: _buildDriverDocs('Ly Hoang Phuc') },
  { id: 'APP014', applyType: 'intercity', name: 'Trần Thị Bích', phone: '0935444555', email: 'bich.tran@gmail.com', address: '120 Cách Mạng Tháng 8, Q.3, TP.HCM', operatorId: 'PTR005', licenseClass: 'D', avatar: '👩', status: 'pending', submittedAt: '2026-05-31 11:40', documents: _buildDriverDocs('Tran Thi Bich') },
  { id: 'APP015', applyType: 'intercity', name: 'Ngô Quang Vinh', phone: '0935555666', email: 'vinh.ngo@gmail.com', address: '7 Nguyễn Oanh, Q.Gò Vấp, TP.HCM', operatorId: 'PTR003', licenseClass: 'E', avatar: '👨', status: 'pending', submittedAt: '2026-05-31 12:15', documents: _buildDriverDocs('Ngo Quang Vinh') },
  { id: 'APP016', applyType: 'intercity', name: 'Đỗ Minh Khoa', phone: '0935666777', email: 'khoa.do@gmail.com', address: '210 Phạm Văn Đồng, TP.Thủ Đức, TP.HCM', operatorId: 'PTR001', licenseClass: 'D', avatar: '👨', status: 'pending', submittedAt: '2026-05-31 12:50', documents: _buildDriverDocs('Do Minh Khoa') },
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

  // ===== VÉ ĐÃ ĐẶT THEO CHUYẾN (demo liên kết khi bấm vào chuyến) =====
  // TRP001 — TP.HCM → Đà Lạt (Phương Trang 06:00)
  {
    id: 'BK200', bookingCode: 'RO-240319-200', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH001', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'INT001', tripId: 'TRP001', scheduleId: null,
    seatNumbers: ['A1','A2'],
    passengerSnapshot: [{ name: 'Trịnh Hoàng Nam', phone: '0801234567' }, { name: 'Trịnh Bảo An', phone: '0801234500' }],
    fareSnapshot: 640000, distance: 305, paymentMethod: 'wallet', paymentReference: 'PAY200',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 09:10', updatedAt: '2026-03-18 09:11'
  },
  {
    id: 'BK201', bookingCode: 'RO-240319-201', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CASH', fulfillmentStatus: 'PENDING',
    customerId: 'KH003', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'INT001', tripId: 'TRP001', scheduleId: null,
    seatNumbers: ['B3'],
    passengerSnapshot: [{ name: 'Mai Xuân Phong', phone: '0823456789' }],
    fareSnapshot: 320000, distance: 305, paymentMethod: 'cash', paymentReference: 'CASH-BK201',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 10:02', updatedAt: '2026-03-18 10:02'
  },
  {
    id: 'BK202', bookingCode: 'RO-240319-202', bookingType: 'INTERCITY',
    bookingStatus: 'PENDING_CONFIRMATION', paymentStatus: 'PENDING', fulfillmentStatus: null,
    customerId: 'KH007', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'INT001', tripId: 'TRP001', scheduleId: null,
    seatNumbers: [],
    passengerSnapshot: [{ name: 'Phan Thị Nga', phone: '0867890123' }],
    fareSnapshot: 320000, distance: 305, paymentMethod: 'wallet', paymentReference: null,
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 11:20', updatedAt: '2026-03-18 11:20'
  },
  // TRP002 — TP.HCM → Đà Lạt (Thành Bưởi 20:00 giường nằm)
  {
    id: 'BK203', bookingCode: 'RO-240319-203', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH005', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'INT001', tripId: 'TRP002', scheduleId: null,
    seatNumbers: ['L5','L6'],
    passengerSnapshot: [{ name: 'Hồ Quang Vinh', phone: '0845678901' }, { name: 'Hồ Gia Bảo', phone: '0845678900' }],
    fareSnapshot: 560000, distance: 305, paymentMethod: 'momo', paymentReference: 'PAY203',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 12:00', updatedAt: '2026-03-18 12:01'
  },
  // TRP004 — TP.HCM → Đà Lạt (Limousine 22:00)
  {
    id: 'BK204', bookingCode: 'RO-240319-204', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH002', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'INT001', tripId: 'TRP004', scheduleId: null,
    seatNumbers: ['V1'],
    passengerSnapshot: [{ name: 'Lý Thanh Trúc', phone: '0812345678' }],
    fareSnapshot: 450000, distance: 305, paymentMethod: 'wallet', paymentReference: 'PAY204',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 13:15', updatedAt: '2026-03-18 13:16'
  },
  // TRP009 — TP.HCM → Nha Trang (Phương Trang 19:00 giường nằm)
  {
    id: 'BK205', bookingCode: 'RO-240319-205', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH004', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Nha Trang',
    routeId: 'INT003', tripId: 'TRP009', scheduleId: null,
    seatNumbers: ['A7','A8','A9'],
    passengerSnapshot: [{ name: 'Cao Thị Linh', phone: '0834567890' }, { name: 'Cao Văn Tú', phone: '0834567800' }, { name: 'Cao Mỹ Duyên', phone: '0834567811' }],
    fareSnapshot: 840000, distance: 430, paymentMethod: 'momo', paymentReference: 'PAY205',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 14:40', updatedAt: '2026-03-18 14:41'
  },
  {
    id: 'BK206', bookingCode: 'RO-240319-206', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CASH', fulfillmentStatus: 'PENDING',
    customerId: 'KH006', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Nha Trang',
    routeId: 'INT003', tripId: 'TRP009', scheduleId: null,
    seatNumbers: ['B2'],
    passengerSnapshot: [{ name: 'Đặng Minh Hải', phone: '0856789012' }],
    fareSnapshot: 280000, distance: 430, paymentMethod: 'cash', paymentReference: 'CASH-BK206',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 15:05', updatedAt: '2026-03-18 15:05'
  },
  // TRP015 — TP.HCM → Phan Thiết (Việt Thanh 07:00)
  {
    id: 'BK207', bookingCode: 'RO-240319-207', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH008', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Phan Thiết',
    routeId: 'INT006', tripId: 'TRP015', scheduleId: null,
    seatNumbers: ['C1','C2'],
    passengerSnapshot: [{ name: 'Vương Đình Phúc', phone: '0878901234' }, { name: 'Vương Thảo My', phone: '0878901200' }],
    fareSnapshot: 360000, distance: 200, paymentMethod: 'wallet', paymentReference: 'PAY207',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 15:30', updatedAt: '2026-03-18 15:31'
  },
  // TRP017 — TP.HCM → Đà Nẵng (Hoàng Long 16:00 giường nằm)
  {
    id: 'BK208', bookingCode: 'RO-240319-208', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH007', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Nẵng',
    routeId: 'INT004', tripId: 'TRP017', scheduleId: null,
    seatNumbers: ['A4'],
    passengerSnapshot: [{ name: 'Phan Thị Nga', phone: '0867890123' }],
    fareSnapshot: 450000, distance: 960, paymentMethod: 'momo', paymentReference: 'PAY208',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 16:10', updatedAt: '2026-03-18 16:11'
  },
  // TRP019 — TP.HCM → Hà Nội (Hoàng Long 15:00 giường nằm 40)
  {
    id: 'BK209', bookingCode: 'RO-240319-209', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH001', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Nước Ngầm, Hà Nội',
    routeId: 'INT007', tripId: 'TRP019', scheduleId: null,
    seatNumbers: ['L10','L11'],
    passengerSnapshot: [{ name: 'Trịnh Hoàng Nam', phone: '0801234567' }, { name: 'Trịnh Thu Hà', phone: '0801234599' }],
    fareSnapshot: 1700000, distance: 1700, paymentMethod: 'wallet', paymentReference: 'PAY209',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 16:45', updatedAt: '2026-03-18 16:46'
  },
  // TRP005 — TP.HCM → Đà Lạt (Thành Bưởi 08:00, ngày 20)
  {
    id: 'BK210', bookingCode: 'RO-240320-210', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH003', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Đà Lạt',
    routeId: 'INT001', tripId: 'TRP005', scheduleId: null,
    seatNumbers: ['A10','A11'],
    passengerSnapshot: [{ name: 'Mai Xuân Phong', phone: '0823456789' }, { name: 'Mai Hồng Ân', phone: '0823456700' }],
    fareSnapshot: 580000, distance: 305, paymentMethod: 'wallet', paymentReference: 'PAY210',
    fulfillmentTaskId: null,
    createdAt: '2026-03-19 08:10', updatedAt: '2026-03-19 08:11'
  },
  // TRP007 — TP.HCM → Cần Thơ (14:00)
  {
    id: 'BK211', bookingCode: 'RO-240319-211', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CASH', fulfillmentStatus: 'PENDING',
    customerId: 'KH004', agentId: null, driverId: null,
    pickup: 'BX Miền Tây, TP.HCM', dropoff: 'BX Cần Thơ',
    routeId: 'INT002', tripId: 'TRP007', scheduleId: null,
    seatNumbers: ['B7'],
    passengerSnapshot: [{ name: 'Cao Thị Linh', phone: '0834567890' }],
    fareSnapshot: 150000, distance: 170, paymentMethod: 'cash', paymentReference: 'CASH-BK211',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 09:40', updatedAt: '2026-03-18 09:40'
  },
  // TRP008 — TP.HCM → Cần Thơ (Limousine 05:30, ngày 20)
  {
    id: 'BK212', bookingCode: 'RO-240320-212', bookingType: 'INTERCITY',
    bookingStatus: 'PENDING_CONFIRMATION', paymentStatus: 'PENDING', fulfillmentStatus: null,
    customerId: 'KH007', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Tây, TP.HCM', dropoff: 'BX Cần Thơ',
    routeId: 'INT002', tripId: 'TRP008', scheduleId: null,
    seatNumbers: [],
    passengerSnapshot: [{ name: 'Phan Thị Nga', phone: '0867890123' }],
    fareSnapshot: 220000, distance: 170, paymentMethod: 'wallet', paymentReference: null,
    fulfillmentTaskId: null,
    createdAt: '2026-03-19 18:20', updatedAt: '2026-03-19 18:20'
  },
  // TRP013 — TP.HCM → Vũng Tàu (10:00)
  {
    id: 'BK213', bookingCode: 'RO-240319-213', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH005', agentId: null, driverId: null,
    pickup: 'BX Miền Đông Mới', dropoff: 'BX Vũng Tàu',
    routeId: 'INT005', tripId: 'TRP013', scheduleId: null,
    seatNumbers: ['C5','C6','C7'],
    passengerSnapshot: [{ name: 'Hồ Quang Vinh', phone: '0845678901' }, { name: 'Hồ Minh Khôi', phone: '0845678902' }, { name: 'Hồ Yến Nhi', phone: '0845678903' }],
    fareSnapshot: 360000, distance: 120, paymentMethod: 'momo', paymentReference: 'PAY213',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 11:05', updatedAt: '2026-03-18 11:06'
  },
  // TRP016 — TP.HCM → Phan Thiết (13:00)
  {
    id: 'BK214', bookingCode: 'RO-240319-214', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH008', agentId: 'USR003', driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Phan Thiết',
    routeId: 'INT006', tripId: 'TRP016', scheduleId: null,
    seatNumbers: ['A2'],
    passengerSnapshot: [{ name: 'Vương Đình Phúc', phone: '0878901234' }],
    fareSnapshot: 180000, distance: 200, paymentMethod: 'wallet', paymentReference: 'PAY214',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 12:30', updatedAt: '2026-03-18 12:31'
  },
  // TRP019 — thêm 1 khách nữa cùng chuyến Hà Nội
  {
    id: 'BK215', bookingCode: 'RO-240319-215', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CASH', fulfillmentStatus: 'PENDING',
    customerId: 'KH006', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Nước Ngầm, Hà Nội',
    routeId: 'INT007', tripId: 'TRP019', scheduleId: null,
    seatNumbers: ['L1'],
    passengerSnapshot: [{ name: 'Đặng Minh Hải', phone: '0856789012' }],
    fareSnapshot: 850000, distance: 1700, paymentMethod: 'cash', paymentReference: 'CASH-BK215',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 17:10', updatedAt: '2026-03-18 17:10'
  },
  // TRP021 — Hà Nội → Đà Nẵng (20:00)
  {
    id: 'BK216', bookingCode: 'RO-240319-216', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH002', agentId: 'USR003', driverId: null,
    pickup: 'BX Nước Ngầm, Hà Nội', dropoff: 'BX Đà Nẵng',
    routeId: 'INT008', tripId: 'TRP021', scheduleId: null,
    seatNumbers: ['B3','B4'],
    passengerSnapshot: [{ name: 'Lý Thanh Trúc', phone: '0812345678' }, { name: 'Lý Gia Hân', phone: '0812345600' }],
    fareSnapshot: 760000, distance: 760, paymentMethod: 'wallet', paymentReference: 'PAY216',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 13:50', updatedAt: '2026-03-18 13:51'
  },
  // TRP023 — Hà Nội → Hải Phòng (07:00)
  {
    id: 'BK217', bookingCode: 'RO-240319-217', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH001', agentId: null, driverId: null,
    pickup: 'BX Gia Lâm, Hà Nội', dropoff: 'BX Hải Phòng',
    routeId: 'INT009', tripId: 'TRP023', scheduleId: null,
    seatNumbers: ['A1'],
    passengerSnapshot: [{ name: 'Trịnh Hoàng Nam', phone: '0801234567' }],
    fareSnapshot: 150000, distance: 120, paymentMethod: 'momo', paymentReference: 'PAY217',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 07:20', updatedAt: '2026-03-18 07:21'
  },
  // TRP025 — Đà Nẵng → Hội An (08:00)
  {
    id: 'BK218', bookingCode: 'RO-240319-218', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CASH', fulfillmentStatus: 'PENDING',
    customerId: 'KH004', agentId: 'USR003', driverId: null,
    pickup: 'BX Đà Nẵng', dropoff: 'BX Hội An',
    routeId: 'INT010', tripId: 'TRP025', scheduleId: null,
    seatNumbers: ['A5','A6'],
    passengerSnapshot: [{ name: 'Cao Thị Linh', phone: '0834567890' }, { name: 'Cao Văn Tú', phone: '0834567800' }],
    fareSnapshot: 160000, distance: 30, paymentMethod: 'cash', paymentReference: 'CASH-BK218',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 08:05', updatedAt: '2026-03-18 08:05'
  },
  // TRP010 — TP.HCM → Nha Trang (Limousine 20:00)
  {
    id: 'BK219', bookingCode: 'RO-240319-219', bookingType: 'INTERCITY',
    bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
    customerId: 'KH008', agentId: null, driverId: null,
    pickup: 'BX Miền Đông, TP.HCM', dropoff: 'BX Nha Trang',
    routeId: 'INT003', tripId: 'TRP010', scheduleId: null,
    seatNumbers: ['V3','V4'],
    passengerSnapshot: [{ name: 'Vương Đình Phúc', phone: '0878901234' }, { name: 'Vương Thảo My', phone: '0878901200' }],
    fareSnapshot: 700000, distance: 430, paymentMethod: 'wallet', paymentReference: 'PAY219',
    fulfillmentTaskId: null,
    createdAt: '2026-03-18 14:00', updatedAt: '2026-03-18 14:01'
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
// Trường nâng cao:
//   audience: đối tượng áp dụng — 'all' | 'new_user' (thành viên mới) | 'existing' | 'vip'
//   perUserLimit: số lần tối đa 1 tài khoản được dùng (null = không giới hạn theo tài khoản)
//   firstOrderOnly: chỉ áp dụng cho đơn đầu tiên (true/false)
const PROMOS = [
  { id: 'PM001', code: 'WELCOME50', type: 'percent', value: 50, maxDiscount: 30000, minOrder: 20000, usageLimit: 1000, used: 756, perUserLimit: 1, audience: 'new_user', firstOrderOnly: true, vehicleTypes: ['BIKE', 'CAR'], startDate: '2026-03-01', endDate: '2026-03-31', status: 'active' },
  { id: 'PM002', code: 'RIDE20K', type: 'fixed', value: 20000, maxDiscount: 20000, minOrder: 50000, usageLimit: 500, used: 423, perUserLimit: 3, audience: 'all', vehicleTypes: ['CAR'], startDate: '2026-03-10', endDate: '2026-03-25', status: 'active' },
  { id: 'PM003', code: 'INTERCITY100', type: 'fixed', value: 100000, maxDiscount: 100000, minOrder: 200000, usageLimit: 200, used: 200, perUserLimit: 1, audience: 'all', vehicleTypes: ['INTERCITY'], startDate: '2026-02-15', endDate: '2026-03-15', status: 'expired' },
  { id: 'PM004', code: 'NEWUSER', type: 'percent', value: 30, maxDiscount: 50000, minOrder: 0, usageLimit: 5000, used: 3210, perUserLimit: 1, audience: 'new_user', firstOrderOnly: true, vehicleTypes: ['BIKE', 'CAR', 'INTERCITY'], startDate: '2026-01-01', endDate: '2026-06-30', status: 'active' },
  { id: 'PM005', code: 'DKFREE', type: 'fixed', value: 200000, maxDiscount: 200000, minOrder: 400000, usageLimit: 100, used: 45, perUserLimit: 2, audience: 'all', vehicleTypes: ['SERVICE_ORDER'], startDate: '2026-03-01', endDate: '2026-04-30', status: 'active' },
  { id: 'PM006', code: 'SUMMER25', type: 'percent', value: 25, maxDiscount: 40000, minOrder: 30000, usageLimit: 2000, used: 0, perUserLimit: null, audience: 'all', vehicleTypes: ['BIKE', 'CAR'], startDate: '2026-06-01', endDate: '2026-08-31', status: 'scheduled' },
  // Mã ưu đãi thành viên mới: 4 lần/tài khoản, giảm 75% tối đa 50k, cho liên tỉnh + đăng kiểm + bảo dưỡng
  { id: 'PM007', code: 'TANBINHVIEN', type: 'percent', value: 75, maxDiscount: 50000, minOrder: 0, usageLimit: 100000, used: 1280, perUserLimit: 4, audience: 'new_user', firstOrderOnly: false, vehicleTypes: ['INTERCITY', 'SERVICE_ORDER', 'MAINTENANCE_ORDER'], startDate: '2026-05-01', endDate: '2026-12-31', status: 'active' },
  // ===== Bổ sung dữ liệu phủ đủ trường hợp =====
  { id: 'PM008', code: 'BAODUONG15', type: 'percent', value: 15, maxDiscount: 150000, minOrder: 300000, usageLimit: 500, used: 88, perUserLimit: 2, audience: 'all', firstOrderOnly: false, vehicleTypes: ['MAINTENANCE_ORDER'], startDate: '2026-05-01', endDate: '2026-07-31', status: 'active' },
  { id: 'PM009', code: 'VIPRIDE', type: 'percent', value: 20, maxDiscount: 80000, minOrder: 0, usageLimit: 1000, used: 312, perUserLimit: null, audience: 'vip', firstOrderOnly: false, vehicleTypes: ['BIKE', 'CAR', 'INTERCITY'], startDate: '2026-04-01', endDate: '2026-12-31', status: 'active' },
  { id: 'PM010', code: 'COMEBACK40', type: 'percent', value: 40, maxDiscount: 60000, minOrder: 30000, usageLimit: 3000, used: 1540, perUserLimit: 1, audience: 'existing', firstOrderOnly: false, vehicleTypes: ['BIKE', 'CAR'], startDate: '2026-05-15', endDate: '2026-06-15', status: 'active' },
  { id: 'PM011', code: 'SOLDOUT10', type: 'fixed', value: 10000, maxDiscount: 10000, minOrder: 0, usageLimit: 300, used: 300, perUserLimit: 1, audience: 'all', firstOrderOnly: false, vehicleTypes: ['BIKE'], startDate: '2026-04-01', endDate: '2026-09-30', status: 'active' },
  { id: 'PM012', code: 'TET2026', type: 'percent', value: 30, maxDiscount: 100000, minOrder: 100000, usageLimit: 5000, used: 0, perUserLimit: 2, audience: 'all', firstOrderOnly: false, vehicleTypes: ['INTERCITY'], startDate: '2026-12-20', endDate: '2027-01-10', status: 'scheduled' },
  { id: 'PM013', code: 'FLASH50', type: 'percent', value: 50, maxDiscount: 25000, minOrder: 0, usageLimit: 800, used: 800, perUserLimit: 1, audience: 'all', firstOrderOnly: false, vehicleTypes: ['BIKE', 'CAR'], startDate: '2026-02-01', endDate: '2026-02-28', status: 'expired' },
  { id: 'PM014', code: 'PAUSED5', type: 'fixed', value: 5000, maxDiscount: 5000, minOrder: 0, usageLimit: 2000, used: 640, perUserLimit: null, audience: 'all', firstOrderOnly: false, vehicleTypes: ['BIKE', 'CAR'], startDate: '2026-03-01', endDate: '2026-12-31', status: 'paused' },
  { id: 'PM015', code: 'DKHOME', type: 'percent', value: 25, maxDiscount: 120000, minOrder: 0, usageLimit: 600, used: 210, perUserLimit: 3, audience: 'all', firstOrderOnly: false, vehicleTypes: ['SERVICE_ORDER', 'MAINTENANCE_ORDER'], startDate: '2026-05-01', endDate: '2026-08-31', status: 'active' },
  // Mã chỉ định thủ công: chỉ áp cho danh sách khách được chọn (CSKH tặng riêng)
  { id: 'PM016', code: 'TANGRIENG', type: 'fixed', value: 50000, maxDiscount: 50000, minOrder: 0, usageLimit: 50, used: 6, perUserLimit: 1, audience: 'manual', firstOrderOnly: false, targetCustomers: ['0901234567', '0812345678', 'KH005'], vehicleTypes: ['BIKE', 'CAR', 'INTERCITY'], startDate: '2026-05-01', endDate: '2026-09-30', status: 'active' },
];

// Nhãn đối tượng áp dụng ưu đãi
// manual = chỉ định thủ công danh sách khách được áp (theo SĐT / mã KH)
const PROMO_AUDIENCE = {
  all:       { label: 'Mọi người dùng', icon: '👥', class: 'badge-offline' },
  new_user:  { label: 'Thành viên mới', icon: '🆕', class: 'badge-active' },
  existing:  { label: 'Khách hiện hữu', icon: '🔁', class: 'badge-accepted' },
  vip:       { label: 'Khách VIP', icon: '⭐', class: 'badge-scheduled' },
  manual:    { label: 'Chỉ định thủ công', icon: '🎯', class: 'badge-pending' },
};

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

const NOTIFICATION_CONFIGS = [
  { id: 'NC001', eventType: 'fulfillment_assigned_user', serviceType: 'ALL', recipientGroup: 'CUSTOMER', channel: 'push', title: 'Đơn đã được phân công', content: 'Đơn {bookingCode} đã có tài xế {driverName}. Dịch vụ: {serviceName}.', status: 'active', updatedAt: '2026-06-10 09:00' },
  { id: 'NC002', eventType: 'fulfillment_in_progress_user', serviceType: 'ALL', recipientGroup: 'CUSTOMER', channel: 'push', title: 'Tài xế đã bắt đầu thực hiện', content: 'Đơn {bookingCode} đang được thực hiện. Bạn có thể theo dõi trạng thái trong ứng dụng.', status: 'active', updatedAt: '2026-06-10 09:05' },
  { id: 'NC003', eventType: 'fulfillment_completed_user', serviceType: 'ALL', recipientGroup: 'CUSTOMER', channel: 'push', title: 'Đơn đã hoàn thành', content: 'Đơn {bookingCode} đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ {serviceName}.', status: 'active', updatedAt: '2026-06-10 09:10' },
  { id: 'NC004', eventType: 'fulfillment_cancelled_user', serviceType: 'ALL', recipientGroup: 'CUSTOMER', channel: 'push', title: 'Đơn đã bị huỷ', content: 'Đơn {bookingCode} đã bị huỷ. Lý do: {reason}.', status: 'active', updatedAt: '2026-06-10 09:15' },
  { id: 'NC005', eventType: 'driver_new_task', serviceType: 'BIKE', recipientGroup: 'DRIVER', channel: 'push', title: 'Có chuyến Bike mới', content: 'Bạn được gán chuyến {bookingCode}: {pickup} → {dropoff}.', status: 'active', updatedAt: '2026-06-10 09:20' },
  { id: 'NC006', eventType: 'driver_new_task', serviceType: 'CAR', recipientGroup: 'DRIVER', channel: 'push', title: 'Có chuyến Car mới', content: 'Bạn được gán chuyến {bookingCode}: {pickup} → {dropoff}.', status: 'active', updatedAt: '2026-06-10 09:25' },
  { id: 'NC007', eventType: 'driver_new_task', serviceType: 'INTERCITY', recipientGroup: 'DRIVER', channel: 'push', title: 'Có chuyến liên tỉnh mới', content: 'Bạn được gán chuyến {bookingCode}. Loại xe: {vehicleType}.', status: 'active', updatedAt: '2026-06-10 09:30' },
  { id: 'NC008', eventType: 'driver_new_task', serviceType: 'SERVICE_ORDER', recipientGroup: 'DRIVER', channel: 'push', title: 'Có đơn đăng kiểm hộ mới', content: 'Bạn được gán đơn {bookingCode}. Nhận xe tại {pickup}.', status: 'active', updatedAt: '2026-06-10 09:35' },
  { id: 'NC009', eventType: 'driver_new_task', serviceType: 'MAINTENANCE_ORDER', recipientGroup: 'DRIVER', channel: 'push', title: 'Có đơn bảo dưỡng hộ mới', content: 'Bạn được gán đơn {bookingCode}. Nhận xe tại {pickup}.', status: 'active', updatedAt: '2026-06-10 09:40' },
  { id: 'NC010', eventType: 'payment_hold_user', serviceType: 'ALL', recipientGroup: 'CUSTOMER', channel: 'push', title: 'Đã tạm giữ tiền', content: 'Hệ thống đã tạm giữ {amount} cho đơn {bookingCode} đến khi dịch vụ hoàn tất.', status: 'active', updatedAt: '2026-06-10 09:45' },
  { id: 'NC011', eventType: 'payment_confirmed_user', serviceType: 'ALL', recipientGroup: 'CUSTOMER', channel: 'sms', title: 'Thanh toán thành công', content: 'Bạn đã thanh toán {amount} cho đơn {bookingCode}.', status: 'active', updatedAt: '2026-06-10 09:50' },
  { id: 'NC012', eventType: 'refund_completed_user', serviceType: 'ALL', recipientGroup: 'CUSTOMER', channel: 'sms', title: 'Hoàn tiền thành công', content: 'Hoàn tiền {amount} cho đơn {bookingCode} đã hoàn tất.', status: 'active', updatedAt: '2026-06-10 09:55' },
  { id: 'NC013', eventType: 'promo_audience', serviceType: 'ALL', recipientGroup: 'all', channel: 'push', title: 'Ưu đãi dành cho bạn', content: 'Mã {promoCode} đang áp dụng cho nhóm {promoAudience}. Dùng ngay trước {endDate}.', status: 'active', updatedAt: '2026-06-10 10:00' },
  { id: 'NC014', eventType: 'promo_audience', serviceType: 'INTERCITY', recipientGroup: 'vip', channel: 'push', title: 'Ưu đãi VIP liên tỉnh', content: 'Khách VIP nhận mã {promoCode} cho tuyến liên tỉnh. Ưu đãi áp dụng theo nhóm người dùng của mã.', status: 'active', updatedAt: '2026-06-10 10:05' }
];
const DEFAULT_NOTIFICATION_CONFIGS = NOTIFICATION_CONFIGS.map(c => ({ ...c }));

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

// ---- PRICING (Giá tiền / Phí dịch vụ) ----
// Cấu trúc:
// - km[]: khung cây số áp dụng giá/km (km0 = giá mở cửa cho 1km đầu)
// - timeSlot[]: phụ phí theo khung giờ trong ngày (HH:MM)
// - period[]: phụ phí theo thời điểm/ngày đặc biệt (lễ, cuối tuần, ngày cụ thể)
// - services[]: giá gốc dịch vụ. SERVICE_ORDER chỉ có 1 dòng giá đăng kiểm hộ.
const PRICING = {
  BIKE: {
    label: 'Xe máy', icon: '🏍️', mode: 'km',
    km: [
      { id: 'KM-B0', fromKm: 0, toKm: 1, pricePerKm: 12000, note: 'Giá mở cửa (1km đầu)' },
      { id: 'KM-B1', fromKm: 1, toKm: 10, pricePerKm: 4500, note: 'Từ km 1 → km 10' },
      { id: 'KM-B2', fromKm: 10, toKm: null, pricePerKm: 4000, note: 'Trên 10 km' },
    ],
    timeSlot: [
      { id: 'TS-B1', from: '06:00', to: '09:00', surcharge: 5000, note: 'Cao điểm sáng' },
      { id: 'TS-B2', from: '17:00', to: '19:30', surcharge: 5000, note: 'Cao điểm chiều' },
      { id: 'TS-B3', from: '22:00', to: '05:00', surcharge: 10000, note: 'Đêm khuya' },
    ],
    period: [
      { id: 'PR-B1', name: 'Cuối tuần', type: 'weekend', surcharge: 3000 },
      { id: 'PR-B2', name: 'Tết Nguyên Đán', type: 'date_range', from: '2026-02-15', to: '2026-02-22', surcharge: 20000 },
    ],
  },
  CAR: {
    label: 'Xe hơi', icon: '🚗', mode: 'km',
    km: [
      { id: 'KM-C0', fromKm: 0, toKm: 1, pricePerKm: 25000, note: 'Giá mở cửa (1km đầu)' },
      { id: 'KM-C1', fromKm: 1, toKm: 20, pricePerKm: 14000, note: 'Từ km 1 → km 20' },
      { id: 'KM-C2', fromKm: 20, toKm: null, pricePerKm: 12000, note: 'Trên 20 km' },
    ],
    timeSlot: [
      { id: 'TS-C1', from: '06:30', to: '09:00', surcharge: 10000, note: 'Cao điểm sáng' },
      { id: 'TS-C2', from: '17:00', to: '20:00', surcharge: 10000, note: 'Cao điểm chiều' },
      { id: 'TS-C3', from: '23:00', to: '05:00', surcharge: 20000, note: 'Đêm khuya' },
    ],
    period: [
      { id: 'PR-C1', name: 'Cuối tuần', type: 'weekend', surcharge: 5000 },
      { id: 'PR-C2', name: 'Lễ 30/4 - 1/5', type: 'date_range', from: '2026-04-30', to: '2026-05-01', surcharge: 30000 },
    ],
  },
  INTERCITY: {
    label: 'Xe khách liên tỉnh', icon: '🚌', mode: 'ticket',
    timeSlot: [
      { id: 'TS-I1', from: '05:00', to: '07:00', surcharge: 20000, note: 'Chuyến sớm' },
      { id: 'TS-I2', from: '22:00', to: '04:00', surcharge: 30000, note: 'Chuyến đêm' },
    ],
    period: [
      { id: 'PR-I1', name: 'Cuối tuần', type: 'weekend', surcharge: 20000 },
      { id: 'PR-I2', name: 'Tết Nguyên Đán', type: 'date_range', from: '2026-02-15', to: '2026-02-22', surcharge: 100000 },
      { id: 'PR-I3', name: 'Lễ 2/9', type: 'date_range', from: '2026-09-01', to: '2026-09-03', surcharge: 50000 },
    ],
  },
  SERVICE_ORDER: {
    label: 'Đăng kiểm hộ', icon: '📋', mode: 'service',
    services: [
      { id: 'SV-R1', code: 'registration', name: 'Đăng kiểm hộ', price: 350000 },
    ],
    timeSlot: [
      { id: 'TS-R1', from: '07:00', to: '09:00', surcharge: 30000, note: 'Khung sớm' },
      { id: 'TS-R2', from: '17:00', to: '19:00', surcharge: 50000, note: 'Ngoài giờ' },
    ],
    period: [
      { id: 'PR-R1', name: 'Cuối tuần', type: 'weekend', surcharge: 50000 },
      { id: 'PR-R2', name: 'Lễ Tết', type: 'date_range', from: '2026-02-15', to: '2026-02-22', surcharge: 100000 },
    ],
  },
  MAINTENANCE_ORDER: {
    label: 'Bảo dưỡng hộ', icon: '🔧', mode: 'service',
    services: [
      { id: 'SV-M1', code: 'basic', name: 'Bảo dưỡng cơ bản', price: 400000 },
      { id: 'SV-M2', code: 'full', name: 'Bảo dưỡng toàn diện', price: 1200000 },
      { id: 'SV-M3', code: 'oil_change', name: 'Thay nhớt', price: 250000 },
      { id: 'SV-M4', code: 'tire', name: 'Thay lốp', price: 800000 },
    ],
    timeSlot: [
      { id: 'TS-M1', from: '07:00', to: '09:00', surcharge: 30000, note: 'Khung sớm' },
      { id: 'TS-M2', from: '18:00', to: '21:00', surcharge: 80000, note: 'Ngoài giờ' },
    ],
    period: [
      { id: 'PR-M1', name: 'Cuối tuần', type: 'weekend', surcharge: 60000 },
      { id: 'PR-M2', name: 'Lễ Tết', type: 'date_range', from: '2026-02-15', to: '2026-02-22', surcharge: 120000 },
    ],
  },
};

// ---- MAINTENANCE (Bảo dưỡng hộ) — pickupAddress = địa chỉ cá nhân của khách, kèm engineType ----
const MAINTENANCE = [
  { id: 'MNT001', plate: '51A-456.78', ownerName: 'Phạm Trung Hiếu', ownerPhone: '0911223344', vehicleType: 'car', engineType: 'gasoline', pickupAddress: '12 Hai Bà Trưng, P.Bến Nghé, Q.1, TP.HCM', bookingDate: '2026-03-22', bookingTime: '09:00', service: 'basic', price: 400000, status: 'pending', createdAt: '2026-03-18 12:00', docImages: { front: 'https://placehold.co/640x400/166534/ffffff.png?text=MNT001+Mat+truoc', back: 'https://placehold.co/640x400/14532d/ffffff.png?text=MNT001+Mat+sau' } },
  { id: 'MNT002', plate: '51B-987.65', ownerName: 'Đinh Khánh Linh', ownerPhone: '0922334455', vehicleType: 'car', engineType: 'hybrid', pickupAddress: '88 Cách Mạng Tháng 8, P.6, Q.3, TP.HCM', bookingDate: '2026-03-20', bookingTime: '10:00', service: 'full', price: 1200000, status: 'confirmed', createdAt: '2026-03-18 13:30', docImages: { front: 'https://placehold.co/640x400/166534/ffffff.png?text=MNT002+Mat+truoc', back: 'https://placehold.co/640x400/14532d/ffffff.png?text=MNT002+Mat+sau' } },
  { id: 'MNT003', plate: '52C-321.45', ownerName: 'Trương Văn Đức', ownerPhone: '0933445566', vehicleType: 'truck', engineType: 'diesel', pickupAddress: '45 Trường Chinh, P.13, Q.Tân Bình, TP.HCM', bookingDate: '2026-03-23', bookingTime: '07:00', service: 'oil_change', price: 250000, status: 'pending', createdAt: '2026-03-18 15:00' },
  { id: 'MNT004', plate: '60D-789.12', ownerName: 'Lý Thị Hồng', ownerPhone: '0944556677', vehicleType: 'car', engineType: 'electric', pickupAddress: '202 Nguyễn Văn Linh, P.Tân Phong, Q.7, TP.HCM', bookingDate: '2026-03-19', bookingTime: '14:00', service: 'tire', price: 800000, status: 'completed', createdAt: '2026-03-17 11:00' },
  { id: 'MNT005', plate: '65E-234.56', ownerName: 'Nguyễn Quốc Khánh', ownerPhone: '0955667788', vehicleType: 'car', engineType: 'gasoline', pickupAddress: '99 Phan Đăng Lưu, P.7, Q.Phú Nhuận, TP.HCM', bookingDate: '2026-03-24', bookingTime: '13:00', service: 'basic', price: 400000, status: 'pending', createdAt: '2026-03-18 10:15' },
  { id: 'MNT006', plate: '43F-555.99', ownerName: 'Vũ Thanh Hà', ownerPhone: '0966778899', vehicleType: 'bus', engineType: 'diesel', pickupAddress: '150 Lý Tự Trọng, P.Bến Thành, Q.1, TP.HCM', bookingDate: '2026-03-21', bookingTime: '15:00', service: 'full', price: 1500000, status: 'cancelled', createdAt: '2026-03-16 09:30' },
  { id: 'MNT007', plate: '51M-456.78', ownerName: 'Bùi Quốc Việt', ownerPhone: '0933110011', vehicleType: 'car', engineType: 'hybrid', pickupAddress: '12 Bà Triệu, P.7, Q.Tân Bình, TP.HCM', bookingDate: '2026-03-22', bookingTime: '11:00', service: 'basic', price: 400000, status: 'confirmed', createdAt: '2026-03-18 14:20' },
  { id: 'MNT008', plate: '51N-789.12', ownerName: 'Nguyễn Thị Quỳnh', ownerPhone: '0944220022', vehicleType: 'car', engineType: 'electric', pickupAddress: '76 Lê Lai, P.Bến Thành, Q.1, TP.HCM', bookingDate: '2026-03-23', bookingTime: '15:00', service: 'tire', price: 800000, status: 'confirmed', createdAt: '2026-03-18 16:00' },
  // ===== HÔM NAY 2026-05-27 — TEST TIME-CONFLICT cho dịch vụ =====
  { id: 'MNT100', plate: '51X-100.10', ownerName: 'Khách Hiện Tại', ownerPhone: '0900100100', vehicleType: 'car', engineType: 'gasoline', pickupAddress: '5 Nguyễn Huệ, P.Bến Nghé, Q.1, TP.HCM', bookingDate: '2026-05-27', bookingTime: '09:00', service: 'full', price: 1200000, status: 'confirmed', createdAt: '2026-05-26 20:00', bookingId: 'BK-MNT-LIVE' },
  { id: 'MNT101', plate: '51X-100.20', ownerName: 'Khách Chờ Sớm', ownerPhone: '0900200200', vehicleType: 'car', engineType: 'hybrid', pickupAddress: '20 Nguyễn Thị Minh Khai, P.Đa Kao, Q.1, TP.HCM', bookingDate: '2026-05-27', bookingTime: '10:00', service: 'basic', price: 400000, status: 'confirmed', createdAt: '2026-05-27 07:00' },
  { id: 'MNT102', plate: '51X-100.30', ownerName: 'Khách Chờ Chiều', ownerPhone: '0900300300', vehicleType: 'car', engineType: 'electric', pickupAddress: '30 Trần Hưng Đạo, P.Cô Giang, Q.1, TP.HCM', bookingDate: '2026-05-27', bookingTime: '16:00', service: 'oil_change', price: 250000, status: 'confirmed', createdAt: '2026-05-27 07:30' },
];

// ---- REGISTRATIONS (Đăng kiểm hộ) — pickupAddress = địa chỉ cá nhân của khách, kèm engineType ----
const REGISTRATIONS = [
  { id: 'REG001', plate: '51A-123.45', ownerName: 'Nguyễn Văn Minh', ownerPhone: '0901234567', vehicleType: 'car', engineType: 'gasoline', pickupAddress: '123 Lê Lợi, P.Bến Thành, Q.1, TP.HCM', bookingDate: '2026-03-20', bookingTime: '08:00', service: 'registration', price: 350000, status: 'pending', createdAt: '2026-03-18 10:30', docImages: { front: 'https://placehold.co/640x400/1e3a8a/ffffff.png?text=REG001+Mat+truoc', back: 'https://placehold.co/640x400/172554/ffffff.png?text=REG001+Mat+sau' } },
  { id: 'REG002', plate: '51B-678.90', ownerName: 'Trần Thị Hương', ownerPhone: '0912345678', vehicleType: 'car', engineType: 'hybrid', pickupAddress: '456 Nguyễn Trãi, P.8, Q.5, TP.HCM', bookingDate: '2026-03-19', bookingTime: '09:00', service: 'registration', price: 350000, status: 'confirmed', createdAt: '2026-03-18 11:00', docImages: { front: 'https://placehold.co/640x400/1e3a8a/ffffff.png?text=REG002+Mat+truoc', back: 'https://placehold.co/640x400/172554/ffffff.png?text=REG002+Mat+sau' } },
  { id: 'REG003', plate: '52C-111.22', ownerName: 'Lê Hoàng Nam', ownerPhone: '0923456789', vehicleType: 'car', engineType: 'electric', pickupAddress: '789 Pasteur, P.Võ Thị Sáu, Q.3, TP.HCM', bookingDate: '2026-03-21', bookingTime: '10:00', service: 'registration', price: 350000, status: 'pending', createdAt: '2026-03-18 14:15' },
  { id: 'REG004', plate: '60D-333.44', ownerName: 'Phạm Thị Mai', ownerPhone: '0934567890', vehicleType: 'truck', engineType: 'diesel', pickupAddress: '321 Quang Trung, P.10, Q.Gò Vấp, TP.HCM', bookingDate: '2026-03-19', bookingTime: '07:00', service: 'registration', price: 350000, status: 'completed', createdAt: '2026-03-17 16:00' },
  { id: 'REG005', plate: '65E-555.66', ownerName: 'Võ Văn Hùng', ownerPhone: '0945678901', vehicleType: 'car', engineType: 'gasoline', pickupAddress: '555 Lý Thường Kiệt, P.7, Q.Tân Bình, TP.HCM', bookingDate: '2026-03-22', bookingTime: '13:00', service: 'registration', price: 350000, status: 'pending', createdAt: '2026-03-18 09:45' },
  { id: 'REG006', plate: '43F-777.88', ownerName: 'Ngô Thị Lan', ownerPhone: '0956789012', vehicleType: 'bus', engineType: 'diesel', pickupAddress: '100 Điện Biên Phủ, P.15, Q.Bình Thạnh, TP.HCM', bookingDate: '2026-03-20', bookingTime: '14:00', service: 'registration', price: 350000, status: 'cancelled', createdAt: '2026-03-16 11:30' },
  { id: 'REG007', plate: '51K-888.11', ownerName: 'Đào Văn Quân', ownerPhone: '0921110011', vehicleType: 'car', engineType: 'hybrid', pickupAddress: '88 Trần Hưng Đạo, P.Cô Giang, Q.1, TP.HCM', bookingDate: '2026-03-21', bookingTime: '08:00', service: 'registration', price: 350000, status: 'confirmed', createdAt: '2026-03-18 14:00' },
  { id: 'REG008', plate: '51L-222.33', ownerName: 'Tô Mỹ Linh', ownerPhone: '0922220022', vehicleType: 'car', engineType: 'electric', pickupAddress: '55 Võ Văn Tần, P.Võ Thị Sáu, Q.3, TP.HCM', bookingDate: '2026-03-22', bookingTime: '09:00', service: 'registration', price: 350000, status: 'confirmed', createdAt: '2026-03-18 15:30' },
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

// ============================================================
// AUTO-LINK & SEED — đảm bảo dữ liệu mock liên kết với nhau
// 1) Tạo pool khách lẻ → gán cho vé liên tỉnh seed (customerId thật)
// 2) Seed vé cho mỗi chuyến để khớp số đã bán (popup "Vé đã đặt 33/45")
// 3) Nối 2 chiều REGISTRATIONS/MAINTENANCE ↔ BOOKINGS ↔ CUSTOMERS
// ============================================================
(function seedAndLink() {
  const FIRST = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý','Đinh','Tô','Trương','Cao'];
  const MID = ['Văn','Thị','Hữu','Đức','Minh','Quốc','Gia','Hoài','Thanh','Bảo','Tuấn','Khánh','Ngọc','Phương','Anh'];
  const LAST = ['An','Bình','Chi','Dũng','Giang','Hà','Hải','Hùng','Khoa','Lan','Linh','Mai','Nam','Nga','Phúc','Quân','Sơn','Trang','Tú','Vy'];
  let seed = 7919;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const pay = () => ['wallet', 'cash', 'momo'][Math.floor(rnd() * 3)];

  // ID generator tránh trùng
  let custSeq = CUSTOMERS.reduce((m, c) => Math.max(m, parseInt(String(c.id).replace(/\D/g, '')) || 0), 0);
  const newCustId = () => 'KH' + String(++custSeq).padStart(3, '0');
  function findOrCreateCustomer(name, phoneNo) {
    let c = CUSTOMERS.find(x => x.phone === phoneNo);
    if (!c) {
      c = { id: newCustId(), name, phone: phoneNo, email: '', totalBookings: 0, status: 'active' };
      CUSTOMERS.push(c);
    }
    return c;
  }

  // (1) Pool 36 khách lẻ cho vé liên tỉnh seed
  const pool = [];
  for (let i = 0; i < 36; i++) {
    const name = `${pick(FIRST)} ${pick(MID)} ${pick(LAST)}`;
    const phoneNo = '09' + String(10000000 + Math.floor(rnd() * 89999999));
    const c = { id: newCustId(), name, phone: phoneNo, email: '', totalBookings: 0, status: 'active' };
    CUSTOMERS.push(c);
    pool.push(c);
  }
  let poolIdx = 0;

  // (2) Seed vé liên tỉnh — mỗi vé gắn customerId từ pool
  let n = 500;
  INTERCITY_TRIPS.forEach(trip => {
    const sold = trip.seatsTotal - trip.seatsAvailable;
    if (sold <= 0) return;
    const route = INTERCITY_ROUTES.find(r => r.id === trip.routeId);
    let already = BOOKINGS
      .filter(b => b.bookingType === 'INTERCITY' && b.tripId === trip.id)
      .reduce((s, b) => s + (b.passengerSnapshot?.length || 1), 0);
    let remaining = sold - already;
    while (remaining > 0) {
      const pax = Math.min(remaining, 1 + Math.floor(rnd() * 2));
      const cust = pool[poolIdx++ % pool.length];
      cust.totalBookings = (cust.totalBookings || 0) + 1;
      const passengers = [{ name: cust.name, phone: cust.phone }];
      for (let k = 1; k < pax; k++) passengers.push({ name: `${pick(FIRST)} ${pick(MID)} ${pick(LAST)}`, phone: cust.phone });
      const method = pay();
      BOOKINGS.push({
        id: 'BK' + n,
        bookingCode: 'RO-SEED-' + n,
        bookingType: 'INTERCITY',
        seed: true,
        bookingStatus: 'COMPLETED',
        paymentStatus: method === 'cash' ? 'CASH' : 'CONFIRMED',
        fulfillmentStatus: 'COMPLETED',
        customerId: cust.id, agentId: 'USR003', driverId: null,
        pickup: route ? 'BX ' + route.origin : '', dropoff: route ? 'BX ' + route.destination : '',
        routeId: trip.routeId, tripId: trip.id, scheduleId: null,
        seatNumbers: [],
        passengerSnapshot: passengers,
        fareSnapshot: trip.price * pax,
        distance: route?.distance || 0,
        paymentMethod: method, paymentReference: method === 'cash' ? 'CASH-BK' + n : 'PAY' + n,
        fulfillmentTaskId: null,
        createdAt: trip.date + ' 08:00', updatedAt: trip.date + ' 08:00'
      });
      n++;
      remaining -= pax;
    }
  });

  // (3a) Nối các SERVICE_ORDER/MAINTENANCE_ORDER booking đang thiếu order-id
  //      với REG/MNT tĩnh chưa có booking (ghép 2 chiều)
  const regFree = REGISTRATIONS.filter(r => !r.bookingId);
  const mntFree = MAINTENANCE.filter(m => !m.bookingId);
  BOOKINGS.filter(b => b.bookingType === 'SERVICE_ORDER' && !b.serviceOrderId).forEach(b => {
    const r = regFree.shift();
    if (!r) return;
    b.serviceOrderId = r.id;
    r.bookingId = b.id;
    r.customerId = b.customerId;
  });
  BOOKINGS.filter(b => b.bookingType === 'MAINTENANCE_ORDER' && !b.maintenanceOrderId).forEach(b => {
    const m = mntFree.shift();
    if (!m) return;
    b.maintenanceOrderId = m.id;
    m.bookingId = b.id;
    m.customerId = b.customerId;
  });

  // (3b) REG/MNT tĩnh còn lại → tạo booking liên kết + khách
  let bkSeq = 900;
  const REG_PRICE = PRICING.SERVICE_ORDER.services[0]?.price || 350000;
  const MNT_PRICE = { basic: 400000, full: 1200000, oil_change: 250000, tire: 800000 };
  REGISTRATIONS.filter(r => !r.bookingId).forEach(r => {
    const cust = findOrCreateCustomer(r.ownerName, r.ownerPhone);
    cust.totalBookings = (cust.totalBookings || 0) + 1;
    const paid = r.status === 'completed' || r.status === 'confirmed';
    const b = {
      id: 'BK' + bkSeq++, bookingCode: 'RO-SVC-' + r.id, bookingType: 'SERVICE_ORDER',
      bookingStatus: r.status === 'completed' ? 'COMPLETED' : (r.status === 'cancelled' ? 'CANCELLED' : (r.status === 'confirmed' ? 'CONFIRMED' : 'PENDING_CONFIRMATION')),
      paymentStatus: paid ? 'CASH' : 'PENDING',
      fulfillmentStatus: r.status === 'completed' ? 'COMPLETED' : (paid ? 'PENDING' : null),
      customerId: cust.id, agentId: 'USR003', driverId: null,
      pickup: r.pickupAddress, dropoff: r.pickupAddress,
      fareSnapshot: r.price || REG_PRICE, distance: 0,
      paymentMethod: 'cash', paymentReference: paid ? 'CASH-' + r.id : null,
      fulfillmentTaskId: null, serviceOrderId: r.id,
      createdAt: r.createdAt || nowTs(), updatedAt: r.createdAt || nowTs()
    };
    BOOKINGS.push(b);
    r.bookingId = b.id;
    r.customerId = cust.id;
  });
  MAINTENANCE.filter(m => !m.bookingId).forEach(m => {
    const cust = findOrCreateCustomer(m.ownerName, m.ownerPhone);
    cust.totalBookings = (cust.totalBookings || 0) + 1;
    const paid = m.status === 'completed' || m.status === 'confirmed';
    const b = {
      id: 'BK' + bkSeq++, bookingCode: 'RO-MNT-' + m.id, bookingType: 'MAINTENANCE_ORDER',
      bookingStatus: m.status === 'completed' ? 'COMPLETED' : (m.status === 'cancelled' ? 'CANCELLED' : (m.status === 'confirmed' ? 'CONFIRMED' : 'PENDING_CONFIRMATION')),
      paymentStatus: paid ? 'CASH' : 'PENDING',
      fulfillmentStatus: m.status === 'completed' ? 'COMPLETED' : (paid ? 'PENDING' : null),
      customerId: cust.id, agentId: 'USR003', driverId: null,
      pickup: m.pickupAddress, dropoff: m.pickupAddress,
      fareSnapshot: m.price || MNT_PRICE[m.service] || 0, distance: 0,
      paymentMethod: 'cash', paymentReference: paid ? 'CASH-' + m.id : null,
      fulfillmentTaskId: null, maintenanceOrderId: m.id,
      createdAt: m.createdAt || nowTs(), updatedAt: m.createdAt || nowTs()
    };
    BOOKINGS.push(b);
    m.bookingId = b.id;
    m.customerId = cust.id;
  });

  // (3c) Backfill customerId cho REG/MNT đã có bookingId sẵn nhưng thiếu customer
  [...REGISTRATIONS, ...MAINTENANCE].forEach(o => {
    if (o.bookingId && !o.customerId) {
      const b = BOOKINGS.find(x => x.id === o.bookingId);
      if (b && b.customerId) o.customerId = b.customerId;
    }
  });

  // (3d) Ảnh hồ sơ (mặt trước/mặt sau) khách upload từ app — dùng chung cho
  // đăng kiểm hộ & bảo dưỡng hộ. Demo: gán ảnh placeholder cho đơn chưa huỷ.
  REGISTRATIONS.forEach(r => {
    if (r.status === 'cancelled' || r.docImages) return;
    const label = encodeURIComponent(r.plate);
    r.docImages = {
      front: `https://placehold.co/640x400/1e3a8a/ffffff.png?text=Giay+DK+-+Mat+truoc%0A${label}`,
      back: `https://placehold.co/640x400/166534/ffffff.png?text=Giay+DK+-+Mat+sau%0A${label}`
    };
  });
  MAINTENANCE.forEach(m => {
    if (m.status === 'cancelled' || m.docImages) return;
    const label = encodeURIComponent(m.plate);
    m.docImages = {
      front: `https://placehold.co/640x400/7c2d12/ffffff.png?text=Ho+so+BD+-+Mat+truoc%0A${label}`,
      back: `https://placehold.co/640x400/4c1d95/ffffff.png?text=Ho+so+BD+-+Mat+sau%0A${label}`
    };
  });

  function nowTs() {
    const d = new Date();
    const p = x => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
})();

// ============================================================
// LIÊN KẾT LỊCH CHẠY → CHUYẾN → ĐƠN VÉ
// Mỗi chuyến (INTERCITY_TRIP) thuộc về 1 lịch chạy (SCHEDULE) theo
// (tuyến + nhà xe + giờ chạy). Chuyến chưa có lịch → sinh lịch mới.
// Đơn vé (BOOKING) kế thừa scheduleId từ chuyến của nó.
// Quan hệ: 1 lịch chạy ─ n chuyến ─ n đơn vé.
// ============================================================
(function linkScheduleTrips() {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const destOf = name => String(name).split(' - ').pop().trim(); // "HCM - Đà Lạt" → "Đà Lạt"
  const intByDest = {};
  INTERCITY_ROUTES.forEach(r => { intByDest[r.destination] = r.id; });
  const modelByName = {};
  VEHICLE_MODELS.forEach(v => { modelByName[v.name] = v.id; });

  // Signature của lịch đã có (quy về INTERCITY route id)
  const sig = {};
  SCHEDULES.forEach(sc => {
    const rt = ROUTES.find(r => r.id === sc.routeId);
    const intId = rt ? intByDest[destOf(rt.name)] : (INTERCITY_ROUTES.find(r => r.id === sc.routeId) ? sc.routeId : null);
    if (intId) sig[`${intId}|${sc.operatorId}|${sc.departureTime}`] = sc.id;
  });

  let schSeq = SCHEDULES.reduce((m, s) => Math.max(m, parseInt(String(s.id).replace(/\D/g, '')) || 0), 0);

  INTERCITY_TRIPS.forEach(t => {
    if (t.scheduleId) return;
    const key = `${t.routeId}|${t.operatorId}|${t.departureTime}`;
    let scId = sig[key];
    const day = DAYS[new Date(t.date + 'T00:00:00').getDay()];
    if (!scId) {
      scId = 'SCH' + String(++schSeq).padStart(3, '0');
      SCHEDULES.push({
        id: scId,
        routeId: t.routeId,                 // tham chiếu INTERCITY_ROUTES
        operatorId: t.operatorId,
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        vehicleModelId: modelByName[t.vehicleType] || null,
        seatLayoutId: modelByName[t.vehicleType] || null,
        status: 'active',
        daysOfWeek: [day],
        intercity: true
      });
      sig[key] = scId;
    } else {
      const sc = SCHEDULES.find(s => s.id === scId);
      if (sc && sc.daysOfWeek && !sc.daysOfWeek.includes(day)) sc.daysOfWeek.push(day);
    }
    t.scheduleId = scId;
  });

  // Đơn vé kế thừa scheduleId từ chuyến
  const tripById = {};
  INTERCITY_TRIPS.forEach(t => { tripById[t.id] = t; });
  BOOKINGS.forEach(b => {
    if (b.bookingType !== 'INTERCITY') return;
    // Đơn cũ thiếu tripId → gán 1 chuyến cùng lịch (hoặc cùng tuyến) để không mồ côi
    if (!b.tripId) {
      let cand = b.scheduleId ? INTERCITY_TRIPS.find(t => t.scheduleId === b.scheduleId) : null;
      if (!cand && b.routeId) {
        const rt = ROUTES.find(r => r.id === b.routeId);
        const intId = rt ? intByDest[destOf(rt.name)] : b.routeId; // RT → INT
        cand = INTERCITY_TRIPS.find(t => t.routeId === intId) || INTERCITY_TRIPS.find(t => t.routeId === b.routeId);
      }
      if (cand) b.tripId = cand.id;
    }
    const t = tripById[b.tripId];
    if (t && t.scheduleId) b.scheduleId = t.scheduleId;
  });
})();

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

// ============================================================
// SEED DEMO — tài xế / xe có NHIỀU lịch bận (3-5 lịch) để test UI ghi chú
//   PTR003 (Hoàng Long): IDR005 + IV006 → 4 lịch (2026-06-02)
//   PTR005 (Việt Thanh): IDR007 + IV008 → 5 lịch (2026-06-02)
//   Kèm 2 đơn CHỜ PHÂN CÔNG (2026-06-05, không trùng giờ) để mở popup thấy danh sách lịch bận.
// ============================================================
(function seedBusySchedules() {
  // [tripId, routeId, operatorId, opName, dep, arr, vehicleType, price, dropoff]
  const groups = [
    {
      op: 'PTR003', opName: 'Nhà xe Hoàng Long', route: 'INT003', drv: 'IDR005', veh: 'IV006',
      n: 'PT3', dropoff: 'BX Nha Trang', vt: 'Giường nằm 36 chỗ', price: 290000,
      slots: [['05:00','07:00'], ['09:00','11:00'], ['13:00','15:00'], ['17:00','19:00']]
    },
    {
      op: 'PTR005', opName: 'Nhà xe Việt Thanh', route: 'INT005', drv: 'IDR007', veh: 'IV008',
      n: 'PT5', dropoff: 'BX Vũng Tàu', vt: 'Ghế ngồi 45 chỗ', price: 120000,
      slots: [['04:00','06:00'], ['08:00','09:30'], ['11:00','12:30'], ['14:00','15:30'], ['17:00','18:30']]
    }
  ];
  const cust = (CUSTOMERS[0] && CUSTOMERS[0].id) || 'KH001';

  groups.forEach(g => {
    g.slots.forEach((s, i) => {
      const idx = i + 1;
      const tripId = `TRP-${g.n}-${idx}`;
      const bkId = `BK-${g.n}-${idx}`;
      const ftId = `FT-${g.n}-${idx}`;
      INTERCITY_TRIPS.push({
        id: tripId, routeId: g.route, operatorId: g.op, operatorName: g.opName,
        departureTime: s[0], arrivalTime: s[1], vehicleType: g.vt, price: g.price,
        seatsTotal: 36, seatsAvailable: 20, status: 'available', date: '2026-06-02'
      });
      BOOKINGS.push({
        id: bkId, bookingCode: `RO-260602-${g.n}${idx}`, bookingType: 'INTERCITY',
        bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'ASSIGNED',
        customerId: cust, agentId: null, driverId: g.drv,
        pickup: 'BX Miền Đông, TP.HCM', dropoff: g.dropoff,
        routeId: g.route, tripId, scheduleId: null, seatNumbers: ['A' + idx],
        passengerSnapshot: [{ name: 'Khách demo', phone: '0900000000' }],
        fareSnapshot: g.price, distance: 200, paymentMethod: 'momo', paymentReference: 'PAY-' + bkId,
        fulfillmentTaskId: ftId,
        createdAt: '2026-06-01 10:00', updatedAt: '2026-06-01 10:05'
      });
      FULFILLMENT_TASKS.push({
        id: ftId, bookingId: bkId, driverId: g.drv, vehicleId: g.veh,
        status: 'ASSIGNED', assignedAt: '2026-06-01 10:05', startedAt: null, completedAt: null
      });
    });

    // Đơn CHỜ PHÂN CÔNG cùng nhà xe, khác ngày → IDR/IV trên hiện trong popup kèm N lịch bận
    const pendTrip = `TRP-${g.n}-PEND`;
    const pendBk = `BK-${g.n}-PEND`;
    INTERCITY_TRIPS.push({
      id: pendTrip, routeId: g.route, operatorId: g.op, operatorName: g.opName,
      departureTime: '08:00', arrivalTime: '10:00', vehicleType: g.vt, price: g.price,
      seatsTotal: 36, seatsAvailable: 30, status: 'available', date: '2026-06-05'
    });
    BOOKINGS.push({
      id: pendBk, bookingCode: `RO-260605-${g.n}`, bookingType: 'INTERCITY',
      bookingStatus: 'CONFIRMED', paymentStatus: 'CONFIRMED', fulfillmentStatus: 'PENDING',
      customerId: cust, agentId: null, driverId: null,
      pickup: 'BX Miền Đông, TP.HCM', dropoff: g.dropoff,
      routeId: g.route, tripId: pendTrip, scheduleId: null, seatNumbers: ['D1'],
      passengerSnapshot: [{ name: 'Khách demo', phone: '0900000001' }],
      fareSnapshot: g.price, distance: 200, paymentMethod: 'momo', paymentReference: 'PAY-' + pendBk,
      fulfillmentTaskId: null,
      createdAt: '2026-06-04 09:00', updatedAt: '2026-06-04 09:00'
    });
  });
})();

// ============================================
// LOCAL STORE — persist toàn bộ data vào localStorage
// Cho phép thêm/xoá/sửa ở mọi module và giữ liên kết liền mạch sau khi F5.
// Các const ở trên là SEED; Store sẽ hydrate/đè in-place khi có dữ liệu đã lưu.
// ============================================
const STORE_KEY = 'hahago_store_v3';

// Registry các collection có thể bị thay đổi (CRUD / giao dịch).
// Array → hydrate in-place (length=0 + push). Object → xoá key + Object.assign.
const STORE_COLLECTIONS = {
  PORTAL_USERS, ROLES, VEHICLE_MODELS, STOPS, ROUTES, SCHEDULES,
  DRIVERS, INTERCITY_DRIVERS, DRIVER_APPLICATIONS, CUSTOMERS,
  BOOKINGS, FULFILLMENT_TASKS, INTERCITY_VEHICLES, PARTNERS,
  PROMOS, WALLETS, WALLET_TRANSACTIONS, REFUNDS, NOTIFICATIONS,
  NOTIFICATION_CONFIGS, AUDIT_LOGS, COMMISSIONS, COMMISSION_HISTORY, MAINTENANCE, REGISTRATIONS,
  INTERCITY_ROUTES, INTERCITY_TRIPS, AGENT_CUSTOMERS, PRICING
};

let _storeReady = false;        // true sau khi hydrate xong → cho phép autosave
let _saveTimer = null;

function hydrateStore() {
  let raw = null;
  try { raw = localStorage.getItem(STORE_KEY); } catch (e) { raw = null; }
  if (!raw) { _storeReady = true; return false; }
  try {
    const saved = JSON.parse(raw);
    Object.keys(STORE_COLLECTIONS).forEach(k => {
      const target = STORE_COLLECTIONS[k];
      const src = saved[k];
      if (src == null) return;
      if (Array.isArray(target)) {
        target.length = 0;
        src.forEach(item => target.push(item));
      } else if (typeof target === 'object') {
        Object.keys(target).forEach(key => { delete target[key]; });
        Object.assign(target, src);
      }
    });
    _storeReady = true;
    return true;
  } catch (e) {
    console.warn('hydrateStore lỗi, dùng seed:', e);
    _storeReady = true;
    return false;
  }
}

function saveStore() {
  if (!_storeReady) return;            // tránh đè seed trước khi hydrate
  const snap = {};
  Object.keys(STORE_COLLECTIONS).forEach(k => { snap[k] = STORE_COLLECTIONS[k]; });
  try { localStorage.setItem(STORE_KEY, JSON.stringify(snap)); }
  catch (e) { console.warn('saveStore lỗi:', e); }
}

// Lưu trễ (debounce) để gọi thoải mái sau mỗi mutation mà không nghẽn UI.
function scheduleSave() {
  if (!_storeReady) return;
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveStore, 150);
}

function resetStore() {
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  location.reload();
}
