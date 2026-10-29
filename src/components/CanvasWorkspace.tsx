import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  AnnotationNode,
  ClipboardImagePayload,
  ToolProperties,
  ToolType,
  ViewportState,
} from '../types/canvas';
import { expansion, hitTest, nodeBounds, translateNode } from '../services/editor_geometry';
import { EmptyState } from './EmptyState';
import { AppLanguage, translations } from '../i18n/translations';

interface CanvasWorkspaceProps {
  imagePayload: ClipboardImagePayload | null;
  viewport: ViewportState;
  onViewportChange: (viewport: ViewportState) => void;
  onOpenFile: () => void;
  onPasteClipboard: () => void;
  activeTool: ToolType;
  properties: ToolProperties;
  annotations: AnnotationNode[];
  onAddAnnotation: (node: AnnotationNode) => void;
  selectedId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateAnnotation?: (node: AnnotationNode) => void;
  onExpandCanvas: (left: number, top: number, right: number, bottom: number) => void;
  language?: AppLanguage;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  imagePayload,
  viewport,
  onViewportChange,
  onOpenFile,
  onPasteClipboard,
  activeTool,
  properties,
  annotations,
  onAddAnnotation,
  selectedId,
  onSelectNode,
  onUpdateAnnotation,
  onExpandCanvas,
  language = 'vi',
}) => {
  const t = translations[language].canvas;
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);

  const assets = useRef(new Map<string, HTMLImageElement>());
  const [assetVersion, setAssetVersion] = useState(0);
  const dragRef = useRef<{ node: AnnotationNode; x: number; y: number } | null>(null);
  const resizeRef = useRef<{ x: number; y: number; left: boolean; top: boolean } | null>(null);
  const [resizePreview, setResizePreview] = useState<ReturnType<typeof expansion> | null>(null);
  const resizePreviewRef = useRef<ReturnType<typeof expansion> | null>(null);
  const [textDraft, setTextDraft] = useState<{ x: number; y: number; value: string } | null>(null);
  useEffect(() => {
    let disposed = false;
    const images = annotations.filter(n => n.type === 'IMAGE');
    const ids = new Set(images.map(n => n.id));
    for (const id of assets.current.keys()) if (!ids.has(id)) assets.current.delete(id);
    for (const node of images) if (!assets.current.has(node.id)) {
      const img = new Image();
      img.onload = () => { if (!disposed) { assets.current.set(node.id, img); setAssetVersion(v => v + 1); } };
      img.src = node.data_url;
    }
    return () => { disposed = true; };
  }, [annotations]);
  const measureText = (text: string, size: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return text.length * size * 0.65;
    ctx.font = `bold ${size}px system-ui, -apple-system, sans-serif`;
    return ctx.measureText(text).width;
  };
  const commitText = () => {
    if (!textDraft) return;
    const value = textDraft.value.trim();
    setTextDraft(null);
    if (value) onAddAnnotation({ id: crypto.randomUUID(), type: 'TEXT', x: textDraft.x, y: textDraft.y, text: value, font_size: properties.fontSize, font_family: 'system-ui', font_weight: 'bold', fill_color: properties.color, stroke_color: properties.color, stroke_width: 1, opacity: 1, z_index: annotations.length });
  };
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Trạng thái vẽ hiện thời
  const [isDrawing, setDrawingState] = useState(false);
  const drawingRef = useRef(false);
  const setIsDrawing = (value: boolean) => { drawingRef.current = value; setDrawingState(value); };
  const drawStartRef = useRef({ x: 0, y: 0 });
  const setDrawStart = (value: {x:number;y:number}) => { drawStartRef.current = value; };
  const currentPointsRef = useRef<number[]>([]);
  const setCurrentPoints = (value: number[]) => { currentPointsRef.current = value; };
  const [previewNode, setPreviewState] = useState<AnnotationNode | null>(null);
  const previewRef = useRef<AnnotationNode | null>(null);
  const setPreviewNode = (value: AnnotationNode | null) => { previewRef.current = value; setPreviewState(value); };

  // Đếm số bước cho Step Tool
  const nextStepNumber = annotations.filter((a) => a.type === 'STEP_COUNTER').length + 1;

  // Lắng nghe phím Space để kích hoạt chế độ Pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Xử lý zoom qua con lăn chuột
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!imagePayload) return;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.1), 5.0);

    onViewportChange({
      ...viewport,
      zoom: Number(newZoom.toFixed(2)),
    });
  };

  // Nạp Base Image object phục vụ render hiệu ứng mờ Blur
  useEffect(() => {
    if (!imagePayload) {
      baseImgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imagePayload.data_url;
    img.onload = () => {
      baseImgRef.current = img;
      renderCanvas();
    };
  }, [imagePayload]);

  // Hàm vẽ toàn bộ Annotations lên Interactive Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagePayload) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allNodes = previewNode ? (dragRef.current ? annotations.map(n => n.id === previewNode.id ? previewNode : n) : [...annotations, previewNode]) : annotations;

    for (const node of allNodes) {
      ctx.save();

      if (node.type === 'IMAGE') {
        const img = assets.current.get(node.id);
        if (img) ctx.drawImage(img, node.x, node.y, node.width, node.height);
      } else if (node.type === 'SOLID_REDACT') {
        // Che thông tin tuyệt đối (100% che kín pixel)
        ctx.fillStyle = node.fill_color;
        ctx.fillRect(node.x, node.y, node.width, node.height);
      } else if (node.type === 'BLUR_FILTER') {
        // Hiệu ứng làm mờ / mosaic pixelation
        if (baseImgRef.current) {
          const sampleSize = Math.max(8, node.blur_radius || 10);
          ctx.save();
          ctx.beginPath();
          ctx.rect(node.x, node.y, node.width, node.height);
          ctx.clip();
          // Vẽ ảnh thu nhỏ rồi phóng to lại để tạo hiệu ứng pixel mosaic
          const tempCanvas = document.createElement('canvas');
          const tw = Math.max(1, Math.floor(node.width / sampleSize));
          const th = Math.max(1, Math.floor(node.height / sampleSize));
          tempCanvas.width = tw;
          tempCanvas.height = th;
          const tCtx = tempCanvas.getContext('2d');
          if (tCtx) {
            tCtx.drawImage(
              canvas,
              node.x,
              node.y,
              node.width,
              node.height,
              0,
              0,
              tw,
              th
            );
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tempCanvas, 0, 0, tw, th, node.x, node.y, node.width, node.height);
          }
          ctx.restore();
        }
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
        const rx = Math.abs(node.radius_x);
        const ry = Math.abs(node.radius_y);
        ctx.ellipse(node.x, node.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (node.type === 'ARROW') {
        const [x1, y1, x2, y2] = node.points;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.hypot(dx, dy);

        if (length > 2) {
          const angle = Math.atan2(dy, dx);
          // Kích thước đầu mũi tên vuốt nhọn (Swept-back Chevron)
          const headLength = Math.min(Math.max(16, node.stroke_width * 4), 38);
          const arrowAngle = 0.44; // ~25.2 độ
          const indent = headLength * 0.72; // Đáy lõm ôm lấy thân

          const tipX = x2;
          const tipY = y2;
          const leftX = x2 - headLength * Math.cos(angle - arrowAngle);
          const leftY = y2 - headLength * Math.sin(angle - arrowAngle);
          const rightX = x2 - headLength * Math.cos(angle + arrowAngle);
          const rightY = y2 - headLength * Math.sin(angle + arrowAngle);
          const baseX = x2 - indent * Math.cos(angle);
          const baseY = y2 - indent * Math.sin(angle);

          // 1. Thân mũi tên nối từ (x1, y1) tới điểm đáy lõm (baseX, baseY)
          ctx.strokeStyle = node.stroke_color;
          ctx.fillStyle = node.stroke_color;
          ctx.lineWidth = node.stroke_width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(baseX, baseY);
          ctx.stroke();

          // 2. Đầu mũi tên Chevron sắc sảo
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
        // Nhãn tròn đánh số bước
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

      // Viền hiển thị khi đối tượng đang được chọn
      if (node.id === selectedId) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        const bounds = nodeBounds(node, measureText);
        ctx.strokeRect(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);
        ctx.setLineDash([]);
      }

      ctx.restore();
    }
    // Same final privacy pass as exported bitmap; mosaic cannot reveal a solid mask.
    for (const node of allNodes) if (node.type === 'SOLID_REDACT') {
      ctx.fillStyle = node.fill_color;
      ctx.fillRect(Math.floor(node.x), Math.floor(node.y), Math.ceil(node.x + node.width) - Math.floor(node.x), Math.ceil(node.y + node.height) - Math.floor(node.y));
    }
  }, [annotations, previewNode, selectedId, imagePayload, assetVersion]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Tính tọa độ pixel trên ảnh gốc
  const getImageCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Xử lý MouseDown trên Canvas
  const handleCanvasMouseDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && spacePressed)) {
      // Middle click hoặc Space + Click -> Hand Pan
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.pan_x, y: e.clientY - viewport.pan_y });
      return;
    }

    if (e.button !== 0 || !imagePayload) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = getImageCoordinates(e);

    // Chế độ Chọn đối tượng (Select Tool)
    if (activeTool === 'select') {
      const found = [...annotations].reverse().find(a => hitTest(a, x, y, 6 / viewport.zoom, measureText));
      onSelectNode(found?.id ?? null);
      dragRef.current = found ? { node: found, x, y } : null;
      return;
    }

    // Chế độ Đánh số bước (Step Tool) - Click 1 phát ăn ngay
    if (activeTool === 'step') {
      const newNode: AnnotationNode = {
        id: `step_${Date.now()}`,
        type: 'STEP_COUNTER',
        x,
        y,
        step_number: nextStepNumber,
        radius: 15,
        bg_color: properties.color || '#ef4444',
        text_color: '#ffffff',
        stroke_color: '#ffffff',
        stroke_width: 2,
        opacity: 1.0,
        z_index: annotations.length + 1,
      };
      onAddAnnotation(newNode);
      return;
    }

    // Chế độ Nhập văn bản (Text Tool)
    if (activeTool === 'text') {
      setTextDraft({ x, y, value: '' });
      return;
    }

    // Các công cụ vẽ kéo rê chuột
    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentPoints([x, y]);
  };

  // Xử lý MouseMove trên Canvas
  const handleCanvasMouseMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      onViewportChange({
        ...viewport,
        pan_x: e.clientX - panStart.x,
        pan_y: e.clientY - panStart.y,
      });
      return;
    }

    if (dragRef.current) {
      const { x, y } = getImageCoordinates(e);
      setPreviewNode(translateNode(dragRef.current.node, x - dragRef.current.x, y - dragRef.current.y));
      return;
    }
    if (!drawingRef.current || !imagePayload) return;

    const { x, y } = getImageCoordinates(e);

    if (activeTool === 'pen') {
      const updated = [...currentPointsRef.current, x, y];
      setCurrentPoints(updated);
      setPreviewNode({
        id: 'preview',
        type: 'PEN',
        x: drawStartRef.current.x,
        y: drawStartRef.current.y,
        points: updated,
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 1.0,
        z_index: 9999,
      });
      return;
    }

    if (activeTool === 'solid_redact') {
      const w = x - drawStartRef.current.x;
      const h = y - drawStartRef.current.y;
      setPreviewNode({
        id: 'preview',
        type: 'SOLID_REDACT',
        x: Math.min(drawStartRef.current.x, x),
        y: Math.min(drawStartRef.current.y, y),
        width: Math.abs(w),
        height: Math.abs(h),
        rotation: 0,
        z_index: 9999,
        fill_color: properties.solidRedactColor || '#000000',
        opacity: 1.0,
        corner_radius: 0,
      });
    } else if (activeTool === 'blur') {
      const w = x - drawStartRef.current.x;
      const h = y - drawStartRef.current.y;
      setPreviewNode({
        id: 'preview',
        type: 'BLUR_FILTER',
        x: Math.min(drawStartRef.current.x, x),
        y: Math.min(drawStartRef.current.y, y),
        width: Math.abs(w),
        height: Math.abs(h),
        z_index: 9999,
        blur_radius: 12,
      });
    } else if (activeTool === 'rect') {
      const w = x - drawStartRef.current.x;
      const h = y - drawStartRef.current.y;
      setPreviewNode({
        id: 'preview',
        type: 'RECTANGLE',
        x: Math.min(drawStartRef.current.x, x),
        y: Math.min(drawStartRef.current.y, y),
        width: Math.abs(w),
        height: Math.abs(h),
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 1.0,
        z_index: 9999,
      });
    } else if (activeTool === 'highlight') {
      const w = x - drawStartRef.current.x;
      const h = y - drawStartRef.current.y;
      setPreviewNode({
        id: 'preview',
        type: 'HIGHLIGHT',
        x: Math.min(drawStartRef.current.x, x),
        y: Math.min(drawStartRef.current.y, y),
        width: Math.abs(w),
        height: Math.abs(h),
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 0.35,
        z_index: 9999,
      });
    } else if (activeTool === 'ellipse') {
      const rx = Math.abs(x - drawStartRef.current.x) / 2;
      const ry = Math.abs(y - drawStartRef.current.y) / 2;
      const cx = (drawStartRef.current.x + x) / 2;
      const cy = (drawStartRef.current.y + y) / 2;
      setPreviewNode({
        id: 'preview',
        type: 'ELLIPSE',
        x: cx,
        y: cy,
        radius_x: rx,
        radius_y: ry,
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 1.0,
        z_index: 9999,
      });
    } else if (activeTool === 'arrow') {
      setPreviewNode({
        id: 'preview',
        type: 'ARROW',
        x: drawStartRef.current.x,
        y: drawStartRef.current.y,
        points: [drawStartRef.current.x, drawStartRef.current.y, x, y],
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 1.0,
        z_index: 9999,
      });
    } else if (activeTool === 'line') {
      setPreviewNode({
        id: 'preview',
        type: 'LINE',
        x: drawStartRef.current.x,
        y: drawStartRef.current.y,
        points: [drawStartRef.current.x, drawStartRef.current.y, x, y],
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 1.0,
        z_index: 9999,
      });
    }
  };

  // Xử lý MouseUp chốt tạo Annotation
  const handleCanvasMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (dragRef.current) {
      const original = dragRef.current.node;
      const moved = previewRef.current;
      dragRef.current = null;
      setPreviewNode(null);
      if (moved && (moved.x !== original.x || moved.y !== original.y)) onUpdateAnnotation?.(moved);
      return;
    }
    if (!drawingRef.current) return;
    setIsDrawing(false);

    const committedPreview = previewRef.current;
    if (committedPreview) {
      // Bỏ id preview và gán UUID thật
      const finalNode: AnnotationNode = {
        ...committedPreview,
        id: `anno_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        z_index: annotations.length + 1,
      };
      setPreviewNode(null);
      setCurrentPoints([]);
      onAddAnnotation(finalNode);
    }
  };

  const finishDrawingRef = useRef(handleCanvasMouseUp);
  finishDrawingRef.current = handleCanvasMouseUp;
  useEffect(() => {
    const finish = () => finishDrawingRef.current();
    window.addEventListener('pointerup', finish);
    return () => window.removeEventListener('pointerup', finish);
  }, []);

  if (!imagePayload) {
    return (
      <div className="flex-1 w-full h-full bg-[#090a0f] relative overflow-hidden flex items-center justify-center">
        <EmptyState onOpenFile={onOpenFile} onPaste={onPasteClipboard} language={language} />
      </div>
    );
  }

  const cursorClass = isPanning
    ? 'cursor-grabbing'
    : spacePressed
    ? 'cursor-grab'
    : activeTool === 'select'
    ? 'cursor-default'
    : 'cursor-crosshair';

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseLeave={() => {
        if (dragRef.current || drawingRef.current) return;
        setIsPanning(false);
        if (drawingRef.current) {
          setIsDrawing(false);
          setPreviewNode(null);
        }
      }}
      className={`flex-1 w-full h-full bg-dot-grid relative overflow-hidden flex items-center justify-center select-none ${cursorClass}`}
    >
      {/* Khung Canvas Frame co giãn theo Viewport */}
      <div
        ref={frameRef}
        style={{
          transform: `translate(${viewport.pan_x}px, ${viewport.pan_y}px) scale(${viewport.zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.05s ease-out',
        }}
        className="relative shadow-2xl rounded-sm transition-shadow"
      >
        <div
          style={{
            width: `${imagePayload.width}px`,
            height: `${imagePayload.height}px`,
          }}
          className={`relative overflow-hidden rounded-sm border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${
            imagePayload.has_alpha ? 'bg-transparency-grid' : 'bg-white'
          }`}
        >
          {/* Lớp Base Image */}
          <img
            src={imagePayload.data_url}
            alt={t.capturedScreenAlt}
            draggable={false}
            style={{
              width: `${imagePayload.width}px`,
              height: `${imagePayload.height}px`,
            }}
            className="block max-w-none pointer-events-none"
          />

          {/* Lớp Interactive Canvas Vẽ Chú thích & Che Thông tin */}
          <canvas
            ref={canvasRef}
            width={imagePayload.width}
            height={imagePayload.height}
            onPointerDown={handleCanvasMouseDown}
            onPointerMove={handleCanvasMouseMove}
            onPointerUp={handleCanvasMouseUp}
            onPointerCancel={() => { dragRef.current = null; setIsDrawing(false); setPreviewNode(null); }}
            style={{ touchAction: 'none' }}
            className="absolute inset-0 z-20 block cursor-inherit"
          />
        </div>

        {textDraft && <textarea autoFocus aria-label={language === 'vi' ? 'Nhập văn bản' : 'Enter text'}
          value={textDraft.value} onChange={e => setTextDraft({ ...textDraft, value: e.target.value })}
          onBlur={commitText} onKeyDown={e => { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); setTextDraft(null); } else if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); commitText(); } }}
          style={{ position: 'absolute', left: textDraft.x, top: textDraft.y, zIndex: 30, minWidth: 160, minHeight: properties.fontSize * 2, font: `bold ${properties.fontSize}px system-ui`, color: properties.color, background: 'var(--surface-base, #0f1117)', border: '1px solid #06b6d4', outline: 'none' }} />}
        {/* Viền bao ranh giới Canvas Frame */}
        <div className="absolute inset-0 z-30 border-2 border-cyan-400/40 pointer-events-none rounded-sm">
          {(['nw', 'ne', 'sw', 'se'] as const).map(corner => <button key={corner}
            aria-label={language === 'vi' ? `Mở rộng canvas ${corner}` : `Expand canvas ${corner}`}
            title={language === 'vi' ? 'Kéo ra ngoài để mở rộng canvas' : 'Drag outward to expand canvas'}
            className="absolute w-3 h-3 bg-white border border-slate-800 rounded-xs shadow-md pointer-events-auto"
            style={{ top: corner[0] === 'n' ? -6 : undefined, bottom: corner[0] === 's' ? -6 : undefined, left: corner[1] === 'w' ? -6 : undefined, right: corner[1] === 'e' ? -6 : undefined, cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize', touchAction: 'none' }}
            onPointerDown={e => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); resizeRef.current = { x: e.clientX, y: e.clientY, left: corner[1] === 'w', top: corner[0] === 'n' }; }}
            onPointerMove={e => { const start = resizeRef.current; if (!start) return; const size = expansion(imagePayload.width, imagePayload.height, (e.clientX - start.x) / viewport.zoom, (e.clientY - start.y) / viewport.zoom, start.left, start.top); resizePreviewRef.current = size; setResizePreview(size); }}
            onPointerUp={() => { const size = resizePreviewRef.current; resizeRef.current = null; resizePreviewRef.current = null; setResizePreview(null); if (size) onExpandCanvas(size.left, size.top, size.right, size.bottom); }}
            onPointerCancel={() => { resizeRef.current = null; resizePreviewRef.current = null; setResizePreview(null); }} />)}
          {resizePreview && <div className="absolute border-2 border-dashed border-cyan-400 pointer-events-none" style={{ left: -resizePreview.left, top: -resizePreview.top, width: imagePayload.width + resizePreview.left + resizePreview.right, height: imagePayload.height + resizePreview.top + resizePreview.bottom }}><span className="bg-slate-900 text-white text-xs">{imagePayload.width + resizePreview.left + resizePreview.right} × {imagePayload.height + resizePreview.top + resizePreview.bottom}</span></div>}

        </div>
      </div>
    </div>
  );
};
