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
    new_settings: AppSettings,
    _state: State<'_, AppState>,
) -> Result<(), String> {
    settings::save_settings(&new_settings)
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
            save_app_settings
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, _event| {});
}
