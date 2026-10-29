# VXShot — Kiểm chứng nghiệp vụ editor 2026-10-29

Trạng thái: source đã sửa, browser fixture PASS; chưa nghiệm thu native hoặc release.

## Thay đổi

- Paste thêm IMAGE độc lập trên cùng, giữ ảnh đầu và annotation; ảnh đầu cũng chọn/move/Delete được. Focus/global shortcut vẫn không thay phiên đang mở. Open File giữ luồng xác nhận thay tài liệu.
- Text nhập trực tiếp tại canvas, hỗ trợ Unicode/IME, Enter/blur chốt, Shift+Enter xuống dòng, Escape hủy. Chặn default focus pointerdown để textarea không đóng ngay.
- Select có hit-test và selection bounds cho mọi loại object; move cập nhật cả points tuyệt đối của line/arrow/pen. Pointer capture giữ drag ngoài biên, mỗi drag một entry history, cancel bỏ preview.
- Bốn góc mở rộng frame, có preview W×H và giới hạn8192px/chiều,33.2MP. Trái/trên dịch toàn bộ object cùng offset; phải/dưới giữ tọa độ. History và dirty giữ cả frame lẫn object.
- Export preload IMAGE, composite đúng thứ tự, blur lấy nội dung bên dưới; solid mask luôn có pass opaque cuối. Không xuất selection/input/handle.

## Checks đã chạy

- `npm run build`: PASS (TypeScript + Vite).
- `node scripts/test_editor.mjs`:2/2 PASS, guard focus và dirty snapshot.
- `node scripts/test_editor_geometry.mjs`:3/3 PASS, geometry của11loại object, dịch points không mutate nguồn, multiline text bounds,4góc expansion/giới hạn/không shrink.
- `scripts/qa_editor_feedback.mjs`: PASS actual React trên Chrome headless, bridge fixture hoàn toàn. Paste giữ hai ảnh, move độc lập cả ảnh đầu/ảnh mới, Delete/Undo/Redo; nhập tiếng Việt và move text; line/ellipse/pen drag; expand NW, Undo/Redo frame; PNG readback450×340, green/red đúng pixel và alpha vùng mới; fast solid mask + mosaic vẫn `[0,0,0,255]`; dirty guard nhận thay đổi frame. Không có pageerror.
- [Evidence JSON](editor_feedback_20261029.json), [screenshot](editor_feedback_20261029.png).
- `git diff --check` phạm vi editor: PASS. Toàn repo còn trailing whitespace trong `docs/button_icons_svg.md:4` thuộc diff có sẵn/ngoài phạm vi; không sửa file đó.

## Chạy lại browser fixture

Chạy Vite riêng ở loopback bằng `npm run dev -- --host 127.0.0.1 --port 5188`. Cài Playwright trong môi trường QA riêng; không thêm dependency production. Đặt `VXSHOT_PLAYWRIGHT` tới module Playwright và `VXSHOT_BROWSER` tới executable Chrome khi không dùng browser mặc định Playwright; chạy `node scripts/qa_editor_feedback.mjs`. `VXSHOT_QA_URL` cho phép đổi URL. Script chạy profile tạm, mock bridge/settings/clipboard/dialog; không đọc dữ liệu user.

## Phần chưa kiểm chứng

- Native macOS/WKWebView và Windows/WebView2: clipboard IPC, text IME thực, drag/pointer capture, Save/Copy OS, focus/dialog thực; chưa chạy native bundle mới.
- Browser kiểm trực tiếp NW ở100%;4góc và giới hạn được kiểm ở pure geometry. Native/visual4góc tại zoom/pan khác nhau chưa nghiệm thu.
- Nhánh Escape/Shift+Enter/IME composition, JPEG readback và mọi loại object qua pointer thật chưa đủ browser evidence; TypeScript/geometry không thay các case đó.
- Không có resize/rotate từng object, crop hoặc thay đổi Settings/titlebar/common UI trong phạm vi này. Không commit/push/release, không sửa Applications/quyền hệ thống.
- Script legacy `qa_editor_session.cjs` dùng fixture mouse/model một ảnh cũ chưa được migrate/chạy ở đợt này. Gate browser hiện hành cho editor là `qa_editor_feedback.mjs`, gồm fast-drag/privacy readback và dirty guard; không dùng evidence1.0.x cũ để nhận native mới.
