import React, { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  ChevronDown,
  History,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Scan,
  Settings,
  X,
  WindowMin,
  WindowMax,
} from './icons/Icons';
import { minimizeWindow, toggleMaximizeWindow, closeWindow } from '../services/tauri_bridge';

interface TitlebarProps {
  onOpenFile: () => void;
  onOpenRecentFile?: (path: string) => void;
  recentFiles: string[];
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
  onOpenSettings: () => void;
  isMac: boolean;
}

export const Titlebar: React.FC<TitlebarProps> = ({
  onOpenFile,
  onOpenRecentFile,
  recentFiles,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  onOpenSettings,
  isMac,
}) => {
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRecentDropdown(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRecentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatPathLabel = (path: string) => {
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1] || path;
  };

  return (
    <div
      data-tauri-drag-region
      className="h-[32px] min-h-[32px] w-full flex items-center justify-between px-3 bg-[#0f1117] border-b border-white/[0.08] select-none titlebar-drag z-50 text-xs"
    >
      {/* Vùng bên trái: Traffic Lights Spacer (macOS) HOẶC Menus (Windows) */}
      <div className="flex items-center h-full">
        {isMac ? (
          // macOS: Chừa 82px cho traffic lights native chuẩn zTools, hỗ trợ drag window
          <div data-tauri-drag-region className="w-[82px] h-full flex-shrink-0 cursor-default" />
        ) : null}

        {/* Biểu tượng và tên App */}
        <div data-tauri-drag-region className="flex items-center gap-[6px] mr-4 cursor-default">
          <svg
            className="w-4 h-4 text-cyan-400 flex-shrink-0 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2v14a2 2 0 0 0 2 2h14" />
            <path d="M18 22V8a2 2 0 0 0-2-2H2" />
          </svg>
          <span className="font-semibold text-xs text-slate-100 tracking-tight pointer-events-none">VXShot</span>
        </div>

        {/* Nút Mở Tệp (Open File) kèm Dropdown Recent */}
        <div className="relative titlebar-no-drag" ref={dropdownRef}>
          <div className="flex items-center bg-slate-800/60 hover:bg-slate-700/70 border border-white/[0.08] rounded-md overflow-hidden text-slate-300 hover:text-white transition-colors">
            <button
              type="button"
              onClick={onOpenFile}
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/[0.06] transition-colors"
              title="Mở ảnh từ máy tính (Cmd/Ctrl + O)"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-medium">Mở tệp</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRecentDropdown(!showRecentDropdown)}
              className="px-1 py-1 border-l border-white/[0.08] hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
              title="Danh sách tệp gần đây"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Dropdown danh sách gần đây */}
          {showRecentDropdown && (
            <div className="absolute left-0 top-[28px] w-64 bg-[#141824] border border-white/[0.12] rounded-lg shadow-2xl py-1.5 z-50 backdrop-blur-xl">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold tracking-wider text-slate-400 border-b border-white/[0.06] flex items-center justify-between">
                <span>Tệp gần đây</span>
                <History className="w-3 h-3 text-slate-500" />
              </div>
              {recentFiles.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-slate-500 italic">
                  Chưa có tệp nào gần đây
                </div>
              ) : (
                recentFiles.slice(0, 5).map((path, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setShowRecentDropdown(false);
                      onOpenRecentFile?.(path);
                    }}
                    title={path}
                    className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/15 hover:text-cyan-300 text-slate-300 flex items-center justify-between group transition-colors"
                  >
                    <span className="truncate text-[11px] font-medium">{formatPathLabel(path)}</span>
                    <span className="text-[9px] text-slate-500 ml-2 font-mono flex-shrink-0">
                      #{idx + 1}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vùng kéo cửa sổ rộng rãi ở giữa thanh tiêu đề */}
      <div data-tauri-drag-region className="flex-1 h-full cursor-default" />

      {/* Vùng bên phải: Zoom Controls, Settings, Windows Control Buttons */}
      <div className="flex items-center gap-2 titlebar-no-drag">
        {/* Bộ điều khiển Zoom */}
        <div className="flex items-center bg-slate-800/60 border border-white/[0.08] rounded-md px-1 py-0.5 text-slate-300 gap-1 text-[11px] font-mono">
          <button
            type="button"
            onClick={onZoomOut}
            title="Thu nhỏ (Cmd/Ctrl + -)"
            className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onZoomReset}
            title="Kích thước gốc 100% (Cmd/Ctrl + 0)"
            className="px-1.5 py-0.5 hover:text-cyan-400 hover:bg-white/[0.06] rounded font-semibold transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            title="Phóng to (Cmd/Ctrl + +)"
            className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onZoomFit}
            title="Vừa màn hình (Cmd/Ctrl + 9)"
            className="p-1 border-l border-white/[0.08] hover:text-cyan-400 hover:bg-white/[0.06] rounded transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Nút Cài đặt */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Cài đặt VXShot"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-md transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Nút điều khiển cửa sổ trên Windows */}
        {!isMac && (
          <div className="flex items-center ml-2 border-l border-white/[0.08] pl-2">
            <button
              type="button"
              onClick={minimizeWindow}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <WindowMin className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleMaximizeWindow}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <WindowMax className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={closeWindow}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
