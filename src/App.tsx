import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Titlebar } from './components/Titlebar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { FloatingToolbar } from './components/FloatingToolbar';
import { BottomStatusBar } from './components/BottomStatusBar';
import { SettingsModal } from './components/SettingsModal';
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
  listenToShortcut,
  listenToWindowFocus,
  openFileDialog,
  openSaveDialog,
  readClipboardImage,
  saveAppSettings,
  saveImageFile,
  writeClipboardImage,
} from './services/tauri_bridge';

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

export const App: React.FC = () => {
  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac');

  const [imagePayload, setImagePayload] = useState<ClipboardImagePayload | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ zoom: 1.0, pan_x: 0, pan_y: 0 });
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [statusMessage, setStatusMessage] = useState<string>('Sẵn sàng');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
  const [history, setHistory] = useState<AnnotationNode[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      setImagePayload(payload);
      setAnnotations([]);
      setHistory([[]]);
      setHistoryIndex(0);
      setSelectedId(null);

      const fitZoom = calculateFitZoom(payload.width, payload.height);
      setViewport({ zoom: fitZoom, pan_x: 0, pan_y: 0 });
      setStatusMessage(`Đã nạp ảnh (${payload.width} × ${payload.height} px)`);
      if (showNotification) {
        setToast({
          message: `Đã tự động nạp ảnh từ clipboard (${payload.width} × ${payload.height} px)`,
          type: 'success',
        });
      }
    },
    [calculateFitZoom]
  );

  // Đọc clipboard từ Rust
  const fetchClipboard = useCallback(
    async (showNotification = false) => {
      try {
        const payload = await readClipboardImage();
        if (payload) {
          hydrateImage(payload, showNotification);
          return true;
        } else if (showNotification) {
          setToast({ message: 'Clipboard chưa có dữ liệu hình ảnh', type: 'info' });
        }
      } catch (err) {
        console.error('Lỗi đọc clipboard:', err);
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
        setSettings(storedSettings);
      }
      await fetchClipboard(true);
    };
    init();

    let unlistenShortcut: (() => void) | undefined;
    let unlistenFocus: (() => void) | undefined;

    listenToShortcut(() => {
      fetchClipboard(false);
    }).then((unlisten) => {
      unlistenShortcut = unlisten;
    });

    listenToWindowFocus(() => {
      fetchClipboard(false);
    }).then((unlisten) => {
      unlistenFocus = unlisten;
    });

    return () => {
      unlistenShortcut?.();
      unlistenFocus?.();
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
  const handleOpenFile = async () => {
    try {
      const payload = await openFileDialog();
      if (payload) {
        hydrateImage(payload, true);
      }
    } catch (err) {
      setToast({ message: `Lỗi mở tệp: ${err}`, type: 'error' });
    }
  };

  // Thêm Annotation mới và cập nhật History
  const handleAddAnnotation = (newNode: AnnotationNode) => {
    const nextAnnotations = [...annotations, newNode];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextAnnotations);

    setAnnotations(nextAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setStatusMessage(`Đã thêm chú thích (${nextAnnotations.length} đối tượng)`);
  };

  // Undo (Hoàn tác)
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevAnnotations = history[prevIndex];
      setHistoryIndex(prevIndex);
      setAnnotations(prevAnnotations);
      setSelectedId(null);
      setStatusMessage(`Hoàn tác (${prevAnnotations.length} đối tượng)`);
    }
  }, [historyIndex, history]);

  // Redo (Làm lại)
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextAnnotations = history[nextIndex];
      setHistoryIndex(nextIndex);
      setAnnotations(nextAnnotations);
      setSelectedId(null);
      setStatusMessage(`Làm lại (${nextAnnotations.length} đối tượng)`);
    }
  }, [historyIndex, history]);

  // Xóa đối tượng đang chọn
  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    const nextAnnotations = annotations.filter((a) => a.id !== selectedId);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextAnnotations);

    setAnnotations(nextAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSelectedId(null);
    setStatusMessage('Đã xóa đối tượng');
  }, [selectedId, annotations, history, historyIndex]);

  // Safe Isolated Export Stage: Làm phẳng ảnh gốc + mọi Annotations lên Offscreen Canvas
  const getFlattenedImageBytes = async (format: ExportFormat): Promise<number[]> => {
    if (!imagePayload) throw new Error('Không có ảnh để xuất');

    return new Promise((resolve, reject) => {
      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';
      baseImg.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = imagePayload.width;
        offCanvas.height = imagePayload.height;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Không thể khởi tạo bộ vẽ 2D'));
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
          if (node.type === 'SOLID_REDACT') {
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
              tCtx.drawImage(baseImg, node.x, node.y, node.width, node.height, 0, 0, tw, th);
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
            ctx.fillText(node.text, node.x, node.y);
          }
          ctx.restore();
        }

        // Chuyển sang bytes
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpeg' ? 0.92 : undefined;
        offCanvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Lỗi xuất dữ liệu Blob'));
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
  const handleSaveFile = async (format: ExportFormat = 'png') => {
    if (!imagePayload) return;
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

      const imageBytes = await getFlattenedImageBytes(format);

      const saveOptions: SaveFileOptions = {
        file_path: selectedPath,
        image_bytes: imageBytes,
        format,
      };

      const result = await saveImageFile(saveOptions);
      if (result.success) {
        const updatedRecent = [
          selectedPath,
          ...settings.recent_files.filter((p) => p !== selectedPath),
        ].slice(0, 5);
        const updatedSettings = { ...settings, recent_files: updatedRecent };
        setSettings(updatedSettings);
        await saveAppSettings(updatedSettings);

        const fileName = selectedPath.split(/[/\\]/).pop() || selectedPath;
        setToast({ message: `Đã lưu tệp thành phẩm: ${fileName}`, type: 'success' });
        setStatusMessage(`Đã lưu: ${fileName}`);
      }
    } catch (err) {
      setToast({ message: `Lỗi lưu tệp: ${err}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Sao chép thành phẩm vào Clipboard (Copy Result)
  const handleCopyResult = async () => {
    if (!imagePayload) return;
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
      setToast({
        message: 'Đã sao chép ảnh có chú thích vào Clipboard! Sẵn sàng dán (Cmd/Ctrl + V) sang Slack, Docs...',
        type: 'success',
      });
      setStatusMessage('Đã sao chép ảnh vào clipboard');
    } catch (err) {
      setToast({ message: `Lỗi sao chép ảnh: ${err}`, type: 'error' });
    } finally {
      setIsCopying(false);
    }
  };

  // Phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
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
        handleSaveFile('png');
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
      else if ((isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (isCmdOrCtrl && e.key.toLowerCase() === 'y')) {
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
  ]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f1117] text-slate-100 overflow-hidden font-sans select-none">
      {/* Titlebar 32px chuẩn zTools */}
      <Titlebar
        onOpenFile={handleOpenFile}
        onOpenRecentFile={(path) => {
          // Mở recent file
        }}
        recentFiles={settings.recent_files}
        zoom={viewport.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onZoomFit={handleZoomFit}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMac={isMac}
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
          selectedId={selectedId}
          onSelectNode={setSelectedId}
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
      />

      {/* Modal Cài đặt */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            saveAppSettings(newSettings);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

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
