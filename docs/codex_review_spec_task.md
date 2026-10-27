# Nhiệm vụ: Tham vấn & Review Bộ Tài liệu Đặc tả Kỹ thuật VXShot

Vai trò: Chỉ tham vấn/review chỉ đọc; không sửa nguồn; không gọi agent khác.
Tuân thủ AGENTS.md, tiếng Việt chuyên nghiệp, UTF-8, snake_case và tuyệt đối không dùng LaTeX.

## 1. Bối cảnh dự án
Dự án **VXShot** — tiện ích máy tính chỉnh sửa và xử lý nhanh ảnh từ clipboard (bộ nhớ tạm) trên Windows và macOS, không tự chụp màn hình.
Phạm vi sản phẩm: [vxshot/VXShot_Scope_v1.0.md](../../VXShot_Scope_v1.0.md).
Quy chuẩn thiết kế: [.agents/desktop_ui_standards.md](../../.agents/desktop_ui_standards.md) và [_summary/master_theme.md](../../_summary/master_theme.md).

Bộ tài liệu đặc tả (Docs / Spec Suite) vừa được biên soạn hoàn chỉnh gồm 7 tài liệu tại thư mục `vxshot/docs/spec/`:
- `vxshot/docs/spec/00_system_overview.md`: Tổng quan hệ thống, ma trận độ khó, kiến trúc 3 tầng, phân rã chức năng và lộ trình 3 giai đoạn.
- `vxshot/docs/spec/01_business_process.md`: Quy trình nghiệp vụ vĩ mô, SIPOC, BPMN/Swimlane cho UC-01 (Quick Save), UC-02 (Quick Annotate), UC-03 (Ghép ảnh), Dirty State Guard và 4 ma trận quyết định.
- `vxshot/docs/spec/02_feature_flow.md`: Luồng người dùng, sơ đồ tuần tự hệ thống Sequence (đọc clipboard, flatten export, lưu tệp), máy trạng thái FSM và 3 Machine-Readable Contracts cho AI Dev Agent.
- `vxshot/docs/spec/03_ui_wireframe.md`: Tokens giao diện Slate Navy (#0f1117) và Electric Cyan (#06b6d4), Titlebar 32px chuẩn zTools, ASCII wireframes, cây component, ma trận trạng thái và visual prompt.
- `vxshot/docs/spec/04_api_data.md`: Hợp đồng IPC Tauri v2, JSON schemas (ClipboardImagePayload, CanvasState, ImageNode, AnnotationNode, AppSettings), sơ đồ ERD và ma trận mã lỗi.
- `vxshot/docs/spec/05_qa_acceptance.md`: Tiêu chuẩn nghiệm thu Gherkin cho 3 use cases chính, kiểm thử an toàn phá hủy pixel của Solid Redaction, độc lập mức zoom, ma trận 10 edge cases và checklist bàn giao đa nền tảng.
- `vxshot/docs/spec/06_demo_presentation.md`: Kịch bản demo 3 hồi 5 phút, 3 Wow Factors (Zero-Click Hydration, Zero-Leak Solid Redaction, Zero-Junk Copy Result), seed data và contingency playbook.

## 2. Yêu cầu Review & Tham vấn
Codex hãy đọc kỹ toàn bộ 7 file spec trên và đưa ra phản biện, nhận xét chuyên sâu tập trung vào 4 trọng tâm:
1. **Tính khả thi và độ hoàn thiện kiến trúc:** Bộ công nghệ đề xuất (Tauri v2 + Rust bridge với `arboard`, React 19 + Konva.js/`react-konva`) có rào cản hay xung đột nào không? Konva.js xử lý ảnh kích thước lớn (4K/8K) trên WebView có nguy cơ gì về bộ nhớ/hiệu năng?
2. **Khả năng xử lý các điểm nghẽn kỹ thuật (Technical Bottlenecks):**
   - Đọc/ghi clipboard đa nền tảng: Bảo toàn kênh Alpha (32-bit RGBA) trên Windows (`CF_DIBV5` vs `image/png`) và macOS (`NSPasteboard` TIFF/PNG).
   - Kết xuất raster độc lập mức zoom (Zoom-independent Flatten Export): Cơ chế clone hoặc detach stage ẩn để render đúng kích thước pixel thực mà không làm giật màn hình hiển thị.
   - Bảo mật khối che (Solid Redaction): Đảm bảo khi flatten, pixel thực sự bị ghi đè phá hủy, không để lộ dữ liệu nhạy cảm.
3. **Tính nhất quán chéo (Cross-Spec Consistency):**
   - Các lệnh IPC trong `04_api_data.md` có đáp ứng đầy đủ luồng thực thi trong `02_feature_flow.md` và `00_system_overview.md` chưa?
   - Cấu trúc state và dữ liệu có khớp giữa frontend và backend Rust không?
4. **Đề xuất hành động & Khuyến nghị thực thi trước khi code Phase 1:**
   - Những điểm cần lưu ý đặc biệt, bẫy tiềm ẩn (gotchas) hoặc bổ sung cần thiết để khi bắt đầu lập trình Phase 1 (Clipboard -> Quick Save/Copy) diễn ra trơn tru nhất.

## 3. Định dạng đầu ra mong muốn
- Phân tích gãy gọn, mạch lạc, trực diện vào vấn đề kỹ thuật.
- Trình bày dạng danh mục hoặc bảng đối chiếu rõ ràng.
- Ghi nhận xét vào một báo cáo tổng kết hoàn chỉnh.
