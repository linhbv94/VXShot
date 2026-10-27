import { appVersion } from '../services/app_updater';
import { AppUpdates } from './AppUpdates';
import React, { useState } from 'react';
import { X, Settings, RefreshCw, Coffee, Heart, ShieldAlert, Sparkles, SlidersHorizontal, ImageIcon } from './icons/Icons';
import { AppSettings } from '../types/settings';
import qrCode from '../assets/qr.png';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

type SettingsTab = 'general' | 'editor' | 'privacy' | 'updates' | 'about' | 'support';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);

  const handleToggleAutoHydrate = () => {
    const updated = {
      ...currentSettings,
      general: {
        ...currentSettings.general,
        auto_hydrate_on_open: !currentSettings.general.auto_hydrate_on_open,
      },
    };
    setCurrentSettings(updated);
    onSaveSettings(updated);
  };

  const handleToggleFitWindow = () => {
    const updated = {
      ...currentSettings,
      general: {
        ...currentSettings.general,
        fit_window_on_open: !currentSettings.general.fit_window_on_open,
      },
    };
    setCurrentSettings(updated);
    onSaveSettings(updated);
  };

  const handleSelectFormat = (format: string) => {
    const updated = {
      ...currentSettings,
      editor: {
        ...currentSettings.editor,
        default_export_format: format,
      },
    };
    setCurrentSettings(updated);
    onSaveSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-[640px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-48px)] bg-[#141824] border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header với Drag Region chuẩn zTools */}
        <div
          data-tauri-drag-region
          className="h-[44px] min-h-[44px] px-4 flex items-center justify-between border-b border-white/[0.08] titlebar-drag select-none bg-slate-900/40"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-100">Cài đặt VXShot</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-md transition-colors titlebar-no-drag"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body 2 cột: Sidebar trái & Nội dung phải */}
        <div className="flex flex-1 min-h-[380px] overflow-hidden">
          {/* Sidebar danh mục chuẩn 2 nhóm */}
          <div className="w-[190px] border-r border-white/[0.08] p-2.5 flex flex-col justify-between bg-slate-950/30 text-xs">
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Cốt lõi
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  activeTab === 'general'
                    ? 'bg-cyan-500/15 text-cyan-300 font-medium'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Chung</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-cyan-500/15 text-cyan-300 font-medium'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Trình biên tập</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-cyan-500/15 text-cyan-300 font-medium'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Quyền riêng tư</span>
              </button>

              <div className="my-1.5 border-t border-white/[0.06]" />

              <div className="px-2 py-1 text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Thông tin & Hỗ trợ
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('updates')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  activeTab === 'updates'
                    ? 'bg-cyan-500/15 text-cyan-300 font-medium'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Cập nhật</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  activeTab === 'about'
                    ? 'bg-cyan-500/15 text-cyan-300 font-medium'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Giới thiệu</span>
              </button>
            </div>

            {/* Tab Ủng hộ tác giả nổi bật với màu Amber và Icon Coffee */}
            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left font-medium transition-colors ${
                activeTab === 'support'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Coffee className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Ủng hộ tác giả</span>
            </button>
          </div>

          {/* Vùng nội dung chi tiết bên phải */}
          <div className="flex-1 p-5 overflow-y-auto text-xs flex flex-col">
            {activeTab === 'general' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-100">Cấu hình chung</h3>

                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/[0.06] cursor-pointer hover:bg-slate-900/60 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">Tự động nạp ảnh từ Clipboard</span>
                    <span className="text-[11px] text-slate-400">
                      Mở ứng dụng hoặc kích hoạt phím tắt sẽ tự động hiển thị ảnh có sẵn
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSettings.general.auto_hydrate_on_open}
                    onChange={handleToggleAutoHydrate}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/[0.06] cursor-pointer hover:bg-slate-900/60 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">Tự căn chỉnh vừa cửa sổ (Fit to Window)</span>
                    <span className="text-[11px] text-slate-400">
                      Tự động tính tỉ lệ Zoom tối ưu để toàn bộ ảnh nằm trọn trong màn hình
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSettings.general.fit_window_on_open}
                    onChange={handleToggleFitWindow}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>

                <div className="p-3 rounded-lg bg-slate-900/40 border border-white/[0.06] flex flex-col gap-1.5">
                  <span className="font-medium text-slate-200">Phím tắt toàn hệ thống (Global Shortcut)</span>
                  <span className="text-[11px] text-slate-400">
                    Kích hoạt hiển thị VXShot từ bất kỳ đâu trên hệ điều hành
                  </span>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-slate-800 text-cyan-300 border border-white/[0.1] rounded font-mono text-[11px]">
                      {currentSettings.hotkeys.global_open}
                    </kbd>
                    <span className="text-[11px] text-slate-500">(Mặc định)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-100">Cấu hình Trình biên tập</h3>

                <div className="p-3 rounded-lg bg-slate-900/40 border border-white/[0.06] flex flex-col gap-2">
                  <span className="font-medium text-slate-200">Định dạng lưu mặc định</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="export_format"
                        checked={currentSettings.editor.default_export_format === 'PNG'}
                        onChange={() => handleSelectFormat('PNG')}
                        className="accent-cyan-500"
                      />
                      <span>PNG (Bảo toàn độ trong suốt Alpha)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="export_format"
                        checked={currentSettings.editor.default_export_format === 'JPEG'}
                        onChange={() => handleSelectFormat('JPEG')}
                        className="accent-cyan-500"
                      />
                      <span>JPEG (Nền trắng chuẩn cho web)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-100">Quyền riêng tư & An toàn dữ liệu</h3>

                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                  ✓ <strong>100% Offline-First:</strong> Ảnh được xử lý trên máy và không tải lên máy chủ. Ứng dụng chỉ kết nối GitHub để kiểm tra và tải cập nhật.
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900/40 border border-white/[0.06] flex flex-col gap-2">
                  <span className="font-medium text-slate-200">Chính sách Che Thông Tin Mặc Định</span>
                  <span className="text-[11px] text-slate-400">
                    Khối che đặc màu đen (Solid Redaction Block) được thiết lập làm mặc định để phá hủy ma trận điểm ảnh nhạy cảm khi xuất, chống giải mã ngược qua các công cụ AI.
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'updates' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-100">Kiểm tra cập nhật</h3>
                <AppUpdates language="vi" />
              </div>
            )}

            {activeTab === 'about' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-100">Giới thiệu ứng dụng</h3>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.06] flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                        <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-100">VXShot</span>
                      <span className="text-[11px] text-slate-400 font-mono">Phiên bản {appVersion}</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Tiện ích máy tính siêu tốc chuyên chỉnh sửa và xử lý nhanh ảnh từ clipboard trên Windows và macOS. Nằm trong bộ công cụ tiện ích cá nhân <strong>zTools</strong>.
                  </p>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                    <span>Tác giả: <strong>Bùi Việt Linh</strong></span>
                    <span className="font-mono">Tauri v2 + React 19 + Rust</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Coffee className="w-4 h-4" />
                  <span className="text-sm font-bold">Mời tác giả tách cà phê</span>
                </div>
                <p className="text-slate-300 text-[11px] max-w-sm leading-relaxed">
                  Cảm ơn bạn đã tin dùng <strong>VXShot</strong> trong hệ sinh thái zTools! Nếu tiện ích này giúp bạn tiết kiệm thời gian chụp và xử lý ảnh hàng ngày, bạn có thể ủng hộ tác giả một ly cà phê nhé.
                </p>

                {/* Card VietQR căn giữa chuẩn zTools */}
                <div className="p-3 bg-white rounded-xl shadow-xl flex flex-col items-center gap-1 mt-1">
                  <img
                    src={qrCode}
                    alt="VietQR Vietcombank"
                    className="w-44 h-44 object-contain rounded-md"
                  />
                  <span className="text-[10px] text-slate-800 font-semibold tracking-wide">
                    Quét mã bằng ứng dụng Ngân hàng (Vietcombank)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                  <span>Trân trọng sự ủng hộ và đồng hành của bạn!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-[46px] min-h-[46px] px-4 flex items-center justify-end border-t border-white/[0.08] bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs active:scale-95 transition-all shadow-md shadow-cyan-500/20"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
