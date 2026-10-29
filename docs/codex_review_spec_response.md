**Kết luận: kiến trúc khả thi, nhưng bộ spec chưa đủ nhất quán để dùng trực tiếp làm contract triển khai.** Cần chốt lại IPC, export, vòng đời phiên và an toàn lưu tệp trước Phase 1. Các cam kết về alpha, ảnh 8K và redaction cần bằng chứng runtime riêng.

Đã đọc toàn bộ 7 spec, scope và quy chuẩn UI được tham chiếu. Đây là review tài liệu; không sửa file, không chạy build/runtime và không gọi agent khác.

**1. [Cao] Contract IPC đang có nhiều phiên bản không tương thích**

Đối chiếu [02_feature_flow.md](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/02_feature_flow.md:160) với [04_api_data.md](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/04_api_data.md:22):

| Hạng mục | Luồng/contract trong `02` | Khai báo trong `04` | Vấn đề |
|---|---|---|---|
| Ghi clipboard | `{ image_bytes }` hoặc `{ bytes }` | `{ payload: WriteClipboardPayload }` | Khác tên và cấu trúc |
| Lưu ảnh | `{ file_path, data_bytes, format }` hoặc `{ path, bytes, format }` | `file_path, data_base64, format` | Binary và Base64 chưa thống nhất |
| Save dialog | `{ default_name }` | `options: SaveDialogOptions` | Thiếu lớp `options` |
| Kết quả lưu | `Ok(bytes_written)` | `SaveFileResult` | Chưa định nghĩa kiểu kết quả |
| Lỗi | `None`, `"NO_IMAGE"`, JSON error code | `Result<…, String>` | Không có quy tắc ánh xạ thống nhất |

`WriteClipboardPayload`, `SaveDialogOptions`, `ExportFormat`, `SaveFileResult` chưa được định nghĩa. Tauri cũng mặc định dùng camelCase cho tên argument; nếu chọn snake_case cần khai báo `rename_all = "snake_case"` và thống nhất serialization của struct. [Tài liệu Tauri](https://v2.tauri.app/develop/calling-rust/).

**Khuyến nghị:** chốt một contract duy nhất cho từng command, gồm payload, kết quả, cancellation, lỗi có cấu trúc và ví dụ `invoke` hợp lệ. Chọn rõ bên nào encode PNG/JPEG; hiện frontend đã encode nhưng overview vẫn giao encoder cho Rust.

**2. [Cao] `pixelRatio: 1` chưa bảo đảm export độc lập zoom/pan**

[Contract export](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/02_feature_flow.md:312) chỉ đặt vùng xuất và `pixelRatio`, chưa loại bỏ transform của viewport. Trong khi đó overview nói tạm ngắt scale, còn luồng resize lại tạo stage ẩn.

`pixelRatio` điều khiển mật độ raster đầu ra; nó không tự khôi phục hệ tọa độ tài liệu khi stage hoặc group vẫn chịu zoom/pan. [Tài liệu Konva](https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html).

Nên thống nhất:

- Chụp snapshot state tại thời điểm xuất.
- Dựng cây nội dung xuất riêng, `scale = 1`, không mang viewport pan.
- Xuất đúng `canvas_width × canvas_height`, cắt theo canvas bounds.
- Loại grid, checkerboard, handles, selection và overlay khỏi cây xuất.
- Chờ ảnh/font sẵn sàng; giải phóng tài nguyên trong `finally`.

Stage xuất riêng ít ảnh hưởng màn hình hơn việc detach hoặc sửa stage React đang quản lý, đổi lại tăng bộ nhớ đỉnh. Phase 1 có thể encode trực tiếp bitmap gốc nếu chưa có chỉnh sửa, tránh dựng thêm stage toàn kích thước.

**3. [Cao] Model redaction cho phép trạng thái không đáp ứng cam kết bảo mật**

Trong [04_api_data.md](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/04_api_data.md:211), `SOLID_REDACT` dùng chung model có:

- `opacity` tùy ý.
- `fill_color` không bắt buộc.
- `corner_radius` mặc định 4px.
- `rotation` không bị giới hạn.

Những thuộc tính này có thể để lộ pixel ở góc hoặc biên, trái tiêu chí [QA yêu cầu toàn bounding box là RGBA đặc](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/05_qa_acceptance.md:79).

**Khuyến nghị:** định nghĩa redaction riêng với fill bắt buộc, alpha 255, opacity 1, không bo góc. Cách đơn giản nhất cho bản đầu là khối chữ nhật không xoay; ghi đè vùng pixel đã chuẩn hóa trên raster cuối trước khi encode. Nếu hỗ trợ xoay phải định nghĩa mask và quy tắc bao phủ biên.

Bổ sung kiểm thử tọa độ lẻ, resize, zoom, sát mép canvas, nhiều ảnh và cả clipboard. JPEG cần tiêu chí riêng vì nén lossy không bảo đảm mọi pixel sau giải mã giữ đúng màu tuyệt đối.

Cam kết bảo mật nên giới hạn ở **vùng được che trong ảnh xuất**. Ảnh gốc và Undo vẫn tồn tại trong phiên; clipboard history hoặc ứng dụng ngoài VXShot nằm ngoài bảo đảm này.

**4. [Cao] Vòng đời phiên có nguy cơ làm mất khả năng chỉnh sửa**

[FSM](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/02_feature_flow.md:230) cho Copy Result chuyển sang `SAVED_CLEAN`, nhưng contract export chỉ xóa dirty sau lưu tệp. Ngoài ra, Undo về bước đầu luôn được coi là hết dirty, dù người dùng có thể đã lưu ở một revision khác.

Tình huống cần xử lý rõ: sửa → xuất ảnh phẳng → focus lại app → auto-hydrate thay toàn bộ đối tượng bằng ảnh clipboard. File ảnh phẳng không bảo toàn phiên chỉnh sửa.

Nên tách:

- `document_revision`.
- Revision đã export ra file/clipboard.
- Quyền thay thế phiên hiện tại.
- Trạng thái đang đọc hoặc đang export.

Cần kiểm tra revision **sau khi** thao tác bất đồng bộ hoàn tất. Nếu người dùng sửa tiếp trong lúc lưu, kết quả lưu cũ không được đặt phiên mới thành clean.

Các event shortcut, focus và clipboard change cũng cần chống kích hoạt trùng và bỏ kết quả đọc đã lỗi thời. `Ok(None)` hiện chưa có nhánh trong `hydrate_from_clipboard`; lỗi đọc không nên làm biến mất phiên đang có.

**5. [Cao] Giới hạn 16384 × 16384 không phải ngân sách bộ nhớ an toàn**

[Ma trận rủi ro](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/01_business_process.md:245) dùng giới hạn cạnh như biện pháp chống OOM, trong khi QA không giới hạn cứng tổng lượng ảnh.

Ước tính cho một buffer RGBA:

| Kích thước | Bộ nhớ |
|---|---:|
| 3840 × 2160 | 31,6 MiB |
| 7680 × 4320 | 126,6 MiB |
| 16384 × 16384 | 1024 MiB |

Đây chưa gồm bitmap nguồn, canvas hiển thị, hit canvas, export canvas, cache, Base64 và IPC. Zoom nhỏ chỉ giảm hiển thị nếu backing canvas được thiết kế tương ứng.

Konva xác nhận mỗi layer là một canvas riêng; giới hạn kích thước và diện tích canvas còn phụ thuộc trình duyệt. [Hiệu năng Konva](https://konvajs.org/docs/performance/All_Performance_Tips.html), [giới hạn export](https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html).

**Khuyến nghị:** giới hạn tổng decoded pixels, số ảnh, bộ nhớ export dự kiến và số thao tác đồng thời; kiểm tra trước cấp phát. History nên tham chiếu asset bất biến thay vì serialize lại Base64 vào từng snapshot. Chỉ destroy asset cũ sau khi ảnh thay thế đã nạp thành công.

**6. [Cao] Bridge clipboard chưa đủ chi tiết để cam kết bảo toàn alpha**

[Overview](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/00_system_overview.md:63) định hướng đúng, nhưng chưa chốt adapter đọc/ghi và fallback.

`arboard::get_image` trả decoded pixels; `set_image` nhận `ImageData`, không nhận trực tiếp PNG bytes. Tài liệu công khai cũng không bảo đảm mọi định dạng ảnh từ ứng dụng khác đều đọc được. Vì vậy không thể suy ra dùng `arboard` là đã đáp ứng PNG/DIBV5/TIFF và alpha. [API arboard](https://docs.rs/arboard/latest/arboard/struct.Clipboard.html).

Cần bổ sung:

- Windows: định dạng PNG đã đăng ký, thứ tự fallback, DIB row orientation/stride, channel masks, BGRA/RGBA và cách xử lý alpha không xác định.
- macOS: chọn representation theo kích thước pixel thực, chuẩn hóa premultiplied alpha và chính sách màu.
- Ghi clipboard: mọi representation phải sinh từ **cùng ảnh đã flatten/redact**, không còn representation nguồn nhạy cảm.
- Serialize truy cập clipboard, retry hữu hạn; decode/encode nặng không chạy trên UI thread.

Tên `image/png` là mô tả chưa đủ cho Win32; cần chỉ rõ registered format thực tế. [Microsoft Clipboard Formats](https://learn.microsoft.com/en-gb/windows/desktop/dataxchg/clipboard-formats).

**7. [Cao] “Ghi tệp an toàn” chưa có contract chống mất dữ liệu**

[Command lưu](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/04_api_data.md:47) nhận đường dẫn tùy ý nhưng chưa quy định xác nhận overwrite, ghi dở, disk full hoặc file đích thay đổi sau dialog.

Cần chốt hành vi không ghi đè ngoài ý muốn, xác thực định dạng thực với extension, ghi hoàn chỉnh trước khi thay thế và giữ file cũ nguyên vẹn khi lỗi. Kiểm tra quyền trước khi ghi không thay thế việc xử lý lỗi thực tế.

Nếu dùng file staging để ghi an toàn, QA “không có tệp tạm” cần cho phép staging có vòng đời rõ ràng và được dọn sạch.

**8. [Trung bình] Data model chưa đủ làm machine-readable contract**

Tại [CanvasState](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/04_api_data.md:134):

- `$ref` trỏ tới `definitions/ImageNode` và `definitions/AnnotationNode` nhưng không có `definitions`.
- Chưa định nghĩa union `AnnotationNode`; thiếu model cho ellipse, pen và blur.
- Contract hydrate dùng `src`, model dùng `data_url`; `view_mode` và viewport state chưa được khai báo.
- Overview có `device_pixel_ratio`, payload schema không có.
- Chưa chốt z-order chung giữa ảnh và annotations; cây UI tách layer cố định có thể mâu thuẫn với Bring to Front/Send to Back.
- Resize cạnh trái/trên thiếu quy tắc đổi origin hoặc dịch tọa độ đối tượng.

Backend hiện chỉ nhận raster, nên QA yêu cầu Rust validate stroke/font là không thực thi được theo IPC đã mô tả. Cần xác định state thuộc frontend và dữ liệu nào thực sự qua Rust.

**9. [Trung bình] Kịch bản macOS và cold start đang sai giả định**

[QA macOS](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/05_qa_acceptance.md:156) dùng `Cmd+Shift+4` rồi kỳ vọng clipboard có ảnh. Với cấu hình mặc định, cần thêm Control để chụp vào clipboard; nếu không demo có thể nạp ảnh cũ. [Hướng dẫn Apple](https://support.apple.com/en-euro/guide/mac-help/mh26782/mac).

QA cũng cho phép dùng hotkey khi ứng dụng chưa mở. Shortcut do process đăng ký chỉ hoạt động khi process còn chạy; cold start cần OS launcher hoặc cơ chế riêng. Nên tách “chưa có cửa sổ” với “process đã thoát”. [Tauri Global Shortcut](https://v2.tauri.app/plugin/global-shortcut/).

**10. [Trung bình/Thấp] Các điểm nhất quán còn lại**

- UI Recent Files cần loader theo path, nhưng API chỉ có dialog trả bitmap; thiếu đường nạp recent/drop và cập nhật recent.
- Updater chưa có contract; QA cấm mạng trong toàn bộ sử dụng mâu thuẫn tab Updates. Nên giới hạn “không mạng” ở luồng mặc định và xử lý ảnh.
- Tool flow tự về Select sau mọi thao tác, nhưng FSM Step cho phép click liên tiếp.
- UI có minimum width 800px và 760px; spacer traffic lights 54px không khớp vùng chừa 82px trong theme.
- Các link quy chuẩn từ `docs/spec/` thiếu một cấp `../`; link scope trong file task cũng sai.
- [Demo FAQ](/Users/vic/_Work/VXUtilities/vxshot/docs/spec/06_demo_presentation.md:75) khẳng định `<15MB`, parity đầy đủ và CI đã đóng gói khi chưa có artifact chứng minh.
- “React 19” chưa đủ để chọn dependency: cần khóa bộ React/React DOM/react-konva tương thích theo peer dependencies. [Manifest react-konva](https://github.com/konvajs/react-konva/blob/master/package.json).

**Thứ tự khuyến nghị trước Phase 1**

1. Chốt IPC, typed errors, cancellation, encoding và quy tắc snake_case.
2. Chốt activation, quyền thay thế phiên, xử lý async và lưu tệp an toàn.
3. Làm spike clipboard trên Windows/macOS với fixture alpha; kiểm tra đọc → PNG/JPEG → Copy Result → dán sang ứng dụng đích.
4. Đo pipeline 4K/8K trên WKWebView và WebView2 thực: bộ nhớ đỉnh, độ trễ, giải phóng sau nhiều lượt, lỗi export.
5. Bổ sung QA overwrite, disk full, clipboard lock, kết quả async lỗi thời, zoom/pan/DPI và xuất đồng thời với chỉnh sửa.

Có thể giữ Tauri + Rust + React + Konva. Phase 1 nên ưu tiên pipeline bitmap gốc để giảm cấp phát; export scene riêng phù hợp từ Phase 2. Backend renderer hoặc tiled export chỉ nên bổ sung khi spike chứng minh WebView không đáp ứng ngân sách đã chốt.