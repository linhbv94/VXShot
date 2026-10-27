# 02. Luồng Tính năng & Logic Hệ thống — VXShot (`_spec2_feature_flow`)

> **Tên sản phẩm:** VXShot (Cross-platform Quick Clipboard Image Editor & Annotator)  
> **Thư mục tài liệu:** `vxshot/docs/spec/`  
> **Phiên bản:** 1.0.0  
> **Ngày cập nhật:** 2026-10-27  
> **Tài liệu liên quan:** [00_system_overview.md](00_system_overview.md) | [01_business_process.md](01_business_process.md) | [VXShot_Scope_v1.0.md](../../VXShot_Scope_v1.0.md)

---

## 1. Sơ đồ Luồng Người dùng Chi tiết (User Flow Diagrams)

### 1.1. Luồng 1: Khởi động Ứng dụng & Nạp Tự động từ Clipboard (App Activation & Hydration)

```mermaid
graph TD
    Trigger([Kích hoạt: Mở Icon hoặc bấm Hotkey Cmd/Ctrl+Shift+X]) --> CheckRunning{App đang chạy ngầm?}
    
    CheckRunning -- Chưa chạy --> BootApp[Khởi chạy Tauri Process & Dựng Webview]
    CheckRunning -- Đang chạy --> FocusWindow[Đưa cửa sổ lên phía trước & Active Window]
    
    BootApp --> CheckDirty{Canvas hiện tại có đang Dirty?}
    FocusWindow --> CheckDirty
    
    CheckDirty -- Đang Dirty (Có bài chưa lưu) --> KeepFocus[Giữ nguyên bài cũ & Hiển thị Banner nhắc phiên dở dang]
    CheckDirty -- Sạch / Mới khởi động --> QueryClip[Gọi Rust Command read_clipboard_image]
    
    QueryClip --> HasImage{Clipboard có chứa ảnh?}
    HasImage -- Có ảnh hợp lệ --> LoadImage[Tạo ImageNode gốc, Canvas Frame = Kích thước ảnh pixel thực]
    HasImage -- Không có ảnh --> ShowEmpty[Hiển thị Màn hình Trống: Kéo thả / Dán phím / Mở file]
    
    LoadImage --> FitZoom[Tự động tính tỉ lệ Zoom tối ưu vừa khung nhìn cửa sổ]
    FitZoom --> ReadyState([Trạng thái Sẵn sàng Chỉnh sửa / Lưu])
```

---

### 1.2. Luồng 2: Lựa chọn & Thao tác Công cụ Chú thích (Annotation & Tool Switching)

```mermaid
graph TD
    ReadyState([Trạng thái Sẵn sàng]) --> SelectTool[Người dùng chọn công cụ trên thanh Top HUD hoặc Phím tắt]
    
    SelectTool --> ToolType{Kiểu công cụ?}
    
    ToolType -- Select (V) --> ModeSelect[Chế độ chọn: Click chọn đối tượng, hiện Transform Handles, Kéo di chuyển]
    ToolType -- Shapes (Rect R, Ellipse O, Line L, Arrow A) --> ModeShape[Chế độ vẽ hình: Kéo thả chuột trên canvas để xác định tọa độ và kích thước]
    ToolType -- Text (T) --> ModeText[Chế độ văn bản: Click để đặt ô nhập chữ, gõ nội dung, tự co giãn theo nội dung]
    ToolType -- Counter Step (S) --> ModeStep[Chế độ đánh số: Click để đặt nhãn số tự động tăng 1, 2, 3...]
    ToolType -- Solid Redact (B) --> ModeRedact[Chế độ che thông tin: Kéo khối chữ nhật màu đặc phủ lên vùng nhạy cảm]
    ToolType -- Highlight (H) --> ModeHigh[Chế độ tô sáng: Kéo vệt chữ nhật có opacity 35% màu vàng/cyan]
    
    ModeShape & ModeText & ModeStep & ModeRedact & ModeHigh --> CommitObject[Nhả chuột: Hoàn tất đối tượng, đẩy vào Layer Tree]
    CommitObject --> PushHistory[Ghi nhận trạng thái mới vào Undo History Stack]
    PushHistory --> MarkDirty[Đánh dấu Canvas is_dirty = true]
    MarkDirty --> AutoSelect[Tự động chuyển về công cụ Select để sẵn sàng chỉnh sửa tiếp]
```

---

### 1.3. Luồng 3: Động cơ Lịch sử Thao tác (Undo / Redo Engine)

```mermaid
graph TD
    UserAction[Hành động làm biến đổi Canvas: Thêm, Xóa, Di chuyển, Resize, Đổi màu, Co giãn Canvas] --> PushState[Sao lưu Bản chụp Trạng thái hiện tại Snapshot]
    
    PushState --> TruncateRedo[Xóa sạch nhánh Redo Stack hiện có]
    TruncateRedo --> CheckDepth{Độ sâu Stack > 50 bước?}
    CheckDepth -- Có --> ShiftOldest[Loại bỏ bước cũ nhất ở đáy Stack - FIFO]
    CheckDepth -- Không --> AddStep[Thêm Snapshot vào đỉnh Undo Stack]
    
    AddStep --> IdleState([Chờ lệnh tiếp theo])
    
    IdleState --> UndoTrigger[Người dùng nhấn Cmd/Ctrl + Z]
    UndoTrigger --> CanUndo{Undo Stack > 1 bước?}
    CanUndo -- Có --> PopUndo[Lấy trạng thái trước đó ra khỏi Undo Stack]
    PopUndo --> PushRedo[Đưa trạng thái hiện tại vào Redo Stack]
    PushRedo --> ApplySnapshot[Khôi phục đối tượng trên Konva Stage]
    CanUndo -- Không --> IgnoreUndo[Không làm gì - Nút Undo bị Disable]
    
    IdleState --> RedoTrigger[Người dùng nhấn Cmd/Ctrl + Shift + Z]
    RedoTrigger --> CanRedo{Redo Stack có dữ liệu?}
    CanRedo -- Có --> PopRedo[Lấy trạng thái kế tiếp từ Redo Stack]
    PopRedo --> PushUndoAgain[Đẩy lại vào Undo Stack]
    PushUndoAgain --> ApplySnapshot
    CanRedo -- Không --> IgnoreRedo[Không làm gì - Nút Redo bị Disable]
```

---

### 1.4. Luồng 4: Mở rộng Ranh giới Canvas & Cắt cúp Khi Xuất (Canvas Resize & Viewport Clipping)

```mermaid
graph TD
    StartResize[Kéo tay nắm ranh giới Canvas hoặc chọn Preset mở rộng] --> LiveAdjust[Hiển thị viền nét đứt và kích thước mới realtime W x H px]
    
    LiveAdjust --> ReleaseMouse[Nhả chuột: Xác nhận kích thước Canvas mới]
    ReleaseMouse --> UpdateBounds[Cập nhật khung Canvas Frame kích thước mới]
    UpdateBounds --> ClipView[Vùng canvas giữ nguyên hiển thị, đối tượng nằm ngoài bị che mờ]
    
    ClipView --> ExportEvent{Thực hiện Copy Result hoặc Save Image?}
    ExportEvent -- Có --> PrepareExport[Tạo Stage ẩn kích thước bằng đúng Canvas Frame W x H]
    PrepareExport --> DrawElements[Vẽ lại tất cả đối tượng theo tọa độ tương đối của Canvas Frame]
    DrawElements --> DiscardOut[Tất cả pixel nằm ngoài Canvas Frame tự động bị cắt bỏ 100%]
    DiscardOut --> RasterOutput([Kết xuất Bitmap Raster chuẩn kích thước])
```

---

## 2. Sơ đồ Tuần tự Hệ thống (System Sequence Diagrams)

### 2.1. Tuần tự 1: Đọc Ảnh Clipboard Native & Dựng Stage (Native Clipboard Read & Stage Hydration)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as React WebView UI
    participant Store as Canvas State Store
    participant Bridge as Tauri IPC Bridge
    participant Rust as Rust Native Core (arboard)
    participant OS as OS Clipboard API
    
    User->>UI: Mở App hoặc Nhấn Phím tắt Toàn hệ thống
    UI->>Store: Kiểm tra trạng thái is_dirty
    Store-->>UI: is_dirty = false (Sạch)
    UI->>Bridge: invoke("read_clipboard_image")
    Bridge->>Rust: Thực thi hàm đọc clipboard native
    Rust->>OS: Truy vấn dữ liệu hình ảnh (NSPasteboard / Win32)
    ALT Clipboard có ảnh
        OS-->>Rust: Trả về Binary Bitmap (PNG / DIBV5 RGBA)
        Rust->>Rust: Chuyển đổi thành chuỗi Base64 Data URL + Kích thước (w, h)
        Rust-->>Bridge: Trả về ClipboardImagePayload { data_url, width, height }
        Bridge-->>UI: Payload JSON
        UI->>Store: Khởi tạo Base Image Object & Set Canvas Size (width, height)
        UI->>UI: Dựng Konva Stage & Tự căn chỉnh Zoom vừa cửa sổ
        UI-->>User: Hiển thị ảnh tức thì trên màn hình
    ELSE Clipboard không có ảnh
        OS-->>Rust: Rỗng hoặc định dạng không hỗ trợ
        Rust-->>Bridge: Trả về None / Error("NO_IMAGE")
        Bridge-->>UI: Trả về rỗng
        UI-->>User: Hiển thị màn hình đón tiếp (Empty State Dropzone)
    END
```

---

### 2.2. Tuần tự 2: Hợp nhất Toàn bộ Lớp & Ghi ngược vào Clipboard (Flatten & Copy Result)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as React WebView UI
    participant Konva as Konva Stage Engine
    participant Bridge as Tauri IPC Bridge
    participant Rust as Rust Native Core
    participant OS as OS Clipboard
    
    User->>UI: Click nút "Copy Result" hoặc Cmd/Ctrl+Shift+C
    UI->>UI: Lưu current_revision làm revision xuất
    UI->>Konva: Dựng Offscreen Stage ảo (scale=1, x=0, y=0, lọc bỏ handles & dot grid)
    Konva->>Konva: Kết xuất toàn bộ Layer thành Raster Bitmap duy nhất
    Konva-->>UI: Trả về ArrayBuffer PNG dữ liệu thô (Raw Bytes)
    UI->>Bridge: invoke("write_clipboard_image", { payload: { image_bytes, width, height, has_alpha } })
    Bridge->>Rust: Nhận payload chứa mảng bytes PNG và kích thước
    Rust->>OS: Ghi dữ liệu ảnh PNG 32-bit RGBA vào Clipboard hệ điều hành
    OS-->>Rust: Xác nhận ghi thành công
    Rust-->>Bridge: Ok(())
    Bridge-->>UI: Thành công
    UI-->>User: Hiển thị Toast thông báo: "Đã sao chép thành phẩm vào Clipboard"
    User->>OS: Mở Slack/Docs nhấn Cmd/Ctrl+V để dán ảnh
```

---

### 2.3. Tuần tự 3: Lưu Ảnh Thành Phẩm Ra Ổ Cứng (Save Image File Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as React WebView UI
    participant Konva as Konva Stage Engine
    participant Bridge as Tauri IPC Bridge
    participant Rust as Rust File System
    participant OS as OS Native Save Dialog
    
    User->>UI: Nhấn Cmd/Ctrl + S hoặc Click nút "Save Image"
    UI->>Bridge: invoke("open_save_dialog", { options: { default_name: "VXShot_capture.png", default_extension: "png" } })
    Bridge->>Rust: Gọi dialog::FileDialogBuilder
    Rust->>OS: Mở hộp thoại lưu tệp native của Windows / macOS
    User->>OS: Chọn thư mục lưu, đặt tên tệp, chọn định dạng (PNG/JPEG)
    OS-->>Rust: Trả về đường dẫn tuyệt đối (file_path)
    Rust-->>Bridge: Trả về file_path đã chọn (hoặc None nếu Cancel)
    
    ALT Người dùng không Cancel
        Bridge-->>UI: FilePath đã xác nhận
        UI->>UI: Ghi nhận snapshot_revision = document_revision
        UI->>Konva: Yêu cầu kết xuất raster từ Offscreen Stage (scale=1)
        ALT Định dạng là JPEG
            Konva->>Konva: Tô nền trắng (#ffffff) cho vùng trong suốt + nén 92%
        ELSE Định dạng là PNG
            Konva->>Konva: Bảo toàn kênh trong suốt (Alpha)
        END
        Konva-->>UI: Trả về Binary Array Buffer (image_bytes)
        UI->>Bridge: invoke("save_image_file", { options: { file_path, image_bytes, format } })
        Bridge->>Rust: Ghi tệp an toàn (Atomic staging file -> rename)
        Rust-->>Bridge: Ok(SaveFileResult { success: true, file_path, bytes_written })
        Bridge-->>UI: Thành công
        ALT document_revision == snapshot_revision (Không có sửa đổi mới trong lúc lưu)
            UI->>UI: Đặt lại trạng thái is_file_dirty = false
        END
        UI-->>User: Toast: "Đã lưu tệp thành công tại [Tên tệp]"
    ELSE Người dùng nhấn Cancel
        Bridge-->>UI: None
        UI-->>User: Giữ nguyên màn hình làm việc
    END
```

---

## 3. Máy Trạng thái Hệ thống (Finite State Machines — FSM)

### 3.1. FSM 1: Vòng đời Ứng dụng & Trạng thái Phiên Làm Việc (Application Lifecycle FSM)

```text
┌────────────────────────────────────────────────────────────────────────┐
│               MA TRẬN CHUYỂN TRẠNG THÁI VÒNG ĐỜI ỨNG DỤNG              │
├─────────────────┬──────────────────────┬───────────────────────────────┤
│ Trạng thái Hiện │ Sự kiện Kích hoạt    │ Trạng thái Đích & Hành động   │
├─────────────────┼──────────────────────┼───────────────────────────────┤
│ `EMPTY_IDLE`    │ Đọc clipboard có ảnh │ → `IMAGE_LOADED` (Nạp ảnh gốc)│
│ `EMPTY_IDLE`    │ Kéo thả tệp vào app  │ → `IMAGE_LOADED` (Nạp tệp ảnh)│
├─────────────────┼──────────────────────┼───────────────────────────────┤
│ `IMAGE_LOADED`  │ Thêm chú thích / sửa │ → `EDITING_DIRTY`             │
│ `IMAGE_LOADED`  │ Bấm Cmd+S lưu ngay   │ → `SAVED_CLEAN` (Lưu ảnh gốc) │
│ `IMAGE_LOADED`  │ Bấm Copy Result      │ → `SAVED_CLEAN` (Ghi clipbrd) │
├─────────────────┼──────────────────────┼───────────────────────────────┤
│ `EDITING_DIRTY` │ Thêm / sửa đối tượng │ → `EDITING_DIRTY` (Push stack)│
│ `EDITING_DIRTY` │ Bấm Undo về bước đầu │ → `IMAGE_LOADED` (Hết dirty)  │
│ `EDITING_DIRTY` │ Bấm Cmd+S lưu tệp    │ → `SAVED_CLEAN` (Ghi đĩa OK)  │
│ `EDITING_DIRTY` │ Đóng app / Phím tắt  │ → `PROMPT_UNSAVED` (Hỏi user) │
├─────────────────┼──────────────────────┼───────────────────────────────┤
│ `SAVED_CLEAN`   │ Thêm chú thích mới   │ → `EDITING_DIRTY`             │
│ `SAVED_CLEAN`   │ Mở ảnh mới hoàn toàn │ → `IMAGE_LOADED` (Thay ảnh)   │
└─────────────────┴──────────────────────┴───────────────────────────────┘
```

---

### 3.2. FSM 2: Máy Trạng thái Công cụ Biên tập (Editor Tool FSM)

```mermaid
stateDiagram-v2
    [*] --> SELECT_MODE : Mặc định khi nạp ảnh
    
    SELECT_MODE --> DRAW_SHAPE : Chọn Rect / Ellipse / Arrow / Line
    SELECT_MODE --> DRAW_TEXT : Chọn Text Tool
    SELECT_MODE --> DRAW_STEP : Chọn Counter Step Tool
    SELECT_MODE --> DRAW_REDACT : Chọn Solid Redact Block
    SELECT_MODE --> DRAW_HIGHLIGHT : Chọn Highlight Tool
    SELECT_MODE --> TRANSFORMING : Click chọn đối tượng có sẵn
    
    DRAW_SHAPE --> SELECT_MODE : Nhả chuột (MouseUp hoàn tất hình)
    DRAW_TEXT --> SELECT_MODE : Bấm ra ngoài ô gõ chữ (Blur)
    DRAW_STEP --> DRAW_STEP : Click liên tiếp để đặt các số 1, 2, 3...
    DRAW_STEP --> SELECT_MODE : Bấm phím ESC hoặc chọn công cụ khác
    DRAW_REDACT --> SELECT_MODE : Nhả chuột (MouseUp hoàn tất khối che)
    DRAW_HIGHLIGHT --> SELECT_MODE : Nhả chuột hoàn tất vệt sáng
    
    TRANSFORMING --> SELECT_MODE : Click ra vùng trống canvas
```

---

## 4. Giao ước Thực thi Dành cho AI Dev Agents (Machine-Readable Logic Contracts)

### Contract 1: `hydrate_from_clipboard`
- **Mục tiêu:** Tự động đọc và nạp ảnh từ clipboard khi mở app hoặc kích hoạt phím tắt.
- **Tiền điều kiện (Pre-conditions):** Cửa sổ app đang active VÀ `canvas_state.is_dirty == false`.
- **Các bước thực thi (Execution Logic):**
  1. Gửi lệnh IPC `invoke("read_clipboard_image")`.
  2. Nếu trả về `Result::Ok(payload)`:
     - Tạo một `ImageNode` với `id: "base_image"`, `x: 0`, `y: 0`, `width: payload.width`, `height: payload.height`, `src: payload.data_url`.
     - Cập nhật `canvas_state.width = payload.width`, `canvas_state.height = payload.height`.
     - Xóa sạch danh sách annotations hiện tại.
     - Đặt `canvas_state.is_dirty = false`.
     - Tính toán `zoom_level = calculate_fit_zoom(window_width, window_height, payload.width, payload.height)`.
  3. Nếu trả về `Result::Err(_)`:
     - Chuyển `canvas_state.view_mode = "EMPTY"`.
- **Hậu điều kiện (Post-conditions):** Canvas hiển thị ảnh gốc ở chế độ Fit Zoom, thanh trạng thái hiển thị đúng kích thước ảnh.

---

### Contract 2: `paste_secondary_image`
- **Mục tiêu:** Dán thêm ảnh mới từ clipboard vào canvas hiện tại khi người dùng nhấn `Cmd/Ctrl + V`.
- **Tiền điều kiện (Pre-conditions):** App đang mở VÀ người dùng nhấn phím tắt Paste VÀ không có ô Text Input nào đang focus.
- **Các bước thực thi (Execution Logic):**
  1. Gọi IPC `invoke("read_clipboard_image")`.
  2. Nếu có ảnh:
     - Sinh `new_id = "img_" + uuid_v4()`.
     - Tính toán vị trí hiển thị: Đặt ở giữa khung nhìn hiện tại (Viewport Center) hoặc lệch `+30px` so với ảnh gần nhất.
     - Thêm `ImageNode` vào danh sách `canvas_state.images` với Z-index cao nhất.
     - Nếu ảnh dán có kích thước vượt ra ngoài ranh giới Canvas Frame hiện tại:
       - **Không tự ý mở rộng Canvas Frame** (tuân thủ Scope v1.0).
       - Hiển thị thông báo gợi ý: *"Ảnh dán vượt ngoài ranh giới. Kéo tay nắm canvas để mở rộng vùng hiển thị."*
     - Chọn ngay ảnh mới dán và bật `Transformer` handles để người dùng co giãn/di chuyển.
     - Đặt `canvas_state.is_dirty = true`.
     - Đẩy bản chụp vào `undo_stack`.
- **Hậu điều kiện (Post-conditions):** Ảnh mới trở thành một đối tượng độc lập, có thể chỉnh sửa riêng biệt.

---

### Contract 3: `export_flattened_image`
- **Mục tiêu:** Kết xuất toàn bộ đối tượng thành một ảnh raster duy nhất theo đúng pixel gốc của Canvas Frame, độc lập 100% với mức zoom/pan của màn hình hiển thị.
- **Tiền điều kiện (Pre-conditions):** `target in ["CLIPBOARD", "FILE"]` VÀ `canvas_state.width > 0` VÀ `canvas_state.height > 0`.
- **Các bước thực thi (Execution Logic):**
  1. Ghi nhận `export_revision = canvas_state.document_revision`.
  2. **Đường nhanh Phase 1 (Phase 1 Fast-Path):**
     - Nếu `canvas_state.annotations.length == 0` VÀ `canvas_state.images.length == 1` VÀ chưa thay đổi kích thước canvas:
       - Trích xuất trực tiếp buffer bitmap gốc từ `base_image`, chuyển đổi sang định dạng mong muốn mà không cần dựng stage ảo.
  3. **Đường dựng Stage Cách Ly (Phase 2 & 3 Isolated Offscreen Stage):**
     - Dựng một cây DOM Konva Stage ảo (Offscreen Stage) hoàn toàn độc lập với stage màn hình chính:
       - Cấu hình cố định: `x: 0`, `y: 0`, `scaleX: 1`, `scaleY: 1`.
       - Kích thước đúng bằng Canvas Frame: `width: canvas_state.width`, `height: canvas_state.height`.
     - Sao chép toàn bộ danh sách `ImageNode` và `AnnotationNode` sang stage ảo (loại bỏ hoàn toàn transformer handles, viền chọn, dot grid và overlay vùng ngoài).
     - Áp dụng `SolidRedactNode`: Ghi đè màu đặc (alpha 255) trực tiếp lên ma trận điểm ảnh.
     - Nếu định dạng xuất là `"JPEG"`: Đặt lớp nền đáy là màu trắng (`#ffffff`), áp dụng chất lượng nén `0.92`.
     - Nếu định dạng xuất là `"PNG"`: Bảo toàn kênh trong suốt (Alpha 32-bit).
  4. Gọi hàm kết xuất raster: `offscreen_stage.toBlob({ mimeType: format_mime, pixelRatio: 1 })`.
  5. Chuyển Blob thành mảng bytes thô (`Uint8Array` / `Vec<u8>`).
  6. Nếu thao tác là `"CLIPBOARD"`:
     - Gọi IPC `invoke("write_clipboard_image", { payload: { image_bytes, width, height, has_alpha } })`.
     - Hiển thị toast: *"Đã sao chép thành phẩm vào Clipboard"*. (Lưu ý: Không xóa cờ `is_file_dirty` vì file trên đĩa vẫn chưa được lưu).
  7. Nếu thao tác là `"FILE"`:
     - Gọi IPC `invoke("save_image_file", { options: { file_path, image_bytes, format } })`.
     - Sau khi nhận kết quả `SaveFileResult::success`:
       - Nếu `canvas_state.document_revision == export_revision` (người dùng không thực hiện thêm thao tác mới trong lúc đang mở dialog lưu): Đặt `canvas_state.is_file_dirty = false`.
  8. Giải phóng hoàn toàn `offscreen_stage` trong khối `finally` để thu hồi bộ nhớ GPU/RAM.
- **Hậu điều kiện (Post-conditions):** Ảnh raster hoàn chỉnh được xuất ra chuẩn kích thước pixel gốc, ma trận điểm ảnh bị che được phá hủy vĩnh viễn, không rò rỉ bộ nhớ.


## Baseline phát hành 1.0.0 — QA độc lập 2026-10-27

- Phạm vi thực tế: một ảnh PNG/JPEG nền + annotation Canvas2D, zoom/pan, undo/redo, PNG/JPEG save và copy bitmap. Clipboard/file engine Rust dùng chung macOS/Windows. Multi-image, crop/resize/transform handles và sửa đối tượng sau tạo chưa triển khai; các mục đó trong thiết kế là roadmap, không thuộc nghiệm thu1.0.0.
- Focus/global shortcut không thay ảnh đã mở. Chỉ tự hydrate canvas trống khi bật auto-hydrate; đọc lại settings trước lần đầu. Paste/Open chủ động hỏi xác nhận nếu annotation khác snapshot vừa Save/Copy; stale clipboard results bị bỏ. Native dialog/focus không reset history.
- Save/Copy chụp snapshot annotation, chặn updater trước download nếu còn thay đổi chưa xuất hoặc thao tác đang chạy. Solid redaction vẽ lại ở pass cuối (cả preview/export), làm tròn ra ngoài pixel; mosaic lấy ảnh gốc không được phủ ngược lên vùng che. Màu đen opaque giữ nguyên.
- File input/export decode giới hạn8192px/33.2MP,64MiB encoded/256MiB decode allocation. Save kiểm format, dùng tempfile create-new cùng volume + sync + atomic persist, cleanup khi lỗi; từ chối đích symlink/thư mục. Chọn PNG/JPEG theo extension trong dialog; file hỏng không ghi đè đích.
- Settings IPC dùng rename_all snake_case cho new_settings. Updates thật: startup check im lặng khi mạng lỗi, manual retry, available/download/install/restart; không tự install. Chỉ GitHub updater dùng mạng, không upload ảnh. Giữ com.vxshot.desktop, khóa updater riêng, SDK27.0, Win currentUser.
- Recent menu chưa hoạt động được ẩn; không báo đã có tính năng roadmap. QA runtime và CI/package/public ghi riêng ở release review/evidence.


## Hồi quy native 1.0.1 — chốt nét vẽ nhanh

NativeQA1.0.0 xác nhận Save/Cancel giữ annotation/history. Tuy nhiên kéo khối che nhanh có thể chỉ hiện preview mà không commit vào annotations, nên ảnh xuất không chứa mask. Dùng refs đồng bộ cho drawing/start/points/preview, nhận mouseup ở window và consume nét vẽ đúng một lần trước React render. Preview/history/export phải thống nhất; duplicate mouseup không thêm hai đối tượng. Không thay engine clipboard/file, app identity, updater key hoặc SDK.
