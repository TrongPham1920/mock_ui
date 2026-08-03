# Thông tin tài xế Bike/Car truyền cho App User khi nhận đơn

## 1. Mục đích

Khi một tài xế Bike/Car nhận đơn thành công, App User phải nhận và hiển thị thông tin của đúng tài xế đang thực hiện đơn để khách có thể nhận diện, liên hệ và theo dõi chuyến đi.

Thông tin được lấy từ hồ sơ tại **Quản lý tài xế Bike/Car**. Loại xe hiển thị theo loại xe của đơn mà tài xế vừa nhận.

## 2. Thời điểm truyền thông tin

```text
User tạo đơn
→ Hệ thống tìm tài xế
→ Tài xế nhận đơn thành công
→ Backend xác nhận tài xế được gán cho đơn
→ Backend lấy thông tin tài xế từ Quản lý tài xế Bike/Car
→ Backend truyền thông tin tài xế cho App User
→ App User hiển thị màn hình "Đã có tài xế"
```

Chỉ truyền thông tin sau khi tài xế đã nhận đơn thành công. Không truyền thông tin của các tài xế đang được mời nhận đơn nhưng chưa xác nhận.

## 3. Thông tin truyền cho App User

| Thông tin | Tên trường đề xuất | Nguồn dữ liệu | Cách hiển thị trên App User |
| --- | --- | --- | --- |
| Rating | `rating` | Điểm trung bình từ các đánh giá hợp lệ của User | Hiển thị từ 1,0 đến 5,0 sao; ví dụ `4,8 ⭐` |
| Số lượt đánh giá | `ratingCount` | Tổng số đánh giá hợp lệ của tài xế | Hiển thị cùng rating; ví dụ `4,8 ⭐ (125 lượt)` |
| AVT tài xế | `avatarUrl` | Ảnh đại diện trong hồ sơ tài xế | Hiển thị ảnh tròn; dùng ảnh mặc định nếu chưa có ảnh |
| Tên tài xế | `driverName` | Họ tên trong hồ sơ tài xế | Hiển thị đầy đủ tên tài xế |
| Biển số xe | `licensePlate` | Biển số trong hồ sơ tài xế Bike/Car | Hiển thị đúng định dạng đã được duyệt trên CMS |
| Loại xe khách đặt | `vehicleTypeName` | Loại xe của đơn tài xế vừa nhận | Ví dụ: `Bike phổ thông`, `Bike Premium`, `Car 04 phổ thông`, `Car 06 Premium` |
| SĐT | `phoneNumber` | Số điện thoại trong hồ sơ tài xế | Hiển thị và cho phép User bấm để gọi |

`ratingCount` là dữ liệu đi kèm bắt buộc của rating để App User biết điểm số đang được tổng hợp từ bao nhiêu lượt đánh giá.

Loại xe khách đặt phải lấy theo **đơn hiện tại**, không lấy một loại bất kỳ trong danh sách các loại xe tài xế được phép chạy.

## 4. Công thức tính rating tài xế

Mỗi đánh giá hợp lệ của User có số điểm từ 1 đến 5 sao.

Gọi:

- `N`: tổng số lượt đánh giá hợp lệ của tài xế.
- `Sᵢ`: số sao của lượt đánh giá thứ `i`.
- `TotalScore`: tổng số sao của tất cả lượt đánh giá hợp lệ.
- `Rating`: điểm trung bình của tài xế.

### Công thức tổng quát

```text
TotalScore = S₁ + S₂ + ... + Sₙ

Rating = TotalScore / N
```

Ví dụ tài xế có bốn đánh giá: `5`, `4`, `5`, `3` sao:

```text
TotalScore = 5 + 4 + 5 + 3 = 17
N = 4
Rating = 17 / 4 = 4,25
Rating hiển thị = 4,3
```

### Công thức khi có một đánh giá mới

Khi User gửi thêm một đánh giá có số sao là `NewScore`:

```text
TotalScore mới = TotalScore cũ + NewScore
Số lượt mới = N cũ + 1
Rating mới = TotalScore mới / Số lượt mới
```

Hệ thống phải tính từ `TotalScore` và `ratingCount` thực tế. Không dùng rating đã làm tròn trên giao diện để tính rating tiếp theo vì sẽ làm sai lệch điểm sau nhiều lượt đánh giá.

Rating chỉ được làm tròn đến một chữ số thập phân khi truyền hoặc hiển thị cho App User.

### Trường hợp chưa có đánh giá

Nếu `ratingCount = 0`:

- `rating` trả về `null`.
- App User hiển thị **“Chưa có đánh giá”**.
- Không hiển thị `0,0 sao`, vì giá trị này có thể khiến User hiểu nhầm tài xế đã bị đánh giá 0 sao.

## 5. Điều kiện một đánh giá được tính vào rating

Một đánh giá chỉ được tính khi đáp ứng đủ các điều kiện:

1. Đơn Bike/Car đã hoàn thành.
2. Người đánh giá là User đã đặt đơn đó.
3. Điểm đánh giá là số nguyên từ 1 đến 5 sao.
4. Mỗi đơn chỉ được đánh giá tài xế một lần.
5. Đánh giá được gắn đúng với tài xế đã hoàn thành đơn.

User có thể bỏ qua đánh giá. Trường hợp bỏ qua không làm tăng `ratingCount` và không ảnh hưởng đến rating hiện tại của tài xế.

Đơn bị hủy, đánh giá trùng hoặc dữ liệu đánh giá không hợp lệ không được đưa vào công thức.

## 6. Dữ liệu mẫu truyền cho App User

```json
{
  "driverInfo": {
    "rating": 4.8,
    "ratingCount": 125,
    "avatarUrl": "https://cdn.hahago.vn/drivers/DRV001/avatar.jpg",
    "driverName": "Nguyễn Văn An",
    "licensePlate": "59F1-12345",
    "serviceTypeName": "Bike Phổ thông",
    "phoneNumber": "0901234567"
  }
}
```

Trường hợp tài xế chưa có đánh giá:

```json
{
  "driverInfo": {
    "rating": null,
    "ratingCount": 0,
    "avatarUrl": "https://cdn.hahago.vn/default/driver-avatar.png",
    "driverName": "Nguyễn Văn An",
    "licensePlate": "59F1-12345",
    "serviceTypeName": "Bike Phổ thông",
    "phoneNumber": "0901234567"
  }
}
```

## 7. Quy tắc dữ liệu và bảo mật

- Backend phải xác định tài xế từ tài xế đã được gán cho đơn; App User không tự truyền `driverId` để yêu cầu thông tin của một tài xế bất kỳ.
- Chỉ User sở hữu đơn mới được nhận thông tin tài xế của đơn đó.
- Tên, SĐT, ảnh đại diện và biển số phải lấy từ hồ sơ tài xế đã được duyệt.
- Nếu tài xế đổi thông tin sau khi nhận đơn, màn hình chuyến hiện tại phải được cập nhật theo dữ liệu đã được backend xác nhận.
- Nếu thiếu ảnh đại diện, App User dùng ảnh mặc định. Các thông tin tên tài xế, biển số và SĐT không được để trống.
- Khi tài xế bị đổi hoặc đơn được gán lại, App User phải nhận lại toàn bộ thông tin của tài xế mới.

## 8. Tiêu chí nghiệm thu

- Khi tài xế Bike/Car nhận đơn, App User hiển thị đúng rating, AVT, tên tài xế, biển số xe, loại xe dịch vụ và SĐT.
- Thông tin hiển thị thuộc đúng tài xế đã nhận đúng đơn của User.
- Rating hiển thị một chữ số thập phân và đi kèm số lượt đánh giá.
- Tài xế chưa có đánh giá được hiển thị là **“Chưa có đánh giá”**.
- Mỗi đánh giá hợp lệ chỉ được cộng một lần.
- Rating mới được tính đúng từ tổng điểm và tổng lượt đánh giá, không bị sai lệch do dùng điểm đã làm tròn.
- User có thể bấm SĐT để gọi tài xế.
- Khi đổi tài xế, App User không tiếp tục hiển thị thông tin của tài xế cũ.
