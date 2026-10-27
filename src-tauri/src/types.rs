use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ClipboardImagePayload {
    pub data_url: String,
    pub width: u32,
    pub height: u32,
    pub has_alpha: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct WriteClipboardPayload {
    pub image_bytes: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub has_alpha: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct SaveDialogOptions {
    pub default_name: String,
    pub default_extension: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ExportFormat {
    Png,
    Jpeg,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct SaveFileOptions {
    pub file_path: String,
    pub image_bytes: Vec<u8>,
    pub format: ExportFormat,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct SaveFileResult {
    pub success: bool,
    pub file_path: String,
    pub bytes_written: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct GeneralSettings {
    pub auto_hydrate_on_open: bool,
    pub fit_window_on_open: bool,
    pub theme: String,
    pub language: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct HotkeySettings {
    pub global_open: String,
    pub quick_save: String,
    pub copy_result: String,
    pub undo: String,
    pub redo: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct EditorSettings {
    pub default_export_format: String,
    pub jpeg_quality: f32,
    pub jpeg_background: String,
    pub default_stroke_color: String,
    pub default_stroke_width: u32,
    pub default_font_size: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct PrivacySettings {
    pub default_redact_mode: String,
    pub solid_redact_color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct AppSettings {
    pub general: GeneralSettings,
    pub hotkeys: HotkeySettings,
    pub editor: EditorSettings,
    pub privacy: PrivacySettings,
    pub recent_files: Vec<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            general: GeneralSettings {
                auto_hydrate_on_open: true,
                fit_window_on_open: true,
                theme: "dark".to_string(),
                language: "vi".to_string(),
            },
            hotkeys: HotkeySettings {
                global_open: "CmdOrCtrl+Shift+X".to_string(),
                quick_save: "CmdOrCtrl+S".to_string(),
                copy_result: "CmdOrCtrl+Shift+C".to_string(),
                undo: "CmdOrCtrl+Z".to_string(),
                redo: "CmdOrCtrl+Shift+Z".to_string(),
            },
            editor: EditorSettings {
                default_export_format: "PNG".to_string(),
                jpeg_quality: 0.92,
                jpeg_background: "#ffffff".to_string(),
                default_stroke_color: "#ef4444".to_string(),
                default_stroke_width: 4,
                default_font_size: 18,
            },
            privacy: PrivacySettings {
                default_redact_mode: "SOLID_BLOCK".to_string(),
                solid_redact_color: "#000000".to_string(),
            },
            recent_files: Vec::new(),
        }
    }
}
