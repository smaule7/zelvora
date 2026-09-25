import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  RotateCw,
  RotateCcw,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Terminal,
  User as UserIcon,
  AlertCircle,
} from 'lucide-react';
import { Message, Attachment } from '../types';
import { AttachmentChip } from './AttachmentChip';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onEditMessage?: (id: string, newContent: string) => void;
  onPreviewAttachment?: (attachment: Attachment) => void;
  onRetry?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onEditMessage,
  onPreviewAttachment,
  onRetry,
}) => {
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === 'user';

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = async (codeText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && onEditMessage) {
      onEditMessage(message.id, editedContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`group w-full py-5 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-[#080909]'
          : 'bg-[#0c0e0d]/90 border-y border-zinc-900/60'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300 font-semibold text-xs shadow-sm">
              <UserIcon className="w-4 h-4 text-zinc-300" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#091510] border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-sm">
              <span className="font-mono text-xs tracking-wider text-emerald-400 font-bold">Z</span>
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row: Author + Timestamp */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200">
                {isUser ? 'You' : 'Zelvoro AI'}
              </span>
              <span className="text-[11px] text-zinc-500">{message.timestamp}</span>
            </div>

            {/* Quick action buttons on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isUser && !isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedContent(message.content);
                    setIsEditing(true);
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1"
                  title="Edit message"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pb-2">
              {message.attachments.map((att) => (
                <AttachmentChip
                  key={att.id}
                  attachment={att}
                  onClick={() => onPreviewAttachment && onPreviewAttachment(att)}
                />
              ))}
            </div>
          )}

          {/* Inline Edit View for User */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[90px] rounded-xl bg-black border border-emerald-500/40 p-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 font-sans"
              />
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors"
                >
                  Save & Resubmit
                </button>
              </div>
            </div>
          ) : (
            /* Main Content Rendering */
            <div className="text-zinc-200 text-sm leading-relaxed prose prose-invert max-w-none">
              {isUser ? (
                <div className="whitespace-pre-wrap font-normal text-zinc-100">
                  {message.content}
                </div>
              ) : (
                <div className="markdown-body text-zinc-200">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        const isInline = !match && !codeString.includes('\n');

                        if (isInline) {
                          return (
                            <code
                              className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-300 font-mono text-xs"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }

                        const codeId = Math.random();
                        const language = match ? match[1] : 'code';

                        return (
                          <div className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-[#070908] not-prose">
                            {/* Code Header Bar */}
                            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0e1110] border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                              <div className="flex items-center gap-1.5 text-zinc-300">
                                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="uppercase text-[11px] font-semibold text-emerald-400/90 tracking-wider">
                                  {language}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(codeString, Math.floor(codeId * 1000))}
                                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-[11px]"
                              >
                                {copiedCodeIndex === Math.floor(codeId * 1000) ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>Copy code</span>
                                  </>
                                )}
                              </button>
                            </div>
                            {/* Code Content */}
                            <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-normal bg-[#060807]">
                              <code>{children}</code>
                            </pre>
                          </div>
                        );
                      },
                      table({ children }) {
                        return (
                          <div className="my-3 overflow-x-auto rounded-xl border border-zinc-800 bg-[#080a09] not-prose">
                            <table className="w-full text-left text-xs border-collapse">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children }) {
                        return (
                          <thead className="bg-[#0e1311] border-b border-zinc-800 text-emerald-400 font-medium">
                            {children}
                          </thead>
                        );
                      },
                      th({ children }) {
                        return <th className="p-2.5 font-semibold text-zinc-200">{children}</th>;
                      },
                      td({ children }) {
                        return (
                          <td className="p-2.5 border-b border-zinc-800/60 text-zinc-300">
                            {children}
                          </td>
                        );
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-5 my-2 space-y-1 text-zinc-200">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-5 my-2 space-y-1 text-zinc-200">{children}</ol>;
                      },
                      li({ children }) {
                        return <li className="text-zinc-300 leading-relaxed">{children}</li>;
                      },
                      h1({ children }) {
                        return <h1 className="text-lg font-bold text-white mt-4 mb-2">{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 className="text-base font-bold text-white mt-4 mb-2">{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 className="text-sm font-semibold text-emerald-400 mt-3 mb-1.5">{children}</h3>;
                      },
                      p({ children }) {
                        return <p className="my-2 leading-relaxed text-zinc-300">{children}</p>;
                      },
                      blockquote({ children }) {
                        return (
                          <blockquote className="border-l-2 border-emerald-500/60 pl-3 my-2 text-zinc-400 italic">
                            {children}
                          </blockquote>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Error Banner with Retry */}
              {(message.error || message.status === 'failed') && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#160b0c] border border-rose-900/60 flex items-start justify-between gap-3 text-xs not-prose">
                  <div className="flex items-start gap-2.5 text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-rose-200">Processing Error</span>
                      <p className="text-[11px] text-rose-300/90 leading-relaxed mt-0.5">
                        {message.error || 'The backend failed to complete this response.'}
                      </p>
                    </div>
                  </div>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900/80 border border-rose-700/60 text-rose-200 font-medium text-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Assistant Action Bar */}
          {!isUser && !message.error && message.status !== 'failed' && (
            <div className="flex items-center gap-1.5 pt-2 text-zinc-400 text-xs border-t border-zinc-800/40">
              <button
                type="button"
                onClick={handleCopyResponse}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-zinc-800/70 hover:text-white transition-colors"
                title="Copy entire response"
              >
                {copiedResponse ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-zinc-800/70 hover:text-white transition-colors"
                  title="Regenerate response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}

              <div className="h-3 w-[1px] bg-zinc-800 mx-1" />

              <button
                type="button"
                onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                className={`p-1 rounded-md hover:bg-zinc-800/70 transition-colors ${
                  feedback === 'up' ? 'text-emerald-400 bg-emerald-950/30' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Good response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                className={`p-1 rounded-md hover:bg-zinc-800/70 transition-colors ${
                  feedback === 'down' ? 'text-rose-400 bg-rose-950/30' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Poor response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
