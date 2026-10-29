import React from 'react';
import {
  MousePointer,
  SolidRedactIcon,
  BlurMosaicIcon,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Type,
  ListOrdered,
  Pencil,
  Highlighter,
  Undo2,
  Redo2,
  Trash2,
} from './icons/Icons';
import { ToolProperties, ToolType } from '../types/canvas';
import { AppLanguage, translations } from '../i18n/translations';

interface FloatingToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  properties: ToolProperties;
  onUpdateProperties: (props: Partial<ToolProperties>) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  hasSelection: boolean;
  onDeleteSelected: () => void;
  language?: AppLanguage;
}

const STROKE_WIDTHS = [2, 4, 8];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  activeTool,
  onSelectTool,
  properties,
  onUpdateProperties,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasSelection,
  onDeleteSelected,
  language = 'vi',
}) => {
  const t = translations[language].toolbar;

  const PRESET_COLORS = [
    { name: t.colors.red, hex: '#ef4444' },
    { name: t.colors.cyan, hex: '#06b6d4' },
    { name: t.colors.green, hex: '#22c55e' },
    { name: t.colors.yellow, hex: '#eab308' },
    { name: t.colors.white, hex: '#ffffff' },
    { name: t.colors.black, hex: '#000000' },
  ];

  const SOLID_REDACT_COLORS = [
    { name: t.colors.black, hex: '#000000' },
    { name: t.colors.charcoal, hex: '#1e293b' },
    { name: t.colors.white, hex: '#ffffff' },
  ];

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5 select-none">
      {/* Thanh công cụ chính */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#13161f]/92 backdrop-blur-md border border-slate-700/70 shadow-2xl rounded-xl">
        {/* Nhóm Chọn & Che dữ liệu */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title={t.select}
            onClick={() => onSelectTool('select')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'select'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          <button
            type="button"
            title={t.solidRedact}
            onClick={() => onSelectTool('solid_redact')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'solid_redact'
                ? 'bg-rose-500/25 text-rose-400 border border-rose-500/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <SolidRedactIcon className="w-4 h-4 text-rose-400" />
          </button>

          <button
            type="button"
            title={t.blur}
            onClick={() => onSelectTool('blur')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'blur'
                ? 'bg-purple-500/25 text-purple-400 border border-purple-500/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BlurMosaicIcon className="w-4 h-4 text-purple-400" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/70 mx-1" />

        {/* Nhóm Hình & Mũi tên */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title={t.rect}
            onClick={() => onSelectTool('rect')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'rect'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            type="button"
            title={t.ellipse}
            onClick={() => onSelectTool('ellipse')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'ellipse'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            type="button"
            title={t.arrow}
            onClick={() => onSelectTool('arrow')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'arrow'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            title={t.line}
            onClick={() => onSelectTool('line')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'line'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/70 mx-1" />

        {/* Nhóm Viết & Đánh số */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title={t.text}
            onClick={() => onSelectTool('text')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'text'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            type="button"
            title={t.step}
            onClick={() => onSelectTool('step')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'step'
                ? 'bg-amber-500/25 text-amber-400 border border-amber-500/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-amber-400" />
          </button>

          <button
            type="button"
            title={t.pen}
            onClick={() => onSelectTool('pen')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'pen'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            title={t.highlight}
            onClick={() => onSelectTool('highlight')}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              activeTool === 'highlight'
                ? 'bg-yellow-500/25 text-yellow-300 border border-yellow-500/50 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Highlighter className="w-4 h-4 text-yellow-300" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/70 mx-1" />

        {/* Nhóm Thuộc tính (Màu sắc & Nét vẽ) */}
        <div className="flex items-center gap-1.5">
          {activeTool === 'solid_redact' ? (
            // Chọn màu che Solid Redact
            <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-700/50">
              {SOLID_REDACT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={t.redactColorPrefix(c.name)}
                  onClick={() => onUpdateProperties({ solidRedactColor: c.hex })}
                  className={`w-4 h-4 rounded-full border transition-transform ${
                    properties.solidRedactColor === c.hex
                      ? 'scale-125 border-cyan-400 ring-1 ring-cyan-400'
                      : 'border-slate-600 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          ) : (
            // Chọn màu vẽ thông thường
            <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-700/50">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={t.colorPrefix(c.name)}
                  onClick={() => onUpdateProperties({ color: c.hex })}
                  className={`w-4 h-4 rounded-full border transition-transform ${
                    properties.color === c.hex
                      ? 'scale-125 border-cyan-400 ring-1 ring-cyan-400'
                      : 'border-slate-600 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}

          {/* Chọn độ dày nét */}
          <div className="flex items-center gap-0.5 bg-slate-900/60 p-0.5 rounded-lg border border-slate-700/50 text-[11px] font-mono">
            {STROKE_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                title={t.strokeWidth(w)}
                onClick={() => onUpdateProperties({ strokeWidth: w })}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  properties.strokeWidth === w
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {w}p
              </button>
            ))}
          </div>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/70 mx-1" />

        {/* Nhóm Undo, Redo, Delete */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title={t.undo}
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            title={t.redo}
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {hasSelection && (
            <button
              type="button"
              title={t.deleteSelected}
              onClick={onDeleteSelected}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors ml-0.5"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
