use crate::types::{ClipboardImagePayload, SaveDialogOptions, SaveFileOptions, SaveFileResult};
use base64::Engine;
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use uuid::Uuid;

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

    // Tạo tên tệp staging tạm cùng thư mục
    let staging_filename = format!(".vxshot_staging_{}.tmp", Uuid::new_v4());
    let staging_path = parent_dir.join(&staging_filename);

    let bytes_len = options.image_bytes.len();

    // Ghi dữ liệu vào tệp staging
    let write_result = (|| -> Result<(), std::io::Error> {
        let mut file = File::create(&staging_path)?;
        file.write_all(&options.image_bytes)?;
        file.sync_all()?;
        Ok(())
    })();

    if let Err(e) = write_result {
        let _ = fs::remove_file(&staging_path);
        return Err(format!("Lỗi ghi dữ liệu xuống đĩa cứng: {e}"));
    }

    // Rename nguyên tử sang tệp đích
    if let Err(e) = fs::rename(&staging_path, &target_path) {
        let _ = fs::remove_file(&staging_path);
        return Err(format!("Lỗi cập nhật tệp thành phẩm: {e}"));
    }

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
        .add_filter("Hình ảnh", &["png", "jpg", "jpeg", "webp"])
        .pick_file();

    let path = match file_path {
        Some(p) => p,
        None => return Ok(None),
    };

    let bytes = match fs::read(&path) {
        Ok(b) => b,
        Err(e) => return Err(format!("Không thể đọc tệp: {e}")),
    };

    let dynamic_img = match image::load_from_memory(&bytes) {
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
