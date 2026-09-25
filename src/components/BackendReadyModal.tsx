import React, { useState } from 'react';
import {
  X,
  Database,
  Key,
  HardDrive,
  Workflow,
  Cpu,
  Check,
  Copy,
  Layers,
  Terminal,
} from 'lucide-react';

interface BackendReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendReadyModal: React.FC<BackendReadyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback
    }
  };

  const envSnippet = `# Zelvoro AI Backend Integration Environment
# Supabase Configuration (Client & Direct Storage)
VITE_SUPABASE_URL="https://xoivytxnvcluokqmgewt.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Zapier Agents SDK Configuration (Server-Side)
ZAPIER_CREDENTIALS_CLIENT_ID="your-zapier-client-id"
ZAPIER_CREDENTIALS_CLIENT_SECRET="your-zapier-client-secret"
ZAPIER_AGENT_ID="your-zelvoro-agent-id"`;

  return (
    <div
      id="backend-ready-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="backend-ready-dialog"
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-[#090b0a] border border-emerald-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#070908]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Backend Preparation & Architecture</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready for Hookup
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Prepared connectors for Supabase, Zapier, and the Zelvoro AI Agent
              </p>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left text-xs text-zinc-300">
          <p className="text-zinc-300 leading-relaxed">
            The Zelvoro AI interface is built cleanly with modular state stores, structured models, and decoupled interfaces so each integration can be enabled seamlessly:
          </p>

          {/* Connectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0e1210] border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Key className="w-4 h-4" />
                  <span>Supabase Auth</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">STATUS: READY</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Client session management, JWT bearer tokens, and user profile state synchronization.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e1210] border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Database className="w-4 h-4" />
                  <span>Supabase Database</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">SCHEMA: SYNCED</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Relational schema for conversations, messages, and attachment metadata with Row Level Security.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e1210] border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <HardDrive className="w-4 h-4" />
                  <span>Supabase Storage</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">BUCKET: PREPARED</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Asset storage bucket for PDF, DOCX, CSV, audio memos, and image files.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e1210] border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Workflow className="w-4 h-4" />
                  <span>Zapier Automation</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">HOOK: READY</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Real-time outbound webhook payload trigger on conversation completion or flagged directives.
              </p>
            </div>
          </div>

          {/* Zelvoro AI Agent Integration Box */}
          <div className="p-4 rounded-xl bg-[#07110c] border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Zelvoro AI Agent Gateway</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                DeepReason Engine v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Standardized payload contract accepting user prompts, conversation memory history, and multimodal attachments (PDF embeddings, tabular schemas, and audio transcription buffers).
            </p>
          </div>

          {/* Environment Variables Reference Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">
                Environment Specification (.env template)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(envSnippet, 'env')}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {copiedKey === 'env' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-black border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-normal">
              <code>{envSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800 bg-[#070908] text-xs text-zinc-400">
          <span>Interface layer verified • Ready for production credentials</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
