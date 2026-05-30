# Spec cho Dev — Chỉ liệt kê phần cần sửa

Mỗi mục dưới đây là **việc dev phải làm**. Chỉ list các cột/tính năng cần thêm/sửa, không nhắc các phần dev đã làm đúng.

Ký hiệu:
- ⚠️ **THIẾU** — Cột/tính năng dev chưa có, phải bổ sung
- 🔄 **ĐỔI THỨ TỰ** — Đã có nhưng đặt sai vị trí
- 🐛 **BUG** — Có nhưng hoạt động sai

---

## 1. Tuyến đường `/transport/routes?tab=transport-routes-tab`

Thứ tự cột chuẩn (đầy đủ):
```
STT | Mã tuyến | Tên tuyến đường | Điểm đi | Điểm đến | Khoảng cách | Thời gian | Điểm dừng | Nhà xe khai thác | Trạng thái | Thao tác
```

Phải bổ sung:
- ⚠️ **Điểm dừng** — đặt sau "Thời gian". Format rút gọn: `BX Miền Đông, Dầu Giây +2` (hover hoặc click xem full list)
- ⚠️ **Nhà xe khai thác** — đặt sau "Điểm dừng". Multi badge: `Phương Trang` `Thành Bưởi`

---

## 2. Nhà xe `/transport/partners?tab=transport-partners-tab`

Thứ tự cột chuẩn:
```
STT | Mã | Tên nhà xe | Người liên hệ | Số điện thoại | Số xe | Số tài xế | Tuyến đường | Chiết khấu | Trạng thái | Thao tác
```

Phải bổ sung:
- ⚠️ **Tuyến đường** — đặt sau "Số tài xế", trước "Chiết khấu". Multi badge: `HCM-Đà Lạt` `HCM-Cần Thơ` `+1`

---

## 3. Tài xế `/transport/partners?tab=transport-drivers` — **TÁCH 3 TAB**

Hiện đang gộp 1 table. Phải tách:

### Tab 3a. "Bike/Car" (TX có xe cố định)
```
STT | Mã | Họ tên | SĐT | Loại xe | Biển số | Nhà xe | Đánh giá | Số chuyến | Trạng thái | Thao tác
```
- ⚠️ Thêm cột **Nhà xe** (nếu thuộc nhà xe, hoặc `Cá nhân`)
- 🔄 Cột **Trạng thái** đặt SÁT cột Thao tác (đang ở giữa, sai vị trí)

### Tab 3b. "Tài xế liên tỉnh" (không có xe cố định)
```
STT | Mã | Họ tên | SĐT | Nhà xe quản lý | Hạng GPLX | Đánh giá | Số chuyến | Đang gán | Trạng thái | Thao tác
```
- ⚠️ **KHÔNG có cột Biển số** (vì TX liên tỉnh dùng xe rời)
- ⚠️ Thêm cột **Nhà xe quản lý** (bắt buộc)
- ⚠️ Thêm cột **Hạng GPLX**: B2/C/D/E/F
- ⚠️ Thêm cột **Đang gán** (taskId hiện tại, vd `FT100`)

### Tab 3c. "Xe liên tỉnh" (quản lý xe độc lập, không có TX cố định)
```
STT | Mã | Biển số | Loại xe | Nhà xe quản lý | Số km | Đang gán | Trạng thái | Thao tác
```
- ⚠️ Toàn bộ tab này CHƯA CÓ. Phải tạo mới.
- Trạng thái: `Sẵn sàng` / `Đang chạy` / `Bảo dưỡng`

---

## 4. Giám sát đơn hàng `/operations/booking?tab=booking-all`

Thứ tự cột chuẩn:
```
Mã booking | Loại | Khách hàng | Trạng thái đơn | Trạng thái thanh toán | Trạng thái fulfillment | Điểm đón | Điểm trả | Giá | Ngày tạo | Thao tác
```

Phải bổ sung:
- ⚠️ **Mã booking** — đặt đầu tiên thay cho STT (vd `RO-260527-100`). Copy được.
- ⚠️ **Trạng thái fulfillment** — đặt sau "Trạng thái thanh toán". Giá trị: `PENDING/ASSIGNED/IN_PROGRESS/COMPLETED/CANCELLED`. Đây là **1 trong 3 trục lifecycle** bắt buộc.
- 🔄 **Đổi thứ tự**: hiện đang `Loại → Trạng thái đơn → Trạng thái TT → KH`. Phải đổi thành `Loại → KH → Trạng thái đơn → Trạng thái TT → Trạng thái fulfillment`.


---

## 5. Nhiệm vụ phân công `/operations/fulfillment`

Thứ tự cột chuẩn:
```
STT | Task ID | Booking ID | Loại dịch vụ | Xe | Tài xế | Trạng thái | Gán lúc | Bắt đầu | Hoàn thành | Thao tác
```

Phải bổ sung:
- ⚠️ **Task ID** — đặt sau STT (vd `FT100`)
- ⚠️ **Booking ID** — đặt sau Task ID (vd `BK100`, click → mở booking detail)
- ⚠️ **Xe** — đặt sau Loại dịch vụ. Show `IV001 - 51B-10001` cho task INTERCITY; `—` cho BIKE/CAR (TX có xe cố định đã hiện ở cột Tài xế).

Bug phải fix:
- 🐛 **Loại dịch vụ chỉ show "INSPECTION" toàn bộ rows**. Phải hiển thị đúng theo `bookings.bookingType`: `BIKE` / `CAR` / `INTERCITY` / `SERVICE_ORDER` / `MAINTENANCE_ORDER`.
- 🐛 **Cột Tài xế toàn "—"**. Phải join `task.driverId` với pool `DRIVERS ∪ INTERCITY_DRIVERS` để show tên + avatar.

Layout cần kiểm tra:
- Tab **INTERCITY** phải đổi sang **3-column** view: `Chờ phân công | Xe sẵn sàng | Tài xế sẵn sàng` (khác với 2-column của tab BIKE/CAR/SERVICE/MAINTENANCE).

Logic dispatch:
- 🐛 **Time conflict** — Khi mở modal gán TX/Xe, phải loại bỏ TX/Xe đang BUSY có thời gian trùng với chuyến đang gán. Nếu không trùng (vd chuyến mới sau khi TX kết thúc) thì show kèm hint `đang bận 27/05 08:00-15:00`.
  - Test case: Mở dispatch cho `BK101` (10:00-18:00) → `IDR001` và `IV001` KHÔNG được xuất hiện trong dropdown (vì đang chạy `BK100` 08:00-15:00 → overlap).
  - Mở dispatch cho `BK102` (20:00-03:00+1) → `IDR001` xuất hiện kèm hint "đang bận 08:00-15:00".

---

## 6. Đặt vé liên tỉnh `/operations/booking?tab=booking-intercity`

Search form phải bổ sung:
- ⚠️ **Select Số khách** (1-5 khách) — đặt cạnh "Ngày đi". Lọc chuyến có `seatsAvailable >= số khách chọn`.
- ⚠️ **Nút swap ⇄** — đặt giữa "Điểm đi" và "Điểm đến". Click đổi giá trị 2 select.

---

## 7. Đăng kiểm hộ `/operations/booking?tab=booking-registration`

Thứ tự cột chuẩn:
```
STT | Mã đơn | Biển số | Tên chủ xe | SĐT | Loại xe | Trung tâm | Ngày đặt | Dịch vụ | Giá | Trạng thái | Thao tác
```

Phải bổ sung:
- ⚠️ **Mã đơn** — đặt sau STT (vd `REG001`). Copy được.

---

## 8. Bảo dưỡng `/operations/booking?tab=booking-maintenance`

- ⚠️ Cần kiểm tra **tab Bảo dưỡng có hoạt động không** (song song với Đăng kiểm).
- Schema giống Đăng kiểm, đổi cột "Trung tâm đăng kiểm" → "Gara/Trung tâm bảo dưỡng".

---

## 9. Người dùng & Vai trò `/system/users`

- ⚠️ Cần kiểm tra **Tab "Vai trò & Quyền"** đã có chưa.
- Headers tab Roles:
  ```
  STT | Mã | Tên vai trò | Mã vai trò | Quyền hạn | Số người dùng | Trạng thái | Thao tác
  ```
- Modal tạo role: checkbox grid các quyền `booking.view/create/cancel/...`

---

## 10. Ví & Thanh toán `/finance/wallets`

Cần kiểm tra có đủ **2 bảng** không:

### Bảng 1: Danh sách Ví
```
STT | ID | Chủ ví | Loại chủ | Loại ví | Số dư | Tạm giữ | Trạng thái | Thao tác
```

### Bảng 2: Giao dịch gần đây
```
STT | ID | Ví | Hướng | Loại | Số tiền | Số dư | Trạng thái | Thời gian
```

---

## 11. Hoàn tiền `/finance/refunds`

Thứ tự cột chuẩn:
```
STT | ID | Booking | Khách hàng | Số tiền | Lý do | Phương thức | Người xử lý | Trạng thái | Tạo lúc | Thao tác
```

- ⚠️ Cần kiểm tra cột **Người xử lý** (processedBy) đã có chưa.

---

## 12. Mã ưu đãi `/finance/promos`

Thứ tự cột chuẩn:
```
STT | Mã | Loại giảm | Giá trị | Giảm tối đa | Đơn tối thiểu | Loại xe áp dụng | Đã dùng/Tổng | Thời hạn | Trạng thái | Thao tác
```

- ⚠️ Cần kiểm tra cột **Loại xe áp dụng** (vehicleTypes) — badges multi: `BIKE` `CAR` `INTERCITY`...

---

## 13. Chiết khấu `/finance/commissions`

Cần kiểm tra có đủ **2 bảng** không:

### Bảng 1: Config chiết khấu
```
ID | Loại xe | Tỉ lệ % | Mô tả | Thao tác
```

### Bảng 2: Lịch sử chiết khấu
```
STT | ID | Booking | Tài xế | Loại xe | Giá chuyến | Tỉ lệ | Chiết khấu | Thời gian
```

---

## 14. Nhật ký hoạt động `/system/audit`

Thứ tự cột chuẩn:
```
STT | Thời gian | Thao tác | Người thực hiện | Vai trò | Đối tượng | Site | Trace ID | Trước → Sau
```

- ⚠️ Cần kiểm tra cột **Trace ID** + **Before/After JSON** (click row → modal xem diff).

---

## 15. Giám sát hệ thống `/system/monitoring`

```
STT | Dịch vụ | Trạng thái | Thời gian hoạt động | Độ trễ | Tỷ lệ lỗi
```

- ⚠️ Cần kiểm tra đủ **6 service**: mobility / wallet-payment / fulfillment / transport-master / users / notification.

---

## 16. RBAC toàn site

- ⚠️ Test login với từng role, verify sidebar lọc đúng:
  - `ADMIN`: thấy tất cả
  - `OPERATOR`: ẩn Users, Audit
  - `AGENT`: chỉ thấy Dashboard, Bookings, Intercity, Partners, Wallets
  - `FINANCE`: chỉ thấy Dashboard, Bookings, Wallets, Refunds, Commissions, Audit, Monitoring
  - `VIEWER`: chỉ thấy Dashboard, Bookings, Wallets, Monitoring
- Truy cập trực tiếp URL không có quyền → redirect hoặc alert "Không có quyền".

---

## 17. Responsive

- ⚠️ Test mobile 375px:
  - Sidebar phải collapse thành hamburger menu
  - Table phải scroll horizontal (không vỡ layout)
  - Modals phải fit viewport

---

# Convention chung (áp dụng mọi trang)

1. **Mọi table**: cột STT đầu tiên + cột Thao tác cuối cùng.
2. **Mọi list page**: filter bar trên + pagination dưới + nút "+ Thêm" góc phải.
3. **Trạng thái** luôn sát cột Thao tác.
4. **Tiền** format `200,000 đ`.
5. **Ngày** format `27/05/2026 - 22:59`.
6. **Mã đơn** format `RO-YYMMDD-XXX`, copy được.
7. **Avatar tài xế** + chấm trạng thái (xanh online / xám offline / vàng busy).
