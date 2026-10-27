import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  AnnotationNode,
  ClipboardImagePayload,
  ToolProperties,
  ToolType,
  ViewportState,
} from '../types/canvas';
import { EmptyState } from './EmptyState';

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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Trạng thái vẽ hiện thời
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [previewNode, setPreviewNode] = useState<AnnotationNode | null>(null);

  // Đếm số bước cho Step Tool
  const nextStepNumber = annotations.filter((a) => a.type === 'STEP_COUNTER').length + 1;

  // Lắng nghe phím Space để kích hoạt chế độ Pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT') {
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

    const allNodes = previewNode ? [...annotations, previewNode] : annotations;

    for (const node of allNodes) {
      ctx.save();

      if (node.type === 'SOLID_REDACT') {
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
              baseImgRef.current,
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
        ctx.fillText(node.text, node.x, node.y);
      }

      // Viền hiển thị khi đối tượng đang được chọn
      if (node.id === selectedId) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        if ('width' in node && 'height' in node) {
          ctx.strokeRect(node.x - 2, node.y - 2, node.width + 4, node.height + 4);
        } else if (node.type === 'STEP_COUNTER') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, (node.radius || 15) + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      ctx.restore();
    }
    // Same final privacy pass as exported bitmap; mosaic cannot reveal a solid mask.
    for (const node of allNodes) if (node.type === 'SOLID_REDACT') {
      ctx.fillStyle = node.fill_color;
      ctx.fillRect(Math.floor(node.x), Math.floor(node.y), Math.ceil(node.x + node.width) - Math.floor(node.x), Math.ceil(node.y + node.height) - Math.floor(node.y));
    }
  }, [annotations, previewNode, selectedId, imagePayload]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Tính tọa độ pixel trên ảnh gốc
  const getImageCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && spacePressed)) {
      // Middle click hoặc Space + Click -> Hand Pan
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.pan_x, y: e.clientY - viewport.pan_y });
      return;
    }

    if (e.button !== 0 || !imagePayload) return;

    const { x, y } = getImageCoordinates(e);

    // Chế độ Chọn đối tượng (Select Tool)
    if (activeTool === 'select') {
      // Tìm annotation ở gần con trỏ
      let foundId: string | null = null;
      for (let i = annotations.length - 1; i >= 0; i--) {
        const a = annotations[i];
        if ('width' in a && 'height' in a) {
          const w = (a as any).width;
          const h = (a as any).height;
          const minX = Math.min(a.x, a.x + w);
          const maxX = Math.max(a.x, a.x + w);
          const minY = Math.min(a.y, a.y + h);
          const maxY = Math.max(a.y, a.y + h);
          if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            foundId = a.id;
            break;
          }
        } else if (a.type === 'STEP_COUNTER') {
          const dist = Math.hypot(x - a.x, y - a.y);
          if (dist <= (a.radius || 15) + 5) {
            foundId = a.id;
            break;
          }
        }
      }
      onSelectNode(foundId);
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
      const text = prompt('Nhập nội dung ghi chú:');
      if (text && text.trim()) {
        const newNode: AnnotationNode = {
          id: `text_${Date.now()}`,
          type: 'TEXT',
          x,
          y,
          text: text.trim(),
          font_size: properties.fontSize || 20,
          font_family: 'system-ui',
          font_weight: 'bold',
          fill_color: properties.color || '#ef4444',
          stroke_color: properties.color || '#ef4444',
          stroke_width: 1,
          opacity: 1.0,
          z_index: annotations.length + 1,
        };
        onAddAnnotation(newNode);
      }
      return;
    }

    // Các công cụ vẽ kéo rê chuột
    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentPoints([x, y]);
  };

  // Xử lý MouseMove trên Canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      onViewportChange({
        ...viewport,
        pan_x: e.clientX - panStart.x,
        pan_y: e.clientY - panStart.y,
      });
      return;
    }

    if (!isDrawing || !imagePayload) return;

    const { x, y } = getImageCoordinates(e);

    if (activeTool === 'pen') {
      const updated = [...currentPoints, x, y];
      setCurrentPoints(updated);
      setPreviewNode({
        id: 'preview',
        type: 'PEN',
        x: drawStart.x,
        y: drawStart.y,
        points: updated,
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 1.0,
        z_index: 9999,
      });
      return;
    }

    if (activeTool === 'solid_redact') {
      const w = x - drawStart.x;
      const h = y - drawStart.y;
      setPreviewNode({
        id: 'preview',
        type: 'SOLID_REDACT',
        x: Math.min(drawStart.x, x),
        y: Math.min(drawStart.y, y),
        width: Math.abs(w),
        height: Math.abs(h),
        rotation: 0,
        z_index: 9999,
        fill_color: properties.solidRedactColor || '#000000',
        opacity: 1.0,
        corner_radius: 0,
      });
    } else if (activeTool === 'blur') {
      const w = x - drawStart.x;
      const h = y - drawStart.y;
      setPreviewNode({
        id: 'preview',
        type: 'BLUR_FILTER',
        x: Math.min(drawStart.x, x),
        y: Math.min(drawStart.y, y),
        width: Math.abs(w),
        height: Math.abs(h),
        z_index: 9999,
        blur_radius: 12,
      });
    } else if (activeTool === 'rect') {
      const w = x - drawStart.x;
      const h = y - drawStart.y;
      setPreviewNode({
        id: 'preview',
        type: 'RECTANGLE',
        x: Math.min(drawStart.x, x),
        y: Math.min(drawStart.y, y),
        width: Math.abs(w),
        height: Math.abs(h),
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 1.0,
        z_index: 9999,
      });
    } else if (activeTool === 'highlight') {
      const w = x - drawStart.x;
      const h = y - drawStart.y;
      setPreviewNode({
        id: 'preview',
        type: 'HIGHLIGHT',
        x: Math.min(drawStart.x, x),
        y: Math.min(drawStart.y, y),
        width: Math.abs(w),
        height: Math.abs(h),
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 0.35,
        z_index: 9999,
      });
    } else if (activeTool === 'ellipse') {
      const rx = Math.abs(x - drawStart.x) / 2;
      const ry = Math.abs(y - drawStart.y) / 2;
      const cx = (drawStart.x + x) / 2;
      const cy = (drawStart.y + y) / 2;
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
        x: drawStart.x,
        y: drawStart.y,
        points: [drawStart.x, drawStart.y, x, y],
        stroke_color: properties.color,
        stroke_width: properties.strokeWidth,
        opacity: 1.0,
        z_index: 9999,
      });
    } else if (activeTool === 'line') {
      setPreviewNode({
        id: 'preview',
        type: 'LINE',
        x: drawStart.x,
        y: drawStart.y,
        points: [drawStart.x, drawStart.y, x, y],
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

    if (!isDrawing) return;
    setIsDrawing(false);

    if (previewNode) {
      // Bỏ id preview và gán UUID thật
      const finalNode: AnnotationNode = {
        ...previewNode,
        id: `anno_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        z_index: annotations.length + 1,
      };
      setPreviewNode(null);
      setCurrentPoints([]);
      onAddAnnotation(finalNode);
    }
  };

  if (!imagePayload) {
    return (
      <div className="flex-1 w-full h-full bg-[#090a0f] relative overflow-hidden flex items-center justify-center">
        <EmptyState onOpenFile={onOpenFile} onPaste={onPasteClipboard} />
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
        setIsPanning(false);
        if (isDrawing) {
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
            alt="Captured Screen"
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
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="absolute inset-0 z-20 block cursor-inherit"
          />
        </div>

        {/* Viền bao ranh giới Canvas Frame */}
        <div className="absolute inset-0 border-2 border-cyan-400/40 pointer-events-none rounded-sm">
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-slate-800 rounded-xs shadow-md" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-800 rounded-xs shadow-md" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-slate-800 rounded-xs shadow-md" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-800 rounded-xs shadow-md" />
        </div>
      </div>
    </div>
  );
};
