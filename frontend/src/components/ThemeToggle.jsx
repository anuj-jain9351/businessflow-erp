import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="p-2.5 rounded-xl border transition-all duration-200
                 bg-white border-slate-200 text-slate-700 hover:bg-slate-100
                 dark:bg-slate-900 dark:border-slate-800 dark:text-amber-400 dark:hover:bg-slate-800 shadow-sm"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} className="text-slate-700" />}
    </button>
  );
}