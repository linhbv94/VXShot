import React from 'react';
import {
  FolderOpen,
  ChevronDown,
  History,
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Scan,
  Undo2,
  Redo2,
  Settings,
  SlidersHorizontal,
  MousePointer,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Pencil,
  Type,
  ListOrdered,
  Highlighter,
  ShieldAlert,
  Sparkles,
  Download,
  Save,
  ClipboardCheck,
  Copy,
  Coffee,
  Heart,
  RefreshCw,
  X,
  Minus as WindowMin,
  Square as WindowMax,
  Image as ImageIcon,
  Trash2,
  Droplet,
  EyeOff,
} from 'lucide-react';

// Biểu tượng Khối Che Đen Bảo Mật (Solid Blackout Box)
export const SolidRedactIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="6" width="18" height="12" rx="2" fill="currentColor" fillOpacity="0.85" />
    <line x1="7" y1="12" x2="17" y2="12" stroke="#ffffff" strokeWidth="1.5" />
  </svg>
);

// Biểu tượng Làm Mờ Điểm Ảnh / Kính Mờ (Blur Mosaic Grid)
export const BlurMosaicIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" strokeDasharray="2 2" />
    <path d="M3 15h18" strokeDasharray="2 2" />
    <path d="M9 3v18" strokeDasharray="2 2" />
    <path d="M15 3v18" strokeDasharray="2 2" />
  </svg>
);

export {
  FolderOpen,
  ChevronDown,
  History,
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Scan,
  Undo2,
  Redo2,
  Settings,
  SlidersHorizontal,
  MousePointer,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Pencil,
  Type,
  ListOrdered,
  Highlighter,
  ShieldAlert,
  Sparkles,
  Droplet,
  EyeOff,
  Download,
  Save,
  ClipboardCheck,
  Copy,
  Coffee,
  Heart,
  RefreshCw,
  X,
  WindowMin,
  WindowMax,
  ImageIcon,
  Trash2,
};
