import { useState, useEffect } from 'react';
import { safeJsonParse } from '../utils/formatters';

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() =>
    safeJsonParse(localStorage.getItem('surbus_dark'), true)
  );

  const theme = darkMode ? {
    bg: '#0a0a0f',
    bgCard: '#12121a',
    bgHover: '#1a1a25',
    text: '#ffffff',
    textMuted: '#8b8b9e',
    accent: '#00d4aa',
    border: '#2a2a3a',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  } : {
    bg: '#f8f9fc',
    bgCard: '#ffffff',
    bgHover: '#f0f2f5',
    text: '#1a1a2e',
    textMuted: '#6b7280',
    accent: '#0891b2',
    border: '#e5e7eb',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  // Persistir en localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('surbus_dark', JSON.stringify(darkMode));
    }, 100);
    return () => clearTimeout(timer);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  return { theme, darkMode, toggleTheme };
};
