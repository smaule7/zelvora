import React from 'react';

interface ZelvoroLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const ZelvoroLogo: React.FC<ZelvoroLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="zelvoro-brand-logo">
      {/* Geometric Zelvoro Symbol: Clean Emerald & Deep Black */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-[#0c120f] border border-emerald-500/30 text-emerald-400 font-bold tracking-wider shadow-sm group hover:border-emerald-400/50 transition-colors`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-emerald-400"
        >
          {/* Z shape with precision emerald geometry */}
          <path
            d="M8 9H24L13 23H24"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="9" r="2" fill="#34d399" />
          <circle cx="8" cy="23" r="2" fill="#10b981" />
        </svg>
        <div className="absolute inset-0 rounded-xl bg-emerald-500/5 pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-semibold tracking-tight text-white ${textSizes[size]}`}
            >
              Zelvoro
            </span>
            <span
              className={`font-semibold text-emerald-400 ${textSizes[size]}`}
            >
              AI
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
