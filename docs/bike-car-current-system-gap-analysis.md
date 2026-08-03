# Đối chiếu tài liệu Bike/Car với hệ thống hiện tại

Ngày rà soát: **31/07/2026**

## 1. Kết luận sau khi triển khai Gói A

Gói A đã được triển khai trên hệ thống hiện tại. CMS và app mô phỏng đã có thể vận hành flow Bike/Car thủ công từ đặt xe đến hoàn thành và đánh giá.

- Epic 1 đã tính giá theo km, khung giờ và thời điểm; booking lưu chi tiết giá đã áp dụng.
- Epic 2 đã có Online/Offline, heartbeat 5 giây, GPS, availability và lọc theo bán kính.
- Epic 3 gần như chưa được triển khai trên UI hiện tại.
- Epic 4 đã có điều phối thủ công sau 60 giây/không có tài xế trong vùng, offer 15 giây, thống kê chuyến và đánh giá. Matching tuần tự tự động vẫn thuộc Gói B.

Ký hiệu:

- ✅ Đã có và đáp ứng phần chính.
- 🟡 Đã có một phần hoặc mới là UI/demo.
- ❌ Chưa có.

## 2. Epic 1 — Loại xe và giá

| Tính năng | Hiện trạng | Thiếu sót cần làm |
|---|---:|---|
| Dữ liệu vận tải → Tuyến & Lịch chạy → Loại xe quản lý Bike/Car/Intercity | ✅ | Đã chuyển hướng mới, không dùng menu riêng Loại dịch vụ Bike/Car |
| Bike phổ thông, Bike Premium, Car 04/06 phổ thông, Car 4/06 Premium | ✅ | Không |
| Tạo loại xe theo Loại dịch vụ Xe máy/Xe hơi và Phân loại xe Xe máy/Ô tô | ✅ | Prototype đã có form tạo; production cần chốt validation mã/số ghế |
| Hoạt động/Tạm dừng | ✅ | Không |
| Tạm dừng bị ẩn; Hoạt động không available bị disable trên app khách | ✅ | Không |
| Giá tiền lọc theo tab Xe máy/Xe hơi và bảng giá bám theo loại xe | ✅ | Không |
| Cấu hình giá theo km | ✅ | Đã chặn khoảng km bị hở hoặc chồng lấn |
| Cấu hình phụ phí khung giờ và thời điểm | ✅ | Đã cộng vào báo giá và booking |
| Lưu chi tiết giá tại lúc xác nhận | ✅ | Đã lưu từng khung km, phụ phí, giảm giá và tổng cuối |
| Chiết khấu chung theo Bike/Car và chỉ xem tại bảng giá | ✅ | Không |
| Gán tài xế theo loại xe trong hồ sơ tài xế | ✅ | Không |
| Ngày hiệu lực, bản nháp và lịch sử phiên bản giá | ❌ | Cần làm nếu giá được vận hành thật trên production |

### Đề xuất xác nhận Epic 1

Nên làm ngay:

1. Đã đưa phụ phí khung giờ và thời điểm vào giá cuối.
2. Đã lưu chi tiết giá áp dụng trong booking.
3. Đã chặn khoảng km bị hở/chồng lấn và khung giờ không hợp lệ.

Có thể làm sau: bản nháp, ngày hiệu lực và lịch sử phiên bản giá đầy đủ.

## 3. Epic 2 — Thanh toán và trạng thái tài xế

| Tính năng | Hiện trạng | Thiếu sót cần làm |
|---|---:|---|
| Tiền mặt được ghép chuyến nhưng chưa ghi đã thu | ✅ | Không |
| Không tiền mặt chỉ ghép sau khi giữ tiền thành công | ✅ | Flow hiện tại là demo ví nội bộ, cần kết nối thanh toán thật khi triển khai production |
| Ba trạng thái Online/Offline/Bận | ✅ | App Driver đã có nút bật/tắt; Bận do hệ thống quản lý |
| Bận được hệ thống quản lý | ✅ | Cần kiểm tra thêm các tình huống app mất mạng và kết thúc chuyến lỗi |
| Tài xế và xe Bike/Car trong cùng hồ sơ | ✅ | Không |
| Quyền nhận loại xe Bike/Car | ✅ | Không |
| Availability đầy đủ | ✅ | Kiểm tra trạng thái, chuyến/offer, quyền nhận loại xe, hồ sơ, GPS và bán kính |
| Heartbeat, GPS mới trong 15 giây | ✅ | App mô phỏng cập nhật mỗi 5 giây; quá 15 giây bị loại |
| Kiểm tra hồ sơ/giấy tờ còn hiệu lực khi matching | ✅ | Đã là điều kiện availability |
| Cấu hình bán kính theo loại xe | ✅ | Có UI và dữ liệu cấu hình |
| Bán kính thực sự lọc tài xế khi matching | ✅ | Đã tính khoảng cách từ vị trí mới nhất đến điểm đón |
| CMS hiển thị lý do không available | ✅ | Hiển thị Offline, Bận, offer khác, GPS cũ, hồ sơ hoặc ngoài bán kính |

### Đề xuất xác nhận Epic 2

Nên làm ngay trước khi vận hành thật:

1. Nút Online/Offline trên app Driver.
2. Heartbeat, vị trí mới nhất và tự loại tài xế mất kết nối.
3. Tính availability đầy đủ theo quyền nhận loại xe, hồ sơ, offer/chuyến hiện tại và bán kính.
4. CMS hiển thị lý do một tài xế Online nhưng không available.

## 4. Epic 3 — Vị trí thời gian thực và ETA

| Tính năng | Hiện trạng | Thiếu sót cần làm |
|---|---:|---|
| Driver gửi vị trí mỗi 5 giây | 🟡 | Đã có trong app mô phỏng; hạ tầng mobile/BE thật thuộc giai đoạn tiếp theo |
| Backend kiểm tra và lưu vị trí mới nhất | 🟡 | Prototype đã lưu và dùng cho availability; chưa phải dịch vụ backend production |
| Pub/sub hoặc socket cập nhật đúng Customer | ❌ | Chưa có |
| Customer xem tài xế trên bản đồ | ❌ | Chưa có |
| CMS xem vị trí và thời điểm cập nhật cuối | ❌ | Chưa có |
| Cảnh báo mất cập nhật sau 15 giây | ❌ | Chưa có |
| ETA bằng lat/lng | ❌ | Chưa có |
| Fallback từ mã hành chính và địa chỉ chi tiết | ❌ | Chưa có |

### Đề xuất xác nhận Epic 3

Epic này là một khối tính năng mới. Nếu giai đoạn đầu chấp nhận vận hành thủ công, có thể chia:

- Giai đoạn 1: lấy vị trí mới nhất để phục vụ availability và điều phối CMS.
- Giai đoạn 2: realtime socket, bản đồ Customer/CMS và ETA liên tục.

## 5. Epic 4 — Matching và vòng đời chuyến

| Tính năng | Hiện trạng | Thiếu sót cần làm |
|---|---:|---|
| CMS có danh sách chuyến chờ và tài xế Online | ✅ | Không |
| CMS chọn và gán tài xế thủ công | ✅ | Có ngưỡng 60 giây, khoảng cách, lý do ngoài bán kính và audit |
| Driver Accept/Decline | ✅ | Có offer 15 giây và tự trả booking về hàng chờ khi timeout |
| Tự gửi offer tuần tự | ❌ | Chưa có |
| Timeout tự chuyển tài xế tiếp theo | ❌ | Chưa có |
| Mở rộng bán kính tự động | ❌ | Chưa có |
| Chống hai tài xế cùng nhận | ❌ | Chưa có cơ chế matching đồng thời để kiểm chứng |
| Lịch sử Offer/Accept/Decline/Timeout | ❌ | Chỉ có audit cơ bản sau thao tác, chưa có phiên matching đầy đủ |
| Bắt đầu và hoàn thành chuyến | ✅ | Có trên CMS và app Driver mô phỏng |
| Quyết toán và giải phóng tài xế khi hoàn thành | ✅ | Có trong prototype |
| Tăng tổng chuyến khi hoàn thành | ✅ | Chỉ tăng một lần khi chuyển sang Hoàn thành |
| Số chuyến hoàn thành hôm nay | ✅ | Tính theo `completedAt` và múi giờ Việt Nam |
| Customer đánh giá sau chuyến | ✅ | Có form 1–5 sao và nhận xét tùy chọn |
| Điểm trung bình và số lượt đánh giá | ✅ | Đã lưu bản ghi, cập nhật trung bình và số lượt |

## 6. Đối chiếu UI theo yêu cầu mới

### Màn Tài xế Bike/Car

Đã có:

- Tổng tài xế, Online, Đang chạy và Offline.
- Loại xe, số chỗ, biển số và loại xe được phép nhận chuyến.
- Một cột Đánh giá và một cột Hoàn thành.

Đã bổ sung trong Gói A:

- Cột **Chuyến hôm nay**.
- **Số lượt đánh giá** bên cạnh điểm trung bình.
- Màn chi tiết tài xế và danh sách đánh giá theo booking.
- Số liệu được cập nhật khi tài xế hoàn thành chuyến.

### Màn Nhiệm vụ phân công → Bike & Car

Đã có:

- Danh sách chuyến chờ.
- Danh sách tài xế Online.
- Modal chọn tài xế phù hợp với loại xe khách đã đặt.
- Gán lại tài xế cho task đã được phân công.

Đã bổ sung trong Gói A:

- Thời gian chuyến đã chờ và cảnh báo vượt ngưỡng 60 giây.
- Khoảng cách và bán kính hiện tại; ETA vẫn thuộc Gói B.
- Nhóm tài xế ngoài bán kính để điều hành cân nhắc.
- Lý do tài xế không available.
- Tổng chuyến, chuyến hôm nay và số lượt đánh giá trong modal chọn tài xế.
- Nhập lý do khi chọn tài xế ngoài bán kính.
- Driver có đếm ngược 15 giây để Accept/Decline.

Chưa có: matching tự động tuần tự trước khi CMS can thiệp.

## 7. Trạng thái các gói triển khai

### Gói A — MVP vận hành thủ công: Đã hoàn thành

Đã triển khai:

1. Hoàn thiện giá theo km + khung giờ + thời điểm.
2. Làm Online/Offline, heartbeat, vị trí mới nhất và availability thật.
3. Dùng bán kính để lọc danh sách tài xế.
4. Hoàn thiện CMS điều phối thủ công khi chờ lâu/không có tài xế trong vùng.
5. Cập nhật tổng chuyến, chuyến hôm nay và đánh giá sau khi hoàn thành.

### Gói B — Đầy đủ theo bốn Epic

Bao gồm toàn bộ Gói A và thêm:

1. Matching tự động tuần tự, mỗi tài xế 15 giây.
2. Tự mở rộng bán kính và kết thúc khi không tìm được tài xế.
3. Realtime vị trí trên Customer/CMS.
4. ETA và fallback địa chỉ.
5. Lịch sử offer và kiểm soát nhận chuyến đồng thời.

### Bước tiếp theo

Gói A đã hoàn tất trên prototype. Khi triển khai tiếp Gói B, ưu tiên matching tự động trước, sau đó mới mở realtime bản đồ và ETA.

## 8. Quy tắc đã áp dụng cho Gói A

| Vấn đề | Đề xuất mặc định |
|---|---|
| Bao lâu được xem là chờ quá lâu? | 60 giây, sau đó CMS cảnh báo |
| CMS chọn tài xế có gán thẳng không? | Không; gửi offer và Driver vẫn có 15 giây Accept |
| Có được chọn tài xế ngoài bán kính tối đa? | Không; được chọn ngoài bán kính ban đầu nhưng không vượt tối đa và phải nhập lý do |
| Chuyến nào được cộng số lượng? | Chỉ chuyến chuyển sang Hoàn thành thành công |
| Ngày dùng cho “chuyến hôm nay” | Ngày của thời điểm hoàn thành theo múi giờ Việt Nam |
| Đánh giá | 1–5 sao, nhận xét tùy chọn, một lần cho mỗi booking hoàn thành |
| Khách bỏ qua đánh giá | Không ảnh hưởng trạng thái Hoàn thành |
| Admin có sửa điểm sao không? | Không; chỉ được ẩn nội dung nhận xét vi phạm nếu có quyền |
