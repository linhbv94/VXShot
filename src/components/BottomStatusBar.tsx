import React, { useState, useRef, useEffect } from 'react';
import { Download, ClipboardCheck, ChevronDown, ImageIcon } from './icons/Icons';
import { ExportFormat } from '../types/canvas';

interface BottomStatusBarProps {
  width: number;
  height: number;
  zoom: number;
  statusMessage: string;
  hasImage: boolean;
  onSaveFile: (format?: ExportFormat) => void;
  onCopyResult: () => void;
  isSaving: boolean;
  isCopying: boolean;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  width,
  height,
  zoom,
  statusMessage,
  hasImage,
  onSaveFile,
  onCopyResult,
  isSaving,
  isCopying,
}) => {
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (saveDropdownRef.current && !saveDropdownRef.current.contains(e.target as Node)) {
        setShowSaveDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-[34px] min-h-[34px] w-full flex items-center justify-between px-3.5 bg-[#0f1117] border-t border-white/[0.08] select-none text-xs text-slate-300 z-40">
      {/* Vùng bên trái: Thông số Canvas & Trạng thái */}
      <div className="flex items-center gap-3 text-[11px] font-mono">
        {/* Kích thước Canvas */}
        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-white/[0.06]">
          <ImageIcon className="w-3 h-3 text-cyan-400" />
          <span className="font-semibold text-slate-200">
            {width > 0 ? `${width} × ${height} px` : '0 × 0 px'}
          </span>
        </div>

        {/* Tỷ lệ thu phóng */}
        <div className="text-slate-400">
          Zoom: <span className="text-slate-200 font-semibold">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Thông báo trạng thái */}
        {statusMessage && (
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-sans text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[280px]">{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Vùng bên phải: Nút Save Image & Copy Result */}
      <div className="flex items-center gap-2">
        {/* Nút Save Image với Dropdown định dạng PNG/JPEG */}
        <div className="relative" ref={saveDropdownRef}>
          <div className="inline-flex rounded-md overflow-hidden bg-slate-800 hover:bg-slate-700/80 border border-white/[0.12] transition-colors shadow-sm">
            <button
              type="button"
              disabled={!hasImage || isSaving}
              onClick={() => onSaveFile()}
              className={`flex items-center gap-1.5 px-3 py-1 font-medium text-slate-200 hover:text-white transition-all active:scale-95 ${
                !hasImage ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Lưu tệp ảnh PNG (Cmd/Ctrl + S)"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu tệp...'}</span>
              <kbd className="hidden md:inline-block ml-1 px-1 py-0.2 text-[9px] bg-slate-900/60 text-slate-400 rounded font-mono">
                Cmd+S
              </kbd>
            </button>
            <button
              type="button"
              disabled={!hasImage || isSaving}
              onClick={() => setShowSaveDropdown(!showSaveDropdown)}
              className="px-1.5 py-1 border-l border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              title="Tùy chọn định dạng lưu"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {showSaveDropdown && (
            <div className="absolute right-0 bottom-[36px] w-48 bg-[#141824] border border-white/[0.12] rounded-lg shadow-2xl py-1 z-50 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  setShowSaveDropdown(false);
                  onSaveFile('png');
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/15 hover:text-cyan-300 text-slate-200 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">Lưu tệp PNG</span>
                  <span className="text-[10px] text-slate-400">Giữ kênh trong suốt (Alpha)</span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400">.png</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveDropdown(false);
                  onSaveFile('jpeg');
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/15 hover:text-cyan-300 text-slate-200 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">Lưu tệp JPEG</span>
                  <span className="text-[10px] text-slate-400">Nền trắng chuẩn cho web</span>
                </div>
                <span className="text-[9px] font-mono text-amber-400">.jpg</span>
              </button>
            </div>
          )}
        </div>

        {/* Nút chính: Sao chép thành phẩm (Copy Result) Electric Cyan */}
        <button
          type="button"
          disabled={!hasImage || isCopying}
          onClick={onCopyResult}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-white bg-cyan-500 hover:bg-cyan-400 active:scale-95 shadow-md shadow-cyan-500/25 transition-all ${
            !hasImage ? 'opacity-40 cursor-not-allowed bg-slate-700 shadow-none' : ''
          }`}
          title="Hợp nhất và sao chép ảnh vào clipboard (Cmd/Ctrl + Shift + C)"
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-white" />
          <span>{isCopying ? 'Đang sao chép...' : 'Sao chép ảnh'}</span>
          <kbd className="hidden md:inline-block ml-1 px-1 py-0.2 text-[9px] bg-cyan-600/60 text-cyan-100 rounded font-mono">
            Cmd+Shift+C
          </kbd>
        </button>
      </div>
    </div>
  );
};
