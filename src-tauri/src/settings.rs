use crate::types::AppSettings;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;

fn get_config_path() -> PathBuf {
    let mut dir = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
    dir.push("vxshot");
    let _ = fs::create_dir_all(&dir);
    dir.push("config.json");
    dir
}

pub fn load_settings() -> AppSettings {
    let path = get_config_path();
    if !path.exists() {
        return AppSettings::default();
    }

    let mut file = match File::open(&path) {
        Ok(f) => f,
        Err(_) => return AppSettings::default(),
    };

    let mut content = String::new();
    if file.read_to_string(&mut content).is_err() {
        return AppSettings::default();
    }

    serde_json::from_str(&content).unwrap_or_default()
}

pub fn save_settings(settings: &AppSettings) -> Result<(), String> {
    let path = get_config_path();
    let content = match serde_json::to_string_pretty(settings) {
        Ok(s) => s,
        Err(e) => return Err(format!("Lỗi serialize cấu hình: {e}")),
    };

    let mut file = match File::create(&path) {
        Ok(f) => f,
        Err(e) => return Err(format!("Lỗi tạo tệp cấu hình: {e}")),
    };

    if let Err(e) = file.write_all(content.as_bytes()) {
        return Err(format!("Lỗi ghi tệp cấu hình: {e}"));
    }

    Ok(())
}
