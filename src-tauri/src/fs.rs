use crate::types::{ClipboardImagePayload, SaveDialogOptions, SaveFileOptions, SaveFileResult};
use base64::Engine;
use std::fs;
use std::io::Write;
use std::path::PathBuf;


pub fn atomic_save_image_file(options: SaveFileOptions) -> Result<SaveFileResult, String> {
    let target_path = PathBuf::from(&options.file_path);
    let parent_dir = target_path
        .parent()
        .ok_or_else(|| "Đường dẫn tệp không có thư mục cha hợp lệ.".to_string())?;

    if !parent_dir.exists() {
        if let Err(e) = fs::create_dir_all(parent_dir) {
            return Err(format!("Không thể tạo thư mục lưu tệp: {e}"));
        }
    }

    if options.image_bytes.is_empty() || options.image_bytes.len() > 64 * 1024 * 1024 {
        return Err("Dữ liệu ảnh rỗng hoặc vượt giới hạn 64MiB.".into());
    }
    let expected = match options.format { crate::types::ExportFormat::Png => image::ImageFormat::Png, crate::types::ExportFormat::Jpeg => image::ImageFormat::Jpeg };
    if image::guess_format(&options.image_bytes).ok() != Some(expected) {
        return Err("Dữ liệu ảnh không khớp định dạng xuất.".into());
    }
    crate::clipboard::decode_bounded_image(&options.image_bytes)?;
    if fs::symlink_metadata(&target_path).map(|m| m.file_type().is_symlink() || !m.is_file()).unwrap_or(false) {
        return Err("Đích lưu phải là tệp thông thường, không phải liên kết hoặc thư mục.".into());
    }
    let mut staging = tempfile::Builder::new().prefix(".vxshot_staging_").tempfile_in(parent_dir)
        .map_err(|e| format!("Không tạo được tệp tạm: {e}"))?;
    let bytes_len = options.image_bytes.len();
    staging.write_all(&options.image_bytes).and_then(|_| staging.as_file().sync_all())
        .map_err(|e| format!("Lỗi ghi dữ liệu: {e}"))?;
    staging.persist(&target_path).map_err(|e| format!("Không cập nhật được tệp đích: {e}"))?;

    Ok(SaveFileResult {
        success: true,
        file_path: options.file_path,
        bytes_written: bytes_len,
    })
}

pub fn open_save_dialog(options: SaveDialogOptions) -> Option<String> {
    let mut dialog = rfd::FileDialog::new()
        .set_file_name(&options.default_name);

    if options.default_extension.to_lowercase() == "jpeg" || options.default_extension.to_lowercase() == "jpg" {
        dialog = dialog
            .add_filter("JPEG Image", &["jpg", "jpeg"])
            .add_filter("PNG Image", &["png"]);
    } else {
        dialog = dialog
            .add_filter("PNG Image", &["png"])
            .add_filter("JPEG Image", &["jpg", "jpeg"]);
    }

    let file_path = dialog.save_file()?;
    Some(file_path.to_string_lossy().to_string())
}

pub fn open_file_dialog() -> Result<Option<ClipboardImagePayload>, String> {
    let file_path = rfd::FileDialog::new()
        .add_filter("Hình ảnh", &["png", "jpg", "jpeg"])
        .pick_file();

    let path = match file_path {
        Some(p) => p,
        None => return Ok(None),
    };

    if fs::metadata(&path).map_err(|e| e.to_string())?.len() > 64 * 1024 * 1024 { return Err("Tệp ảnh vượt giới hạn 64MiB.".into()); }
    let bytes = match fs::read(&path) {
        Ok(b) => b,
        Err(e) => return Err(format!("Không thể đọc tệp: {e}")),
    };

    let dynamic_img = match crate::clipboard::decode_bounded_image(&bytes) {
        Ok(img) => img,
        Err(e) => return Err(format!("Định dạng ảnh không được hỗ trợ: {e}")),
    };

    let width = dynamic_img.width();
    let height = dynamic_img.height();
    let has_alpha = dynamic_img.color().has_alpha();

    // Chuẩn hóa sang PNG base64
    let mut png_bytes: Vec<u8> = Vec::new();
    let mut cursor = std::io::Cursor::new(&mut png_bytes);
    if let Err(e) = dynamic_img.write_to(&mut cursor, image::ImageFormat::Png) {
        return Err(format!("Lỗi chuyển đổi ảnh: {e}"));
    }

    let b64 = base64::engine::general_purpose::STANDARD.encode(&png_bytes);
    let data_url = format!("data:image/png;base64,{b64}");

    Ok(Some(ClipboardImagePayload {
        data_url,
        width,
        height,
        has_alpha,
    }))
}
