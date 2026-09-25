import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Settings,
  Edit2,
  Check,
} from 'lucide-react';
import { ZelvoroLogo } from './ZelvoroLogo';

interface HeaderProps {
  conversationTitle: string;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onRenameTitle?: (newTitle: string) => void;
  onClearChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  conversationTitle,
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
  onRenameTitle,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleText, setTitleText] = useState(conversationTitle);

  const handleSaveTitle = () => {
    if (titleText.trim() && onRenameTitle) {
      onRenameTitle(titleText.trim());
    }
    setIsRenaming(false);
  };

  return (
    <header
      id="zelvoro-header"
      className="sticky top-0 z-20 w-full h-14 bg-[#070808]/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-5 flex items-center justify-between"
    >
      {/* Left: Mobile Sidebar Toggle & Conversation Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile menu toggle */}
        <button
          type="button"
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors md:hidden"
          aria-label="Toggle sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand in Header (visible on mobile) */}
        <div className="md:hidden">
          <ZelvoroLogo size="sm" showText={false} />
        </div>

        {/* Title display & inline rename */}
        <div className="flex items-center gap-2 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                autoFocus
                className="bg-black border border-emerald-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 text-emerald-400 hover:text-emerald-300"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group">
              <h2
                className="text-xs sm:text-sm font-medium text-zinc-200 truncate max-w-[170px] sm:max-w-[280px] md:max-w-md"
                title={conversationTitle}
              >
                {conversationTitle}
              </h2>
              {onRenameTitle && (
                <button
                  type="button"
                  onClick={() => {
                    setTitleText(conversationTitle);
                    setIsRenaming(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-300 transition-opacity"
                  title="Rename conversation"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* New Chat Quick Action */}
        <button
          type="button"
          id="btn-header-new-chat"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors text-xs font-medium"
          title="Start new chat"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Settings button */}
        <button
          type="button"
          id="btn-header-settings"
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Open settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
