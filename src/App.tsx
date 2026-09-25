import React, { useState, useEffect, useRef } from 'react';
import {
  Square,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowDown,
} from 'lucide-react';
import { Conversation, Message, Attachment, UserSettings } from './types';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_USER_SETTINGS,
} from './data/mockData';
import {
  saveUserMessageToSupabase,
  sendChatMessageToZapierAgent,
  saveAssistantMessageToSupabase,
  fetchZelvoroHistory,
} from './services/zelvoroBackend';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { ChatMessage } from './components/ChatMessage';
import { Composer } from './components/Composer';
import { SettingsModal } from './components/SettingsModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { BackendReadyModal } from './components/BackendReadyModal';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('zelvoro_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CONVERSATIONS;
      }
    }
    return INITIAL_CONVERSATIONS;
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return INITIAL_CONVERSATIONS[0]?.id || 'new';
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('zelvoro_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USER_SETTINGS;
      }
    }
    return INITIAL_USER_SETTINGS;
  });

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('Zelvoro is thinking');
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('zelvoro_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('zelvoro_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Sync message history from zelvoro_messages table if available
  useEffect(() => {
    let isMounted = true;
    async function syncBackendHistory() {
      try {
        const records = await fetchZelvoroHistory();
        if (!isMounted || !records || records.length === 0) return;

        const syncedMessages: Message[] = [];
        for (const rec of records) {
          const reqId = rec.request_id || rec.id || `rec-${Date.now()}`;
          if (rec.user_message) {
            syncedMessages.push({
              id: `user-${reqId}`,
              role: 'user',
              content: rec.user_message,
              timestamp: rec.created_at
                ? new Date(rec.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Synced',
              requestId: reqId,
            });
          }
          if (rec.status === 'completed' && rec.assistant_response) {
            syncedMessages.push({
              id: `asst-${reqId}`,
              role: 'assistant',
              content: rec.assistant_response,
              status: 'completed',
              timestamp: rec.created_at
                ? new Date(rec.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Synced',
              requestId: reqId,
            });
          } else if (rec.status === 'failed') {
            syncedMessages.push({
              id: `asst-${reqId}`,
              role: 'assistant',
              content: '',
              status: 'failed',
              error: rec.assistant_response || 'Zapier Agent processing failed',
              timestamp: rec.created_at
                ? new Date(rec.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Synced',
              requestId: reqId,
            });
          }
        }

        if (syncedMessages.length > 0) {
          setConversations((prev) => {
            const hasSynced = prev.some((c) => c.id === 'supabase-cloud-sync');
            const syncConv: Conversation = {
              id: 'supabase-cloud-sync',
              title: 'Supabase Cloud History',
              createdAt: records[0].created_at || new Date().toISOString(),
              updatedAt: records[records.length - 1].created_at || new Date().toISOString(),
              pinned: true,
              messages: syncedMessages,
              tags: ['supabase', 'backend'],
            };
            if (hasSynced) {
              return prev.map((c) => (c.id === 'supabase-cloud-sync' ? syncConv : c));
            }
            return [syncConv, ...prev];
          });
        }
      } catch {
        // Quiet fallback
      }
    }

    syncBackendHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  // Current active conversation
  const activeConversation = conversations.find((c) => c.id === activeId);

  // Scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // Check scroll position for "scroll to bottom" button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isScrolledUp);
  };

  useEffect(() => {
    if (userSettings.chatSettings.autoScroll) {
      scrollToBottom(false);
    }
  }, [activeId, activeConversation?.messages.length]);

  // Create a new empty conversation
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newId);
  };

  // Delete a conversation
  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Toggle pinned state
  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  // Rename conversation title
  const handleRenameTitle = (newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, title: newTitle } : c))
    );
  };

  // Stop backend generation
  const handleStopGeneration = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    setIsGenerating(false);
    setStatusText('Zelvoro is thinking');
  };

  // Send message to server-side Zapier Agent & save to Supabase
  const handleSendMessage = async (content: string, attachments: Attachment[] = []) => {
    if (isGenerating || (!content.trim() && attachments.length === 0)) return;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsgId = `msg-user-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content,
      timestamp: timeStr,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // If active conversation doesn't exist or has 0 messages, generate a relevant title
    let targetConvId = activeId;
    const isInitialInConv = !activeConversation || activeConversation.messages.length === 0;

    if (!activeConversation || activeId === 'new') {
      const newId = `conv-${Date.now()}`;
      targetConvId = newId;
      const initialTitle =
        content.trim().slice(0, 36) ||
        (attachments[0] ? `Analysis: ${attachments[0].name}` : 'New Conversation');
      const newConv: Conversation = {
        id: newId,
        title: initialTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [userMessage],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newId);
    } else {
      const updatedTitle =
        activeConversation.title === 'New Conversation' && isInitialInConv
          ? content.trim().slice(0, 36) ||
            (attachments[0] ? `Analysis: ${attachments[0].name}` : 'New Conversation')
          : activeConversation.title;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                title: updatedTitle,
                updatedAt: new Date().toISOString(),
                messages: [...c.messages, userMessage],
              }
            : c
        )
      );
    }

    // Immediately display the user's message in the conversation
    setIsGenerating(true);
    setStatusText('Running Zelvoro Zapier Agent...');
    setTimeout(() => scrollToBottom(true), 50);

    // 1. Save user's message directly to Supabase
    let dbRecordId = '';
    try {
      dbRecordId = await saveUserMessageToSupabase(content);
    } catch {
      // Non-fatal
    }

    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;

    try {
      // 2 & 3. Call server-side Zapier Agents integration & wait for Agent response
      const assistantReply = await sendChatMessageToZapierAgent(
        content,
        abortController.signal
      );

      // 4 & 5. Display the Agent response in the existing Zelvoro chat interface
      const respTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const assistantMessage: Message = {
        id: `msg-asst-${Date.now()}`,
        role: 'assistant',
        content: assistantReply,
        status: 'completed',
        timestamp: respTime,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                messages: [...c.messages, assistantMessage],
              }
            : c
        )
      );

      // 6. Save assistant response to Supabase
      if (dbRecordId) {
        await saveAssistantMessageToSupabase(dbRecordId, content, assistantReply);
      }
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        // Stopped by user
      } else {
        // Show retry/error UI on failure without generating any fake Gemini answers
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while running the Zapier Agent.';
        const respTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const failedMessage: Message = {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: '',
          status: 'failed',
          error: errorMessage,
          timestamp: respTime,
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: [...c.messages, failedMessage],
                }
              : c
          )
        );
      }
    } finally {
      setIsGenerating(false);
      setStatusText('Zelvoro is thinking');
      activeAbortControllerRef.current = null;
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  // Regenerate latest response from real backend
  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length === 0 || isGenerating) return;

    const lastUserMessage = [...activeConversation.messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    // Remove the latest assistant response and resend
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        const msgs = [...c.messages];
        if (msgs[msgs.length - 1]?.role === 'assistant') {
          msgs.pop();
        }
        return { ...c, messages: msgs };
      })
    );

    handleSendMessage(lastUserMessage.content, lastUserMessage.attachments || []);
  };

  // Retry a failed message
  const handleRetry = (failedMessage: Message) => {
    if (!activeConversation || isGenerating) return;

    // Find preceding user message
    const failedIdx = activeConversation.messages.findIndex((m) => m.id === failedMessage.id);
    let userContent = '';
    let userAttachments: Attachment[] = [];

    if (failedIdx > 0) {
      const prevMsg = activeConversation.messages[failedIdx - 1];
      if (prevMsg && prevMsg.role === 'user') {
        userContent = prevMsg.content;
        userAttachments = prevMsg.attachments || [];
      }
    }

    if (!userContent) {
      const lastUser = [...activeConversation.messages].reverse().find((m) => m.role === 'user');
      if (lastUser) {
        userContent = lastUser.content;
        userAttachments = lastUser.attachments || [];
      }
    }

    // Remove the failed message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          messages: c.messages.filter((m) => m.id !== failedMessage.id),
        };
      })
    );

    if (userContent) {
      handleSendMessage(userContent, userAttachments);
    }
  };

  // Edit user message and re-send to real backend
  const handleEditMessage = (id: string, newContent: string) => {
    if (!activeConversation || isGenerating) return;

    const msgIndex = activeConversation.messages.findIndex((m) => m.id === id);
    if (msgIndex === -1) return;

    const userMsg = activeConversation.messages[msgIndex];
    const updatedMessages = activeConversation.messages.slice(0, msgIndex + 1);
    updatedMessages[msgIndex] = {
      ...userMsg,
      content: newContent,
      timestamp:
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (edited)',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: updatedMessages,
            }
          : c
      )
    );

    handleSendMessage(newContent, userMsg.attachments || []);
  };

  // Clear current chat
  const handleClearChat = () => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [] } : c))
    );
  };

  const currentMessages = activeConversation ? activeConversation.messages : [];
  const isEmpty = currentMessages.length === 0;

  // Background style based on appearance settings
  const bgSurfaceClass =
    userSettings.appearance.themeMode === 'pure-black'
      ? 'bg-[#070808]'
      : 'bg-[#101211]';

  return (
    <div
      id="zelvoro-app-root"
      className={`flex h-screen w-screen overflow-hidden ${bgSurfaceClass} text-zinc-100 font-sans selection:bg-emerald-500/25 selection:text-emerald-300`}
    >
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => setActiveId(id)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onTogglePin={handleTogglePin}
        userSettings={userSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Header */}
        <Header
          conversationTitle={activeConversation?.title || 'New Conversation'}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRenameTitle={handleRenameTitle}
          onClearChat={handleClearChat}
        />

        {/* Chat Scroll View */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          id="chat-messages-viewport"
          className="flex-1 overflow-y-auto flex flex-col relative"
        >
          {isEmpty ? (
            <EmptyState
              onSelectPrompt={(promptText) => {
                handleSendMessage(promptText, []);
              }}
            />
          ) : (
            <div className="flex-1 pb-4">
              {currentMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRegenerate={handleRegenerate}
                  onEditMessage={handleEditMessage}
                  onPreviewAttachment={(att) => setPreviewAttachment(att)}
                  onRetry={() => handleRetry(msg)}
                />
              ))}

              {/* Generation / Typing Indicator */}
              {isGenerating && (
                <div
                  id="zelvoro-typing-indicator"
                  className="w-full py-3.5 px-4 sm:px-6 bg-[#0a0c0b] border-y border-zinc-900/60 animate-in fade-in duration-200"
                >
                  <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#091510] border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-sm">
                        <span className="animate-pulse">Z</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                        <span>{statusText}</span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs transition-colors"
                    >
                      <Square className="w-3 h-3 text-rose-400 fill-current" />
                      <span>Stop generating</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-28 right-6 z-20 p-2.5 rounded-full bg-[#141a17] border border-emerald-500/40 text-emerald-400 shadow-xl hover:bg-emerald-500 hover:text-black transition-all duration-150"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Message Composer */}
        <Composer
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSaveSettings={(newSettings) => setUserSettings(newSettings)}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      {/* Backend Readiness Modal */}
      <BackendReadyModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </div>
  );
}
