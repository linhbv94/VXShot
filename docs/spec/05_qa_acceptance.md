# 05. Tiêu chuẩn Nghiệm thu & Kịch bản Kiểm thử — VXShot (`_spec5_qa_acceptance`)

> **Tên sản phẩm:** VXShot (Cross-platform Quick Clipboard Image Editor & Annotator)  
> **Thư mục tài liệu:** `vxshot/docs/spec/`  
> **Phiên bản:** 1.0.0  
> **Ngày cập nhật:** 2026-10-27  
> **Tài liệu nguồn:** [VXShot_Scope_v1.0.md](../../VXShot_Scope_v1.0.md) | [00_system_overview.md](00_system_overview.md)

---

## 1. Tiêu Chuẩn Nghiệm Thu Chi Tiết (Gherkin Scenarios)

### Kịch bản 1: Lưu Nhanh Ảnh từ Clipboard Ra Tệp (Quick Save Flow — UC-01)
```gherkin
Feature: Tự động nạp ảnh từ clipboard và lưu nhanh thành tệp

  Scenario: Lưu nhanh ảnh vừa chụp thành tệp PNG
    Given Người dùng vừa chụp màn hình vào Clipboard (nhấn Cmd+Ctrl+Shift+4 trên macOS hoặc Win+Shift+S trên Windows)
    And VXShot đang chạy ở chế độ nền (hoặc người dùng mở app từ Dock/Taskbar)
    When Người dùng kích hoạt VXShot bằng biểu tượng hoặc nhấn phím tắt "Cmd/Ctrl + Shift + X"
    Then Cửa sổ ứng dụng hiển thị với ảnh chụp được nạp sẵn trên Canvas mà không cần thao tác dán
    And Thanh trạng thái hiển thị kích thước đúng pixel thực của ảnh gốc (ví dụ: "1920 × 1080 px")
    When Người dùng nhấn "Cmd/Ctrl + S"
    Then Hộp thoại lưu tệp native của hệ điều hành xuất hiện với tên gợi ý mặc định
    When Người dùng chọn thư mục và nhấn nút "Save" với định dạng PNG
    Then Tệp PNG được tạo thành công trên đĩa cứng qua cơ chế Atomic Save (không bị hỏng tệp nếu đứt quãng)
    And Kênh trong suốt (Alpha) của ảnh được bảo toàn nguyên vẹn
    And Clipboard gốc của hệ thống không bị thay đổi hoặc mất dữ liệu
```

---

### Kịch bản 2: Chú Thích Nhanh & Sao Chép Thành Phẩm (Quick Annotate Flow — UC-02)
```gherkin
Feature: Thêm đối tượng chú thích và sao chép ảnh hợp nhất vào clipboard

  Scenario: Thêm mũi tên, nhãn số và khối che thông tin rồi Copy Result
    Given Ảnh màn hình đã được nạp sẵn trên Canvas
    When Người dùng chọn công cụ Mũi tên (Arrow [A]) và kéo vẽ từ điểm (100, 100) đến (250, 250)
    Then Mũi tên màu đỏ xuất hiện sắc nét trên Canvas
    When Người dùng chọn công cụ Đánh số (Step Counter [S]) và click chuột 3 lần liên tiếp tại 3 vị trí
    Then Xuất hiện lần lượt 3 nhãn số tròn có nội dung "1", "2", "3"
    When Người dùng chọn công cụ Khối che (Solid Redact [B]) và kéo phủ kín một đoạn văn bản nhạy cảm
    Then Một khối chữ nhật màu đen đặc xuất hiện che phủ hoàn toàn đoạn văn bản bên dưới
    When Người dùng nhấn nút "Sao chép thành phẩm" (hoặc "Cmd/Ctrl + Shift + C")
    Then Toàn bộ các đối tượng và ảnh nền được hợp nhất thành một bitmap phẳng (Flatten Raster)
    And Dữ liệu ảnh phẳng mới được ghi đè vào Clipboard của hệ điều hành
    And Toast thông báo "Đã sao chép thành phẩm vào Clipboard" xuất hiện
    When Người dùng chuyển sang ứng dụng Slack và nhấn "Cmd/Ctrl + V"
    Then Ảnh dán vào hiển thị đầy đủ mũi tên, nhãn số 1-2-3 và khối che đen đặc
```

---

### Kịch bản 3: Ghép Nhiều Ảnh Trên Một Khung Vẽ (Multi-Image Composition — UC-03)
```gherkin
Feature: Mở rộng kích thước canvas và dán thêm ảnh thứ hai

  Scenario: Ghép 2 ảnh chụp cạnh nhau và xuất thành một ảnh duy nhất
    Given Canvas đang chứa ảnh thứ nhất có kích thước 800x600px
    When Người dùng kéo tay nắm mép phải của Canvas Frame sang phải thêm 400px
    Then Chiều rộng của Canvas Frame mở rộng thành 1200x600px
    And Vùng mở rộng mới có nền trong suốt (với caro mờ hiển thị trên UI)
    When Người dùng chụp một ảnh mới từ trình duyệt và nhấn "Cmd/Ctrl + V" trong VXShot
    Then Ảnh thứ hai xuất hiện trên Canvas dưới dạng một ImageNode độc lập
    And Ảnh thứ nhất không bị ghi đè hay mất mát
    When Người dùng kéo ảnh thứ hai đặt vào vùng canvas vừa mở rộng bên phải
    And Nhấn "Cmd/Ctrl + S" để lưu thành file JPEG
    Then Tệp JPEG xuất ra có kích thước đúng 1200x600px
    And Phần vùng trống trong suốt (nếu có) được tự động phủ nền trắng sạch sẽ
```

---

### Kịch bản 4: Kiểm Thử An Toàn Tuyệt Đối Khối Che Thông Tin (Solid Redaction Security)
```gherkin
Feature: Bảo mật thông tin bằng khối che màu đặc phá hủy điểm ảnh

  Scenario: Kiểm tra phân tích pixel của ảnh sau khi xuất khối che đặc
    Given Trên ảnh có chuỗi ký tự mật khẩu bí mật "MyPassword123"
    When Người dùng vẽ khối Solid Redact màu đen đặc (#000000) che kín toàn bộ chữ "MyPassword123"
    And Người dùng xuất ảnh ra tệp PNG bằng nút Save
    When Sử dụng công cụ kiểm thử phân tích pixel (ImageMagick / Python Pillow) đọc vùng tọa độ bị che
    Then Tất cả các điểm ảnh trong vùng bounding box của khối che đều có giá trị màu thuần túy (R:0, G:0, B:0, A:255)
    And Không còn bất kỳ pixel nào mang thông tin vết tích của ký tự cũ
    And Tệp PNG xuất ra không chứa bất kỳ layer metadata hay vector path nào chứa text gốc
```

---

### Kịch bản 5: Bảo Vệ Trạng Thái Phiên Chưa Lưu (Dirty State Guard)
```gherkin
Feature: Bảo vệ bài đang sửa dở khi nhận kích hoạt mới

  Scenario: Nhấn phím tắt mở app khi bài cũ đang sửa dở dang
    Given Người dùng đang có một phiên làm việc với 3 mũi tên đã vẽ và cờ is_dirty = true
    And Người dùng chuyển sang cửa sổ khác và chụp ảnh mới vào clipboard
    When Người dùng nhấn phím tắt toàn hệ thống "Cmd/Ctrl + Shift + X" để mở VXShot
    Then Cửa sổ VXShot được đưa lên phía trước (Focused)
    And Nội dung bài đang sửa dở dang không bị xóa hay ghi đè
    And Một thanh cảnh báo xuất hiện hỏi: "Phiên hiện tại có thay đổi chưa lưu. Bạn muốn Tạo phiên mới hay Dán ảnh mới vào canvas?"
    When Người dùng bấm "Hủy" hoặc đóng thanh cảnh báo
    Then Màn hình giữ nguyên hiện trạng bài cũ để người dùng tiếp tục thao tác
```

---

### Kịch bản 6: Độc Lập Giữa Mức Thu Phóng (Zoom) Và Độ Phân Giải Xuất (Zoom Independence)
```gherkin
Feature: Đảm bảo độ sắc nét ảnh xuất không bị ảnh hưởng bởi mức zoom hiển thị

  Scenario: Zoom out 25% hoặc Zoom in 300% rồi xuất ảnh
    Given Ảnh gốc nạp từ clipboard có kích thước vật lý 3840x2160px (4K)
    When Người dùng thu nhỏ mức hiển thị trên màn hình xuống Zoom 25% để nhìn toàn cảnh
    And Vẽ một mũi tên chú thích
    And Nhấn nút "Sao chép thành phẩm" (Copy Result)
    Then Ảnh raster ghi vào clipboard có kích thước chính xác 3840x2160px
    And Các chi tiết của ảnh gốc và nét vẽ mũi tên đạt độ sắc nét 100% của độ phân giải 4K
    And Không bị vỡ hạt hay giảm độ phân giải theo mức zoom 25% của màn hình
```

---

## 2. Ma Trận Kiểm Thử Trường Hợp Biên (Edge Cases & Negative Matrix)

| ID | Kịch bản Kiểm thử Biên | Hành vi Kỳ vọng của Hệ thống | Mức độ Ưu tiên |
| :--- | :--- | :--- | :--- |
| `EC_01` | Nạp ảnh kích thước cực đại (Ảnh chụp cuộn toàn trang 8K: 7680×4320px, dung lượng > 80MB) | App nạp ảnh an toàn, không bị tràn bộ nhớ (OOM) hoặc sập WebView; tự động áp dụng Zoom 15% để vừa cửa sổ. | **Critical** |
| `EC_02` | Clipboard hoàn toàn rỗng hoặc chỉ chứa chuỗi text khi mở app | Hiển thị màn hình đón tiếp (Empty State) với Dropzone thân thiện; không báo lỗi crash, không nạp ảnh rác. | **High** |
| `EC_03` | Người dùng dán liên tiếp 10 bức ảnh trong 2 giây bằng `Cmd+V` | Hệ thống tạo tuần tự 10 ImageNode xếp chồng với Z-index tăng dần, không bị treo UI thread. | **High** |
| `EC_04` | Kéo đối tượng chú thích chạy hoàn toàn ra ngoài ranh giới Canvas Frame | Đối tượng vẫn được bảo toàn trên Layer Tree nhưng khi xuất ảnh (Copy/Save) phần nằm ngoài bị cắt bỏ 100%. | **High** |
| `EC_05` | Nhấn Undo 60 lần liên tiếp sau khi thực hiện 60 thao tác | Ngăn không cho Undo vượt quá giới hạn 50 bước trong stack (FIFO pruning); nút Undo chuyển sang trạng thái Disabled. | **Medium** |
| `EC_06` | Đặt tên file lưu chứa ký tự tiếng Việt Unicode có dấu và khoảng trắng | Hệ thống ghi tệp bình thường, không bị lỗi mã hóa font hoặc hỏng đường dẫn tệp trên cả Windows và macOS. | **Critical** |
| `EC_07` | Ứng dụng khác đang khóa chặt Clipboard của OS khi VXShot cố gắng đọc | Cơ chế thử lại (Retry) 3 lần với chu kỳ 50ms; nếu vẫn khóa thì hiển thị thông báo nhẹ nhàng thay vì đóng app đột ngột. | **High** |
| `EC_08` | Di chuyển cửa sổ app từ màn hình Retina (2x scale) sang màn hình ngoài thường (1x scale) | Tọa độ vẽ chuột và Transform Handles tự động đồng bộ theo DPI mới; không bị lệch tọa độ click. | **Critical** |
| `EC_09` | Người dùng vẽ một hình chữ nhật có kích thước bằng 0 (chỉ click chuột rồi nhả tại chỗ) | Hệ thống tự động hủy đối tượng 0-pixel này, không tạo rác trong Layer Tree và không push vào Undo Stack. | **Medium** |
| `EC_10` | Xuất file JPEG từ canvas có 80% diện tích là trong suốt | Vùng trong suốt tự động được phủ nền trắng `#ffffff` phẳng mịn, không xuất hiện viền đen hay hạt nhiễu xám. | **High** |
| `EC_11` | Lưu đè lên tệp đã có sẵn hoặc ổ đĩa bị đầy khi đang ghi tệp | Hệ thống dùng cơ chế Atomic Save (ghi ra file staging tạm rồi rename nguyên tử); nếu ghi thất bại hoặc đĩa đầy, tệp cũ được bảo toàn 100%, không bị hỏng tệp trắng. | **Critical** |

---

## 3. Quy Tắc Xác Thực Dữ Liệu (Client vs Server Validation Rules)

| Thuộc tính Dữ liệu | Quy tắc Kiểm tra Phía Giao diện (Client Validation) | Quy tắc Kiểm tra Phía Rust (Native Engine) | Thông báo Lỗi khi Vi phạm |
| :--- | :--- | :--- | :--- |
| **Kích thước Canvas** | Tối thiểu `10 × 10 px`, Tối đa `8192 × 8192 px` (tối đa 33.2MP) | Giới hạn theo khả năng cấp phát GPU Texture buffer (ngân sách RAM 200MB) | *"Kích thước canvas nằm ngoài giới hạn cho phép (10px - 8192px)."* |
| **Độ dày nét vẽ** | Số nguyên dương nằm trong khoảng `[1, 64] px` | Kiểm tra float không âm | *"Độ dày nét vẽ không hợp lệ."* |
| **Cỡ chữ văn bản** | Nằm trong khoảng `[10, 120] px` | Sanitize chuỗi text, loại bỏ mã độc | *"Cỡ chữ nằm ngoài khoảng 10px - 120px."* |
| **Tên tệp xuất** | Không chứa ký tự cấm hệ điều hành (`/ \ : * ? " < > \|`) | Kiểm tra đường dẫn tồn tại và có quyền ghi | *"Tên tệp chứa ký tự không hợp lệ của hệ điều hành."* |
| **Dung lượng ảnh** | Không vượt quá 33.2 Megapixels | Trả về lỗi nếu không đủ RAM cấp phát mảng byte | *"Ảnh quá lớn, hệ thống không đủ bộ nhớ để xử lý an toàn."* |

---

## 4. Danh Mục Kiểm Tra Bàn Giao Phát Hành (Cross-Platform QA Checklist)

### 4.1. Kiểm thử Môi trường macOS (Apple Silicon & Intel)
- [ ] Chụp màn hình vào clipboard bằng `Cmd + Control + Shift + 4` → Mở app thấy ảnh nạp ngay tức thì.
- [ ] Kiểm tra thanh Titlebar 32px: Bezel native traffic lights đúng `12pt`, khoảng cách tâm `20pt`, vùng chừa `82px` chuẩn zTools.
- [ ] Kiểm tra phím tắt toàn hệ thống `Cmd + Shift + X` kích hoạt app khi đang ẩn dưới nền.
- [ ] Kiểm tra giữ trọn kênh Alpha đối với ảnh có bo góc cửa sổ macOS (Window Shadow & Rounded Corners).
- [ ] Thao tác Copy Result và dán sang Apple Notes, Slack, Telegram hiển thị chuẩn xác.

### 4.2. Kiểm thử Môi trường Windows (Windows 11 / Windows 10 x64)
- [ ] Chụp màn hình bằng `Win + Shift + S` → Mở app thấy ảnh nạp sẵn.
- [ ] Kiểm tra Titlebar không bị lỗi double bar (`decorations: false`), các nút min/max/close nằm góc phải phản hồi mượt mà.
- [ ] Không xuất hiện nút traffic lights của Mac trên giao diện Windows.
- [ ] Kiểm tra đọc ảnh từ định dạng `CF_DIBV5` bảo toàn độ trong suốt, không bị đen nền góc bo.
- [ ] Thao tác Copy Result và dán sang Paint, Microsoft Word, Teams thành công.

### 4.3. Kiểm thử Tính Riêng Tư & An Toàn Dữ Liệu
- [ ] Giám sát Network Inspector: Tuyệt đối không phát sinh bất kỳ HTTP/WebSocket request nào ra ngoài internet trong toàn bộ quá trình sử dụng.
- [ ] Kiểm tra thư mục tạm (Temp Directory): Ứng dụng không để lại tệp rác hoặc lưu ngầm lịch sử ảnh đã chỉnh sửa.
- [ ] Kiểm tra pixel vùng che Solid Redact: Xác minh ma trận điểm ảnh bị ghi đè triệt để bằng màu đơn sắc.


## Baseline phát hành 1.0.0 — QA độc lập 2026-10-27

- Phạm vi thực tế: một ảnh PNG/JPEG nền + annotation Canvas2D, zoom/pan, undo/redo, PNG/JPEG save và copy bitmap. Clipboard/file engine Rust dùng chung macOS/Windows. Multi-image, crop/resize/transform handles và sửa đối tượng sau tạo chưa triển khai; các mục đó trong thiết kế là roadmap, không thuộc nghiệm thu1.0.0.
- Focus/global shortcut không thay ảnh đã mở. Chỉ tự hydrate canvas trống khi bật auto-hydrate; đọc lại settings trước lần đầu. Paste/Open chủ động hỏi xác nhận nếu annotation khác snapshot vừa Save/Copy; stale clipboard results bị bỏ. Native dialog/focus không reset history.
- Save/Copy chụp snapshot annotation, chặn updater trước download nếu còn thay đổi chưa xuất hoặc thao tác đang chạy. Solid redaction vẽ lại ở pass cuối (cả preview/export), làm tròn ra ngoài pixel; mosaic lấy ảnh gốc không được phủ ngược lên vùng che. Màu đen opaque giữ nguyên.
- File input/export decode giới hạn8192px/33.2MP,64MiB encoded/256MiB decode allocation. Save kiểm format, dùng tempfile create-new cùng volume + sync + atomic persist, cleanup khi lỗi; từ chối đích symlink/thư mục. Chọn PNG/JPEG theo extension trong dialog; file hỏng không ghi đè đích.
- Settings IPC dùng rename_all snake_case cho new_settings. Updates thật: startup check im lặng khi mạng lỗi, manual retry, available/download/install/restart; không tự install. Chỉ GitHub updater dùng mạng, không upload ảnh. Giữ com.vxshot.desktop, khóa updater riêng, SDK27.0, Win currentUser.
- Recent menu chưa hoạt động được ẩn; không báo đã có tính năng roadmap. QA runtime và CI/package/public ghi riêng ở release review/evidence.
