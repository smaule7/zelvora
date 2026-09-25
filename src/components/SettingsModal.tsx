import React, { useState } from 'react';
import {
  X,
  User,
  Sliders,
  Palette,
  MessageSquare,
  Database,
  Check,
  ExternalLink,
  ShieldCheck,
  Copy,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import { UserSettings } from '../types';
import {
  getSupabaseAnonKey,
  setSupabaseAnonKey,
  getSupabaseUrl,
  CHAT_ENDPOINT,
} from '../services/zelvoroBackend';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
}

type TabType = 'profile' | 'instructions' | 'appearance' | 'chat' | 'account';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [anonKeyInput, setAnonKeyInput] = useState(() => getSupabaseAnonKey());
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setSupabaseAnonKey(anonKeyInput);
    onSaveSettings(formData);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVar(label);
      setTimeout(() => setCopiedVar(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="settings-modal-dialog"
        className="relative w-full max-w-2xl flex flex-col rounded-2xl bg-[#0a0c0b] border border-emerald-500/25 shadow-2xl overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#070908]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              Z
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Zelvoro AI Settings</h2>
              <p className="text-[11px] text-zinc-400">Workspace and model configuration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout: Left Tabs + Right Content */}
        <div className="flex flex-col sm:flex-row flex-1 min-h-[420px] overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="sm:w-48 border-b sm:border-b-0 sm:border-r border-zinc-800/80 p-2 sm:p-3 bg-[#080a09] flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap text-left ${
                activeTab === 'profile'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('instructions')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap text-left ${
                activeTab === 'instructions'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Instructions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap text-left ${
                activeTab === 'appearance'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Appearance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap text-left ${
                activeTab === 'chat'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap text-left ${
                activeTab === 'account'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Account & Backend</span>
            </button>
          </div>

          {/* Right Content Tab Body */}
          <div className="flex-1 p-6 overflow-y-auto text-left">
            {/* 1. Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-zinc-800/60">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 font-bold text-lg flex items-center justify-center shadow-md">
                    {formData.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{formData.profileName}</h3>
                    <p className="text-xs text-zinc-400">{formData.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#131b16] text-emerald-400 border border-emerald-500/20">
                      {formData.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.profileName}
                      onChange={(e) =>
                        setFormData({ ...formData, profileName: e.target.value })
                      }
                      className="w-full bg-[#111413] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-[#111413] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full bg-[#111413] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Custom Instructions Tab */}
            {activeTab === 'instructions' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-1">
                    What would you like Zelvoro AI to know about you?
                  </label>
                  <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                    Provide context about your projects, technical domain, or preferred workflow.
                  </p>
                  <textarea
                    rows={4}
                    value={formData.customInstructions.aboutUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customInstructions: {
                          ...formData.customInstructions,
                          aboutUser: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#111413] border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-1">
                    How would you like Zelvoro AI to respond?
                  </label>
                  <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                    Set formatting preferences (e.g. strict typescript examples, mathematical notation, concise bullets).
                  </p>
                  <textarea
                    rows={4}
                    value={formData.customInstructions.responseStyle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customInstructions: {
                          ...formData.customInstructions,
                          responseStyle: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#111413] border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 font-sans"
                  />
                </div>
              </div>
            )}

            {/* 3. Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-2">
                    Surface Tone (Dark Aesthetic)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          appearance: { ...formData.appearance, themeMode: 'pure-black' },
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.appearance.themeMode === 'pure-black'
                          ? 'border-emerald-500/50 bg-[#09100d]'
                          : 'border-zinc-800 bg-black/50 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">Pure Black</span>
                        {formData.appearance.themeMode === 'pure-black' && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">Deep OLED contrast (#070808)</p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          appearance: { ...formData.appearance, themeMode: 'dark-charcoal' },
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.appearance.themeMode === 'dark-charcoal'
                          ? 'border-emerald-500/50 bg-[#09100d]'
                          : 'border-zinc-800 bg-[#121413] hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">Dark Charcoal</span>
                        {formData.appearance.themeMode === 'dark-charcoal' && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">Soft charcoal surfaces (#111313)</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-2">
                    Code Monospace Font
                  </label>
                  <select
                    value={formData.appearance.codeFont}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appearance: {
                          ...formData.appearance,
                          codeFont: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-[#111413] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                  >
                    <option value="JetBrains Mono">JetBrains Mono (Recommended)</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="monospace">System Monospace</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#111413] border border-zinc-800">
                  <div>
                    <span className="text-xs font-medium text-white block">Compact Chat Spacing</span>
                    <span className="text-[11px] text-zinc-400">Reduce vertical padding between messages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.appearance.compactSpacing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appearance: {
                          ...formData.appearance,
                          compactSpacing: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 4. Chat Settings Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-200">
                      Creativity & Sampling (Temperature)
                    </label>
                    <span className="text-xs font-mono text-emerald-400">
                      {formData.chatSettings.temperature}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.chatSettings.temperature}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chatSettings: {
                          ...formData.chatSettings,
                          temperature: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>Precise / Deterministic (0.0)</span>
                    <span>Creative / Generative (1.0)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-1">
                    Active Context Window
                  </label>
                  <select
                    value={formData.chatSettings.contextLength}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chatSettings: {
                          ...formData.chatSettings,
                          contextLength: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#111413] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="16k tokens">16,000 Tokens (Fast memory)</option>
                    <option value="32k tokens">32,000 Tokens (Standard multi-file)</option>
                    <option value="128k tokens">128,000 Tokens (Full repository context)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#111413] border border-zinc-800">
                  <div>
                    <span className="text-xs font-medium text-white block">Auto-scroll to latest response</span>
                    <span className="text-[11px] text-zinc-400">Smooth scroll on new assistant tokens</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.chatSettings.autoScroll}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chatSettings: {
                          ...formData.chatSettings,
                          autoScroll: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 5. Account & Backend Preparation Tab */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#0d1310] border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Zapier Agents SDK Integration</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Message flow: Save user message to Supabase → Server-side Zapier Agents SDK (<code className="text-emerald-300">agents/run_behavior</code>) → Wait for Agent response → Display response → Save assistant response to Supabase (<code className="text-emerald-300">public.zelvoro_messages</code>).
                  </p>
                </div>

                {/* Connection Endpoints */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-black border border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Server AI Gateway</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        ZAPIER AGENTS SDK
                      </span>
                    </div>
                    <code className="text-[11px] font-mono text-zinc-400 block truncate">
                      POST {CHAT_ENDPOINT} (action: run_behavior)
                    </code>
                  </div>

                  <div className="p-3 rounded-xl bg-black border border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Supabase Project URL</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        DIRECT STORAGE
                      </span>
                    </div>
                    <code className="text-[11px] font-mono text-zinc-400 block">
                      {getSupabaseUrl()}
                    </code>
                  </div>

                  <div className="p-3 rounded-xl bg-black border border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Message Database</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        SYNCED
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block">
                      Table: <code className="text-emerald-300">public.zelvoro_messages</code> (user_message, assistant_response, status, created_at)
                    </span>
                  </div>

                  {/* Supabase Anon Key Configuration */}
                  <div className="p-3.5 rounded-xl bg-[#090d0b] border border-zinc-800/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="supabase-anon-key-input" className="text-xs font-semibold text-zinc-200">
                        Supabase Anon Key
                      </label>
                      <span className="text-[10px] text-zinc-400">
                        {anonKeyInput ? (
                          <span className="text-emerald-400 font-mono">KEY CONFIGURED</span>
                        ) : (
                          <span className="text-amber-400 font-mono">OPTIONAL / PROMPT</span>
                        )}
                      </span>
                    </div>
                    <input
                      id="supabase-anon-key-input"
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={anonKeyInput}
                      onChange={(e) => setAnonKeyInput(e.target.value)}
                      className="w-full rounded-lg bg-black border border-zinc-800 focus:border-emerald-500/60 p-2.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none transition-colors"
                    />
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Stored locally in your browser session or passed via <code className="text-zinc-400">VITE_SUPABASE_ANON_KEY</code>. Used to sign Edge Function requests and query <code className="text-zinc-400">zelvoro_messages</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800 bg-[#070908] text-xs">
          <span className="text-zinc-500">
            {savedFeedback ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Preferences saved!
              </span>
            ) : (
              'Zelvoro AI'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
