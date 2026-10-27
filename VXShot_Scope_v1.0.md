# VXShot — Product Scope v1.0

## 1. Product definition

VXShot là tiện ích **chỉnh sửa nhanh ảnh từ clipboard (bộ nhớ tạm)** trên Windows và macOS. Ứng dụng **không tự chụp hoặc quay màn hình**; người dùng tiếp tục sử dụng công cụ chụp có sẵn của hệ điều hành.

**Core flow (luồng chính):** Chụp bằng hệ điều hành → ảnh vào clipboard → mở VXShot (bằng biểu tượng ứng dụng hoặc phím tắt) → ảnh tự được nạp → lưu ngay **hoặc** chú thích/ghép ảnh → sao chép ảnh hoàn chỉnh trở lại clipboard hoặc lưu thành tệp.

### Nguyên tắc
- Cross-platform (đa nền tảng) Windows/macOS là ưu tiên số một.
- Không chen vào quy trình chụp → dán thông thường; chỉ mở VXShot khi thực sự cần.
- Offline-first (ưu tiên hoạt động ngoại tuyến), không cần tài khoản hay máy chủ.
- Không tự sửa hoặc xóa ảnh/tệp nguồn.
- Các đối tượng có thể chỉnh sửa độc lập trong phiên làm việc; chỉ **flatten (hợp nhất thành ảnh phẳng)** khi xuất.

## 2. Use cases (tình huống sử dụng)

### UC-01 — Quick Save (lưu nhanh)
1. Người dùng chụp màn hình, ảnh đã vào clipboard.
2. Đến nơi cần tải ảnh lên nhưng nơi đó không cho dán trực tiếp.
3. Mở VXShot; ảnh tự hiển thị.
4. Nhấn `Cmd/Ctrl + S`, chọn vị trí và lưu PNG/JPEG.
5. Tải tệp lên nơi cần dùng.

**Tiêu chí thành công:** không phải mở Photoshop, Paint, Preview hoặc tự tạo tệp trung gian thủ công.

### UC-02 — Quick Annotate (chú thích nhanh)
1. Mở VXShot với ảnh đã nạp từ clipboard.
2. Thêm chữ, mũi tên, khung, vùng tô sáng, đánh số hoặc vùng che thông tin.
3. Sao chép **toàn bộ thành phẩm đã hợp nhất** vào clipboard.
4. Dán sang ứng dụng khác, hoặc lưu thành tệp.

### UC-03 — Ghép nhiều ảnh
1. Mở ảnh đầu tiên từ clipboard.
2. Mở rộng kích thước canvas (vùng ảnh).
3. Sao chép ảnh khác từ bên ngoài rồi dán vào VXShot.
4. Định vị, thay đổi kích thước và sắp xếp ảnh/chú thích độc lập.
5. Xuất toàn bộ canvas thành một ảnh phẳng.

## 3. Functional scope (phạm vi chức năng)

| ID | Nhóm | Yêu cầu | Ưu tiên |
|---|---|---|---|
| F01 | Khởi động | Mở ứng dụng thông thường | P0 |
| F02 | Khởi động | Phím tắt toàn hệ thống để mở/hiện ứng dụng | P0 |
| F03 | Clipboard | Tự đọc và nạp ảnh khi mở phiên mới | P0 |
| F04 | Lưu | Lưu PNG và JPEG bằng hộp thoại chọn vị trí | P0 |
| F05 | Markup | Chèn chữ, mũi tên, đường thẳng | P0 |
| F06 | Markup | Vẽ hình chữ nhật, elip/khoanh vùng | P0 |
| F07 | Markup | Tô sáng vùng ảnh | P0 |
| F08 | Markup | Đánh số thứ tự tự động tăng | P0 |
| F09 | Privacy | Che thông tin bằng khối màu đặc | P0 |
| F10 | Canvas | Mở rộng/điều chỉnh kích thước vùng xuất | P0 |
| F11 | Images | Dán thêm ảnh từ clipboard dưới dạng đối tượng mới | P0 |
| F12 | Editing | Chọn, di chuyển, đổi kích thước đối tượng | P0 |
| F13 | Editing | Undo/redo (hoàn tác/làm lại) | P0 |
| F14 | Export | Hợp nhất toàn bộ thành phẩm và ghi ảnh vào clipboard | P0 |
| F15 | Export | Hợp nhất toàn bộ thành phẩm và lưu thành tệp | P0 |
| F16 | Markup | Làm mờ/che điểm ảnh | P1 |
| F17 | Project | Lưu và mở lại dự án có thể chỉnh sửa từng lớp | P2 |
| F18 | Export | Kéo thả thành phẩm như một tệp sang ứng dụng khác | P2 |

## 4. Editing model (mô hình chỉnh sửa)

Sử dụng **object-based editing (chỉnh sửa theo đối tượng)** trong phiên làm việc:

- **Canvas:** chiều rộng, chiều cao, màu nền, phạm vi ảnh được xuất.
- **Image objects:** ảnh nền ban đầu và các ảnh dán thêm; có vị trí, kích thước, thứ tự xếp chồng.
- **Annotation objects:** chữ, mũi tên, hình khối, tô sáng, số thứ tự, vùng che; có thể chọn và chỉnh sửa riêng.
- **Flatten on export:** khi copy/save, kết xuất tất cả đối tượng thành một ảnh raster; không đưa cấu trúc lớp vào clipboard hoặc PNG/JPEG.

### Quy tắc đánh số
- Mỗi lần thêm nhãn số: 1, 2, 3... theo thứ tự tăng.
- Xóa một nhãn **không tự đánh lại** những nhãn còn lại trong v1.0.

### Quy tắc canvas
- Dán ảnh thứ hai tạo đối tượng mới, không thay ảnh đầu tiên.
- Kéo đối tượng vượt ranh giới canvas không tự mở rộng canvas.
- Người dùng chủ động đổi kích thước canvas; phần ngoài ranh giới không xuất ra.
- Mức zoom (thu phóng hiển thị) không làm thay đổi độ phân giải xuất.

## 5. Application behavior (hành vi ứng dụng)

- Mở phiên mới khi clipboard có ảnh: tự nạp ảnh và hiển thị ngay.
- Clipboard không có ảnh hợp lệ: hiển thị vùng trống, cho phép dán ảnh hoặc mở tệp.
- Nếu đang có phiên chỉnh sửa chưa lưu: không tự ghi đè nội dung khi mở lại/nhấn phím tắt; giữ phiên hiện tại và cung cấp hành động tạo phiên mới rõ ràng.
- `Cmd/Ctrl + V` trong phiên đang mở: dán ảnh mới thành đối tượng riêng nếu clipboard có ảnh.
- `Cmd/Ctrl + S`: mở hộp thoại lưu tệp PNG/JPEG.
- `Cmd/Ctrl + Z` và `Cmd/Ctrl + Shift + Z`: hoàn tác/làm lại (cần kiểm thử quy ước theo hệ điều hành).
- Hành động **Copy Result (sao chép thành phẩm)** phải rõ ràng, không gây nhầm với sao chép một đối tượng đang được chọn. Có thể dùng nút riêng và phím tắt được quy định sau khi kiểm thử UX.
- JPEG sử dụng nền trắng cho vùng trong suốt, trừ khi người dùng chọn màu khác.

## 6. Privacy & data safety (quyền riêng tư và an toàn dữ liệu)

- Xử lý cục bộ; không tải ảnh lên máy chủ.
- Không lưu lịch sử clipboard hoặc ảnh ngầm theo mặc định.
- Không tự sửa/xóa ảnh gốc hoặc tệp khác của người dùng.
- Che thông tin nhạy cảm bằng **khối màu đặc** làm mặc định; blur/pixelate (làm mờ/che điểm ảnh) chỉ là tùy chọn phụ, không được quảng bá là phương pháp che bí mật tuyệt đối.
- Ảnh PNG/JPEG xuất ra phải là ảnh đã kết xuất thực sự, không còn lớp dữ liệu gốc có thể bật lại. Với vùng che, cần kiểm thử pixel của ảnh đầu ra.
- Không tự thay thế clipboard trong quá trình chỉnh sửa; chỉ ghi lại khi người dùng yêu cầu sao chép thành phẩm.

## 7. Recommended tech stack (bộ công nghệ đề xuất)

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Desktop shell (vỏ ứng dụng) | Tauri 2 + Rust | Đóng gói Windows/macOS, phím tắt, tích hợp hệ điều hành |
| UI (giao diện) | React + TypeScript + Vite | Giao diện và trạng thái thao tác |
| Canvas editor (trình chỉnh sửa) | Konva.js + react-konva | Quản lý đối tượng, lớp, chọn/kéo/đổi kích thước |
| Clipboard | Tauri Clipboard Manager + Rust/native bridge khi cần | Đọc/ghi ảnh đa nền tảng |
| Global shortcut | Tauri Global Shortcut | Mở/hiện cửa sổ |
| Save dialog/filesystem | Tauri Dialog + File System | Chọn vị trí và ghi PNG/JPEG |
| Export | Konva raster export (kết xuất ảnh raster) | Hợp nhất ảnh ở độ phân giải thực |

**Không cần trong v1.0:** engine chụp/quay màn hình, FFmpeg, ImageMagick, SQLite, backend (máy chủ), tài khoản, đồng bộ đám mây.

## 8. Non-functional requirements (yêu cầu phi chức năng)

- Hỗ trợ Windows và macOS; kiểm thử thực tế trên cả hai.
- Mở nhanh, giao diện gọn, không yêu cầu quyền chụp màn hình chỉ để đọc ảnh đã nằm trong clipboard.
- Tệp xuất giữ đúng kích thước pixel của canvas; zoom giao diện không ảnh hưởng chất lượng.
- Ảnh lớn và nhiều đối tượng không được gây mất nội dung hoặc treo không thể khôi phục.
- Lỗi đọc clipboard, lỗi lưu tệp và quyền truy cập phải có thông báo rõ ràng, không im lặng thất bại.
- Kiểm thử ảnh có alpha (độ trong suốt), ảnh độ phân giải cao, đa màn hình/HiDPI (mật độ điểm ảnh cao), đường dẫn Unicode và cả hai hệ điều hành.

## 9. Implementation phases (giai đoạn triển khai)

### Phase 1 — Clipboard → Save/Copy
- Khung Tauri 2/React.
- Mở ứng dụng và phím tắt toàn hệ thống.
- Tự nạp ảnh từ clipboard.
- Lưu PNG/JPEG và sao chép ảnh kết quả.
- Kiểm thử Windows/macOS, định dạng và kích thước ảnh.

**Deliverable (đầu ra):** giải quyết ngay tình huống trang web chỉ cho upload (tải tệp lên).

### Phase 2 — Markup editor
- Chữ, mũi tên, đường thẳng, khung, elip, tô sáng, đánh số, khối che.
- Chọn, di chuyển, đổi kích thước; undo/redo.
- Xuất ảnh hợp nhất, giữ độ phân giải.

**Deliverable:** chú thích ảnh rồi copy/save.

### Phase 3 — Multi-image canvas
- Thay đổi kích thước canvas.
- Dán nhiều ảnh thành các đối tượng độc lập.
- Quản lý thứ tự xếp chồng và bố trí ảnh.
- Kiểm thử ảnh ghép, vùng ngoài canvas và xuất ảnh.

**Deliverable:** ghép nhiều ảnh trong một thành phẩm, không phải chuyển sang Photoshop/Paint.

## 10. Out of scope (ngoài phạm vi v1.0)

- Tự chụp màn hình, chọn vùng chụp, quay màn hình.
- OCR (nhận diện chữ), nhận diện và tự che dữ liệu nhạy cảm.
- Đồng bộ đám mây, chia sẻ qua liên kết, tài khoản.
- Trình biên tập ảnh chuyên nghiệp: bộ lọc, chỉnh màu, mask (mặt nạ) phức tạp.
- Lịch sử clipboard hoặc quản lý thư viện ảnh.
- Lưu dự án nhiều lớp và kéo tệp trực tiếp sang ứng dụng khác (để P2).

## 11. Acceptance criteria (tiêu chí nghiệm thu)

1. Trên Windows và macOS, sau khi chụp ảnh vào clipboard, mở VXShot thấy ảnh sẵn mà không phải dán thủ công.
2. Có thể lưu ngay ảnh clipboard thành PNG/JPEG mà không phải vào chế độ chỉnh sửa.
3. Có thể thêm chữ, mũi tên, hình, tô sáng, nhãn số và vùng che; di chuyển/chỉnh sửa đối tượng trước khi xuất.
4. Có thể mở rộng canvas, dán ảnh thứ hai, sắp xếp và xuất thành một ảnh duy nhất.
5. Copy Result tạo ra một ảnh phẳng hợp lệ trong clipboard, dán được vào các ứng dụng hỗ trợ ảnh.
6. Save tạo PNG/JPEG đúng kích thước pixel và không tự ghi đè tệp khác.
7. Vùng che đặc thực sự che pixel nhạy cảm trong ảnh đã xuất.
8. Mở lại ứng dụng khi phiên hiện tại chưa lưu không làm mất nội dung mà không có cảnh báo hoặc lựa chọn rõ ràng.
9. Không có truy cập mạng hoặc lưu lịch sử ảnh ngầm trong luồng mặc định.

## 12. Complexity estimate (ước lượng độ khó)

**5/10** cho v1.0 gồm chú thích nhiều đối tượng và ghép ảnh trên Windows/macOS. Phase 1 đơn giản hơn đáng kể; rủi ro tập trung ở tương thích clipboard, tương tác đối tượng, độ phân giải ảnh xuất và hoàn thiện UX (trải nghiệm người dùng).
