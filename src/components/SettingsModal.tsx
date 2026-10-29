import type {AppLanguage,ThemeMode} from '../i18n/translations';
import {SettingsShell,GeneralSettings,UpdatesSettings,AboutSettings,SupportSettings,commonSettingsTabs} from './shared/settings_ui';

import { appVersion } from '../services/app_updater';
import { AppUpdates } from './AppUpdates';
import {useState,useEffect} from 'react';
import {ShieldAlert,SlidersHorizontal,ImageIcon} from './icons/Icons';
import { AppSettings } from '../types/settings';
import {normalizeLanguage,normalizeTheme,translations} from '../i18n/translations';
import qrCode from '../assets/qr.png';

export type SettingsTab = 'general' | 'editor' | 'privacy' | 'updates' | 'about' | 'support';

interface SettingsModalProps {
  settings: AppSettings;
  activeTab?: SettingsTab;
  onTabChange?: (tab: SettingsTab) => void;
  onSaveSettings: (settings: AppSettings) => void;
  onResetDefaults?: () => void;
  onClose: () => void;
}



export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  activeTab: controlledTab,
  onTabChange,
  onSaveSettings,
  onResetDefaults,
  onClose,
}) => {
  const [internalTab, setInternalTab] = useState<SettingsTab>(controlledTab || 'general');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: SettingsTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const lang: AppLanguage = normalizeLanguage(currentSettings.general.language);
  const currentTheme: ThemeMode = normalizeTheme(currentSettings.general.theme);
  const t = translations[lang].settings;

  const handleSelectTheme = (theme: ThemeMode) => {
    const updated: AppSettings = {
      ...currentSettings,
      general: {
        ...currentSettings.general,
        theme,
      },
    };
    setCurrentSettings(updated);
    onSaveSettings(updated);
  };

  const handleSelectLanguage = (language: AppLanguage) => {
    const updated: AppSettings = {
      ...currentSettings,
      general: {
        ...currentSettings.general,
        language,
      },
    };
    setCurrentSettings(updated);
    onSaveSettings(updated);
  };

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

  const handleResetDefaults = () => {
    if (onResetDefaults) {
      onResetDefaults();
      return;
    }
    const reset: AppSettings = {
      ...currentSettings,
      general: {
        auto_hydrate_on_open: true,
        fit_window_on_open: true,
        theme: 'dark',
        language: currentSettings.general.language,
      },
      editor: {
        ...currentSettings.editor,
        default_export_format: 'PNG',
      },
    };
    setCurrentSettings(reset);
    onSaveSettings(reset);
  };

return (<SettingsShell theme={currentTheme} appName="VXShot" language={lang} tabs={[commonSettingsTabs(lang)[0], {id:'editor',label:t.tabs.editor,icon:<SlidersHorizontal size={16}/>} ,{id:'privacy',label:t.tabs.privacy,icon:<ShieldAlert size={16}/>} , ...commonSettingsTabs(lang).slice(1)]} activeTab={activeTab} onTabChange={id=>setActiveTab(id as SettingsTab)} onClose={onClose} onReset={handleResetDefaults}   >{activeTab === 'editor' && (<div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-100">{t.editor.title}</h3>

                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/[0.06] cursor-pointer hover:bg-slate-900/60 transition-colors gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">{t.editor.autoHydrateTitle}</span>
                    <span className="text-[11px] text-slate-400">{t.editor.autoHydrateDesc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSettings.general.auto_hydrate_on_open}
                    onChange={handleToggleAutoHydrate}
                    className="w-4 h-4 accent-cyan-500 rounded flex-shrink-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/[0.06] cursor-pointer hover:bg-slate-900/60 transition-colors gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">{t.editor.fitWindowTitle}</span>
                    <span className="text-[11px] text-slate-400">{t.editor.fitWindowDesc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSettings.general.fit_window_on_open}
                    onChange={handleToggleFitWindow}
                    className="w-4 h-4 accent-cyan-500 rounded flex-shrink-0"
                  />
                </label>

                <div className="p-3 rounded-lg bg-slate-900/40 border border-white/[0.06] flex flex-col gap-1.5">
                  <span className="font-medium text-slate-200">{t.editor.globalShortcutTitle}</span>
                  <span className="text-[11px] text-slate-400">{t.editor.globalShortcutDesc}</span>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-slate-800 text-cyan-300 border border-white/[0.1] rounded font-mono text-[11px]">
                      {currentSettings.hotkeys.global_open}
                    </kbd>
                    <span className="text-[11px] text-slate-500">{t.editor.defaultBadge}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/40 border border-white/[0.06] flex flex-col gap-2">
                  <span className="font-medium text-slate-200">{t.editor.exportFormatTitle}</span>
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="export_format"
                        checked={currentSettings.editor.default_export_format === 'PNG'}
                        onChange={() => handleSelectFormat('PNG')}
                        className="accent-cyan-500"
                      />
                      <span>{t.editor.pngOption}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="export_format"
                        checked={currentSettings.editor.default_export_format === 'JPEG'}
                        onChange={() => handleSelectFormat('JPEG')}
                        className="accent-cyan-500"
                      />
                      <span>{t.editor.jpegOption}</span>
                    </label>
                  </div>
                </div>
              </div>)}
{activeTab === 'privacy' && (<div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-100">{t.privacy.title}</h3>

                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                  ✓ <strong>{t.privacy.offlineBadgeTitle}</strong> {t.privacy.offlineBadgeDesc}
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900/40 border border-white/[0.06] flex flex-col gap-2">
                  <span className="font-medium text-slate-200">{t.privacy.redactPolicyTitle}</span>
                  <span className="text-[11px] text-slate-400">{t.privacy.redactPolicyDesc}</span>
                </div>
              </div>)}
{activeTab === 'general' && <GeneralSettings language={lang} theme={currentTheme} themes={['system','dark','light','oled']} onThemeChange={handleSelectTheme} onLanguageChange={handleSelectLanguage} />}
{activeTab === 'updates' && <UpdatesSettings language={lang} version={appVersion}><AppUpdates language={lang}/></UpdatesSettings>}
{activeTab === 'about' && <AboutSettings language={lang} appName="VXShot" version={appVersion}  description={t.about.description} repository="https://github.com/linhbv94/VXShot" icon={<ImageIcon/>}  />}
{activeTab === 'support' && <SupportSettings language={lang} qrSource={qrCode}/>}</SettingsShell>);
};
