import React from 'react';
import { FolderOpen, Copy } from './icons/Icons';
import { AppLanguage, translations } from '../i18n/translations';

interface EmptyStateProps {
  onOpenFile: () => void;
  onPaste: () => void;
  language?: AppLanguage;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenFile,
  onPaste,
  language = 'vi',
}) => {
  const t = translations[language].emptyState;

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-lg text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-white/[0.08] flex items-center justify-center mb-5 shadow-2xl shadow-cyan-500/10">
        <svg
          className="w-8 h-8 text-cyan-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="10" width="8" height="6" rx="1" strokeDasharray="2 2" />
        </svg>
      </div>

      <h2 className="text-base font-semibold text-slate-100 mb-2">
        {t.title}
      </h2>

      <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-sm">
        {t.descriptionPrefix}
        <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">Ctrl+Cmd+Shift+4</kbd>
        {t.descriptionMiddle}
        <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300">Win+Shift+S</kbd>
        {t.descriptionSuffix}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPaste}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{t.pasteButton}</span>
        </button>

        <button
          type="button"
          onClick={onOpenFile}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-white/[0.08] text-slate-300 hover:text-white font-medium text-xs active:scale-95 transition-all"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>{t.openFileButton}</span>
        </button>
      </div>
    </div>
  );
};
