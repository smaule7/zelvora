import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Music,
  Square,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { Attachment } from '../types';
import { classifyFileType, formatBytes } from '../data/mockData';
import { AttachmentChip } from './AttachmentChip';

interface ComposerProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  isGenerating?: boolean;
  onStopGeneration?: () => void;
  disabled?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  isGenerating = false,
  onStopGeneration,
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [stagedAttachments, setStagedAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap max height to 200px
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleFilesAdded = (files: FileList | File[]) => {
    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      const { type, extension } = classifyFileType(file.name);
      const isImg = type === 'image';
      const isAud = type === 'audio';

      const attachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        sizeFormatted: formatBytes(file.size),
        type,
        extension,
        file,
        previewUrl: isImg ? URL.createObjectURL(file) : undefined,
        duration: isAud ? '02:30' : undefined,
      };

      newAttachments.push(attachment);
    });

    setStagedAttachments((prev) => [...prev, ...newAttachments]);
    setShowAttachMenu(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setStagedAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isGenerating) return;
    if (!content.trim() && stagedAttachments.length === 0) return;

    onSendMessage(content.trim(), stagedAttachments);
    setContent('');
    setStagedAttachments([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const canSend = (content.trim().length > 0 || stagedAttachments.length > 0) && !disabled;

  return (
    <div
      id="zelvoro-composer-container"
      className="relative w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
        className="hidden"
        onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
      />
      <input
        ref={audioInputRef}
        type="file"
        multiple
        accept="audio/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="absolute inset-x-4 inset-y-0 z-30 rounded-2xl bg-black/90 border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center gap-2 pointer-events-none animate-in fade-in duration-150">
          <div className="p-3 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-emerald-300">
            Drop files to attach to Zelvoro AI
          </p>
          <p className="text-xs text-zinc-400">
            Supports PDF, DOCX, CSV, XLS, Images & Audio
          </p>
        </div>
      )}

      {/* Composer Card Surface */}
      <div
        className={`relative rounded-2xl bg-[#0c0e0d] border transition-all duration-200 shadow-xl ${
          isDragOver
            ? 'border-emerald-400'
            : 'border-zinc-800/80 hover:border-zinc-700/80 focus-within:border-emerald-500/50'
        }`}
      >
        {/* Staged Attachments Tray */}
        {stagedAttachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-zinc-800/60 bg-[#090b0a] rounded-t-2xl">
            {stagedAttachments.map((attachment) => (
              <AttachmentChip
                key={attachment.id}
                attachment={attachment}
                onRemove={() => handleRemoveAttachment(attachment.id)}
              />
            ))}
          </div>
        )}

        {/* Textarea & Actions Row */}
        <div className="p-3 sm:p-3.5">
          <textarea
            ref={textareaRef}
            id="message-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Zelvoro AI..."
            rows={1}
            disabled={disabled}
            className="w-full resize-none bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none leading-relaxed font-sans max-h-[200px]"
          />

          {/* Bottom Bar: Attachment triggers & Send button */}
          <div className="flex items-center justify-between pt-2">
            {/* Attachment Dropdown & Quick Actions */}
            <div className="relative flex items-center gap-1 text-zinc-400">
              <button
                type="button"
                id="btn-attachment-menu"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2 rounded-xl transition-colors ${
                  showAttachMenu
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                    : 'hover:bg-zinc-800/80 hover:text-white'
                }`}
                title="Attach files (PDF, DOCX, CSV, Images, Audio)"
                aria-label="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Quick direct buttons for Image and Document */}
              <button
                type="button"
                id="btn-upload-image"
                onClick={() => imageInputRef.current?.click()}
                className="hidden sm:flex p-2 rounded-xl hover:bg-zinc-800/80 hover:text-white transition-colors"
                title="Upload image"
                aria-label="Upload image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-upload-doc"
                onClick={() => fileInputRef.current?.click()}
                className="hidden sm:flex p-2 rounded-xl hover:bg-zinc-800/80 hover:text-white transition-colors"
                title="Upload document or spreadsheet (PDF, DOCX, CSV, XLS)"
                aria-label="Upload document"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-upload-audio"
                onClick={() => audioInputRef.current?.click()}
                className="hidden sm:flex p-2 rounded-xl hover:bg-zinc-800/80 hover:text-white transition-colors"
                title="Upload audio memo"
                aria-label="Upload audio memo"
              >
                <Music className="w-4 h-4" />
              </button>

              {/* Attachment Popover Menu */}
              {showAttachMenu && (
                <div
                  id="attachment-options-menu"
                  className="absolute bottom-full left-0 mb-2 w-56 rounded-xl bg-[#0f1211] border border-emerald-500/30 shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Add Multimodal Input
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:bg-[#161c18] hover:text-emerald-300 transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">Document / File</p>
                      <p className="text-[10px] text-zinc-400">PDF, DOC, DOCX, TXT</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:bg-[#161c18] hover:text-emerald-300 transition-colors text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">Spreadsheet</p>
                      <p className="text-[10px] text-zinc-400">CSV, XLS, XLSX</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      imageInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:bg-[#161c18] hover:text-emerald-300 transition-colors text-left"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">Image Upload</p>
                      <p className="text-[10px] text-zinc-400">PNG, JPG, WEBP, SVG</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:bg-[#161c18] hover:text-emerald-300 transition-colors text-left"
                  >
                    <Music className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">Audio Memo</p>
                      <p className="text-[10px] text-zinc-400">MP3, WAV, M4A, Voice Note</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Right controls: Stop Generation OR Send Button */}
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <button
                  type="button"
                  id="btn-stop-generation"
                  onClick={onStopGeneration}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-send-message"
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${
                    canSend
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-sm hover:scale-105 active:scale-95'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                  }`}
                  aria-label="Send message"
                  title="Send message (Enter)"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle keyboard reminder */}
      <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-zinc-500 select-none">
        <span>Zelvoro understands uploaded documents, spreadsheets, images, and audio.</span>
        <span className="hidden sm:inline">Press <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-400">Shift + Enter</kbd> for new line</span>
      </div>
    </div>
  );
};
