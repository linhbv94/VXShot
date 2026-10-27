#[cfg(test)]
mod tests {
    use crate::fs::atomic_save_image_file;
    use crate::types::{AppSettings, ClipboardImagePayload, ExportFormat, SaveFileOptions};
    use std::fs;

    #[test]
    fn test_settings_default_and_roundtrip() {
        let settings = AppSettings::default();
        assert!(settings.general.auto_hydrate_on_open);
        assert_eq!(settings.editor.default_export_format, "PNG");
        assert_eq!(settings.editor.jpeg_quality, 0.92);
        assert_eq!(settings.hotkeys.global_open, "CmdOrCtrl+Shift+X");

        let json = serde_json::to_string(&settings).expect("Serialization failed");
        assert!(json.contains("\"auto_hydrate_on_open\":true"));
        assert!(json.contains("\"default_export_format\":\"PNG\""));

        let deserialized: AppSettings = serde_json::from_str(&json).expect("Deserialization failed");
        assert_eq!(deserialized.general.auto_hydrate_on_open, settings.general.auto_hydrate_on_open);
        assert_eq!(deserialized.editor.default_export_format, settings.editor.default_export_format);
    }

    #[test]
    fn test_atomic_save_image_file() {
        let temp_dir = std::env::temp_dir().join(format!("vxshot_test_{}", uuid::Uuid::new_v4()));
        let target_file = temp_dir.join("test_output.png");
        let mut cursor = std::io::Cursor::new(Vec::new());
        image::RgbaImage::from_pixel(2, 2, image::Rgba([12, 34, 56, 78])).write_to(&mut cursor, image::ImageFormat::Png).unwrap();
        let fake_bytes = cursor.into_inner();

        let options = SaveFileOptions {
            file_path: target_file.to_string_lossy().to_string(),
            image_bytes: fake_bytes.clone(),
            format: ExportFormat::Png,
        };

        let result = atomic_save_image_file(options).expect("Atomic save should succeed");
        assert!(result.success);
        assert_eq!(result.bytes_written, fake_bytes.len());
        assert!(target_file.exists());

        // Kiểm tra nội dung tệp
        let read_bytes = fs::read(&target_file).expect("Read saved file failed");
        assert_eq!(read_bytes, fake_bytes);

        // Kiểm tra không để lại tệp staging rác .tmp trong thư mục
        let entries = fs::read_dir(&temp_dir).expect("Read dir failed");
        let mut tmp_count = 0;
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with(".vxshot_staging_") {
                tmp_count += 1;
            }
        }
        assert_eq!(tmp_count, 0, "No staging files should be left over");

        // Dọn dẹp
        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_clipboard_payload_snake_case() {
        let payload = ClipboardImagePayload {
            data_url: "data:image/png;base64,iVBORw0KGgo=".to_string(),
            width: 1920,
            height: 1080,
            has_alpha: true,
        };

        let json = serde_json::to_string(&payload).expect("Serialization failed");
        assert!(json.contains("\"data_url\":"));
        assert!(json.contains("\"has_alpha\":true"));
        assert!(json.contains("\"width\":1920"));
        assert!(json.contains("\"height\":1080"));

        let roundtrip: ClipboardImagePayload = serde_json::from_str(&json).expect("Deserialization failed");
        assert_eq!(roundtrip.width, 1920);
        assert_eq!(roundtrip.height, 1080);
        assert!(roundtrip.has_alpha);
    }
}

#[test]
fn malformed_export_preserves_existing_file() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("keep.png");
    std::fs::write(&path, b"original").unwrap();
    let result = crate::fs::atomic_save_image_file(crate::types::SaveFileOptions { file_path:path.to_string_lossy().into(), image_bytes:vec![1,2,3], format:crate::types::ExportFormat::Png });
    assert!(result.is_err());
    assert_eq!(std::fs::read(&path).unwrap(), b"original");
    assert_eq!(std::fs::read_dir(dir.path()).unwrap().count(),1);
}

fn fixture_png(width: u32, height: u32) -> Vec<u8> {
    let mut out = std::io::Cursor::new(Vec::new());
    image::RgbaImage::from_pixel(width, height, image::Rgba([17, 51, 99, 128]))
        .write_to(&mut out, image::ImageFormat::Png).unwrap();
    out.into_inner()
}

#[test]
fn png_alpha_and_dimensions_roundtrip() {
    let bytes = fixture_png(4, 3);
    let img = crate::clipboard::decode_bounded_image(&bytes).unwrap().to_rgba8();
    assert_eq!(img.dimensions(), (4, 3));
    assert!(img.pixels().all(|p| p.0 == [17, 51, 99, 128]));
}

#[test]
fn file_decoder_rejects_overwide_image_and_empty_data() {
    assert!(crate::clipboard::decode_bounded_image(&fixture_png(8193, 1)).is_err());
    assert!(crate::clipboard::decode_bounded_image(&[]).is_err());
}

#[test]
fn atomic_replace_valid_image_preserves_exact_pixels_and_cleans_staging() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("output.png");
    std::fs::write(&path, b"old").unwrap();
    let bytes = fixture_png(4, 3);
    crate::fs::atomic_save_image_file(crate::types::SaveFileOptions {file_path:path.to_string_lossy().into(),image_bytes:bytes.clone(),format:crate::types::ExportFormat::Png}).unwrap();
    assert_eq!(std::fs::read(&path).unwrap(), bytes);
    assert_eq!(std::fs::read_dir(dir.path()).unwrap().count(),1);
}

#[test]
fn export_format_mismatch_preserves_destination() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("output.jpg");
    std::fs::write(&path, b"keep").unwrap();
    assert!(crate::fs::atomic_save_image_file(crate::types::SaveFileOptions {file_path:path.to_string_lossy().into(),image_bytes:fixture_png(4,3),format:crate::types::ExportFormat::Jpeg}).is_err());
    assert_eq!(std::fs::read(&path).unwrap(), b"keep");
}

#[cfg(unix)]
#[test]
fn export_refuses_symlink_without_modifying_target() {
    let dir = tempfile::tempdir().unwrap();
    let original = dir.path().join("original.png");
    std::fs::write(&original,b"keep").unwrap();
    let link = dir.path().join("link.png");
    std::os::unix::fs::symlink(&original, &link).unwrap();
    assert!(crate::fs::atomic_save_image_file(crate::types::SaveFileOptions {file_path:link.to_string_lossy().into(),image_bytes:fixture_png(4,3),format:crate::types::ExportFormat::Png}).is_err());
    assert_eq!(std::fs::read(&original).unwrap(),b"keep");
    assert!(std::fs::symlink_metadata(&link).unwrap().file_type().is_symlink());
}
