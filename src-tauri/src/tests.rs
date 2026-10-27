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
        let fake_bytes = vec![137, 80, 78, 71, 13, 10, 26, 10, 0, 1, 2, 3];

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
