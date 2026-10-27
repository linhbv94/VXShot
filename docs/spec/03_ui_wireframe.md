# 03. Đặc tả Giao diện & Wireframe — VXShot (`_spec3_ui_wireframe`)

> **Tên sản phẩm:** VXShot (Cross-platform Quick Clipboard Image Editor & Annotator)  
> **Thư mục tài liệu:** `vxshot/docs/spec/`  
> **Phiên bản:** 1.0.0  
> **Ngày cập nhật:** 2026-10-27  
> **Quy chuẩn tuân thủ nghiêm ngặt:** [desktop_ui_standards.md](../../../.agents/desktop_ui_standards.md) và [master_theme.md](../../../_summary/master_theme.md)

---

## 1. Hệ Thống Token Thiết Kế & Quy Chuẩn UI Desktop

### 1.1. Bảng Màu Hệ Thống (Master Theme Tokens)

| Tên Token | Dark Mode (Mặc định) | Light Mode | Ý nghĩa & Vị trí Sử dụng |
| :--- | :--- | :--- | :--- |
| `surface-base` | `#0f1117` | `#f8fafc` | Nền gốc toàn bộ cửa sổ ứng dụng (App Canvas Base) |
| `surface-workspace`| `#090a0f` | `#f1f5f9` | Nền không gian vẽ vô tận (chứa lưới dot grid xám mờ) |
| `surface-panel` | `rgba(20, 24, 33, 0.85)` | `rgba(255, 255, 255, 0.92)` | Nền thanh Top HUD, Sub-bar công cụ, Bottom Status Bar |
| `surface-card` | `#141821` | `#ffffff` | Khung Modal Cài đặt, Hộp thoại xác nhận |
| `surface-dropdown`| `rgba(15, 20, 28, 0.96)` | `#ffffff` | Menu ngữ cảnh, Dropdown Recent Files |
| `accent-primary` | `#06b6d4` (`cyan-500`) | `#0891b2` | Nút chính `Copy Result`, công cụ đang active, viền focus |
| `accent-glow` | `rgba(6, 182, 212, 0.35)` | `rgba(8, 145, 178, 0.25)` | Viền sáng nhẹ khi focus ô nhập, viền bao nút chính |
| `accent-surface` | `rgba(6, 182, 212, 0.15)` | `rgba(6, 182, 212, 0.08)` | Nền nút công cụ đang được kích hoạt |
| `text-primary` | `#f8fafc` (`slate-100`) | `#0f172a` (`slate-900`) | Tiêu đề, nhãn nút bấm, văn bản quan trọng |
| `text-secondary` | `#cbd5e1` (`slate-300`) | `#334155` (`slate-700`) | Tọa độ, thông số kích thước canvas, tooltip |
| `text-muted` | `#94a3b8` (`slate-400`) | `#64748b` (`slate-500`) | Nhãn phím tắt, gợi ý trạng thái rỗng |
| `border-subtle` | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.08)` | Viền mờ giữa các panel, phân cách thanh công cụ |
| `border-active` | `#06b6d4` | `#0891b2` | Viền bao ranh giới Canvas Frame khi chọn |

---

### 1.2. Quy Chuẩn Thanh Tiêu Đề Trên Cùng (32px Chrome Titlebar)
Tuân thủ tuyệt đối [desktop_ui_standards.md](../../../.agents/desktop_ui_standards.md):
- **Chiều cao cố định:** Đúng `32px`.
- **Phông chữ:** System font (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`), cỡ `12px`.
- **Tên ứng dụng:** Cỡ `12px`, `font-weight: 600` (Semibold), không dùng phông monospace.
- **Biểu tượng ứng dụng:** Kích thước `16px × 16px`, khoảng cách (gap) giữa icon và tên app đúng `6px`.
- **Trên macOS:**
  - Vùng chừa native traffic lights chuẩn zTools: rộng `82px` (chứa bộ traffic lights native đường kính `12pt`, khoảng cách tâm `20pt`, căn giữa trục dọc `16px`).
  - Menu hệ thống nằm hoàn toàn trên Menu Bar của macOS; không chèn hàng menu lặp lại trong cửa sổ app.
- **Trên Windows:**
  - Vô hiệu hóa hoàn toàn titlebar native của OS (`decorations: false`, không để double titlebar).
  - Menu File / Edit / View / Help đặt sát mép trái; ẩn icon và tên app trên thanh titlebar.
  - Một bộ 3 nút native-like góc phải: Minimize, Maximize/Restore, Close.
- **Nút Mở Tệp (Open File) & Danh Sách Gần Đây (Recent Files):**
  - Tích hợp nút `Open File` ngay trên Titlebar.
  - Hover hoặc focus nút mở sẽ hiển thị dropdown tối đa **5 tệp gần đây (Recent Items)**, mới nhất nằm trên cùng.
  - Click nút chính mở hộp thoại chọn tệp native; click vào item trong dropdown nạp tệp trực tiếp. Nhớ qua các lần khởi động lại app.

---

## 2. Cây Phân Cấp Thành Phần Giao Diện (Component Hierarchy)

```text
VXShotApp (Root Container: 100vw x 100vh, flex-col, overflow-hidden)
├── AppTitlebar (32px, Single-row Chrome, Drag Region)
│   ├── MacTrafficLightsNativeSpacer (82px x 32px, macOS only)
│   ├── AppBranding (Icon 16px + "VXShot" 12px/600)
│   ├── WinMenuBar (File, Edit, View, Help - Windows only)
│   ├── TitlebarActions (Flex-1 justify-end items-center gap-2)
│   │   ├── RecentFilesDropdown (Max 5 items)
│   │   ├── OpenFileButton (Cmd/Ctrl + O)
│   │   ├── ZoomControls (ZoomOut, Reset 100%, ZoomIn, FitToScreen)
│   │   ├── UndoRedoButtonGroup (Cmd+Z, Cmd+Shift+Z)
│   │   └── SettingsButton (Gear Icon)
│   └── WinWindowControls (Min, Max, Close - Windows only)
│
├── MainWorkspace (Flex-1 relative overflow-hidden bg-[#090a0f])
│   ├── TopFloatingToolbar (Floating HUD centered, backdrop-blur-md)
│   │   ├── ToolGroupSelect (Select/Pointer [V])
│   │   ├── ToolGroupShapes (Rect [R], Ellipse [O], Arrow [A], Line [L], Pen [P])
│   │   ├── ToolGroupMarkup (Text [T], Counter Step [S], Highlight [H])
│   │   └── ToolGroupPrivacy (Solid Redact Block [B], Blur Filter [M])
│   │
│   ├── ToolOptionsSubbar (Contextual sub-bar below HUD)
│   │   ├── ColorPresets (Red, Cyan, Yellow, Green, White, Black)
│   │   ├── StrokeWidthPicker (2px, 4px, 8px)
│   │   ├── FontSizePicker (14px, 18px, 24px, 32px)
│   │   └── RedactColorPicker (Black, Charcoal, White)
│   │
│   ├── InfiniteCanvasViewport (Konva Stage with Pan & Zoom handlers)
│   │   ├── DotGridLayer (Background dot grid)
│   │   ├── CanvasFrameContainer (White/Transparent bounding box)
│   │   │   ├── CanvasResizeHandles (8 handles: 4 corners + 4 edge midpoints)
│   │   │   ├── BaseImageLayer (Initial clipboard image)
│   │   │   ├── SecondaryImagesLayer (Pasted images)
│   │   │   ├── AnnotationVectorLayer (Arrows, rects, lines, texts)
│   │   │   ├── RedactionLayer (Solid blocks & blur filters)
│   │   │   └── SelectionTransformerLayer (Konva Transformer handles)
│   │   └── OutsideCanvasDimOverlay (Màn tối mờ vùng ngoài ranh giới)
│   │
│   └── EmptyStateDropzone (Hiển thị khi clipboard rỗng & chưa có ảnh)
│       ├── EmptyIllustrationIcon (Clipboard with dashed border)
│       ├── PrimaryInstruction ("Chụp màn hình và mở VXShot để tự nạp ảnh")
│       └── SecondaryShortcuts ("Hoặc nhấn Cmd/Ctrl + V để dán ảnh / Kéo thả tệp vào đây")
│
├── BottomStatusBar (30px, glass panel, items-center px-4 justify-between)
│   ├── CanvasMetricsGroup (text-[11px] font-mono text-slate-400 gap-3)
│   │   ├── CanvasDimensionsBadge ("1920 × 1080 px")
│   │   ├── ZoomLevelBadge ("100%")
│   │   ├── ObjectsCountBadge ("4 đối tượng")
│   │   └── StatusMessageIndicator ("Đã nạp ảnh từ clipboard")
│   │
│   └── ExportActionButtonsGroup (items-center gap-2)
│       ├── SaveImageDropdownButton (Secondary: "Lưu tệp... (Cmd+S)" [PNG/JPEG])
│       └── CopyResultPrimaryButton (Primary Electric Cyan: "Sao chép thành phẩm (Cmd+Shift+C)")
│
└── SettingsModal (Standard zTools Dialog, Centered, 640px x 480px)
    ├── ModalHeader (Drag region, "Cài đặt VXShot", Close button)
    ├── ModalBody (Flex row)
    │   ├── SettingsSidebar (General, Editor, Privacy, Updates, About, Support Author)
    │   └── SettingsContentArea (Form fields, toggles, shortcuts, VietQR card)
    └── ModalFooter (Reset Defaults left, Done button right)
```

---

## 3. Bản Vẽ Bố Cục Dạng Văn Bản (ASCII / Text Grid Wireframe)

### 3.1. Màn Hình Làm Việc Chính (Main Editor with Image & Annotations)

```text
+------------------------------------------------------------------------------------------------------------------+
| (o)(o)(o)  [X] VXShot    [Open v] [Undo] [Redo]    Zoom: [-] [ 100% ] [+] [Fit]    [?] [⚙ Settings]  [ _ ][ [] ][ X ] |
+------------------------------------------------------------------------------------------------------------------+
|                                                                                                                  |
|         +----------------------------------------------------------------------------------------------+         |
|         | [V Select] | [R Rect] [O Oval] [A Arrow] [L Line] [P Pen] | [T Text] [S Step] [H High] | [B Block] [M Blur] |         |
|         +----------------------------------------------------------------------------------------------+         |
|         | Màu: [*Do] [Xanh] [Vang] [Luc] [Trang] [Den] | Net: [ 2px ] [ 4px*] [ 8px ] | Chu: [ 18px*] |              |
|         +----------------------------------------------------------------------------------------------+         |
|                                                                                                                  |
|  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . |
|  .  .  .  .  .  +------------------------------------------------------------------------+  .  .  .  .  .  .  . |
|  .  .  .  .  .  |[#]-------------------------------[#]--------------------------------[#]|  .  .  .  .  .  .  . |
|  .  .  .  .  .  | |                                                                    | |  .  .  .  .  .  .  . |
|  .  .  .  .  .  | |   +------------------------------------+                           | |  .  .  .  .  .  .  . |
|  .  .  .  .  .  | |   | [Ảnh chụp màn hình từ Clipboard]   |       (1) [Bấm vào đây]   | |  .  .  .  .  .  .  . |
|  .  .  .  .  .  | |   |                                    |          \                | |  .  .  .  .  .  .  . |
|  .  .  .  .  .  |[#]  |   +----------------------------+   |           ======>         |[#] .  .  .  .  .  .  . |
|  .  .  .  .  .  | |   |   | [■■■ SOLID REDACT BLOCK ■■■|   |                           | |  .  .  .  .  .  .  . |
|  .  .  .  .  .  | |   |   +----------------------------+   |     +------------------+  | |  .  .  .  .  .  .  . |
|  .  .  .  .  .  | |   +------------------------------------+     | Ảnh dán thứ 2    |  | |  .  .  .  .  .  .  . |
|  .  .  .  .  .  | |                                              +------------------+  | |  .  .  .  .  .  .  . |
|  .  .  .  .  .  |[#]-------------------------------[#]--------------------------------[#]|  .  .  .  .  .  .  . |
|  .  .  .  .  .  +------------------------------------------------------------------------+  .  .  .  .  .  .  . |
|  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . |
|                                                                                                                  |
+------------------------------------------------------------------------------------------------------------------+
|  1920 × 1080 px  |  Zoom: 100%  |  4 doi tuong  |  Da nap anh tu clipboard        [Luu tep... v]  [ Sao chep anh ] |
+------------------------------------------------------------------------------------------------------------------+
```

---

### 3.2. Màn Hình Đón Tiếp Khi Chưa Có Ảnh (Empty State Dropzone)

```text
+------------------------------------------------------------------------------------------------------------------+
| (o)(o)(o)  [X] VXShot                                                                           [⚙ Settings]      |
+------------------------------------------------------------------------------------------------------------------+
|                                                                                                                  |
|                                                                                                                  |
|                                                                                                                  |
|                                       + - - - - - - - - - - - - - - - - - - - +                                  |
|                                       |                                       |                                  |
|                                       |               [ 📋 ]                  |                                  |
|                                       |                                       |                                  |
|                                       |     Chưa có ảnh trong Clipboard       |                                  |
|                                       |                                       |                                  |
|                                       |   Chụp màn hình bằng phím tắt hệ thống|                                  |
|                                       |   (Cmd+Shift+4 trên Mac / Win+Shift+S)|                                  |
|                                       |   rồi mở lại VXShot để tự nạp ảnh.    |                                  |
|                                       |                                       |                                  |
|                                       |   ---------------------------------   |                                  |
|                                       |   Hoặc nhấn Cmd/Ctrl + V để dán ảnh   |                                  |
|                                       |   Hoặc kéo thả tệp ảnh vào đây        |                                  |
|                                       |                                       |                                  |
|                                       |          [ Chọn tệp từ máy... ]       |                                  |
|                                       |                                       |                                  |
|                                       + - - - - - - - - - - - - - - - - - - - +                                  |
|                                                                                                                  |
|                                                                                                                  |
+------------------------------------------------------------------------------------------------------------------+
|  0 × 0 px  |  Zoom: 100%  |  0 doi tuong  |  San sang                                                            |
+------------------------------------------------------------------------------------------------------------------+
```

---

### 3.3. Cửa Sổ Cài Đặt Chuẩn zTools (Settings Modal)

```text
+---------------------------------------------------------------------------------------------------+
|  [:: Drag Region ::] Cài đặt VXShot                                                         [ X ] |
+---------------------------------------+-----------------------------------------------------------+
| CẤU HÌNH CỐT LÕI                      | CẤU HÌNH CHUNG                                            |
|                                       |                                                           |
| [*] Chung (General)                   | [x] Tự động nạp ảnh từ clipboard khi mở ứng dụng          |
| [ ] Trình biên tập (Editor & Canvas)  | [x] Tự động căn chỉnh Zoom vừa cửa sổ (Fit to Window)     |
| [ ] Quyền riêng tư (Privacy)          |                                                           |
|                                       | PHÍM TẮT TOÀN HỆ THỐNG (GLOBAL SHORTCUT)                  |
| ------------------------------------- | Phím tắt mở / hiện VXShot:                                |
| THÔNG TIN & HỖ TRỢ                    | [ Cmd + Shift + X                      ] [ Đặt lại mặc định] |
|                                       |                                                           |
| [ ] Cập nhật (Updates)                | ĐỊNH DẠNG LƯU MẶC ĐỊNH                                    |
| [ ] Giới thiệu (About)                | (o) PNG (Giữ trọn kênh trong suốt Alpha)                  |
| [ ] Ủng hộ tác giả (Support Author)   | ( ) JPEG (Nền trắng cho vùng trống, chất lượng 92%)        |
|                                       |                                                           |
+---------------------------------------+-----------------------------------------------------------+
| [ Khôi phục mặc định ]                                                            [ Đóng ]        |
+---------------------------------------------------------------------------------------------------+
```

---

### 3.4. Tab Ủng Hộ Tác Giả Chuẩn zTools (Support Author Tab with VietQR Card)
Tuân thủ nghiêm ngặt mục 37 trong [desktop_ui_standards.md](../../.agents/desktop_ui_standards.md):
- Tông màu ấm amber với biểu tượng tách cà phê (`Coffee`).
- Lời cảm ơn chân thành từ tác giả **Bùi Việt Linh**.
- Card mã QR VietQR (Vietcombank) nền trắng sắc nét đặt ở vị trí trung tâm, tối ưu để quét trực tiếp từ app ngân hàng (không hiển thị thủ công số tài khoản dài dòng hay nút copy STK).

```text
+---------------------------------------------------------------------------------------------------+
|  [:: Drag Region ::] Cài đặt VXShot                                                         [ X ] |
+---------------------------------------+-----------------------------------------------------------+
| CẤU HÌNH CỐT LÕI                      | ỦNG HỘ TÁC GIẢ (SUPPORT AUTHOR)                           |
|                                       |                                                           |
| [ ] Chung (General)                   | Cảm ơn bạn đã tin dùng VXShot trong bộ công cụ zTools!    |
| [ ] Trình biên tập (Editor & Canvas)  | Nếu tiện ích này giúp bạn tiết kiệm thời gian mỗi ngày,   |
| [ ] Quyền riêng tư (Privacy)          | bạn có thể mời tác giả một tách cà phê ấm áp nhé.         |
| ------------------------------------- |                                                           |
| THÔNG TIN & HỖ TRỢ                    |                 +-----------------------+                 |
|                                       |                 | ##################### |                 |
| [ ] Cập nhật (Updates)                |                 | ##  VietQR VCB     ## |                 |
| [ ] Giới thiệu (About)                |                 | ## [QR CODE TRẮNG] ## |                 |
| [*] Ủng hộ tác giả (Support Author)   |                 | ##                 ## |                 |
|     (Icon Tách Cà Phê Amber)          |                 | ##################### |                 |
|                                       |                 +-----------------------+                 |
|                                       |              Quét mã bằng ứng dụng Ngân hàng              |
|                                       |                    (Vietcombank QR)                       |
+---------------------------------------+-----------------------------------------------------------+
| [ Khôi phục mặc định ]                                                            [ Đóng ]        |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Ma Trận Trạng Thái Thành Phần (Component States Matrix)

| Tên Component | Default | Hover | Active / Selected | Disabled |
| :--- | :--- | :--- | :--- | :--- |
| `ToolButton` | Nền trong suốt, icon màu `slate-300` | Nền `slate-800/60`, icon màu `white` | Nền `cyan-500/20`, viền `cyan-400`, icon `cyan-300` | Mờ nhẹ `opacity-30`, `cursor-not-allowed` |
| `PrimaryExportButton`| Nền `cyan-500`, chữ `white`, font semibold | Nền `cyan-400`, ánh sáng nhẹ `shadow-cyan-500/25` | `active:scale-95`, nền `cyan-600` | Nền `slate-700`, chữ `slate-400` (khi chưa có ảnh) |
| `SecondarySaveButton` | Nền `slate-800`, viền `slate-700`, chữ `slate-200` | Nền `slate-700`, viền `slate-600`, chữ `white` | `active:scale-95`, nền `slate-600` | Nền `slate-900/50`, viền mờ `opacity-30` |
| `CanvasResizeHandle` | Hình vuông 8x8px, nền `white`, viền `slate-700` 1px | Phóng to 10x10px, viền `cyan-400` | Đổi con trỏ chuột sang resize (`ew-resize`, `ns-resize`) | Ẩn khi đang kết xuất xuất ảnh |
| `RecentDropdownItem` | Nền trong suốt, chữ `slate-300`, tên file nổi bật | Nền `slate-800`, chữ `white`, tooltip hiện đường dẫn | Nền `cyan-500/10`, chữ `cyan-300` | Không có |

---

## 5. Quy Tắc Thích Ứng Cửa Sổ (Responsive & Window Resizing Rules)

| Kích Thước Cửa Sổ | Hành Vi Bố Cục Giao Diện |
| :--- | :--- |
| **Kích thước mặc định:** `1200px × 800px` | Hiển thị trọn vẹn toàn bộ công cụ Top HUD, Sub-bar và đầy đủ nhãn trên Bottom Status Bar. |
| **Kích thước nhỏ gọn:** `960px × 600px` | Top HUD tự động co cụm khoảng cách giữa các nhóm nút (từ `gap-2` xuống `gap-1`). |
| **Giới hạn tối thiểu (Min Window Size):** `760px × 480px` | Giới hạn cứng của cửa sổ; thanh Top HUD và Status bar được cố định tối thiểu 760px, đảm bảo không bao giờ bị tràn (overflow) hoặc gãy dòng giao diện. |

---

## 6. Đoạn Mô Tả Dựng Giao Diện Dành Cho AI UI Agent (Visual Wireframe Prompt)

```text
A sleek, modern desktop screenshot utility editor window named "VXShot" built with a dark slate navy theme (#0F1117) and electric cyan accents (#06B6D4). 

At the very top is a unified 32px native-style chrome titlebar with macOS native-dimension traffic lights on the far left, followed by a crisp 16px camera-crosshair app icon and semibold "VXShot" label (12px/600), open file button with recent files dropdown, undo/redo buttons, and zoom controls (+ / - / 100% / Fit) on the right.

Floating centered below the titlebar is an ultra-compact floating tool HUD pill with a frosted glass backdrop (backdrop-blur-md) containing distinct icon groups: Selection Pointer, Shapes (Rectangle, Ellipse, Arrow, Line, Pen), Markup (Text, Auto-increment Step Badges, Semitransparent Highlight), and Privacy Redaction (Solid Color Redact Block, Blur). A slim secondary options bar sits directly beneath, offering 6 color swatch dots, stroke width toggles (2px, 4px, 8px), and font sizes.

The main canvas viewport features a subtle dark dot grid background (#090A0F) with a clearly defined white/transparent canvas frame bounded by 8 subtle square transform handles. Inside the canvas sits a crisp screenshot annotated with a numbered circular step badge "1", a sharp electric cyan arrow, and a solid charcoal redaction block over sensitive credentials. Parts of elements extending outside the canvas boundary are smoothly dimmed out.

At the bottom is a 30px frosted status bar displaying image dimensions "1920 × 1080 px" in monospace font, zoom level "100%", an object counter, and two high-contrast action buttons on the far right: a secondary "Save Image (Cmd+S)" button and an eye-catching primary "Copy Result (Cmd+Shift+C)" button glowing with electric cyan. High desktop density, clean typography, zero clutter.
```
