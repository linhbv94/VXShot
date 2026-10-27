# VXShot1.0.1 — QA bổ sung native

Ngày2026-10-27, tiếp yêu cầu user thử lại nativeQA. Công cụ hoạt động trở lại, chưa xác minh nguyên nhân noWindowsAvailable trước đó.

Native1.0.0 nạpPNGfixture640×400, thêmstep, Save/Cancel giữhistory và SavePNG thành công. Nhưng fastdrag solidmask hiệnpreview, Undo vẫndisabled, filePNG readback vùngmask vẫn pixelảnhgốc. Đây là lỗi chốtstrokestate, không phải focusreset đã sửa.

Sửa đồng bộ refs cho drawing/start/points/preview, windowmouseup và consume-once; thêm actualReact regression fastdrag +pixelreadback ảnhSave, cùng các checksfocus/save/updater cũ. Tag1.0.0 giữ nguyên; phát hànhpatch1.0.1, cùngkey/ID/SDK/engine.

Native thao tác đầy đủ/CI/package/public đang kiểm trước publish.
