'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

interface Props {
  className?: string;
}

export function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      onClick={toggleTheme}
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
