import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import {
  ClipboardImagePayload,
  ExportFormat,
  SaveDialogOptions,
  SaveFileOptions,
  SaveFileResult,
  WriteClipboardPayload,
} from '../types/canvas';
import { AppSettings } from '../types/settings';

export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const readClipboardImage = async (): Promise<ClipboardImagePayload | null> => {
  if (!isTauriEnvironment()) {
    console.warn('[TauriBridge] Mock readClipboardImage in web browser');
    return null;
  }
  return invoke<ClipboardImagePayload | null>('read_clipboard_image');
};

export const writeClipboardImage = async (payload: WriteClipboardPayload): Promise<void> => {
  if (!isTauriEnvironment()) {
    console.warn('[TauriBridge] Mock writeClipboardImage in web browser');
    return;
  }
  return invoke<void>('write_clipboard_image', { payload });
};

export const openSaveDialog = async (options: SaveDialogOptions): Promise<string | null> => {
  if (!isTauriEnvironment()) {
    return 'mock_screenshot.png';
  }
  return invoke<string | null>('open_save_dialog', { options });
};

export const saveImageFile = async (options: SaveFileOptions): Promise<SaveFileResult> => {
  if (!isTauriEnvironment()) {
    return { success: true, file_path: options.file_path, bytes_written: options.image_bytes.length };
  }
  return invoke<SaveFileResult>('save_image_file', { options });
};

export const openFileDialog = async (): Promise<ClipboardImagePayload | null> => {
  if (!isTauriEnvironment()) {
    return null;
  }
  return invoke<ClipboardImagePayload | null>('open_file_dialog');
};

export const getAppSettings = async (): Promise<AppSettings | null> => {
  if (!isTauriEnvironment()) {
    return null;
  }
  return invoke<AppSettings>('get_app_settings');
};

export const saveAppSettings = async (newSettings: AppSettings): Promise<void> => {
  if (!isTauriEnvironment()) {
    return;
  }
  return invoke<void>('save_app_settings', { new_settings: newSettings });
};

export const setAppLanguage = async (lang: string): Promise<void> => {
  if (!isTauriEnvironment()) {
    return;
  }
  try {
    await invoke<void>('set_app_language', { lang });
  } catch {
    // Fallback if not registered in mock
  }
};

export const minimizeWindow = async () => {
  if (isTauriEnvironment()) {
    await getCurrentWindow().minimize();
  }
};

export const toggleMaximizeWindow = async () => {
  if (isTauriEnvironment()) {
    await getCurrentWindow().toggleMaximize();
  }
};

export const closeWindow = async () => {
  if (isTauriEnvironment()) {
    await getCurrentWindow().close();
  }
};

export const listenToShortcut = (callback: () => void): Promise<UnlistenFn> => {
  if (!isTauriEnvironment()) return Promise.resolve(() => {});
  return listen('vxshot://shortcut-triggered', () => {
    callback();
  });
};

export const listenToWindowFocus = (callback: () => void): Promise<UnlistenFn> => {
  if (!isTauriEnvironment()) return Promise.resolve(() => {});
  return listen('vxshot://window-focused', () => {
    callback();
  });
};

export const listenToOpenSettings = (callback: () => void): Promise<UnlistenFn> => {
  if (!isTauriEnvironment()) return Promise.resolve(() => {});
  return listen('vxshot://open-settings', () => {
    callback();
  });
};

export const listenToMenuOpenFile = (callback: () => void): Promise<UnlistenFn> => {
  if (!isTauriEnvironment()) return Promise.resolve(() => {});
  return listen('vxshot://menu-open-file', () => {
    callback();
  });
};

export const listenToMenuSaveFile = (callback: () => void): Promise<UnlistenFn> => {
  if (!isTauriEnvironment()) return Promise.resolve(() => {});
  return listen('vxshot://menu-save-file', () => {
    callback();
  });
};

export const listenToMenuCopyResult = (callback: () => void): Promise<UnlistenFn> => {
  if (!isTauriEnvironment()) return Promise.resolve(() => {});
  return listen('vxshot://menu-copy-result', () => {
    callback();
  });
};

export const listenToMenuUndo = (callback: () => void): Promise<UnlistenFn> => {
  if (!isTauriEnvironment()) return Promise.resolve(() => {});
  return listen('vxshot://menu-undo', () => {
    callback();
  });
};

export const listenToMenuRedo = (callback: () => void): Promise<UnlistenFn> => {
  if (!isTauriEnvironment()) return Promise.resolve(() => {});
  return listen('vxshot://menu-redo', () => {
    callback();
  });
};
