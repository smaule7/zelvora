import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Settings,
  X,
  Database,
  ExternalLink,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { Conversation, UserSettings } from '../types';
import { ZelvoroLogo } from './ZelvoroLogo';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  userSettings: UserSettings;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onTogglePin,
  userSettings,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations by search term
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedConversations = filtered.filter((c) => c.pinned);
  const unpinnedConversations = filtered.filter((c) => !c.pinned);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        id="zelvoro-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-[#090b0a] border-r border-zinc-800/80 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header: Logo + Close on mobile */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-[#070908]">
          <ZelvoroLogo size="md" />
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Primary Button */}
        <div className="p-3">
          <button
            type="button"
            id="btn-sidebar-new-chat"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-150 shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              id="search-conversations-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-[#111413] border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Conversation List Groups */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
          {/* Pinned section if any */}
          {pinnedConversations.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider flex items-center gap-1.5">
                <Pin className="w-3 h-3 fill-current" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {pinnedConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onCloseMobile();
                      }}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#101914] text-white font-medium border-l-2 border-emerald-400'
                          : 'text-zinc-400 hover:bg-[#121514] hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <MessageSquare
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isActive ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        />
                        <span className="truncate">{conv.title}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(conv.id);
                          }}
                          className="p-1 hover:text-emerald-400"
                          title="Unpin conversation"
                        >
                          <Pin className="w-3 h-3 fill-current text-emerald-400" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="p-1 hover:text-rose-400"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Conversations */}
          <div>
            <div className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              {pinnedConversations.length > 0 ? 'All Conversations' : 'History'}
            </div>
            <div className="space-y-0.5 mt-1">
              {unpinnedConversations.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-zinc-600">
                  {searchQuery ? 'No matching conversations' : 'No past conversations'}
                </div>
              ) : (
                unpinnedConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onCloseMobile();
                      }}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#101914] text-white font-medium border-l-2 border-emerald-400'
                          : 'text-zinc-400 hover:bg-[#121514] hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <MessageSquare
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isActive ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        />
                        <span className="truncate">{conv.title}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(conv.id);
                          }}
                          className="p-1 hover:text-emerald-400"
                          title="Pin conversation"
                        >
                          <Pin className="w-3 h-3 text-zinc-500 hover:text-emerald-400" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="p-1 hover:text-rose-400"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* User Profile & Settings Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-[#070908] space-y-2">
          <div
            id="sidebar-user-profile"
            onClick={onOpenSettings}
            className="flex items-center justify-between p-2 rounded-xl bg-[#0e1110] border border-zinc-800/80 hover:border-emerald-500/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {userSettings.avatar}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-semibold text-zinc-200 truncate">
                  {userSettings.profileName}
                </span>
                <span className="text-[10px] text-zinc-500 truncate">
                  {userSettings.email}
                </span>
              </div>
            </div>
            <Settings className="w-4 h-4 text-zinc-500 hover:text-white flex-shrink-0 ml-1" />
          </div>
        </div>
      </aside>
    </>
  );
};
