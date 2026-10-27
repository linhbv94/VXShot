# 06. Kịch bản Trình diễn & Handoff Demo — VXShot (`_spec6_demo_presentation`)

> **Tên sản phẩm:** VXShot (Cross-platform Quick Clipboard Image Editor & Annotator)  
> **Thư mục tài liệu:** `vxshot/docs/spec/`  
> **Phiên bản:** 1.0.0  
> **Ngày cập nhật:** 2026-10-27  
> **Dành cho:** Presenter, Product Manager, Lead Dev, Stakeholders & QA

---

## 1. Tổng Quan Bài Trình Diễn & 3 "Điểm Chạm Đắt Giá" (Wow Factors)

### 1.1. Mục Tiêu Trình Diễn
Trình diễn trọn vẹn sức mạnh của **VXShot** — công cụ xử lý ảnh clipboard siêu tốc, giải phóng người dùng khỏi quy trình rườm rà khi cần lưu tệp hoặc chú thích ảnh màn hình trong vòng chưa đầy 10 giây.

### 1.2. 3 Điểm Chạm Đắt Giá (Wow Factors)
1. **Nạp Tự Động Không Cần Click (Zero-Click Hydration):** Người dùng chỉ cần chụp màn hình ở ngoài bằng OS, nhấn phím tắt toàn hệ thống là ảnh đã sẵn sàng trên Canvas để thao tác, không phải mở Photoshop hay bấm dán thủ công.
2. **Khối Che Thông Tin Tuyệt Đối (Zero-Leak Solid Redaction):** Thao tác kéo 1 giây che kín mật khẩu hoặc thông tin thẻ, phá hủy ma trận điểm ảnh gốc khi xuất, loại bỏ hoàn toàn nguy cơ rò rỉ dữ liệu qua de-blur AI.
3. **Sao Chép Thành Phẩm 1-Click (Zero-Junk Copy Result):** Chú thích xong chỉ cần bấm một nút là có ngay ảnh phẳng trong clipboard để dán vào Slack/Discord/Docs, không phải lưu ra desktop tạo file rác rồi phải dọn dẹp.

---

## 2. Kịch Bản Trình Diễn 3 Hồi Theo Mốc Thời Gian (Timeline Script)

| Mốc Thời Gian | Giai Đoạn (Act) | Thao Tác Thực Tế Của Người Trình Bày (Presenter Action) | Lời Thoại Gợi Ý Cho Buổi Demo (Voice Script) | Trạng Thái Giao Diện Hướng Tới |
| :--- | :--- | :--- | :--- | :--- |
| **00:00 - 00:45** | **Hồi 1: Đặt Vấn Đề (The Pain Point)** | - Mở một trang web có form nộp tài liệu chỉ có nút "Choose File" (không cho bấm `Ctrl+V`).<br>- Chụp màn hình vào clipboard bằng phím tắt OS (`Cmd+Ctrl+Shift+4` trên Mac / `Win+Shift+S` trên Win).<br>- Thử bấm paste vào form không được. | *"Chào mọi người! Chắc hẳn ai trong chúng ta cũng từng gặp tình huống này: vừa chụp màn hình xong, muốn gửi lên một web form hoặc cổng hỗ trợ, nhưng trang web chỉ có nút 'Choose File'. Bình thường, ta phải mở Paint hay Photoshop, dán vào, lưu ra desktop, rồi mới chọn file để tải lên... Rất mất thời gian!"* | Màn hình trình duyệt với nút Choose File bị từ chối dán |
| **00:45 - 01:30** | **Hồi 2: Khám Phá Giải Pháp (The Quick Save Wow)** | - Nhấn phím tắt toàn hệ thống `Cmd/Ctrl + Shift + X`.<br>- Cửa sổ VXShot mở lên ngay lập tức và ảnh vừa chụp đã nằm sẵn trên canvas.<br>- Nhấn ngay `Cmd/Ctrl + S` và lưu tệp PNG. | *"Và đây là VXShot. Tôi chỉ cần nhấn phím tắt toàn hệ thống, ảnh chụp từ clipboard tự động nạp lên canvas ngay tức khắc mà không cần bấm thêm bất kỳ nút dán nào. Nhấn Cmd+S, chọn nơi lưu, và tôi đã có tệp ảnh sẵn sàng tải lên trong đúng 2 giây!"* | VXShot Canvas hiển thị ảnh sắc nét, hộp thoại Save xuất hiện |
| **01:30 - 03:00** | **Hồi 2: Chú Thích & Che Thông Tin (Markup & Redaction)** | - Chọn công cụ **Mũi tên (Arrow)** vẽ một mũi tên chỉ vào nút lỗi.<br>- Chọn công cụ **Đánh số (Step Counter)** click 2 lần: tạo nhãn `1` và `2`.<br>- Chọn công cụ **Solid Redact (Khối che đặc)** kéo phủ lên phần email người dùng.<br>- Nhấn nút **Copy Result** (Sao chép thành phẩm). | *"Bây giờ, nếu tôi cần chú thích một lỗi phần mềm để báo cho team dev? Tôi chọn Mũi tên chỉ vào điểm lỗi, click tạo nhãn số bước 1 và bước 2. Đặc biệt, email này chứa dữ liệu cá nhân, tôi chọn công cụ Khối che đặc màu đen để phủ kín. Sau đó, chỉ cần bấm 'Sao chép thành phẩm'."* | Canvas có mũi tên cyan, nhãn tròn số 1-2 và khối che đen đặc |
| **03:00 - 04:00** | **Hồi 3: Thành Phẩm & Ghép Ảnh (Outcome & Composition)** | - Mở kênh Slack/Docs và nhấn `Cmd/Ctrl + V` dán trực tiếp ảnh vừa chú thích.<br>- Quay lại VXShot, kéo mép Canvas nới rộng sang phải, dán thêm ảnh thứ 2 và ghép chung. | *"Chuyển sang kênh Slack, bấm Cmd+V: toàn bộ mũi tên, đánh số và khối che đã được hợp nhất thành một ảnh phẳng hoàn hảo, không còn lớp dữ liệu gốc nào bị rò rỉ. Nếu cần so sánh trước/sau, tôi chỉ việc kéo mép canvas ra và dán tiếp ảnh thứ hai để ghép thành phẩm."* | Tin nhắn Slack hiển thị ảnh hoàn chỉnh; Canvas ghép 2 ảnh |
| **04:00 - 05:00** | **Tổng Kết & Hỏi Đáp (Q&A)** | - Mở cửa sổ Cài đặt (Settings Modal), giới thiệu tab Privacy, tab About và tab Ủng hộ tác giả với mã VietQR. | *"VXShot hoàn toàn chạy offline, không thu thập dữ liệu, tương thích cả Windows và macOS, tuân thủ chặt chẽ design tokens của zTools. Mời anh/chị đặt câu hỏi!"* | Modal Settings với giao diện chuẩn zTools và mã VietQR |

---

## 3. Dữ Liệu Chuẩn Bị Trước Khi Demo (Demo Seed Data)

1. **Ảnh Chụp Mẫu Đẹp Sẵn Có:**
   - 1 ảnh chụp màn hình giao diện Dashboard quản trị có bảng dữ liệu khách hàng (chứa cột email, số điện thoại để thực hiện che thông tin).
   - 1 ảnh thông báo lỗi hệ thống (để vẽ mũi tên và nhãn số bước 1-2).
2. **Ứng Dụng Môi Trường:**
   - Cửa sổ trình duyệt mở sẵn trang web upload tệp giả lập.
   - Một kênh chat riêng tư trên Slack / Discord / Telegram để trình diễn dán ảnh thành phẩm.
3. **Phím Tắt Đã Đăng Ký Sẵn:**
   - Đảm bảo phím tắt toàn hệ thống `CmdOrCtrl+Shift+X` hoạt động trơn tru trước khi bắt đầu.

---

## 4. Phương Án Dự Phòng (Contingency Playbook) & Câu Hỏi Thường Gặp (FAQ)

### 4.1. Phương Án Xử Lý Sự Cố Khi Demo Trực Tiếp

```text
┌────────────────────────────────────────────────────────────────────────┐
│                  PHƯƠNG ÁN DỰ PHÒNG KHI GẶP SỰ CỐ DEMO                 │
├────────────────────┬───────────────────────────────────────────────────┤
│ Tình huống sự cố   │ Cách khắc phục nhanh trong 5 giây                │
├────────────────────┼───────────────────────────────────────────────────┤
│ 1. Clipboard bị lỗi│ Bấm nút "Open File" trên Titlebar hoặc kéo thả tệp│
│    không tự nạp ảnh│ ảnh chuẩn bị sẵn trong thư mục `demo_assets/` vào │
│    lúc mở app      │ dropzone của ứng dụng.                            │
├────────────────────┼───────────────────────────────────────────────────┤
│ 2. Phím tắt toàn   │ Click trực tiếp vào biểu tượng VXShot trên Dock / │
│    cầu bị chiếm giữ│ Taskbar để kích hoạt cửa sổ.                      │
├────────────────────┼───────────────────────────────────────────────────┤
│ 3. Ứng dụng chat   │ Nhấn nút "Save Image" lưu thành file PNG ra màn   │
│    ngoài không dán │ hình để chứng minh khả năng xuất ảnh thành công.  │
│    được ảnh        │                                                   │
└────────────────────┴───────────────────────────────────────────────────┘
```

---

### 4.2. Bộ Câu Hỏi Thường Gặp Từ Stakeholders (Stakeholder FAQ)

**Câu hỏi 1: Tại sao VXShot không tích hợp luôn tính năng tự chụp màn hình như CleanShot X hay Snagit?**
> *Trả lời:* "Các công cụ chụp màn hình native của macOS (`Cmd+Ctrl+Shift+4`) và Windows (`Win+Shift+S`) hiện nay đã cực kỳ hoàn thiện, mượt mà và an toàn. Việc viết thêm engine chụp màn hình chỉ làm ứng dụng cồng kềnh, dễ dính lỗi quyền hệ thống (Screen Recording TCC trên Mac). VXShot chọn đứng ở vị trí 'chế biến nhanh': tập trung giải quyết xuất sắc khâu sau khi chụp để giữ app siêu nhẹ gọn (mục tiêu gói bundle tối ưu < 20MB) và khởi động tức thì."

**Câu hỏi 2: Tại sao VXShot mặc định khuyến nghị khối che màu đặc thay vì hiệu ứng làm mờ (Blur)?**
> *Trả lời:* "Hiệu ứng làm mờ chỉ là thuật toán làm mịn toán học trên các điểm ảnh lân cận. Với các công cụ AI hiện nay, văn bản bị làm mờ có thể được khôi phục lại với độ chính xác rất cao. Khối che màu đặc (Solid Block) phá hủy hoàn toàn dữ liệu điểm ảnh gốc, bảo đảm thông tin thẻ, mật khẩu của người dùng không bao giờ bị rò rỉ."

**Câu hỏi 3: VXShot có hỗ trợ Windows và macOS ngang hàng không?**
> *Trả lời:* "Hoàn toàn ngang hàng. Trên macOS, ứng dụng tuân thủ traffic lights native 12pt và tích hợp NSPasteboard. Trên Windows, ứng dụng sử dụng giao diện single-row không bị double titlebar và hỗ trợ kênh Alpha qua CF_DIBV5. Cả hai nền tảng đều được đóng gói bằng Tauri v2 tự động hóa qua GitHub Actions."
