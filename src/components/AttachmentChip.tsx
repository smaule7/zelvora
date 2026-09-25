import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Music,
  FileCode,
  File,
  X,
  ExternalLink,
} from 'lucide-react';
import { Attachment } from '../types';

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove?: () => void;
  onClick?: () => void;
  compact?: boolean;
}

export const AttachmentChip: React.FC<AttachmentChipProps> = ({
  attachment,
  onRemove,
  onClick,
  compact = false,
}) => {
  const getFileBadge = () => {
    switch (attachment.type) {
      case 'pdf':
        return {
          icon: <FileText className="w-4 h-4 text-emerald-400" />,
          label: 'PDF',
          color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
        };
      case 'doc':
      case 'docx':
        return {
          icon: <FileText className="w-4 h-4 text-emerald-400" />,
          label: attachment.extension.toUpperCase(),
          color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
        };
      case 'csv':
      case 'xls':
      case 'xlsx':
        return {
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
          label: attachment.extension.toUpperCase(),
          color: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300',
        };
      case 'txt':
        return {
          icon: <FileCode className="w-4 h-4 text-zinc-300" />,
          label: 'TXT',
          color: 'border-zinc-700/60 bg-zinc-900/60 text-zinc-300',
        };
      case 'image':
        return {
          icon: <ImageIcon className="w-4 h-4 text-emerald-400" />,
          label: 'IMAGE',
          color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
        };
      case 'audio':
        return {
          icon: <Music className="w-4 h-4 text-emerald-400" />,
          label: 'AUDIO',
          color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
        };
      default:
        return {
          icon: <File className="w-4 h-4 text-zinc-400" />,
          label: attachment.extension.toUpperCase() || 'FILE',
          color: 'border-zinc-700/60 bg-zinc-900/60 text-zinc-300',
        };
    }
  };

  const badge = getFileBadge();

  return (
    <div
      id={`attachment-chip-${attachment.id}`}
      onClick={onClick}
      className={`group relative inline-flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-all ${
        badge.color
      } ${
        onClick ? 'cursor-pointer hover:border-emerald-400/50 hover:bg-[#121614]' : ''
      } ${compact ? 'py-1 px-2.5 text-[11px]' : ''}`}
    >
      {/* Visual Icon or Image Thumbnail */}
      {attachment.type === 'image' && (attachment.previewUrl || attachment.url) ? (
        <div className="relative w-7 h-7 rounded overflow-hidden border border-emerald-500/20 flex-shrink-0 bg-black">
          <img
            src={attachment.previewUrl || attachment.url}
            alt={attachment.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 p-1 rounded bg-black/40 border border-emerald-500/10">
          {badge.icon}
        </div>
      )}

      {/* File Info */}
      <div className="flex flex-col min-w-0 pr-1 text-left">
        <span className="font-medium text-zinc-200 truncate max-w-[160px] sm:max-w-[220px]">
          {attachment.name}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span className="font-semibold text-emerald-400/90 tracking-wider">
            {badge.label}
          </span>
          <span>•</span>
          <span>{attachment.sizeFormatted}</span>
          {attachment.duration && (
            <>
              <span>•</span>
              <span className="text-emerald-400">{attachment.duration}</span>
            </>
          )}
        </div>
      </div>

      {/* Quick view indicator if clickable */}
      {onClick && !onRemove && (
        <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400 ml-1 transition-colors" />
      )}

      {/* Remove Button for composer staging */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Remove attachment"
          aria-label="Remove attachment"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
