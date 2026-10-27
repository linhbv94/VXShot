# QA và release VXShot1.0.0

Ngày2026-10-27. User giao QA độc lập trước release, cho phép tạo khóa updater riêng/lưu đúng Secrets VXShot. Không giao agent khác.

## Phát hiện và sửa

- Focus vô điều kiện hydrate/reset annotations/history, kể cả Save dialog/copy. Sửa canvas-empty automatic policy, tôn trọng settings, confirm replace chủ động, stale-result sequence, cleanup listener StrictMode.
- Mosaic sampling original có thể phủ lại solid mask: final opaque privacy pass trên preview/export, pixel rounding outward.
- Settings new_settings khác default Tauri camelCase: command đổi explicit snake_case.
- Đầu vào file/export thiếu bounds/format validation; staging File::create thiếu create-new. Dùng decoder limits và tempfile atomic persist, reject symlink/directory; invalid data không đè file cũ.
- Recent menu no-op bị ẩn; default-format/extension dùng thật. Updates giả “mới nhất” thay bằng singleton updater/controller đã có regression; dirty guard trước download.
- Spec blueprint còn multi-image/crop/transform chưa có: ghi rõ ngoài1.0.0, không claim đã hoàn tất toàn spec.

## Checks

Đang chạy local/native và CI; chưa publish khi thiếu gates.
