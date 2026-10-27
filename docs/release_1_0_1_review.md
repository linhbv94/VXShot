# VXShot 1.0.1 — QA native bổ sung

Ngày 2026-10-27, tiếp yêu cầu user thử lại native QA. Công cụ chụp và điều khiển cửa sổ hoạt động trở lại; chưa xác định nguyên nhân lỗi `noWindowsAvailable` trước đó.

## Lỗi tái hiện trên 1.0.0

Mở PNG fixture 640 × 400, thêm nhãn số, Save/Cancel và lưu PNG giữ được history. Tuy nhiên, kéo nhanh khối che đặc có thể chỉ tạo preview: Undo vẫn disabled và pixel trong file PNG xuất vẫn là ảnh gốc. Đây là lỗi chốt nét vẽ, khác lỗi focus reset đã sửa trước đó.

## Sửa và kiểm chứng

- Dùng refs đồng bộ cho trạng thái vẽ, điểm bắt đầu, chuỗi điểm và preview. Nhận mouseup ở window và chốt mỗi nét đúng một lần trước khi React render. Không thay engine clipboard/file, SDK27.0, app ID hoặc updater key.
- Actual React integration: chuỗi down/move/up nhanh phải ghi history và vùng mask trong PNG xuất phải đen opaque; giữ các kiểm tra focus/hotkey/save/updater guard cũ. Frontend và 17 Node regression tests đạt; 9 Rust fixtures đã có được CI chạy lại.
- Native Mac Silicon: fast drag ghi một đối tượng và bật Undo; thêm mosaic chồng lên tạo hai đối tượng. Save/Cancel và Save/Confirm đều giữ history. Undo về một đối tượng, Redo về hai đối tượng đạt.
- Đọc lại PNG lưu thật: 13.524 pixel vùng che đen opaque, alpha ngoài vùng che bằng 128, kích thước 640 × 400. JPEG có magic FFD8, cùng kích thước, tâm mask [0,0,0,255], vùng alpha được lót trắng [247,167,178,255].
- Settings IPC lưu được tùy chọn auto-hydrate; bật tùy chọn và gọi app bằng hotkey vẫn giữ phiên chỉnh sửa. Đã đóng app QA và khôi phục cấu hình ban đầu. Không đọc/ghi clipboard cá nhân; Copy vào clipboard hệ thống chưa kiểm.

## Release

PR2 merged; tag `0713063158ce476c9beed2d48bf2ac72fb70be41`, build run `40483406220`. Tag public 1.0.0 giữ nguyên; bản sửa phát hành dưới số 1.0.1.

Build `40483406220` và publish `40486754462` thành công. [Public 1.0.1](https://github.com/linhbv94/VXShot/releases/tag/v1.0.1) là stable/latest; manifest khớp bản đã kiểm, sáu assets HTTP200 không token. Mọi chữ ký/tamper rejection, SDK27.0/kiến trúc/ID/version/icon/codesign hai Mac và hai DMG checksum đạt; Windows x64/version/bảy ICO payload khớp.

## Updater thực tế

Chạy bản CI 1.0.0 trong thư mục fixture riêng, kiểm thấy 1.0.1, bấm Update, quan sát tải/cài/khởi động lại. About hiển thị 1.0.1 và updater báo đang dùng bản mới nhất. Executable sau cập nhật byte-exact với gói CI 1.0.1 đã xác minh, strict codesign đạt; cấu hình byte-exact trước/sau. Đã thoát app fixture và khôi phục cấu hình ban đầu. Không thay bộ cài đang dùng của user.

Windows/Intel GUI và updater E2E chưa kiểm; Copy clipboard hệ thống chưa thử để giữ clipboard cá nhân. Đóng riêng lượt Codex QA bổ sung + patch release sau public/E2E verification.
