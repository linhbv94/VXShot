export interface GeneralSettings {
  auto_hydrate_on_open: boolean;
  fit_window_on_open: boolean;
  theme: string;
  language: string;
}

export interface HotkeySettings {
  global_open: string;
  quick_save: string;
  copy_result: string;
  undo: string;
  redo: string;
}

export interface EditorSettings {
  default_export_format: string;
  jpeg_quality: number;
  jpeg_background: string;
  default_stroke_color: string;
  default_stroke_width: number;
  default_font_size: number;
}

export interface PrivacySettings {
  default_redact_mode: string;
  solid_redact_color: string;
}

export interface AppSettings {
  general: GeneralSettings;
  hotkeys: HotkeySettings;
  editor: EditorSettings;
  privacy: PrivacySettings;
  recent_files: string[];
}
