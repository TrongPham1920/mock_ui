# Status Components Reference

Tài liệu tổng hợp toàn bộ component **trạng thái (status badge)** đang dùng trong `ride-ops-dashboard`, kèm:
- `text` (label tiếng Việt)
- `icon` (emoji)
- `color` (chữ — text color, dùng trong badge/chip)
- `bgColor` (nền — 12% alpha của color, dùng trong badge/chip)
- `key` (enum key dùng trong code/DB)

> Tất cả màu nền badge = `rgba(color, 0.12)`. Có thể chỉnh alpha 0.1–0.18 tuỳ design.

---

## 1) Design tokens (palette gốc)

| Token | Hex | Background (12%) | Ý nghĩa |
|---|---|---|---|
| success | `#22C55E` | `rgba(34, 197, 94, 0.12)` | Thành công / hoàn tất / hoạt động |
| warning | `#FFB020` | `rgba(255, 176, 32, 0.12)` | Chờ / cảnh báo / bận |
| danger  | `#EF4444` | `rgba(239, 68, 68, 0.12)` | Thất bại / huỷ / khoá |
| info    | `#14B8A6` | `rgba(20, 184, 166, 0.12)` | Đang xử lý / đang chạy |
| accent  | `#4F8CFF` | `rgba(79, 140, 255, 0.12)` | Xác nhận / đã gán |
| purple  | `#7C5CFC` | `rgba(124, 92, 252, 0.12)` | Đặc biệt / đã lên lịch / reschedule |
| muted   | `#64748B` | `rgba(100, 116, 139, 0.15)` | Trung tính / hết hạn / offline |
| slate   | `#94A3B8` | `rgba(148, 163, 184, 0.12)` | Đã tìm kiếm / hết hạn nhẹ |

---

## 2) BOOKING_STATUSES — Trạng thái đơn đặt

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `DRAFT` | Nháp | 📝 | `#64748B` | `rgba(100,116,139,.12)` |
| `SEARCHED` | Đã tìm kiếm | 🔍 | `#94A3B8` | `rgba(148,163,184,.12)` |
| `PENDING_CONFIRMATION` | Chờ xác nhận | ⏳ | `#FFB020` | `rgba(255,176,32,.12)` |
| `CONFIRMED` | Đã xác nhận | ✅ | `#4F8CFF` | `rgba(79,140,255,.12)` |
| `IN_PROGRESS` | Đang thực hiện | 🛣️ | `#14B8A6` | `rgba(20,184,166,.12)` |
| `RESCHEDULE_REQUESTED` | Yêu cầu đổi lịch | 🔄 | `#7C5CFC` | `rgba(124,92,252,.12)` |
| `COMPLETED` | Hoàn thành | 🏁 | `#22C55E` | `rgba(34,197,94,.12)` |
| `CANCELLED` | Đã hủy | ❌ | `#EF4444` | `rgba(239,68,68,.12)` |

---

## 3) PAYMENT_STATUSES — Trạng thái thanh toán

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `PENDING` | Chờ thanh toán | ⏳ | `#FFB020` | `rgba(255,176,32,.12)` |
| `CONFIRMED` | Đã thanh toán | ✅ | `#22C55E` | `rgba(34,197,94,.12)` |
| `CASH` | Tiền mặt | 💵 | `#7C5CFC` | `rgba(124,92,252,.12)` |
| `FAILED` | Thất bại | ❌ | `#EF4444` | `rgba(239,68,68,.12)` |
| `CANCELLED` | Đã hủy | 🚫 | `#64748B` | `rgba(100,116,139,.12)` |
| `EXPIRED` | Hết hạn | ⏰ | `#94A3B8` | `rgba(148,163,184,.12)` |

---

## 4) PAYMENT_INTENT_STATUS — Cổng thanh toán

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `PENDING` | Chờ thanh toán | ⏳ | `#FFB020` | `rgba(255,176,32,.12)` |
| `PROCESSING` | Đang xử lý | ⚙️ | `#4F8CFF` | `rgba(79,140,255,.12)` |
| `SUCCEEDED` | Thành công | ✅ | `#22C55E` | `rgba(34,197,94,.12)` |
| `FAILED` | Thất bại | ❌ | `#EF4444` | `rgba(239,68,68,.12)` |
| `CANCELLED` | Đã hủy | 🚫 | `#64748B` | `rgba(100,116,139,.12)` |
| `REFUNDED` | Đã hoàn tiền | ↩️ | `#7C5CFC` | `rgba(124,92,252,.12)` |

---

## 5) FULFILLMENT_STATUSES — Phân công tài xế

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `PENDING` | Chờ gán | ⏳ | `#FFB020` | `rgba(255,176,32,.12)` |
| `ASSIGNED` | Đã gán TX | 👤 | `#4F8CFF` | `rgba(79,140,255,.12)` |
| `IN_PROGRESS` | Đang chạy | 🚗 | `#14B8A6` | `rgba(20,184,166,.12)` |
| `COMPLETED` | Hoàn thành | ✅ | `#22C55E` | `rgba(34,197,94,.12)` |
| `CANCELLED` | Đã hủy | ❌ | `#EF4444` | `rgba(239,68,68,.12)` |

---

## 6) REFUND_STATUSES — Hoàn tiền

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `PENDING` | Chờ xử lý | ⏳ | `#FFB020` | `rgba(255,176,32,.12)` |
| `PROCESSING` | Đang xử lý | ⚙️ | `#4F8CFF` | `rgba(79,140,255,.12)` |
| `SUCCESS` | Thành công | ✅ | `#22C55E` | `rgba(34,197,94,.12)` |
| `FAILED` | Thất bại | ❌ | `#EF4444` | `rgba(239,68,68,.12)` |

---

## 7) WALLET_STATUS — Trạng thái ví

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `ACTIVE` | Hoạt động | 💰 | `#22C55E` | `rgba(34,197,94,.12)` |
| `LOCKED` | Đã khóa | 🔒 | `#EF4444` | `rgba(239,68,68,.12)` |
| `CLOSED` | Đã đóng | ⛔ | `#64748B` | `rgba(100,116,139,.15)` |

---

## 8) VEHICLE_STATUS — Trạng thái xe / tài xế

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `idle` | Sẵn sàng | 🟢 | `#22C55E` | `rgba(34,197,94,.12)` |
| `busy` | Đang chạy | 🟡 | `#FFB020` | `rgba(255,176,32,.12)` |
| `maintenance` | Bảo dưỡng | 🔧 | `#FFB020` | `rgba(255,176,32,.12)` |
| `offline` | Offline | ⚫ | `#64748B` | `rgba(100,116,139,.15)` |

---

## 9) SLA_STATUS — Giám sát SLA

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `green` | On Track | ✓ | `#22C55E` | `rgba(34,197,94,.12)` |
| `yellow` | At Risk | ! | `#FFB020` | `rgba(255,176,32,.12)` |
| `red` | Violated | ✗ | `#EF4444` | `rgba(239,68,68,.12)` |

---

## 10) NOTIFICATION_STATUS — Giao thông báo

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `delivered` | Delivered | ✅ | `#22C55E` | `rgba(34,197,94,.12)` |
| `pending` | Pending | ⏳ | `#FFB020` | `rgba(255,176,32,.12)` |
| `failed` | Failed | ❌ | `#EF4444` | `rgba(239,68,68,.12)` |

---

## 11) Registration / Maintenance order status (đăng kiểm & bảo dưỡng hộ)

| key | text | icon | color | bgColor |
|---|---|---|---|---|
| `pending` | Chờ xử lý | ⏳ | `#FFB020` | `rgba(255,176,32,.12)` |
| `confirmed` | Đã xác nhận | ✅ | `#4F8CFF` | `rgba(79,140,255,.12)` |
| `in_progress` | Đang xử lý | ⚙️ | `#14B8A6` | `rgba(20,184,166,.12)` |
| `completed` | Hoàn tất | 🏁 | `#22C55E` | `rgba(34,197,94,.12)` |
| `cancelled` | Đã hủy | ❌ | `#EF4444` | `rgba(239,68,68,.12)` |

---

## 12) JSON export (paste vào project)

```json
{
  "tokens": {
    "success": { "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "warning": { "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "danger":  { "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" },
    "info":    { "color": "#14B8A6", "bg": "rgba(20,184,166,0.12)" },
    "accent":  { "color": "#4F8CFF", "bg": "rgba(79,140,255,0.12)" },
    "purple":  { "color": "#7C5CFC", "bg": "rgba(124,92,252,0.12)" },
    "muted":   { "color": "#64748B", "bg": "rgba(100,116,139,0.15)" },
    "slate":   { "color": "#94A3B8", "bg": "rgba(148,163,184,0.12)" }
  },
  "BOOKING_STATUSES": {
    "DRAFT":                { "text": "Nháp",               "icon": "📝", "color": "#64748B", "bg": "rgba(100,116,139,0.12)" },
    "SEARCHED":             { "text": "Đã tìm kiếm",        "icon": "🔍", "color": "#94A3B8", "bg": "rgba(148,163,184,0.12)" },
    "PENDING_CONFIRMATION": { "text": "Chờ xác nhận",       "icon": "⏳", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "CONFIRMED":            { "text": "Đã xác nhận",        "icon": "✅", "color": "#4F8CFF", "bg": "rgba(79,140,255,0.12)" },
    "IN_PROGRESS":          { "text": "Đang thực hiện",     "icon": "🛣️", "color": "#14B8A6", "bg": "rgba(20,184,166,0.12)" },
    "RESCHEDULE_REQUESTED": { "text": "Yêu cầu đổi lịch",   "icon": "🔄", "color": "#7C5CFC", "bg": "rgba(124,92,252,0.12)" },
    "COMPLETED":            { "text": "Hoàn thành",         "icon": "🏁", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "CANCELLED":            { "text": "Đã hủy",             "icon": "❌", "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" }
  },
  "PAYMENT_STATUSES": {
    "PENDING":   { "text": "Chờ thanh toán", "icon": "⏳", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "CONFIRMED": { "text": "Đã thanh toán",  "icon": "✅", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "CASH":      { "text": "Tiền mặt",       "icon": "💵", "color": "#7C5CFC", "bg": "rgba(124,92,252,0.12)" },
    "FAILED":    { "text": "Thất bại",       "icon": "❌", "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" },
    "CANCELLED": { "text": "Đã hủy",         "icon": "🚫", "color": "#64748B", "bg": "rgba(100,116,139,0.12)" },
    "EXPIRED":   { "text": "Hết hạn",        "icon": "⏰", "color": "#94A3B8", "bg": "rgba(148,163,184,0.12)" }
  },
  "PAYMENT_INTENT_STATUS": {
    "PENDING":    { "text": "Chờ thanh toán", "icon": "⏳", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "PROCESSING": { "text": "Đang xử lý",     "icon": "⚙️", "color": "#4F8CFF", "bg": "rgba(79,140,255,0.12)" },
    "SUCCEEDED":  { "text": "Thành công",     "icon": "✅", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "FAILED":     { "text": "Thất bại",       "icon": "❌", "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" },
    "CANCELLED":  { "text": "Đã hủy",         "icon": "🚫", "color": "#64748B", "bg": "rgba(100,116,139,0.12)" },
    "REFUNDED":   { "text": "Đã hoàn tiền",   "icon": "↩️", "color": "#7C5CFC", "bg": "rgba(124,92,252,0.12)" }
  },
  "FULFILLMENT_STATUSES": {
    "PENDING":     { "text": "Chờ gán",     "icon": "⏳", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "ASSIGNED":    { "text": "Đã gán TX",   "icon": "👤", "color": "#4F8CFF", "bg": "rgba(79,140,255,0.12)" },
    "IN_PROGRESS": { "text": "Đang chạy",   "icon": "🚗", "color": "#14B8A6", "bg": "rgba(20,184,166,0.12)" },
    "COMPLETED":   { "text": "Hoàn thành",  "icon": "✅", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "CANCELLED":   { "text": "Đã hủy",      "icon": "❌", "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" }
  },
  "REFUND_STATUSES": {
    "PENDING":    { "text": "Chờ xử lý",  "icon": "⏳", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "PROCESSING": { "text": "Đang xử lý", "icon": "⚙️", "color": "#4F8CFF", "bg": "rgba(79,140,255,0.12)" },
    "SUCCESS":    { "text": "Thành công", "icon": "✅", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "FAILED":     { "text": "Thất bại",   "icon": "❌", "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" }
  },
  "WALLET_STATUS": {
    "ACTIVE": { "text": "Hoạt động", "icon": "💰", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "LOCKED": { "text": "Đã khóa",   "icon": "🔒", "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" },
    "CLOSED": { "text": "Đã đóng",   "icon": "⛔", "color": "#64748B", "bg": "rgba(100,116,139,0.15)" }
  },
  "VEHICLE_STATUS": {
    "idle":        { "text": "Sẵn sàng",  "icon": "🟢", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "busy":        { "text": "Đang chạy", "icon": "🟡", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "maintenance": { "text": "Bảo dưỡng", "icon": "🔧", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "offline":     { "text": "Offline",   "icon": "⚫", "color": "#64748B", "bg": "rgba(100,116,139,0.15)" }
  },
  "SLA_STATUS": {
    "green":  { "text": "On Track", "icon": "✓", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "yellow": { "text": "At Risk",  "icon": "!", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "red":    { "text": "Violated", "icon": "✗", "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" }
  },
  "NOTIFICATION_STATUS": {
    "delivered": { "text": "Delivered", "icon": "✅", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "pending":   { "text": "Pending",   "icon": "⏳", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "failed":    { "text": "Failed",    "icon": "❌", "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" }
  },
  "ORDER_STATUS": {
    "pending":     { "text": "Chờ xử lý",   "icon": "⏳", "color": "#FFB020", "bg": "rgba(255,176,32,0.12)" },
    "confirmed":   { "text": "Đã xác nhận", "icon": "✅", "color": "#4F8CFF", "bg": "rgba(79,140,255,0.12)" },
    "in_progress": { "text": "Đang xử lý",  "icon": "⚙️", "color": "#14B8A6", "bg": "rgba(20,184,166,0.12)" },
    "completed":   { "text": "Hoàn tất",    "icon": "🏁", "color": "#22C55E", "bg": "rgba(34,197,94,0.12)" },
    "cancelled":   { "text": "Đã hủy",      "icon": "❌", "color": "#EF4444", "bg": "rgba(239,68,68,0.12)" }
  }
}
```

---

## 13) Snippet badge component (copy paste)

### HTML + CSS thuần
```html
<span class="badge" style="--c:#22C55E;--bg:rgba(34,197,94,.12)">
  <span>✅</span> Hoàn thành
</span>

<style>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--c);
  background: var(--bg);
}
</style>
```

### React (TS)
```tsx
type StatusMeta = { text: string; icon: string; color: string; bg: string };

export function StatusBadge({ meta }: { meta: StatusMeta }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
        color: meta.color, background: meta.bg,
      }}
    >
      <span>{meta.icon}</span>{meta.text}
    </span>
  );
}

// usage
<StatusBadge meta={BOOKING_STATUSES.COMPLETED} />
```

### Vue 3
```vue
<template>
  <span class="badge" :style="{ color: meta.color, background: meta.bg }">
    <span>{{ meta.icon }}</span>{{ meta.text }}
  </span>
</template>
<script setup>
defineProps({ meta: Object });
</script>
```

---

**Nguồn:** trích từ `ride-ops-dashboard/data.js` + `style.css` (`:root` design tokens + class `.badge-*`).
