import React from 'react';

interface LogoProps {
  variant?: 'emblem' | 'horizontal' | 'gold' | 'dark';
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  className = '',
  showSubtitle = true,
  size = 'md'
}) => {
  // If emblem variant is requested, render the exact full circular seal from the user's emblem
  if (variant === 'emblem') {
    const emblemDimensions = {
      sm: 'w-24 h-24',
      md: 'w-36 h-36',
      lg: 'w-48 h-48',
      xl: 'w-64 h-64'
    };

    return (
      <div className={`inline-block ${emblemDimensions[size]} select-none ${className}`}>
        <img
          src="/logo.svg"
          alt="MEYVAN Gold & Jewelry Official Emblem"
          className="w-full h-full object-contain filter drop-shadow-xl"
        />
      </div>
    );
  }

  // Standard Header / Horizontal Brand Mark
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const subSizes = {
    sm: 'text-[7px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-[13px]'
  };

  const isDarkSurface = variant !== 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Circular Emblem Icon (Miniature of the official circular logo) */}
      <div className={`${iconSizes[size]} shrink-0 relative rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-md`}>
        <img
          src="/logo.svg"
          alt="MEYVAN Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Typography Block */}
      <div className="flex flex-col text-right leading-none justify-center">
        {/* Main Wordmark */}
        <span
          className={`font-serif-luxury font-bold tracking-[0.24em] ${textSizes[size]} ${
            isDarkSurface ? 'gold-gradient-text drop-shadow-sm' : 'text-[#0B080F]'
          }`}
          style={{ letterSpacing: '0.24em' }}
        >
          MEYVAN
        </span>

        {/* Subtitle */}
        {showSubtitle && (
          <span
            className={`font-serif-luxury tracking-[0.34em] font-normal mt-1 ${subSizes[size]} ${
              isDarkSurface ? 'text-[#D4AF37]/90' : 'text-[#A89B8A]'
            }`}
            style={{ letterSpacing: '0.34em' }}
          >
            GOLD &amp; JEWELRY
          </span>
        )}
      </div>
    </div>
  );
};
