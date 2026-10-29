# 00. Tổng quan Hệ thống — VXShot (`_spec0_system`)

> **Tên sản phẩm:** VXShot (Cross-platform Quick Clipboard Image Editor & Annotator)  
> **Thư mục dự án:** `vxshot`  
> **Phiên bản tài liệu:** 1.0.0  
> **Ngày cập nhật:** 2026-10-27  
> **Nền tảng mục tiêu:** macOS (Apple Silicon & Intel) + Windows 11/10 (x64)  
> **Tài liệu nguồn (Single Source of Scope):** [VXShot_Scope_v1.0.md](../../VXShot_Scope_v1.0.md)  
> **Quy chuẩn tuân thủ:** [desktop_ui_standards.md](../../../_summary/standard_docs/desktop_ui_standards.md) và [master_theme.md](../../../_summary/standard_docs/master_theme.md)

---

## 1. Bối cảnh & Tôn chỉ Sản phẩm (Product Vision)

### 1.1. Nỗi đau thực tế trong quy trình chụp và xử lý ảnh màn hình
Trong công việc văn phòng, lập trình, thiết kế sản phẩm và hỗ trợ khách hàng, người dùng chụp ảnh màn hình hàng chục lần mỗi ngày. Tuy nhiên, luồng làm việc thực tế thường xuyên va phải 3 điểm nghẽn nghiêm trọng:

1. **Trang web/ứng dụng đích không hỗ trợ dán trực tiếp (Upload-only barrier):**
   - Người dùng vừa chụp màn hình bằng phím tắt hệ điều hành (`Cmd + Shift + 4` trên macOS, `Win + Shift + S` trên Windows), ảnh đã nằm sẵn trong clipboard (bộ nhớ tạm).
   - Khi cần tải ảnh lên một cổng dịch vụ (Jira ticket, cổng nộp bài, form web nội bộ) chỉ có nút "Choose File" mà không cho nhấn `Ctrl+V` dán trực tiếp.
   - **Hệ quả phiền toái:** Người dùng buộc phải mở Preview / Paint / Photoshop, dán ảnh vào, nhấn Save, đặt tên file rác, lưu ra Desktop/Downloads, quay lại trình duyệt upload, rồi phải nhớ xóa file rác đó đi.
2. **Nhu cầu chú thích nhanh bị làm phức tạp hóa (Over-engineered annotation tools):**
   - Để chỉ thêm một mũi tên đỏ chỉ vào lỗi, đánh số 1-2-3 cho các bước, hoặc vẽ khung chữ nhật, người dùng phải mở các phần mềm đồ họa nặng nề (Photoshop, Figma, Illustrator) mất cả chục giây khởi động, hoặc dùng các app screenshot trả phí cồng kềnh đầy tính năng thừa (quay video, cloud upload, OCR).
3. **Mối lo ngại về an toàn thông tin & quyền riêng tư (Privacy & Redaction Leaks):**
   - Nhiều công cụ che mờ (blur / pixelate) chỉ áp hiệu ứng mờ bán phần hoặc để lộ metadata/lớp layer trong file xuất, khiến thông tin nhạy cảm (mật khẩu, token API, số tài khoản, thông tin khách hàng) có nguy cơ bị dịch ngược (de-pixelate / unmask).

### 1.2. Định nghĩa & Sứ mệnh của VXShot
VXShot là **tiện ích máy tính siêu tốc chuyên chỉnh sửa và xử lý nhanh ảnh từ clipboard (bộ nhớ tạm)** trên hai nền tảng Windows và macOS.

**Nguyên tắc cốt lõi phân định ranh giới:**
- **Ứng dụng KHÔNG tự chụp hoặc quay màn hình:** Người dùng tiếp tục sử dụng trọn vẹn công cụ chụp màn hình native đã quá quen thuộc và bảo mật của hệ điều hành. VXShot không chen ngang vào luồng chụp → dán thông thường; người dùng chỉ mở VXShot khi thực sự cần lưu file hoặc chú thích/ghép ảnh.
- **Tự động nạp ảnh tức thì (Zero-Click Hydration):** Ngay khi mở VXShot (bằng biểu tượng ứng dụng hoặc phím tắt toàn hệ thống `Cmd/Ctrl + Shift + X`), nếu clipboard đang có dữ liệu ảnh, ảnh sẽ tự động hiển thị trên canvas mà người dùng không cần bấm dán thủ công.
- **Offline-first & Quyền riêng tư tuyệt đối:** Xử lý 100% cục bộ trong RAM và GPU; không gọi máy chủ bên ngoài, không cần tài khoản, không lưu ngầm lịch sử clipboard, không tự sửa/xóa file nguồn.
- **Mô hình chỉnh sửa theo đối tượng (Object-Based Editing):** Cho phép tự do chọn, di chuyển, co giãn, chỉnh sửa chữ/mũi tên/ảnh ghép độc lập; chỉ hợp nhất thành ảnh phẳng (Flatten) khi người dùng chủ động bấm Sao chép (Copy Result) hoặc Lưu tệp (Save Image).

---

## 2. Ma trận Độ khó Kỹ thuật & Giải pháp Kiến trúc (Difficulty Matrix)

```text
┌────────────────────────────────────────────────────────────────────────┐
│               MA TRẬN ĐỘ KHÓ KỸ THUẬT (DIFFICULTY MATRIX)              │
├────────────────────────┬─────────────┬─────────────────────────────────┤
│ Hạng mục Kỹ thuật      │ Mức độ khó  │ Thách thức cốt lõi & Nguy cơ    │
├────────────────────────┼─────────────┼─────────────────────────────────┤
│ 1. Cross-Platform      │ ★★★★☆ (8.5) │ Mất kênh Alpha trong clipboard, │
│    Clipboard Bridge    │             │ xung đột BMP/DIB vs TIFF/PNG    │
├────────────────────────┼─────────────┼─────────────────────────────────┤
│ 2. Canvas Engine &     │ ★★★★☆ (8.0) │ Lệch pixel khi zoom, mờ nét vẽ  │
│    Pixel-Perfect Export│             │ khi export, ranh giới cắt ảnh   │
├────────────────────────┼─────────────┼─────────────────────────────────┤
│ 3. Permanent Pixel     │ ★★★★☆ (8.0) │ Rò rỉ thông tin qua layer còn   │
│    Redaction (Privacy) │             │ sót, khôi phục được ảnh dưới    │
├────────────────────────┼─────────────┼─────────────────────────────────┤
│ 4. Multi-Image &       │ ★★★☆☆ (7.5) │ Co giãn canvas tự do, quản lý   │
│    Dynamic Boundaries  │             │ Z-order và tràn đối tượng ra ngoài│
├────────────────────────┼─────────────┼─────────────────────────────────┤
│ 5. Session Lifecycle & │ ★★★☆☆ (7.0) │ Ghi đè mất bài đang sửa dở dang,│
│    Dirty State Guard   │             │ xung đột phím tắt toàn hệ thống │
└────────────────────────┴─────────────┴─────────────────────────────────┘
```

### Điểm khó 1: Bộ thu nhận Clipboard Đa nền tảng & Giữ trọn kênh Alpha (Độ khó: 8.5/10)
- **Vấn đề kỹ thuật:**
  - *Trên Windows:* Clipboard hệ thống chứa ảnh dưới nhiều định dạng (`CF_DIB`, `CF_DIBV5`, `CF_BITMAP`, hoặc MIME `image/png`). Phần lớn công cụ screenshot cũ chỉ đọc `CF_DIB` chuẩn (không hỗ trợ kênh alpha 32-bit), khiến ảnh chụp có góc bo tròn hoặc vùng trong suốt bị biến thành nền đen kịt xơ xác.
  - *Trên macOS:* Clipboard sử dụng `NSPasteboard` với các kiểu dữ liệu `public.tiff` hoặc `public.png`. Khi ảnh chụp màn hình từ Retina Display (tỉ lệ pixel 2x) được đưa vào clipboard, nếu bridge không xử lý đúng DPI scale, kích thước hiển thị sẽ bị phóng to gấp đôi hoặc co nhỏ gây mờ nét.
- **Giải pháp kiến trúc:**
  - Xây dựng **Native Rust Clipboard Bridge** tích hợp qua thư viện `arboard` và các hàm native API OS chuyên biệt.
  - Trên Windows: Ưu tiên trích xuất luồng `image/png` trực tiếp hoặc chuyển đổi từ `CF_DIBV5` có header `BI_BITFIELDS` để bảo toàn kênh Alpha (32-bit RGBA).
  - Trên macOS: Đọc dữ liệu `public.png` hoặc trích xuất bitmap tệp từ TIFF data representation chuẩn xác.
  - Bridge xuất ra định dạng trung gian thống nhất: Chuỗi Base64 Data URL chuẩn `image/png` kèm thông số kích thước pixel thực (`width`, `height`, `device_pixel_ratio`) gửi qua IPC cho frontend canvas.

### Điểm khó 2: Động cơ Canvas Đối tượng & Kết xuất Raster Độ phân giải Thực (Độ khó: 8.0/10)
- **Vấn đề kỹ thuật:**
  - Người dùng có thể zoom in/zoom out màn hình (ví dụ zoom 250% để soi nét vẽ nhỏ, hoặc zoom 40% để xem toàn cảnh ảnh 4K).
  - Nếu kết xuất ảnh xuất (export) dựa trên kích thước DOM hiển thị trên trình duyệt, ảnh xuất ra sẽ bị vỡ nét (nếu đang zoom out) hoặc kích thước phình to bất thường (nếu đang zoom in).
- **Giải pháp kiến trúc:**
  - Sử dụng **Konva.js (`react-konva`)** làm động cơ quản lý Object Graph, phân tầng (Layers), và Transform Handles (xoay, co giãn, di chuyển).
  - Phân tách tuyệt đối giữa **Hệ tọa độ Canvas Thực (Logical Canvas Coordinates: `width × height`)** và **Khung nhìn Viewport (Stage Scale & Position: `zoom`, `pan_x`, `pan_y`)**.
  - **Cơ chế Xuất Raster Cách Ly (Isolated Export Stage):** Khi thực hiện `Copy Result` hoặc `Save Image`: Động cơ không xuất trực tiếp trên Stage đang chịu tương tác (tránh giật lag và sai lệch do zoom/pan), mà dựng một cây Stage ảo cách ly (Offscreen Stage) với `scale = 1`, `x = 0`, `y = 0`, đúng kích thước `canvas_width × canvas_height`, chỉ chứa các đối tượng đồ họa đã lọc sạch lưới dot grid, handles và selection.
  - **Đường Nhanh Cho Phase 1 (Phase 1 Fast-Path):** Trong Phase 1 (khi người dùng chỉ cần Quick Save ảnh clipboard mà chưa có chú thích), hệ thống mã hóa trực tiếp dữ liệu bitmap gốc sang tệp hoặc clipboard mà không cần khởi tạo stage ảo toàn kích thước, tối ưu hóa tốc độ và triệt tiêu phát sinh RAM thừa.
  - **Ngân Sách Bộ Nhớ An Toàn (Safe Memory Budget):** Giới hạn kích thước ảnh tối đa an toàn ở mức 8192 × 8192 px (hoặc tối đa 33.2 Megapixels ~ chuẩn 8K UHD), với ngân sách bộ nhớ đệm tối đa 200MB trên Webview, kiểm tra kích thước trước khi cấp phát để ngăn chặn hoàn toàn lỗi Out-Of-Memory (OOM).

### Điểm khó 3: Cổng Bảo vệ Quyền riêng tư & Che thông tin Vĩnh viễn (Độ khó: 8.0/10)
- **Vấn đề kỹ thuật:**
  - Nếu áp dụng hiệu ứng Blur (làm mờ) bằng CSS filter hoặc SVG filter đơn thuần, các thuật toán AI hiện đại có thể phục hồi lại chữ gốc (De-blur). Thậm chí nếu xuất file PDF hoặc SVG, lớp layer text bên dưới vẫn tồn tại trong mã nguồn.
- **Giải pháp kiến trúc:**
  - **Chính sách Mặc định An toàn (Secure-by-Default Redaction):** Ưu tiên hàng đầu và khuyến nghị mặc định là **Khối che màu đặc (Solid Color Block)** (đen `#000000`, xám than `#1e293b` hoặc trắng `#ffffff`).
  - Khi xuất ảnh (Flatten): Toàn bộ pixel nằm trong tọa độ bounding box của khối che sẽ bị ghi đè trực tiếp (destructive overwrite) trên bitmap raster. File đầu ra chỉ là một ma trận điểm ảnh PNG/JPEG duy nhất, triệt tiêu hoàn toàn khả năng phục hồi dữ liệu ẩn.

### Điểm khó 4: Mở rộng Canvas Động & Ghép nhiều Ảnh (Độ khó: 7.5/10)
- **Vấn đề kỹ thuật:**
  - Khác với Paint khi mở rộng canvas sẽ cố định ảnh ở góc trái, người dùng ghép ảnh cần mở rộng không gian theo cả 4 hướng (trên, dưới, trái, phải) và tự do di chuyển các ảnh thành phần.
  - Phần đối tượng vượt ra ngoài mép canvas (out-of-bounds) phải được cắt gọn gàng khi xuất mà không làm mất dữ liệu của đối tượng khi đang kéo thả.
- **Giải pháp kiến trúc:**
  - Khung Canvas Frame độc lập với nền làm việc (Workspace Base). Canvas Frame sở hữu các điểm neo điều khiển (Boundary Anchors) ở 4 cạnh và 4 góc.
  - Khi dán thêm ảnh thứ hai (`Cmd/Ctrl + V`): Tự động tạo đối tượng `ImageNode` mới, đặt nổi lên trên cùng (Top Z-order), tự động định vị ở tâm khung nhìn hoặc offset nhẹ (+24px) so với ảnh trước.
  - Sử dụng cơ chế `clipFunc` của Konva để hiển thị visual rõ ràng vùng trong và vùng ngoài canvas; khi xuất raster, chỉ trích xuất đúng tọa độ bao của Canvas Frame.

### Điểm khó 5: Vòng đời Phiên làm việc & Bảo vệ Trạng thái Chưa lưu (Độ khó: 7.0/10)
- **Vấn đề kỹ thuật:**
  - Người dùng đang chú thích dở dang một bức ảnh quan trọng (Dirty State: có thêm 5 mũi tên và 3 dòng ghi chú). Nếu lúc này họ chụp một bức ảnh mới ở ngoài màn hình rồi kích hoạt phím tắt mở VXShot, nếu app tự động xóa bài cũ nạp bài mới sẽ gây mất mát dữ liệu tức thời.
- **Giải pháp kiến trúc:**
  - Thiết lập cờ trạng thái `is_dirty`: Tự động bật `true` ngay khi có bất kỳ thao tác thêm/sửa/xóa đối tượng hoặc thay đổi kích thước canvas.
  - Khi có tín hiệu kích hoạt nạp ảnh mới từ clipboard:
    - Nếu `is_dirty == false` (hoặc canvas đang trống): Tự động nạp và hiển thị ngay.
    - Nếu `is_dirty == true`: Không ghi đè! Đưa cửa sổ lên phía trước (Focus Window) và hiển thị thanh cảnh báo / modal lựa chọn: *"Bạn đang có phiên chỉnh sửa chưa lưu. Bạn muốn Tạo phiên mới (bỏ bài cũ) hay Dán ảnh mới vào canvas hiện tại?"*.

---

## 3. Kiến trúc Kỹ thuật Phân tầng (Layered Architecture)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        VXShot Desktop Application                      │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  Native Chrome Titlebar (32px, System Font 12px/600, Traffic Lights│ │
│ │  macOS 12pt Bezel / Windows Single-row Custom Window Controls)     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  Top Floating Tool HUD: Select | Rect | Ellipse | Arrow | Line |   │ │
│ │  Pen | Text | Counter | Highlight | Solid Redact | Blur Filter     │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │  Tool Options Sub-bar: Colors (6 presets) | Stroke Width (2/4/8px) │ │
│ │  | Font Size (14/18/24/32px) | Redaction Presets | Opacity Slider │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │  Canvas Workspace (Infinite Pan & Zoom Workspace with Dot Grid)    │ │
│ │  ┌──────────────────────────────────────────────────────────────┐  │ │
│ │  │ Canvas Frame Boundary (Handles at 4 corners & 4 edges)       │  │ │
│ │  │  ┌───────────────────────┐  ┌─────────────────────────────┐  │  │ │
│ │  │  │ Image Object 1 (Base) │  │ Image Object 2 (Pasted)     │  │  │ │
│ │  │  │ - Annotation: Arrow   │  │ - Annotation: Solid Redact  │  │  │ │
│ │  │  │ - Annotation: Counter │  │ - Annotation: Text Note     │  │  │ │
│ │  │  └───────────────────────┘  └─────────────────────────────┘  │  │ │
│ │  └──────────────────────────────────────────────────────────────┘  │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │  Bottom Info Bar: Canvas Size (1920x1080) | Zoom (100%) | Objects  │ │
│ │  [Secondary Action: Save Image (PNG/JPEG)] [Primary: Copy Result]  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  Settings Modal (Standard VXUtilities Sidebar: General, Canvas, Privacy, │ │
│ │  Updates, About, Support Author with VietQR Central Card)          │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Tauri IPC Bridge (JSON / Binary)
┌───────────────────────────────────|────────────────────────────────────┐
│                    Rust Core Native Backend Engine                     │
│ ┌───────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐ │
│ │ Native Clipboard Mgr  │ │ Native File Dialog & │ │ Global Shortcut │ │
│ │ - arboard bridge      │ │ File System (PNG/JPG)│ │ Manager         │ │
│ │ - Alpha / DIB / TIFF  │ │ - image-rs encoder   │ │ - Tauri Plugin  │ │
│ └───────────────────────┘ └──────────────────────┘ └─────────────────┘ │
│ ┌───────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐ │
│ │ Window State Manager  │ │ App Settings Store   │ │ Auto Updater    │ │
│ │ - Single instance     │ │ - ~/.config/vxshot/  │ │ - GitHub Release│ │
│ │ - Focus & Restore     │ │   config.json        │ │   integration   │ │
│ └───────────────────────┘ └──────────────────────┘ └─────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ OS System APIs
┌───────────────────────────────────|────────────────────────────────────┐
│                   Hệ điều hành Cục bộ (macOS / Windows)                │
│  - macOS: NSPasteboard, Quartz Event Services, Cocoa Windowing         │
│  - Windows: Win32 Clipboard (CF_DIBV5 / PNG), Win32 Window Messaging   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Phân rã Phạm vi Tính năng (Functional Scope Mapping)

Bảng đối chiếu 18 yêu cầu chức năng từ [VXShot_Scope_v1.0.md](../../VXShot_Scope_v1.0.md) vào kiến trúc kỹ thuật:

| ID | Nhóm | Yêu cầu nghiệp vụ | Mức ưu tiên | Thành phần chịu trách nhiệm |
| :--- | :--- | :--- | :--- | :--- |
| `F01` | Khởi động | Mở ứng dụng thông thường qua icon/OS launcher | **P0** | Tauri Window Lifecycle |
| `F02` | Khởi động | Phím tắt toàn hệ thống mở/hiện ứng dụng (`Cmd/Ctrl+Shift+X`) | **P0** | `tauri-plugin-global-shortcut` |
| `F03` | Clipboard | Tự động đọc và nạp ảnh khi mở phiên mới | **P0** | Rust `read_clipboard_image` + UI Init |
| `F04` | Lưu | Lưu file PNG và JPEG bằng hộp thoại chọn vị trí | **P0** | `tauri-plugin-dialog` + `tauri-plugin-fs` |
| `F05` | Markup | Chèn chữ (Text), mũi tên (Arrow), đường thẳng (Line) | **P0** | Konva `Text`, `Arrow`, `Line` components |
| `F06` | Markup | Vẽ hình chữ nhật (Rect), hình elip (Ellipse) | **P0** | Konva `Rect`, `Ellipse` components |
| `F07` | Markup | Tô sáng vùng ảnh (Highlight) với màu bán trong suốt | **P0** | Konva `Rect` / `Line` với `opacity: 0.35` |
| `F08` | Markup | Đánh số thứ tự tự động tăng (Step Badge: 1, 2, 3...) | **P0** | Konva `Group` (Circle Badge + Text) |
| `F09` | Privacy | Che thông tin nhạy cảm bằng khối màu đặc (Solid Block) | **P0** | Konva `Rect` đặc màu (`#000000`, `#1e293b`) |
| `F10` | Canvas | Mở rộng / điều chỉnh kích thước vùng xuất (Canvas Frame) | **P0** | Konva Stage Boundary Transformer |
| `F11` | Images | Dán thêm ảnh từ clipboard dưới dạng đối tượng mới | **P0** | UI `paste` event handler + Rust Clipboard |
| `F12` | Editing | Chọn, di chuyển, đổi kích thước đối tượng (Transform) | **P0** | Konva `Transformer` component |
| `F13` | Editing | Hoàn tác / làm lại (Undo / Redo stack) | **P0** | Custom History State Manager (Max 50 steps) |
| `F14` | Export | Hợp nhất toàn bộ thành phẩm và ghi ảnh vào clipboard | **P0** | Konva `toBlob` / `toDataURL` + Rust Write |
| `F15` | Export | Hợp nhất toàn bộ thành phẩm và lưu thành tệp trên đĩa | **P0** | Konva Raster Export + Rust `save_image_file`|
| `F16` | Markup | Làm mờ / che điểm ảnh (Blur / Pixelate filter) | **P1** | Konva `Blur` / `Pixelate` filter nodes |
| `F17` | Project | Lưu và mở lại dự án có thể chỉnh sửa từng lớp (`.vxshot`)| **P2** | JSON State Serialization / Deserialization |
| `F18` | Export | Kéo thả trực tiếp thành phẩm như một tệp sang app khác | **P2** | Native Drag-out File Provider Bridge |

---

## 5. Lộ trình Triển khai 3 Giai đoạn (Phased Implementation Plan)

### Giai đoạn 1 (Phase 1): Clipboard → Quick Save / Copy
- **Mục tiêu then chốt:** Giải quyết dứt điểm Use Case 1 (UC-01) — tải ảnh lên trang web không hỗ trợ dán.
- **Tính năng triển khai:**
  - Dựng khung dự án Tauri v2 + React 19 + TypeScript + Vite + Tailwind CSS.
  - Titlebar chuẩn VXUtilities (32px, macOS native traffic lights, Windows `decorations: false`).
  - Lắng nghe phím tắt toàn hệ thống và khởi chạy ứng dụng.
  - Tự động nạp ảnh từ clipboard khi khởi động hoặc nhấn phím tắt.
  - Hộp thoại lưu tệp (`Cmd/Ctrl + S`) hỗ trợ định dạng PNG và JPEG.
  - Nút `Copy Result` ghi ảnh ra clipboard.
  - Khung Canvas đơn giản hiển thị ảnh gốc, zoom fit / 100%.

### Giai đoạn 2 (Phase 2): Bộ công cụ Chú thích (Markup Editor)
- **Mục tiêu then chốt:** Giải quyết Use Case 2 (UC-02) — chú thích nhanh ảnh màn hình trong 3 giây.
- **Tính năng triển khai:**
  - Tích hợp Konva.js và `react-konva`.
  - Top Tool HUD: Select, Arrow, Rect, Ellipse, Line, Text, Step Counter, Highlight, Solid Redact Block.
  - Tool Options Sub-bar: Chọn màu (6 màu chuẩn), độ dày viền (2px, 4px, 8px), cỡ chữ.
  - Bộ điều khiển đối tượng: Chọn (Select), Di chuyển (Drag), Co giãn (Resize with handles), Xóa (Delete/Backspace).
  - Lịch sử thao tác: Undo (`Cmd/Ctrl + Z`) và Redo (`Cmd/Ctrl + Shift + Z`).
  - Bộ kết xuất hợp nhất (Flatten on Export) đảm bảo ảnh xuất đúng pixel gốc, không bị ảnh hưởng bởi mức zoom của người dùng.

### Giai đoạn 3 (Phase 3): Ghép nhiều ảnh & Hoàn thiện Nâng cao
- **Mục tiêu then chốt:** Giải quyết Use Case 3 (UC-03) — ghép nhiều ảnh trên một khung canvas.
- **Tính năng triển khai:**
  - Thay đổi kích thước Canvas Frame qua 8 tay nắm (Canvas Resize Handles) hoặc hộp thoại nhập kích thước.
  - Hỗ trợ dán nhiều ảnh liên tiếp (`Cmd/Ctrl + V`) thành các đối tượng `ImageNode` độc lập.
  - Quản lý thứ tự xếp chồng (Bring to Front, Send to Back, Move Up, Move Down).
  - Tùy chọn làm mờ phụ (Blur filter - P1).
  - Cắt cúp vùng xuất (Clip to canvas bounds) loại bỏ phần đối tượng tràn ra ngoài.
  - Bổ sung tab Settings đầy đủ theo chuẩn VXUtilities (Updates, About, Support Author).

---

## 6. Cấu trúc Bộ Tài liệu Đặc tả (Documentation Map)

Toàn bộ hệ thống đặc tả của VXShot được phân bổ thành 7 tài liệu kỹ thuật chuẩn mực thuộc thư mục `vxshot/docs/spec/`:

1. [00_system_overview.md](00_system_overview.md) *(Tài liệu này)*: Tổng quan hệ thống, bối cảnh, ma trận độ khó, kiến trúc phân tầng, phân rã tính năng và lộ trình.
2. [01_business_process.md](01_business_process.md): Đặc tả quy trình nghiệp vụ tổng thể (BPMN 2.0 / Swimlane), phân tích SIPOC, ma trận quyết định clipboard và chính sách che dữ liệu.
3. [02_feature_flow.md](02_feature_flow.md): Đặc tả chi tiết luồng người dùng (User Flows), sơ đồ tuần tự hệ thống (Sequence Diagrams), máy trạng thái (FSM) và machine-readable logic contracts.
4. [03_ui_wireframe.md](03_ui_wireframe.md): Thiết kế giao diện chi tiết, wireframe ASCII/text grid, cây phân cấp components, ma trận trạng thái và Design Tokens tuân thủ `desktop_ui_standards.md` và `master_theme.md`.
5. [04_api_data.md](04_api_data.md): Giao ước IPC giữa Tauri và WebView, định dạng dữ liệu (JSON Schemas), mô hình Canvas State và ma trận mã lỗi hệ thống.
6. [05_qa_acceptance.md](05_qa_acceptance.md): Tiêu chuẩn nghiệm thu định dạng Gherkin (Given-When-Then), ma trận kiểm thử biên (Edge Cases), quy tắc validation và QA checklist trên macOS & Windows.
7. [06_demo_presentation.md](06_demo_presentation.md): Kịch bản trình diễn tính năng (Demo Playbook), 3 Wow Factors, kịch bản thao tác mẫu và phương án dự phòng khi demo.


## Baseline phát hành 1.0.0 — QA độc lập 2026-10-27

- Phạm vi thực tế: một ảnh PNG/JPEG nền + annotation Canvas2D, zoom/pan, undo/redo, PNG/JPEG save và copy bitmap. Clipboard/file engine Rust dùng chung macOS/Windows. Multi-image, crop/resize/transform handles và sửa đối tượng sau tạo chưa triển khai; các mục đó trong thiết kế là roadmap, không thuộc nghiệm thu1.0.0.
- Focus/global shortcut không thay ảnh đã mở. Chỉ tự hydrate canvas trống khi bật auto-hydrate; đọc lại settings trước lần đầu. Paste/Open chủ động hỏi xác nhận nếu annotation khác snapshot vừa Save/Copy; stale clipboard results bị bỏ. Native dialog/focus không reset history.
- Save/Copy chụp snapshot annotation, chặn updater trước download nếu còn thay đổi chưa xuất hoặc thao tác đang chạy. Solid redaction vẽ lại ở pass cuối (cả preview/export), làm tròn ra ngoài pixel; mosaic lấy ảnh gốc không được phủ ngược lên vùng che. Màu đen opaque giữ nguyên.
- File input/export decode giới hạn8192px/33.2MP,64MiB encoded/256MiB decode allocation. Save kiểm format, dùng tempfile create-new cùng volume + sync + atomic persist, cleanup khi lỗi; từ chối đích symlink/thư mục. Chọn PNG/JPEG theo extension trong dialog; file hỏng không ghi đè đích.
- Settings IPC dùng rename_all snake_case cho new_settings. Updates thật: startup check im lặng khi mạng lỗi, manual retry, available/download/install/restart; không tự install. Chỉ GitHub updater dùng mạng, không upload ảnh. Giữ com.vxshot.desktop, khóa updater riêng, SDK27.0, Win currentUser.
- Recent menu chưa hoạt động được ẩn; không báo đã có tính năng roadmap. QA runtime và CI/package/public ghi riêng ở release review/evidence.


## Hồi quy native 1.0.1 — chốt nét vẽ nhanh

NativeQA1.0.0 xác nhận Save/Cancel giữ annotation/history. Tuy nhiên kéo khối che nhanh có thể chỉ hiện preview mà không commit vào annotations, nên ảnh xuất không chứa mask. Dùng refs đồng bộ cho drawing/start/points/preview, nhận mouseup ở window và consume nét vẽ đúng một lần trước React render. Preview/history/export phải thống nhất; duplicate mouseup không thêm hai đối tượng. Không thay engine clipboard/file, app identity, updater key hoặc SDK.


## Editor source sau feedback 2026-10-29

Source hiện tại bổ sung IMAGE object độc lập cho ảnh đầu/Paste, nhập Text inline, Select/move mọi object và bốn góc mở rộng canvas. History/dirty/export giữ cả object và kích thước khung; mô tả phạm vi1.0.0 phía trên là lịch sử bản phát hành, không phải phạm vi source mới. Xem [flow](02_feature_flow.md#cập-nhật-nghiệp-vụ-editor-2026-10-29-source-hiện-tại-chưa-release) và [AC](05_qa_acceptance.md#acceptance-cho-feedback-editor-2026-10-29). Chưa release, native platform QA còn cần thực hiện.
