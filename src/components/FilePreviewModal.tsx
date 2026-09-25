import React, { useState } from 'react';
import { X, FileText, Music, Image as ImageIcon, FileSpreadsheet, Download, Play, Pause } from 'lucide-react';
import { Attachment } from '../types';

interface FilePreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  attachment,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!attachment) return null;

  // Parse CSV if available
  const csvRows = attachment.dataSnippet
    ? attachment.dataSnippet.split('\n').map((row) => row.split(','))
    : [];

  return (
    <div
      id="file-preview-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="file-preview-dialog"
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-[#0d0f0e] border border-emerald-500/20 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4 bg-[#0a0c0b]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
              {attachment.type === 'image' && <ImageIcon className="w-5 h-5" />}
              {attachment.type === 'audio' && <Music className="w-5 h-5" />}
              {['csv', 'xls', 'xlsx'].includes(attachment.type) && (
                <FileSpreadsheet className="w-5 h-5" />
              )}
              {['pdf', 'doc', 'docx', 'txt'].includes(attachment.type) && (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white truncate max-w-md">
                {attachment.name}
              </h3>
              <p className="text-xs text-zinc-400">
                {attachment.type.toUpperCase()} • {attachment.sizeFormatted}
                {attachment.duration && ` • ${attachment.duration}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-zinc-300">
          {/* Image Preview */}
          {attachment.type === 'image' && (
            <div className="flex flex-col items-center justify-center p-4 bg-black rounded-xl border border-zinc-800/80">
              <img
                src={attachment.previewUrl || attachment.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
                alt={attachment.name}
                className="max-h-[50vh] object-contain rounded-lg"
              />
              <p className="mt-3 text-xs text-zinc-500">
                Processed by Zelvoro Multimodal Vision Layer
              </p>
            </div>
          )}

          {/* Audio Preview */}
          {attachment.type === 'audio' && (
            <div className="flex flex-col items-center justify-center p-8 bg-[#090b0a] rounded-xl border border-emerald-500/20">
              <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-sm">
                <Music className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-sm font-medium text-white mb-1">{attachment.name}</h4>
              <p className="text-xs text-emerald-400 font-mono mb-6">
                Length: {attachment.duration || '03:45'} • 44.1 kHz Stereo
              </p>

              {/* Audio visualizer mockup and controls */}
              <div className="w-full max-w-md bg-black/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-colors shadow-sm"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1 font-mono">
                    <span>{isPlaying ? '01:14' : '00:00'}</span>
                    <span>{attachment.duration || '04:12'}</span>
                  </div>
                  {/* Waveform graphic */}
                  <div className="h-3 w-full flex items-center gap-0.5">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-200 ${
                          i < 12 && isPlaying
                            ? 'bg-emerald-400'
                            : i < 12
                            ? 'bg-emerald-600'
                            : 'bg-zinc-800'
                        }`}
                        style={{
                          height: `${Math.max(20, Math.sin(i * 0.4) * 100)}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-4 text-center">
                Acoustic ingestion completed. Zelvoro can transcribe speech and analyze audio context.
              </p>
            </div>
          )}

          {/* CSV / Spreadsheet Table Preview */}
          {['csv', 'xls', 'xlsx'].includes(attachment.type) && csvRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Structured Ingestion ({csvRows.length} sample rows)</span>
                <span className="text-emerald-400">Ready for SQL & Analytical queries</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#0c100e] text-zinc-300">
                      {csvRows[0].map((header, idx) => (
                        <th key={idx} className="p-2.5 font-semibold text-emerald-400">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(1).map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-zinc-800/50 hover:bg-emerald-950/10 transition-colors"
                      >
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="p-2.5 text-zinc-300 font-mono text-[11px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Document / PDF / TXT metadata */}
          {['pdf', 'doc', 'docx', 'txt'].includes(attachment.type) && (
            <div className="p-6 rounded-xl bg-black border border-zinc-800/80 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{attachment.name}</h4>
                  <p className="text-xs text-zinc-400">Document parsed & tokenized for context injection</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80 text-xs">
                <div className="p-3 rounded-lg bg-[#0e1110] border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Format</span>
                  <span className="font-semibold text-emerald-400">{attachment.extension.toUpperCase()}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0e1110] border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Filesize</span>
                  <span className="font-semibold text-zinc-200">{attachment.sizeFormatted}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0e1110] border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Embedding Status</span>
                  <span className="font-semibold text-emerald-400">Context Vectorized</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0e1110] border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Security Level</span>
                  <span className="font-semibold text-zinc-300">Sandbox Isolation</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-6 py-3 bg-[#0a0c0b] text-xs text-zinc-400">
          <span>Attached to conversation memory</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
