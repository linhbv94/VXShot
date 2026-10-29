import React, { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  ChevronDown,
  History,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings,
  X,
  WindowMin,
  WindowMax,
} from './icons/Icons';
import { minimizeWindow, toggleMaximizeWindow, closeWindow } from '../services/tauri_bridge';
import { AppLanguage, translations } from '../i18n/translations';

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
  language: AppLanguage;
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
  language,
}) => {
  const t = translations[language].titlebar;
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('nav')) document.querySelectorAll('header nav details').forEach(menu => (menu as HTMLDetailsElement).open = false);
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
    <header
      data-tauri-drag-region
      data-vx-titlebar-profile="standard_32"
      className={`h-[32px] min-h-[32px] max-h-[32px] w-full flex items-center justify-between ${
        isMac ? 'pl-[82px] pr-3' : 'px-3'
      } bg-[#0f1117] border-b border-white/[0.08] select-none titlebar-drag z-50 text-xs`}
    >
      {/* Vùng bên trái: App Brand (glyph x=82, gap 6px, name x=104, gap 12px tới action) */}
      <div className="flex items-center h-full min-w-0">
        <div
          data-tauri-drag-region
          data-vx-titlebar-brand
          className="flex items-center gap-[6px] mr-3 cursor-default flex-shrink-0"
        >
          <svg
            data-vx-titlebar-glyph
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
          <span
            data-vx-titlebar-name
            className="font-semibold text-[12px] leading-[16px] tracking-normal text-slate-100 whitespace-nowrap pointer-events-none"
          >
            VXShot
          </span>
        </div>

        {/* Nút Mở Tệp (Open File) kèm Dropdown Recent */}
        {!isMac && <nav data-vx-windows-menu className="flex gap-0.5 titlebar-no-drag" aria-label={language === 'vi' ? 'Menu ứng dụng' : 'Application menu'} style={{WebkitAppRegion:'no-drag'} as React.CSSProperties}>
          {[
            {label:language === 'vi'?'Tệp':'File',items:[{label:t.openFile,action:onOpenFile},{label:language === 'vi'?'Cài đặt':'Settings',action:onOpenSettings}]},
            {label:language === 'vi'?'Xem':'View',items:[{label:language === 'vi'?'Phóng to':'Zoom in',action:onZoomIn},{label:language === 'vi'?'Thu nhỏ':'Zoom out',action:onZoomOut},{label:language === 'vi'?'Kích thước thật':'Actual size',action:onZoomReset},{label:language === 'vi'?'Vừa cửa sổ':'Fit to window',action:onZoomFit}]}
          ].map(menu=><details key={menu.label} className="relative" onToggle={event=>{if(event.currentTarget.open)event.currentTarget.parentElement?.querySelectorAll('details').forEach(other=>{if(other!==event.currentTarget)other.open=false;});}} onKeyDown={event=>{if(event.key==='Escape'){event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus();}}}>
            <summary className="list-none cursor-pointer px-2 py-1 rounded hover:bg-white/10 text-slate-300">{menu.label}</summary>
            <div className="absolute top-full left-0 mt-1 min-w-40 p-1 rounded-lg border border-white/10 bg-[#141821] shadow-xl z-50">
              {menu.items.map(item=><button key={item.label} type="button" className="block w-full text-left px-3 py-1.5 rounded text-slate-200 hover:bg-cyan-500/20 whitespace-nowrap" onClick={event=>{const details=event.currentTarget.closest('details');if(details)details.open=false;item.action();}}>{item.label}</button>)}
            </div>
          </details>)}
        </nav>}

        <div className="relative titlebar-no-drag" ref={dropdownRef}
          onMouseEnter={() => setShowRecentDropdown(true)}
          onMouseLeave={() => setShowRecentDropdown(false)}
          onFocus={() => setShowRecentDropdown(true)}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setShowRecentDropdown(false); }}
          onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setShowRecentDropdown(true); requestAnimationFrame(() => dropdownRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()); } }}
        >
            <button
              type="button"
              onClick={() => { setShowRecentDropdown(false); onOpenFile(); }}
              aria-haspopup="menu"
              aria-expanded={showRecentDropdown}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors text-slate-700 dark:text-slate-200 bg-slate-200/60 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 cursor-pointer"
              title={t.openFileTitle}
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{t.openFile}</span>
              <ChevronDown className="w-3 h-3 shrink-0" />
            </button>

          {/* Dropdown danh sách gần đây */}
          {showRecentDropdown && (
            <div role="menu" className="absolute left-0 top-full pt-1 w-64 bg-[#141824] border border-white/[0.12] rounded-lg shadow-2xl py-1.5 z-50 backdrop-blur-xl">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold tracking-wider text-slate-400 border-b border-white/[0.06] flex items-center justify-between">
                <span>{t.recentFilesHeader}</span>
                <History className="w-3 h-3 text-slate-500" />
              </div>
              {recentFiles.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-slate-500 italic">
                  {t.noRecentFiles}
                </div>
              ) : (
                recentFiles.slice(0, 5).map((path, idx) => (
                  <button
                    key={idx}
                    role="menuitem"
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
      <div data-tauri-drag-region className="flex-1 h-full min-w-[48px] cursor-default" />

      {/* Vùng bên phải: Zoom Controls, Settings (cuối hàng trên macOS), Windows Control Buttons */}
      <div className="flex items-center gap-2 titlebar-no-drag">
        {/* Bộ điều khiển Zoom */}
        <div className="flex items-center bg-slate-800/60 border border-white/[0.08] rounded-md px-1 py-0.5 text-slate-300 gap-1 text-[11px] font-mono">
          <button
            type="button"
            onClick={onZoomOut}
            title={t.zoomOutTitle}
            className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onZoomReset}
            title={t.zoomResetTitle}
            className="px-1.5 py-0.5 hover:text-cyan-400 hover:bg-white/[0.06] rounded font-semibold transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            title={t.zoomInTitle}
            className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onZoomFit}
            title={t.zoomFitTitle}
            className="p-1 border-l border-white/[0.08] hover:text-cyan-400 hover:bg-white/[0.06] rounded transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Nút Cài đặt icon-only 28x28px hitbox, 16x16px icon, radius 6px */}
        <button
          type="button"
          data-vx-settings-button
          onClick={onOpenSettings}
          title={t.settingsTitle}
          aria-label={t.settingsTitle}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-[6px] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Nút điều khiển cửa sổ trên Windows */}
        {!isMac && (
          <div className="flex items-center ml-2 border-l border-white/[0.08] pl-2">
            <button
              type="button"
              onClick={minimizeWindow}
              title={t.minimize}
              aria-label={t.minimize}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <WindowMin className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleMaximizeWindow}
              title={t.maximize}
              aria-label={t.maximize}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <WindowMax className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={closeWindow}
              title={t.close}
              aria-label={t.close}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
