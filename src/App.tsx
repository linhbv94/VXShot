import { AppUpdates } from './components/AppUpdates';
import { translateNode } from './services/editor_geometry';
import { shouldAutoHydrate } from './services/editor_session';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Titlebar } from './components/Titlebar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { FloatingToolbar } from './components/FloatingToolbar';
import { BottomStatusBar } from './components/BottomStatusBar';
import { SettingsModal, SettingsTab } from './components/SettingsModal';
import { Toast } from './components/Toast';
import {
  AnnotationNode,
  ClipboardImagePayload,
  ExportFormat,
  SaveDialogOptions,
  SaveFileOptions,
  ToolProperties,
  ToolType,
  ViewportState,
  WriteClipboardPayload,
} from './types/canvas';
import { AppSettings } from './types/settings';
import {
  getAppSettings,
  listenToMenuCopyResult,
  listenToMenuOpenFile,
  listenToMenuRedo,
  listenToMenuSaveFile,
  listenToMenuUndo,
  listenToOpenSettings,
  listenToShortcut,
  listenToWindowFocus,
  openFileDialog,
  openSaveDialog,
  readClipboardImage,
  saveAppSettings,
  saveImageFile,
  setAppLanguage,
  writeClipboardImage,
} from './services/tauri_bridge';
import {
  AppLanguage,
  ThemeMode,
  normalizeLanguage,
  normalizeTheme,
  translations,
} from './i18n/translations';

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    auto_hydrate_on_open: true,
    fit_window_on_open: true,
    theme: 'dark',
    language: 'vi',
  },
  hotkeys: {
    global_open: 'CmdOrCtrl+Shift+X',
    quick_save: 'CmdOrCtrl+S',
    copy_result: 'CmdOrCtrl+Shift+C',
    undo: 'CmdOrCtrl+Z',
    redo: 'CmdOrCtrl+Shift+Z',
  },
  editor: {
    default_export_format: 'PNG',
    jpeg_quality: 0.92,
    jpeg_background: '#ffffff',
    default_stroke_color: '#ef4444',
    default_stroke_width: 4,
    default_font_size: 18,
  },
  privacy: {
    default_redact_mode: 'SOLID_BLOCK',
    solid_redact_color: '#000000',
  },
  recent_files: [],
};

function applyDocumentTheme(theme: ThemeMode, lang: AppLanguage) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  let resolved: 'dark' | 'light' | 'oled' = 'dark';
  if (theme === 'system') {
    const prefersLight =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches;
    resolved = prefersLight ? 'light' : 'dark';
  } else {
    resolved = theme;
  }
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-theme-mode', theme);
  root.lang = lang;
  if (resolved === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
}

export const App: React.FC = () => {
  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac');

  const [imagePayload, setImagePayload] = useState<ClipboardImagePayload | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ zoom: 1.0, pan_x: 0, pan_y: 0 });
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedLang = localStorage.getItem('vxshot_lang');
      const savedTheme = localStorage.getItem('vxshot_theme');
      return {
        ...DEFAULT_SETTINGS,
        general: {
          ...DEFAULT_SETTINGS.general,
          language: normalizeLanguage(savedLang || DEFAULT_SETTINGS.general.language),
          theme: normalizeTheme(savedTheme || DEFAULT_SETTINGS.general.theme),
        },
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const lang: AppLanguage = normalizeLanguage(settings.general.language);
  const themeMode: ThemeMode = normalizeTheme(settings.general.theme);
  const tApp = translations[lang].app;

  const [statusMessage, setStatusMessage] = useState<string>(tApp.ready);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Quản lý Annotation & Tooling
  const [activeTool, setActiveTool] = useState<ToolType>('rect');
  const [toolProperties, setToolProperties] = useState<ToolProperties>({
    color: '#ef4444',
    strokeWidth: 4,
    fontSize: 20,
    solidRedactColor: '#000000',
  });
  const [annotations, setAnnotations] = useState<AnnotationNode[]>([]);
  const [history, setHistory] = useState<{ nodes: AnnotationNode[]; image: ClipboardImagePayload | null }[]>([{ nodes: [], image: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const live = useRef({ imagePayload, annotations, settings, isSaving, isCopying, lang });
  live.current = { imagePayload, annotations, settings, isSaving, isCopying, lang };
  const documentKey = (nodes: AnnotationNode[], image: ClipboardImagePayload | null) => JSON.stringify({ nodes, width: image?.width, height: image?.height });
  const savedAnnotations = useRef(documentKey([], null));
  const commitRef = useRef<(nodes: AnnotationNode[], image?: ClipboardImagePayload) => void>(() => {});
  const loadSequence = useRef(0);
  const approveReplace = () =>
    documentKey(live.current.annotations, live.current.imagePayload) === savedAnnotations.current ||
    window.confirm(translations[live.current.lang].app.confirmReplace);

  // Đồng bộ theme, ngôn ngữ và native macOS menu
  useEffect(() => {
    applyDocumentTheme(themeMode, lang);
    try {
      localStorage.setItem('vxshot_lang', lang);
      localStorage.setItem('vxshot_theme', themeMode);
    } catch {
      // ignore storage errors
    }
    setAppLanguage(lang);
  }, [themeMode, lang]);

  // Lắng nghe thay đổi hệ thống (system theme) và storage đa cửa sổ
  useEffect(() => {
    const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
    const handleMediaChange = () => {
      if (normalizeTheme(live.current.settings.general.theme) === 'system') {
        applyDocumentTheme('system', live.current.lang);
      }
    };
    mql?.addEventListener?.('change', handleMediaChange);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'vxshot_lang' && event.newValue) {
        const nextLang = normalizeLanguage(event.newValue);
        setSettings((prev) => ({
          ...prev,
          general: { ...prev.general, language: nextLang },
        }));
      } else if (event.key === 'vxshot_theme' && event.newValue) {
        const nextTheme = normalizeTheme(event.newValue);
        setSettings((prev) => ({
          ...prev,
          general: { ...prev.general, theme: nextTheme },
        }));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      mql?.removeEventListener?.('change', handleMediaChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Tự tính tỉ lệ Fit to Window
  const calculateFitZoom = useCallback((imgWidth: number, imgHeight: number) => {
    const availWidth = window.innerWidth - 60;
    const availHeight = window.innerHeight - 32 - 34 - 60;

    if (availWidth <= 0 || availHeight <= 0) return 1.0;

    const scaleX = availWidth / imgWidth;
    const scaleY = availHeight / imgHeight;
    const fitScale = Math.min(scaleX, scaleY, 1.0);
    return Math.max(Number(fitScale.toFixed(2)), 0.1);
  }, []);

  // Nạp ảnh và reset trạng thái canvas
  const hydrateImage = useCallback(
    (payload: ClipboardImagePayload, showNotification = true) => {
      const dict = translations[live.current.lang].app;
      const first: AnnotationNode = { id: crypto.randomUUID(), type: 'IMAGE', data_url: payload.data_url, x: 0, y: 0, width: payload.width, height: payload.height, z_index: 0, stroke_color: '', stroke_width: 0, opacity: 1 };
      const blank = document.createElement('canvas');
      blank.width = 1; blank.height = 1;
      const image = { ...payload, data_url: blank.toDataURL(), has_alpha: true };
      savedAnnotations.current = documentKey([first], image);
      setImagePayload(image);
      setAnnotations([first]);
      setHistory([{ nodes: [first], image }]);
      setHistoryIndex(0);
      setSelectedId(null);

      const fitZoom = live.current.settings.general.fit_window_on_open
        ? calculateFitZoom(payload.width, payload.height)
        : 1;
      setViewport({ zoom: fitZoom, pan_x: 0, pan_y: 0 });
      setStatusMessage(dict.loadedStatus(payload.width, payload.height));
      if (showNotification) {
        setToast({
          message: dict.loadedToast(payload.width, payload.height),
          type: 'success',
        });
      }
    },
    [calculateFitZoom]
  );

  // Đọc clipboard từ Rust
  const fetchClipboard = useCallback(
    async (showNotification = false, automatic = false) => {
      if (
        automatic &&
        !shouldAutoHydrate(
          live.current.settings.general.auto_hydrate_on_open,
          !!live.current.imagePayload,
          live.current.isSaving || live.current.isCopying
        )
      )
        return false;
      const sequence = ++loadSequence.current;
      const dict = translations[live.current.lang].app;
      try {
        const payload = await readClipboardImage();
        if (sequence !== loadSequence.current) return false;
        if (
          automatic &&
          !shouldAutoHydrate(
            live.current.settings.general.auto_hydrate_on_open,
            !!live.current.imagePayload,
            live.current.isSaving || live.current.isCopying
          )
        )
          return false;
        if (payload) {
          if (!automatic && live.current.imagePayload) {
            const current = live.current.imagePayload;
            const node: AnnotationNode = { id: crypto.randomUUID(), type: 'IMAGE', data_url: payload.data_url, x: Math.max(0, (current.width - payload.width) / 2), y: Math.max(0, (current.height - payload.height) / 2), width: payload.width, height: payload.height, z_index: live.current.annotations.length, stroke_color: '', stroke_width: 0, opacity: 1 };
            commitRef.current([...live.current.annotations, node]);
            setSelectedId(node.id);
            setActiveTool('select');
            if (payload.width > current.width || payload.height > current.height) setToast({ message: live.current.lang === 'vi' ? 'Ảnh vượt khung. Kéo góc canvas để mở rộng.' : 'Image exceeds frame. Drag a canvas corner to expand.', type: 'info' });
          } else hydrateImage(payload, showNotification);
          return true;
        } else if (showNotification) {
          setToast({ message: dict.emptyClipboardToast, type: 'info' });
        }
      } catch (err) {
        setToast({ message: dict.readClipboardError(err), type: 'error' });
      }
      return false;
    },
    [hydrateImage]
  );

  // Khởi động ứng dụng
  useEffect(() => {
    const init = async () => {
      const storedSettings = await getAppSettings();
      if (storedSettings) {
        const normalized: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...storedSettings,
          general: {
            ...DEFAULT_SETTINGS.general,
            ...storedSettings.general,
            language: normalizeLanguage(storedSettings.general?.language),
            theme: normalizeTheme(storedSettings.general?.theme),
          },
        };
        setSettings(normalized);
        live.current.settings = normalized;
        live.current.lang = normalizeLanguage(normalized.general.language);
        if (!live.current.imagePayload) {
          setStatusMessage(translations[live.current.lang].app.ready);
        }
      } else {
        live.current.settings = DEFAULT_SETTINGS;
      }
      await fetchClipboard(true, true);
    };
    init();

    let disposed = false;
    let unlistenShortcut: (() => void) | undefined;
    let unlistenFocus: (() => void) | undefined;
    let unlistenOpenSettings: (() => void) | undefined;

    listenToShortcut(() => {
      fetchClipboard(false, true);
    }).then((unlisten) => {
      if (disposed) unlisten();
      else unlistenShortcut = unlisten;
    });

    listenToWindowFocus(() => {
      fetchClipboard(false, true);
    }).then((unlisten) => {
      if (disposed) unlisten();
      else unlistenFocus = unlisten;
    });

    listenToOpenSettings(() => {
      setIsSettingsOpen(true);
    }).then((unlisten) => {
      if (disposed) unlisten();
      else unlistenOpenSettings = unlisten;
    });

    return () => {
      disposed = true;
      unlistenShortcut?.();
      unlistenFocus?.();
      unlistenOpenSettings?.();
    };
  }, [fetchClipboard]);

  // Điều khiển Zoom
  const handleZoomIn = () => {
    setViewport((prev) => ({ ...prev, zoom: Math.min(Number((prev.zoom + 0.15).toFixed(2)), 5.0) }));
  };

  const handleZoomOut = () => {
    setViewport((prev) => ({ ...prev, zoom: Math.max(Number((prev.zoom - 0.15).toFixed(2)), 0.1) }));
  };

  const handleZoomReset = () => {
    setViewport((prev) => ({ ...prev, zoom: 1.0, pan_x: 0, pan_y: 0 }));
  };

  const handleZoomFit = () => {
    if (imagePayload) {
      const fitZoom = calculateFitZoom(imagePayload.width, imagePayload.height);
      setViewport({ zoom: fitZoom, pan_x: 0, pan_y: 0 });
    }
  };

  // Mở tệp từ máy tính
  const handleOpenFile = useCallback(async () => {
    try {
      const sequence = ++loadSequence.current;
      const payload = await openFileDialog();
      if (sequence !== loadSequence.current || !approveReplace()) return;
      if (payload) {
        hydrateImage(payload, true);
      }
    } catch (err) {
      setToast({ message: translations[live.current.lang].app.openFileError(err), type: 'error' });
    }
  }, [hydrateImage]);

  useEffect(() => {
    const protectUpdate = (event: Event) => {
      if (
        live.current.isSaving ||
        live.current.isCopying ||
        documentKey(live.current.annotations, live.current.imagePayload) !== savedAnnotations.current
      )
        event.preventDefault();
    };
    window.addEventListener('vxshot-before-update', protectUpdate);
    return () => window.removeEventListener('vxshot-before-update', protectUpdate);
  }, []);

  const commitDocument = (nodes: AnnotationNode[], image = imagePayload) => {
    const next = [...history.slice(0, historyIndex + 1), { nodes, image }];
    setAnnotations(nodes); setImagePayload(image);
    setHistory(next); setHistoryIndex(next.length - 1);
  };
  commitRef.current = (nodes, image) => commitDocument(nodes, image ?? imagePayload);
  const handleAddAnnotation = (node: AnnotationNode) => {
    commitDocument([...annotations, node]);
    setStatusMessage(tApp.addedAnnotation(annotations.length + 1));
  };
  const handleUpdateAnnotation = (node: AnnotationNode) => commitDocument(annotations.map(a => a.id === node.id ? node : a));
  const handleExpandCanvas = (left: number, top: number, right: number, bottom: number) => {
    if (!imagePayload || !(left || top || right || bottom)) return;
    commitDocument(annotations.map(a => translateNode(a, left, top)), { ...imagePayload, width: imagePayload.width + left + right, height: imagePayload.height + top + bottom });
  };

  // Undo (Hoàn tác)
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevAnnotations = history[prevIndex];
      setHistoryIndex(prevIndex);
      setAnnotations(prevAnnotations.nodes);
      setImagePayload(prevAnnotations.image);
      setSelectedId(null);
      setStatusMessage(translations[live.current.lang].app.undoneStatus(prevAnnotations.nodes.length));
    }
  }, [historyIndex, history]);

  // Redo (Làm lại)
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextAnnotations = history[nextIndex];
      setHistoryIndex(nextIndex);
      setAnnotations(nextAnnotations.nodes);
      setImagePayload(nextAnnotations.image);
      setSelectedId(null);
      setStatusMessage(translations[live.current.lang].app.redoneStatus(nextAnnotations.nodes.length));
    }
  }, [historyIndex, history]);

  // Xóa đối tượng đang chọn
  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    commitDocument(annotations.filter(a => a.id !== selectedId));
    setSelectedId(null);
    setStatusMessage(translations[live.current.lang].app.deletedStatus);
  }, [selectedId, annotations, history, historyIndex]);

  // Safe Isolated Export Stage: Làm phẳng ảnh gốc + mọi Annotations lên Offscreen Canvas
  const getFlattenedImageBytes = async (format: ExportFormat): Promise<number[]> => {
    const dict = translations[live.current.lang].app;
    if (!imagePayload) throw new Error(dict.noImageError);

    const imageAssets = new Map<string, HTMLImageElement>();
    await Promise.all(annotations.filter(n => n.type === 'IMAGE').map(n => new Promise<void>((resolve, reject) => {
      const img = new Image(); img.onload = () => { imageAssets.set(n.id, img); resolve(); }; img.onerror = reject; img.src = n.data_url;
    })));
    return new Promise((resolve, reject) => {
      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';
      baseImg.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = imagePayload.width;
        offCanvas.height = imagePayload.height;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) {
          reject(new Error(dict.canvasInitError));
          return;
        }

        // Lót nền trắng nếu xuất JPEG
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);
        }

        // 1. Vẽ Base Image gốc
        ctx.drawImage(baseImg, 0, 0);

        // 2. Vẽ tất cả Annotations theo thứ tự z_index
        for (const node of annotations) {
          ctx.save();
          if (node.type === 'IMAGE') {
            ctx.drawImage(imageAssets.get(node.id)!, node.x, node.y, node.width, node.height);
          } else if (node.type === 'SOLID_REDACT') {
            ctx.fillStyle = node.fill_color;
            ctx.fillRect(node.x, node.y, node.width, node.height);
          } else if (node.type === 'BLUR_FILTER') {
            const sampleSize = Math.max(8, node.blur_radius || 10);
            ctx.save();
            ctx.beginPath();
            ctx.rect(node.x, node.y, node.width, node.height);
            ctx.clip();
            const tempCanvas = document.createElement('canvas');
            const tw = Math.max(1, Math.floor(node.width / sampleSize));
            const th = Math.max(1, Math.floor(node.height / sampleSize));
            tempCanvas.width = tw;
            tempCanvas.height = th;
            const tCtx = tempCanvas.getContext('2d');
            if (tCtx) {
              tCtx.drawImage(offCanvas, node.x, node.y, node.width, node.height, 0, 0, tw, th);
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(tempCanvas, 0, 0, tw, th, node.x, node.y, node.width, node.height);
            }
            ctx.restore();
          } else if (node.type === 'RECTANGLE') {
            ctx.strokeStyle = node.stroke_color;
            ctx.lineWidth = node.stroke_width;
            ctx.strokeRect(node.x, node.y, node.width, node.height);
          } else if (node.type === 'HIGHLIGHT') {
            // Dạ quang tô sáng: Tô kín khối đặc bán trong suốt (FILL 100% diện tích)
            ctx.fillStyle = node.stroke_color;
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(node.x, node.y, node.width, node.height, 3);
            } else {
              ctx.rect(node.x, node.y, node.width, node.height);
            }
            ctx.fill();
          } else if (node.type === 'ELLIPSE') {
            ctx.strokeStyle = node.stroke_color;
            ctx.lineWidth = node.stroke_width;
            ctx.beginPath();
            ctx.ellipse(node.x, node.y, Math.abs(node.radius_x), Math.abs(node.radius_y), 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (node.type === 'ARROW') {
            const [x1, y1, x2, y2] = node.points;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.hypot(dx, dy);

            if (length > 2) {
              const angle = Math.atan2(dy, dx);
              const headLength = Math.min(Math.max(16, node.stroke_width * 4), 38);
              const arrowAngle = 0.44;
              const indent = headLength * 0.72;

              const tipX = x2;
              const tipY = y2;
              const leftX = x2 - headLength * Math.cos(angle - arrowAngle);
              const leftY = y2 - headLength * Math.sin(angle - arrowAngle);
              const rightX = x2 - headLength * Math.cos(angle + arrowAngle);
              const rightY = y2 - headLength * Math.sin(angle + arrowAngle);
              const baseX = x2 - indent * Math.cos(angle);
              const baseY = y2 - indent * Math.sin(angle);

              ctx.strokeStyle = node.stroke_color;
              ctx.fillStyle = node.stroke_color;
              ctx.lineWidth = node.stroke_width;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';

              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(baseX, baseY);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(tipX, tipY);
              ctx.lineTo(leftX, leftY);
              ctx.lineTo(baseX, baseY);
              ctx.lineTo(rightX, rightY);
              ctx.closePath();
              ctx.fill();
            }
          } else if (node.type === 'LINE') {
            const [x1, y1, x2, y2] = node.points;
            ctx.strokeStyle = node.stroke_color;
            ctx.lineWidth = node.stroke_width;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          } else if (node.type === 'PEN') {
            if (node.points.length >= 4) {
              ctx.strokeStyle = node.stroke_color;
              ctx.lineWidth = node.stroke_width;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.beginPath();
              ctx.moveTo(node.points[0], node.points[1]);
              for (let i = 2; i < node.points.length; i += 2) {
                ctx.lineTo(node.points[i], node.points[i + 1]);
              }
              ctx.stroke();
            }
          } else if (node.type === 'STEP_COUNTER') {
            const radius = node.radius || 15;
            ctx.fillStyle = node.bg_color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = node.text_color || '#ffffff';
            ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(node.step_number), node.x, node.y);
          } else if (node.type === 'TEXT') {
            ctx.fillStyle = node.fill_color || '#ef4444';
            ctx.font = `bold ${node.font_size || 20}px system-ui, -apple-system, sans-serif`;
            ctx.textBaseline = 'top';
            node.text.split('\n').forEach((line, index) => ctx.fillText(line, node.x, node.y + index * node.font_size * 1.2));
          }
          ctx.restore();
        }

        // Privacy masks take precedence over every decorative layer, including mosaic.
        for (const node of annotations)
          if (node.type === 'SOLID_REDACT') {
            ctx.fillStyle = node.fill_color;
            ctx.fillRect(
              Math.floor(node.x),
              Math.floor(node.y),
              Math.ceil(node.x + node.width) - Math.floor(node.x),
              Math.ceil(node.y + node.height) - Math.floor(node.y)
            );
          }

        // Chuyển sang bytes
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpeg' ? 0.92 : undefined;
        offCanvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error(dict.blobExportError));
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              const arrayBuffer = reader.result as ArrayBuffer;
              const uint8 = new Uint8Array(arrayBuffer);
              resolve(Array.from(uint8));
            };
            reader.readAsArrayBuffer(blob);
          },
          mimeType,
          quality
        );
      };
      baseImg.onerror = (e) => reject(e);
      baseImg.src = imagePayload.data_url;
    });
  };

  // Lưu tệp ảnh ra đĩa
  const handleSaveFile = useCallback(
    async (format: ExportFormat = settings.editor.default_export_format === 'JPEG' ? 'jpeg' : 'png') => {
      if (!imagePayload || isSaving || isCopying) return;
      const dict = translations[live.current.lang].app;
      const exportedAnnotations = documentKey(annotations, imagePayload);
      setIsSaving(true);
      try {
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:]/g, '')
          .replace('T', '_')
          .slice(0, 15);
        const defaultName = `VXShot_${timestamp}.${format === 'png' ? 'png' : 'jpg'}`;

        const dialogOptions: SaveDialogOptions = {
          default_name: defaultName,
          default_extension: format,
        };

        const selectedPath = await openSaveDialog(dialogOptions);
        if (!selectedPath) {
          setIsSaving(false);
          return;
        }

        const extension = selectedPath.split('.').pop()?.toLowerCase();
        const actualFormat: ExportFormat =
          extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : extension === 'png' ? 'png' : format;
        const imageBytes = await getFlattenedImageBytes(actualFormat);

        const saveOptions: SaveFileOptions = {
          file_path: selectedPath,
          image_bytes: imageBytes,
          format: actualFormat,
        };

        const result = await saveImageFile(saveOptions);
        if (result.success) {
          savedAnnotations.current = exportedAnnotations;
          const updatedRecent = [
            selectedPath,
            ...settings.recent_files.filter((p) => p !== selectedPath),
          ].slice(0, 5);
          const updatedSettings = { ...settings, recent_files: updatedRecent };
          setSettings(updatedSettings);
          await saveAppSettings(updatedSettings);

          const fileName = selectedPath.split(/[/\\]/).pop() || selectedPath;
          setToast({ message: dict.savedToast(fileName), type: 'success' });
          setStatusMessage(dict.savedStatus(fileName));
        }
      } catch (err) {
        setToast({ message: dict.saveErrorToast(err), type: 'error' });
      } finally {
        setIsSaving(false);
      }
    },
    [imagePayload, isSaving, isCopying, annotations, settings]
  );

  // Sao chép thành phẩm vào Clipboard (Copy Result)
  const handleCopyResult = useCallback(async () => {
    if (!imagePayload || isSaving || isCopying) return;
    const dict = translations[live.current.lang].app;
    const exportedAnnotations = documentKey(annotations, imagePayload);
    setIsCopying(true);
    try {
      const imageBytes = await getFlattenedImageBytes('png');
      const payload: WriteClipboardPayload = {
        image_bytes: imageBytes,
        width: imagePayload.width,
        height: imagePayload.height,
        has_alpha: imagePayload.has_alpha,
      };
      await writeClipboardImage(payload);
      savedAnnotations.current = exportedAnnotations;
      setToast({
        message: dict.copiedToast,
        type: 'success',
      });
      setStatusMessage(dict.copiedStatus);
    } catch (err) {
      setToast({ message: dict.copyErrorToast(err), type: 'error' });
    } finally {
      setIsCopying(false);
    }
  }, [imagePayload, isSaving, isCopying, annotations]);

  // Lắng nghe sự kiện từ macOS native menu
  useEffect(() => {
    let disposed = false;
    const unlisteners: Array<() => void> = [];

    listenToMenuOpenFile(() => {
      handleOpenFile();
    }).then((u) => (disposed ? u() : unlisteners.push(u)));

    listenToMenuSaveFile(() => {
      handleSaveFile();
    }).then((u) => (disposed ? u() : unlisteners.push(u)));

    listenToMenuCopyResult(() => {
      handleCopyResult();
    }).then((u) => (disposed ? u() : unlisteners.push(u)));

    listenToMenuUndo(() => {
      handleUndo();
    }).then((u) => (disposed ? u() : unlisteners.push(u)));

    listenToMenuRedo(() => {
      handleRedo();
    }).then((u) => (disposed ? u() : unlisteners.push(u)));

    return () => {
      disposed = true;
      unlisteners.forEach((u) => u());
    };
  }, [handleOpenFile, handleSaveFile, handleCopyResult, handleUndo, handleRedo]);

  // Phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + , : Mở/đóng Cài đặt
      if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
        return;
      }

      if (isSettingsOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsSettingsOpen(false);
        }
        return;
      }

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Cmd/Ctrl + V: Dán ảnh từ clipboard
      if (isCmdOrCtrl && e.key.toLowerCase() === 'v' && !e.shiftKey) {
        e.preventDefault();
        fetchClipboard(true);
      }
      // Cmd/Ctrl + S: Lưu tệp
      else if (isCmdOrCtrl && e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault();
        handleSaveFile();
      }
      // Cmd/Ctrl + Shift + C: Sao chép thành phẩm
      else if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyResult();
      }
      // Cmd/Ctrl + O: Mở tệp
      else if (isCmdOrCtrl && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
      }
      // Cmd/Ctrl + Z: Undo
      else if (isCmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Cmd/Ctrl + Shift + Z hoặc Cmd/Ctrl + Y: Redo
      else if (
        (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') ||
        (isCmdOrCtrl && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Delete / Backspace: Xóa đối tượng đang chọn
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
      // Phím tắt chọn công cụ
      else if (!isCmdOrCtrl) {
        const k = e.key.toLowerCase();
        if (k === 'v') setActiveTool('select');
        else if (k === 'b') setActiveTool('solid_redact');
        else if (k === 'm') setActiveTool('blur');
        else if (k === 'r') setActiveTool('rect');
        else if (k === 'o') setActiveTool('ellipse');
        else if (k === 'a') setActiveTool('arrow');
        else if (k === 'l') setActiveTool('line');
        else if (k === 't') setActiveTool('text');
        else if (k === 's') setActiveTool('step');
        else if (k === 'p') setActiveTool('pen');
        else if (k === 'h') setActiveTool('highlight');
      }
      // Zoom hotkeys
      else if (isCmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      } else if (isCmdOrCtrl && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (isCmdOrCtrl && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
      } else if (isCmdOrCtrl && e.key === '9') {
        e.preventDefault();
        handleZoomFit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    fetchClipboard,
    handleSaveFile,
    handleCopyResult,
    handleOpenFile,
    handleUndo,
    handleRedo,
    handleDeleteSelected,
    selectedId,
    isSettingsOpen,
  ]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const handleResetDefaults = () => {
    const reset: AppSettings = {
      ...DEFAULT_SETTINGS,
      general: {
        ...DEFAULT_SETTINGS.general,
        language: settings.general.language,
      },
      recent_files: settings.recent_files,
    };
    setSettings(reset);
    saveAppSettings(reset);
  };

  return (
    <div className="vxshot-shell h-screen w-screen flex flex-col bg-[#0f1117] text-slate-100 overflow-hidden font-sans select-none">
      {/* Titlebar 32px chuẩn VXUtilities */}
      <Titlebar
        onOpenFile={handleOpenFile}
        onOpenRecentFile={() => {
          handleOpenFile();
        }}
        recentFiles={settings.recent_files}
        zoom={viewport.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onZoomFit={handleZoomFit}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMac={isMac}
        language={lang}
      />

      {/* Vùng Workspace hiển thị ảnh với Floating Toolbar */}
      <div className="flex-1 w-full relative overflow-hidden flex flex-col">
        {imagePayload && (
          <FloatingToolbar
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            properties={toolProperties}
            onUpdateProperties={(p) => setToolProperties((prev) => ({ ...prev, ...p }))}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            hasSelection={!!selectedId}
            onDeleteSelected={handleDeleteSelected}
            language={lang}
          />
        )}

        <CanvasWorkspace
          imagePayload={imagePayload}
          viewport={viewport}
          onViewportChange={setViewport}
          onOpenFile={handleOpenFile}
          onPasteClipboard={() => fetchClipboard(true)}
          activeTool={activeTool}
          properties={toolProperties}
          annotations={annotations}
          onAddAnnotation={handleAddAnnotation}
          onUpdateAnnotation={handleUpdateAnnotation}
          onExpandCanvas={handleExpandCanvas}
          selectedId={selectedId}
          onSelectNode={setSelectedId}
          language={lang}
        />
      </div>

      {/* Bottom Status Bar với thông số và nút Copy/Save */}
      <BottomStatusBar
        width={imagePayload?.width || 0}
        height={imagePayload?.height || 0}
        zoom={viewport.zoom}
        statusMessage={statusMessage}
        hasImage={!!imagePayload}
        onSaveFile={handleSaveFile}
        onCopyResult={handleCopyResult}
        isSaving={isSaving}
        isCopying={isCopying}
        language={lang}
      />

      {/* Modal Cài đặt */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          activeTab={settingsTab}
          onTabChange={setSettingsTab}
          onSaveSettings={handleSaveSettings}
          onResetDefaults={handleResetDefaults}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      <AppUpdates language={lang} notice />

      {/* Toast thông báo */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
