import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={() => {
        console.log('ThemeToggle clicked, current theme:', theme);
        toggleTheme();
      }}
      className="relative w-20 h-10 sm:w-16 sm:h-9 bg-surface-container-low border border-outline-variant rounded-full cursor-pointer z-[100] transition-all duration-500"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Toggle Circle */}
      <div
        className={`
          absolute top-1 w-7 h-7 rounded-full transition-all duration-500 ease-premium
          flex items-center justify-center pointer-events-none border border-outline-variant/30
          ${theme === 'dark'
            ? 'left-1 bg-surface-container-high shadow-silver-glow'
            : 'left-12 sm:left-8 bg-primary shadow-gold-glow'
          }
        `}
      >
        {/* Icon */}
        <span 
          className={`
            material-symbols-outlined text-sm transition-all duration-300
            ${theme === 'dark' ? 'text-on-surface' : 'text-on-tertiary-fixed'}
          `}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {theme === 'dark' ? 'dark_mode' : 'light_mode'}
        </span>
      </div>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <span 
          className={`
            material-symbols-outlined text-xs transition-opacity duration-300
            ${theme === 'light' ? 'opacity-30' : 'opacity-0'}
            text-on-surface-variant
          `}
        >
          dark_mode
        </span>
        <span 
          className={`
            material-symbols-outlined text-xs transition-opacity duration-300
            ${theme === 'dark' ? 'opacity-30' : 'opacity-0'}
            text-on-surface-variant
          `}
        >
          light_mode
        </span>
      </div>
    </button>
  );
};

export default ThemeToggle;