import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  Volume2,
  Moon,
  Sun,
  Shield,
  Save,
  Check,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('queueflow_sound') !== 'false';
  });

  const [tokenPrefix, setTokenPrefix] = useState<string>(() => {
    return localStorage.getItem('queueflow_prefix') || 'T';
  });

  const [autoAdvance, setAutoAdvance] = useState<boolean>(() => {
    return localStorage.getItem('queueflow_autoadvance') === 'true';
  });

  const [isSaved, setIsSaved] = useState(false);

  // Play pleasant synthetic notification chime using Web Audio API
  const playTestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
      showToast('Played test chime sound', 'info');
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('queueflow_sound', String(soundEnabled));
    localStorage.setItem('queueflow_prefix', tokenPrefix);
    localStorage.setItem('queueflow_autoadvance', String(autoAdvance));

    setIsSaved(true);
    showToast('Preferences saved successfully!', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Preferences
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize queue notifications, display settings and system defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Appearance & Theme
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Choose your preferred color theme for the management dashboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-950 dark:text-white font-semibold'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Light Theme</p>
                  <p className="text-xs text-slate-500">Crisp white and slate interface</p>
                </div>
              </div>
              {theme === 'light' && <Check className="w-5 h-5 text-indigo-600" />}
            </button>

            <button
              type="button"
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-900/60 text-indigo-300">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Dark Theme</p>
                  <p className="text-xs text-slate-400">Dimmed palette for reduced eye strain</p>
                </div>
              </div>
              {theme === 'dark' && <Check className="w-5 h-5 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* Audio & Calling Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Audio & Call Notifications
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Configure audible chimes when calling the next customer.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Sound Chime on "Call Next"
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Play a synthetic audio notification when a token is advanced
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={playTestChime}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Test Sound
                </button>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Queue Configuration Defaults */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Queue Numbering Defaults
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Standard ticket number formatting for newly generated tokens.
          </p>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Default Token Prefix
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={3}
                  value={tokenPrefix}
                  onChange={(e) => setTokenPrefix(e.target.value.toUpperCase())}
                  className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-400">
                  Example preview: <strong className="font-mono text-slate-900 dark:text-white">{tokenPrefix || 'T'}001</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Preferences Saved' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

