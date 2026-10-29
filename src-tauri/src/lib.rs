// VXShot — Native Tauri Engine Core & Desktop Integration
// Quản lý IPC Commands, Clipboard Bridge đa nền tảng, Atomic Save và Native Titlebar

pub mod clipboard;
pub mod fs;
pub mod settings;
pub mod types;

#[cfg(test)]
mod tests;

use tauri::{AppHandle, Emitter, Manager, State};
use types::{
    AppSettings, ClipboardImagePayload, SaveDialogOptions, SaveFileOptions, SaveFileResult,
    WriteClipboardPayload,
};

pub struct AppState {
    // Có thể bổ sung cache nếu cần
}

#[tauri::command]
fn read_clipboard_image(_state: State<'_, AppState>) -> Result<Option<ClipboardImagePayload>, String> {
    clipboard::read_clipboard_image()
}

#[tauri::command]
fn write_clipboard_image(
    payload: WriteClipboardPayload,
    _state: State<'_, AppState>,
) -> Result<(), String> {
    clipboard::write_clipboard_image(payload)
}

#[tauri::command]
fn open_save_dialog(options: SaveDialogOptions, _app: AppHandle) -> Result<Option<String>, String> {
    Ok(fs::open_save_dialog(options))
}

#[tauri::command]
fn save_image_file(
    options: SaveFileOptions,
    _state: State<'_, AppState>,
) -> Result<SaveFileResult, String> {
    fs::atomic_save_image_file(options)
}

#[tauri::command]
fn open_file_dialog(_app: AppHandle) -> Result<Option<ClipboardImagePayload>, String> {
    fs::open_file_dialog()
}

#[tauri::command]
fn get_app_settings(_state: State<'_, AppState>) -> Result<AppSettings, String> {
    Ok(settings::load_settings())
}

#[tauri::command(rename_all = "snake_case")]
fn save_app_settings(
    app: AppHandle,
    new_settings: AppSettings,
    _state: State<'_, AppState>,
) -> Result<(), String> {
    let res = settings::save_settings(&new_settings);
    #[cfg(target_os = "macos")]
    rebuild_mac_app_menu(&app, &new_settings.general.language);
    #[cfg(not(target_os = "macos"))]
    let _ = app;
    res
}

#[tauri::command]
fn set_app_language(app: AppHandle, lang: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    rebuild_mac_app_menu(&app, &lang);
    #[cfg(not(target_os = "macos"))]
    let _ = (app, lang);
    Ok(())
}

#[cfg(target_os = "macos")]
fn rebuild_mac_app_menu(app: &AppHandle, lang: &str) {
    use tauri::menu::{AboutMetadata, Menu, MenuItem, PredefinedMenuItem, Submenu};

    let is_en = lang.trim().eq_ignore_ascii_case("en");
    let settings_label = if is_en { "Settings…" } else { "Cài đặt…" };
    let file_menu_label = if is_en { "File" } else { "Tệp" };
    let open_file_label = if is_en { "Open Image…" } else { "Mở tệp ảnh…" };
    let save_file_label = if is_en { "Save Image…" } else { "Lưu tệp ảnh…" };
    let edit_menu_label = if is_en { "Edit" } else { "Chỉnh sửa" };
    let undo_label = if is_en { "Undo Annotation" } else { "Hoàn tác chú thích" };
    let redo_label = if is_en { "Redo Annotation" } else { "Làm lại chú thích" };
    let copy_result_label = if is_en {
        "Copy Annotated Image"
    } else {
        "Sao chép ảnh thành phẩm"
    };
    let credits_text = if is_en {
        "Bùi Việt Linh\nFast clipboard screenshot editor & privacy redactor in the VXUtilities suite.\nGitHub: https://github.com/linhbv94/VXShot"
    } else {
        "Bùi Việt Linh\nTiện ích chỉnh sửa, chú thích và che thông tin nhanh ảnh từ clipboard thuộc bộ VXUtilities.\nGitHub: https://github.com/linhbv94/VXShot"
    };

    let pkg = app.package_info();
    let about_meta = AboutMetadata {
        name: Some("VXShot".to_string()),
        version: Some(pkg.version.to_string()),
        // Explicit empty build version suppresses AppKit Info.plist fallback.
        short_version: Some(String::new()),
        authors: Some(vec!["Bùi Việt Linh".to_string()]),
        comments: Some(credits_text.to_string()),
        copyright: Some("© 2026 Bùi Việt Linh. All rights reserved.".to_string()),
        license: Some("MIT".to_string()),
        website: Some("https://github.com/linhbv94/VXShot".to_string()),
        website_label: Some("GitHub — linhbv94/VXShot".to_string()),
        credits: Some(credits_text.to_string()),
        icon: Some(tauri::include_image!("icons/icon.png")),
    };

    if let Ok(settings_item) =
        MenuItem::with_id(app, "app_settings", settings_label, true, Some("CmdOrCtrl+,"))
    {
        if let Ok(app_submenu) = Submenu::with_items(
            app,
            "VXShot",
            true,
            &[
                &PredefinedMenuItem::about(app, Some("About VXShot"), Some(about_meta)).unwrap(),
                &PredefinedMenuItem::separator(app).unwrap(),
                &settings_item,
                &PredefinedMenuItem::separator(app).unwrap(),
                &PredefinedMenuItem::services(app, None).unwrap(),
                &PredefinedMenuItem::separator(app).unwrap(),
                &PredefinedMenuItem::hide(app, None).unwrap(),
                &PredefinedMenuItem::hide_others(app, None).unwrap(),
                &PredefinedMenuItem::show_all(app, None).unwrap(),
                &PredefinedMenuItem::separator(app).unwrap(),
                &PredefinedMenuItem::quit(app, None).unwrap(),
            ],
        ) {
            let open_item =
                MenuItem::with_id(app, "file_open", open_file_label, true, Some("CmdOrCtrl+O"))
                    .unwrap();
            let save_item =
                MenuItem::with_id(app, "file_save", save_file_label, true, Some("CmdOrCtrl+S"))
                    .unwrap();
            let file_submenu = Submenu::with_items(
                app,
                file_menu_label,
                true,
                &[
                    &open_item,
                    &save_item,
                    &PredefinedMenuItem::separator(app).unwrap(),
                    &PredefinedMenuItem::close_window(app, None).unwrap(),
                ],
            )
            .unwrap();

            let undo_item =
                MenuItem::with_id(app, "edit_undo", undo_label, true, Some("CmdOrCtrl+Z")).unwrap();
            let redo_item =
                MenuItem::with_id(app, "edit_redo", redo_label, true, Some("CmdOrCtrl+Shift+Z"))
                    .unwrap();
            let copy_item = MenuItem::with_id(
                app,
                "edit_copy_result",
                copy_result_label,
                true,
                Some("CmdOrCtrl+Shift+C"),
            )
            .unwrap();
            let edit_submenu = Submenu::with_items(
                app,
                edit_menu_label,
                true,
                &[
                    &undo_item,
                    &redo_item,
                    &PredefinedMenuItem::separator(app).unwrap(),
                    &copy_item,
                    &PredefinedMenuItem::separator(app).unwrap(),
                    &PredefinedMenuItem::cut(app, None).unwrap(),
                    &PredefinedMenuItem::copy(app, None).unwrap(),
                    &PredefinedMenuItem::paste(app, None).unwrap(),
                    &PredefinedMenuItem::select_all(app, None).unwrap(),
                ],
            )
            .unwrap();

            if let Ok(menu) = Menu::with_items(app, &[&app_submenu, &file_submenu, &edit_submenu]) {
                let _ = app.set_menu(menu);
            }
        }
    }
}

#[cfg(target_os = "macos")]
#[allow(deprecated)]
fn sync_mac_traffic_lights(window: &tauri::WebviewWindow) {
    let win = window.clone();
    let win_closure = win.clone();
    let _ = win.run_on_main_thread(move || {
        #[allow(deprecated)]
        use cocoa::base::{id, nil, BOOL, YES};
        #[allow(deprecated)]
        use cocoa::foundation::{NSPoint, NSRect};
        use objc::{class, msg_send, sel, sel_impl};

        if let Ok(ns_win_ptr) = win_closure.ns_window() {
            let ns_window = ns_win_ptr as id;
            unsafe {
                let style_mask: u64 = msg_send![ns_window, styleMask];
                // NSWindowStyleMaskFullScreen = 1 << 14
                let is_fullscreen = (style_mask & (1 << 14)) != 0;
                if is_fullscreen {
                    return;
                }

                // Traffic lights buttons: 0 = Close, 1 = Miniaturize, 2 = Zoom
                // SDK27.0 native appearance; center spacing =20pt, preserve AppKit padding.
                // View dimensions include AppKit padding; never force the view to 12x12.
                for (i, btn_id) in [0, 1, 2].iter().enumerate() {
                    let btn: id = msg_send![ns_window, standardWindowButton: *btn_id];
                    if btn != nil {
                        let is_hidden: BOOL = msg_send![btn, isHidden];
                        if is_hidden == YES {
                            continue;
                        }
                        // A 12pt bezel has native padding (SDK15.5: frame14x16).
                        // Restore pristine AppKit geometry, never scale the bezel to 12x12.
                        let reference: id = msg_send![class!(NSWindow),
                            standardWindowButton: *btn_id forStyleMask: style_mask];
                        if reference == nil {
                            continue;
                        }
                        let reference_frame: NSRect = msg_send![reference, frame];
                        let reference_bounds: NSRect = msg_send![reference, bounds];
                        let control_size: u64 = msg_send![reference, controlSize];
                        let _: () = msg_send![btn, setControlSize: control_size];
                        // Align against the web content toolbar, not AppKit titlebar metrics.
                        // convertPoint handles the native parent hierarchy and flipped coordinates.
                        let content_view: id = msg_send![ns_window, contentView];
                        let superview: id = msg_send![btn, superview];
                        if content_view == nil || superview == nil {
                            continue;
                        }
                        let content_bounds: NSRect = msg_send![content_view, bounds];
                        let is_flipped: BOOL = msg_send![content_view, isFlipped];
                        // DOM flex center: (32px header − 1px bottom divider) / 2.
                        let toolbar_center_from_top = 15.5;
                        let toolbar_center_y = if is_flipped == YES {
                            toolbar_center_from_top
                        } else {
                            content_bounds.size.height - toolbar_center_from_top
                        };
                        let content_center = NSPoint {
                            x: content_bounds.origin.x + 8.0 + (i as f64) * 20.0 + 6.0,
                            y: content_bounds.origin.y + toolbar_center_y,
                        };
                        let native_center: NSPoint = msg_send![superview,
                            convertPoint: content_center fromView: content_view];
                        let target_x = native_center.x - reference_frame.size.width / 2.0;
                        let target_y = native_center.y - reference_frame.size.height / 2.0;
                        let target_frame = NSRect {
                            origin: NSPoint { x: target_x, y: target_y },
                            size: reference_frame.size,
                        };
                        let _: () = msg_send![btn, setFrame: target_frame];
                        // Match frame/bounds without a view transform, retaining native padding.
                        let _: () = msg_send![btn, setBounds: reference_bounds];
                    }
                }
            }
        }
    });
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(AppState {})
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                let initial_settings = settings::load_settings();
                rebuild_mac_app_menu(app.handle(), &initial_settings.general.language);
                if let Some(main_win) = app.get_webview_window("main") {
                    sync_mac_traffic_lights(&main_win);
                }
            }

            #[cfg(target_os = "windows")]
            {
                if let Some(main_win) = app.get_webview_window("main") {
                    let _ = main_win.set_decorations(false);
                }
            }

            // Đăng ký phím tắt toàn hệ thống CmdOrCtrl+Shift+X
            use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};
            let app_handle = app.handle().clone();
            let shortcut: Shortcut = "CmdOrCtrl+Shift+X".parse().unwrap();
            let _ = app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
                if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                    if let Some(win) = app_handle.get_webview_window("main") {
                        let _ = win.unminimize();
                        let _ = win.show();
                        let _ = win.set_focus();
                        let _ = app_handle.emit("vxshot://shortcut-triggered", ());
                    }
                }
            });

            Ok(())
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            "app_settings" => {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.unminimize();
                    let _ = win.show();
                    let _ = win.set_focus();
                }
                let _ = app.emit("vxshot://open-settings", ());
            }
            "file_open" => {
                let _ = app.emit("vxshot://menu-open-file", ());
            }
            "file_save" => {
                let _ = app.emit("vxshot://menu-save-file", ());
            }
            "edit_undo" => {
                let _ = app.emit("vxshot://menu-undo", ());
            }
            "edit_redo" => {
                let _ = app.emit("vxshot://menu-redo", ());
            }
            "edit_copy_result" => {
                let _ = app.emit("vxshot://menu-copy-result", ());
            }
            _ => {}
        })
        .on_window_event(|window, event| {
            #[cfg(target_os = "macos")]
            {
                if matches!(
                    event,
                    tauri::WindowEvent::Resized(_)
                        | tauri::WindowEvent::Focused(true)
                        | tauri::WindowEvent::ScaleFactorChanged { .. }
                ) {
                    if let Some(win) = window.app_handle().get_webview_window(window.label()) {
                        sync_mac_traffic_lights(&win);
                    }
                }
            }

            if let tauri::WindowEvent::Focused(is_focused) = event {
                if *is_focused {
                    let _ = window.emit("vxshot://window-focused", true);
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            read_clipboard_image,
            write_clipboard_image,
            open_save_dialog,
            save_image_file,
            open_file_dialog,
            get_app_settings,
            save_app_settings,
            set_app_language
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, _event| {});
}
