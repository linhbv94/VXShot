# VXShot — QA và release

Version1.0.0, Windowsx64/macOS Silicon/Intel dùng chung engine clipboard/file Rust. Không có bản dummy. GitHub repo public, standard runners, không cache/artifacts trả phí. Mac SDK27.0, Intel cross-build trênARM runner; chưa GUIWin/Intel.

## Luồng phát hành

1. Đọc spec và work_log tổng; kiểm git status, stage đúng phạm vi, giữ appID com.vxshot.desktop và updater publickey.
2. npm ci; npm run build; cargo test --locked --manifest-path src-tauri/Cargo.toml --lib; node --test scripts/test_editor.mjs scripts/test_updates.mjs scripts/test_release_automation.mjs.
3. Bump đồng bộ npm/Cargo/config bằng scripts/set_version.mjs, viết docs/release_notes/VERSION.md thuần enduser. PR/merge, tag immutable vVERSION, push để release.yml build draft.
4. Kiểm cả3target+validate, tải latest.json mới sau retry (không giữ manifest cũ từ draft thiếuplatform), xác minh layout/chữ ký/tamper/SDK/icons/DMG thật. QA runtime ghi đúng nền tảng, không coi build/mock là native PASS.
5. User giao publish thì dispatch publish_release.yml với tag và local_qa_passed=true; kiểm workflow đúngSHA, stable/latest và6assets public200 không token. Ghi evidence và đóng riêng turn Codex sau public check.

## Khóa và giới hạn

Khóa updater riêng được tạo và lưu TAURI_SIGNING_PRIVATE_KEY trong Actions Secrets theo quyền user. Bản local ở .release_keys/vxshot_updater.key (ignored,0600); backup ngoài máy vào nơi mã hóa, không in hoặc commit khóa. GitHub Secrets không tải lại được giá trị. Không thay key khi chỉ lỗi build.

Mac ad-hoc và Windows chưa Authenticode: có thể cần cho phép mở lần đầu. Updater signing độc lập chữ kýOS; bản đầu cài thủ công một lần, bản cao hơn mới kiểm E2E old→new. Không upload ảnh: mạng chỉ dành updater GitHub.

## QA giữ phiên chỉnh sửa

scripts/qa_editor_session.cjs chạy actual React App với bridge fixture, không đọc clipboard thật, không phải nativeIPC. Cài jsdom/esbuild/@napi-rs/canvas ở thư mục tạm riêng rồi đặt VXSHOT_QA_NODE_MODULES=/absolute/path/node_modules và chạy node scripts/qa_editor_session.cjs. Script kiểm focus/globalshortcut/save-dialog không reset history, updater chặn bài chưa xuất; tạo fixture và dọn temp riêng. Không thêm những dependency QA này vào production.

Native QA vẫn cần mở ảnh fixture, thêm annotations, chuyển app/quay lại, Save cancel/confirm, Copy và Undo/Redo. Nếu công cụ máy khóa/noWindowsAvailable thì ghi phần chưa thử, không tuyên bố native PASS.

## Phạm vi1.0.0

Một ảnh PNG/JPEG nền, annotation, zoom/pan, undo/redo, export PNG/JPEG/clipboard. Multi-image/crop/transform/recent-file opener chưa triển khai; không quảng bá đã có.
