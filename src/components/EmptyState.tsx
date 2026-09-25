import React from 'react';
import {
  HelpCircle,
  PenTool,
  Code2,
  FileSearch,
  ArrowRight,
} from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (promptText: string, suggestedAction?: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const suggestionCards = [
    {
      id: 'suggestion-understand',
      label: 'Help me understand something',
      icon: <HelpCircle className="w-4 h-4 text-emerald-400" />,
      prompt: 'Help me understand how zero-knowledge proofs work with a clear, step-by-step everyday analogy.',
    },
    {
      id: 'suggestion-write',
      label: 'Write something for me',
      icon: <PenTool className="w-4 h-4 text-emerald-400" />,
      prompt: 'Write a clear, concise strategy memo outlining team goals and operational priorities for the quarter.',
    },
    {
      id: 'suggestion-code',
      label: 'Help me code',
      icon: <Code2 className="w-4 h-4 text-emerald-400" />,
      prompt: 'Help me write a clean, well-tested TypeScript utility function with proper error handling and edge cases.',
    },
    {
      id: 'suggestion-file',
      label: 'Analyze a file',
      icon: <FileSearch className="w-4 h-4 text-emerald-400" />,
      prompt: 'I would like to analyze a file. How can you help me extract key metrics and summaries from documents, spreadsheets, or images?',
    },
  ];

  return (
    <div
      id="zelvoro-empty-state"
      className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-2xl mx-auto w-full text-center select-none animate-in fade-in duration-300"
    >
      {/* Centered Brand Mark */}
      <div className="mb-4">
        <div className="w-14 h-14 rounded-2xl bg-[#091510] border border-emerald-500/30 flex items-center justify-center shadow-lg relative">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-emerald-400"
          >
            <path
              d="M8 9H24L13 23H24"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="9" r="2.2" fill="#34d399" />
            <circle cx="8" cy="23" r="2.2" fill="#10b981" />
          </svg>
        </div>
      </div>

      {/* Brand Title */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        Zelvoro AI
      </h1>
      
      {/* Greeting Subheading */}
      <p className="text-base sm:text-lg text-zinc-300 mb-8 font-normal">
        How can I help you today?
      </p>

      {/* Clean Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {suggestionCards.map((card) => (
          <button
            key={card.id}
            id={card.id}
            type="button"
            onClick={() => onSelectPrompt(card.prompt, card.label)}
            className="group flex items-center justify-between p-4 rounded-xl bg-[#0d0f0e] border border-zinc-800 hover:border-emerald-500/40 hover:bg-[#121614] text-left transition-all duration-150 shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/30 flex-shrink-0 transition-colors">
                {card.icon}
              </div>
              <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                {card.label}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 flex-shrink-0 transform group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};
