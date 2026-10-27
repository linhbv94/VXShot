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

## QA bổ sung

- Local frontend +4tagged Rust +17Node đạt; thêm5test-only fixtures sau tag, tổng9Rust đạt: RGBAalpha, decode bounds, successful overwrite readback, format mismatch và symlink preservation.
- Actual export render block chạy trên raster fixture:13.761pixel vùng solid mask vẫn đen opaque khi thêm mosaic chồng lên; alpha ngoài mask128 giữ nguyên. Negative control bỏ finalpass tái hiện leak.
- Actual React App integration với bridge fixture mocks: focus/global shortcut không hydrate lại canvas đang mở; save-dialog focus giữ history; unsaved annotation chặn updater. Không coi DOM mocked bridge là nativeIPC.
- Native bundle MacSDK27 mở thành công, nạp PNGfixture640×400; công cụ sau đó báo noWindowsAvailable khi thao tác canvas/screenshot. Đã nhờ user mở khóa; không claim phần vẽ/save native đạt.
- CI lần1 Windows/MacSilicon đạt, Intel compile đạt nhưng hdiutil Resource busy khi tạoDMG; rerun failed cùngtag, khôngforce-move/versionbump.

- Negative control actual React source e9e8abc tái hiện focus đọc lại clipboard và Undo/history mất; source mới cùng harness PASS. Native settings đã khôi phục nguyên trạng, bundle QA đã thoát; clipboard cá nhân không đọc/ghi. Cả3target/validate attempt2 success, mọi signature/tamper/SDK/icon/2DMG đạt; đang publish.

## Public cuối

[Release1.0.0](https://github.com/linhbv94/VXShot/releases/tag/v1.0.0), tag e6edf14c99e224b6d755f3c66466ba6a87352961. Build40475261551 attempt2 và publish40480258911 thành công. Public stable/latest manifest exact và6assets HTTP200 không token; state trong evidence là public_verified.

Source runtime giữ đúng tag. Những thay đổi sau tag chỉ thêm tests/QA script/evidence/docs; không đổi runtime đã build. Windows/Intel GUI và old→new updater chưa chạy; không claim native canvas/save pass hoặc full roadmap completion. Tự đóng riêng lượt Codex Shot theo quy ước QA+public verification.
