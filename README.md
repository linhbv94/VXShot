# VXShot

> **VXShot** — Trình chỉnh sửa, chú thích và che mờ thông tin ảnh chụp màn hình siêu tốc (Cross-platform Quick Clipboard Image Editor & Annotator).

---

## 1. Giới thiệu tổng quan

VXShot là ứng dụng desktop gọn nhẹ được thiết kế tối ưu cho quy trình làm việc với ảnh chụp màn hình:
1. **Chụp màn hình** bằng phím tắt hệ thống (`Cmd + Shift + 4` trên macOS hoặc `Win + Shift + S` trên Windows) để lưu ảnh vào clipboard.
2. **Mở VXShot** hoặc nhấn `Cmd/Ctrl + V`: Ứng dụng tự động nạp ảnh tức thì (`auto-hydration`), bảo toàn 100% kênh trong suốt Alpha.
3. **Thao tác nhanh trên Floating Toolbar**:
   - 🛡️ **Che thông tin nhạy cảm tuyệt đối (`B` — Solid Redact):** Phủ khối hộp chữ nhật đặc 100% che kín ma trận điểm ảnh (chống inspect, không hở góc).
   - 💧 **Làm mờ điểm ảnh (`M` — Blur / Mosaic):** Làm mờ dữ liệu dạng kính mờ mosaic pixelation mịn màng.
   - ↗️ **Mũi tên chỉ dẫn sắc sảo (`A` — Arrow):** Đầu mũi tên dạng Swept-back Chevron vuốt nhọn chuẩn đồ họa, đáy lõm ôm khít thân.
   - 🔲 **Khung chữ nhật (`R`) & Hình tròn (`O`):** Đóng khung vùng cần nhấn mạnh.
   - 🔤 **Chèn văn bản (`T` — Text):** Ghi chú trực tiếp lên ảnh.
   - 🔢 **Đánh số thứ tự bước (`S` — Step Counter):** Nhãn tròn tự động tăng dần **1**, **2**, **3**... sau mỗi cú click chuột.
   - ✏️ **Bút dạ quang tô sáng (`H` — Highlighter):** Tô kín diện tích khối chữ với màu dạ quang bán trong suốt (alpha 0.35, bo góc 3px mềm mại).
   - ✏️ **Bút vẽ tự do (`P` — Pen) & Đường kẻ (`L` — Line).**
4. **Xuất thành phẩm siêu tốc (Safe Isolated Export Stage)**:
   - **Sao chép thành phẩm (`Cmd/Ctrl + Shift + C`):** Tự động nung phẳng (flatten) toàn bộ chú thích và khối che vào ảnh gốc, đưa thẳng vào OS clipboard để dán sang Slack, Telegram, Jira, Google Docs...
   - **Lưu tệp (`Cmd/Ctrl + S`):** Ghi tệp an toàn nguyên khối (**Atomic Save** qua staging tmp -> fs::rename) dưới định dạng PNG hoặc JPEG.

---

## 2. Công nghệ cốt lõi

- **Core Engine:** Tauri v2 (Rust 2021) — Quản lý clipboard native qua `arboard`, xử lý an toàn bộ nhớ pixel cap 8192px / 33.2MP.
- **Frontend UI:** React 19 + TypeScript + Tailwind CSS v4.
- **Thiết kế Giao diện:** Chuẩn VXUtilities Desktop UI Standards (Titlebar 32px tích hợp macOS native traffic lights, dark theme `#0f1117`, Electric Cyan accents).

---

## 3. Cài đặt và phát triển

### Yêu cầu môi trường
- Node.js ≥ 20.x
- Rust (Cargo) ≥ 1.80

### Khởi chạy môi trường phát triển
```bash
# Cài đặt thư viện frontend
npm install

# Khởi chạy chế độ dev
npm run tauri dev
```

### Đóng gói ứng dụng (Release)
```bash
# Kiểm tra build frontend
npm run build

# Đóng gói bundle macOS (.app)
npm run tauri build -- --bundles app
```

---

## 4. Tài liệu đặc tả kỹ thuật

Chi tiết tài liệu kiến trúc, luồng nghiệp vụ và hợp đồng IPC được lưu tại:
- [00_system_overview.md](docs/spec/00_system_overview.md)
- [01_business_process.md](docs/spec/01_business_process.md)
- [02_feature_flow.md](docs/spec/02_feature_flow.md)
- [03_ui_wireframe.md](docs/spec/03_ui_wireframe.md)
- [04_api_data.md](docs/spec/04_api_data.md)
- [05_qa_acceptance.md](docs/spec/05_qa_acceptance.md)
- [06_demo_presentation.md](docs/spec/06_demo_presentation.md)
