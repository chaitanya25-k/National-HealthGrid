import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'high-contrast';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hg_theme') as ThemeMode | null;
      if (saved === 'dark' || saved === 'high-contrast' || saved === 'light') {
        const root = document.documentElement;
        root.classList.remove('dark', 'light', 'high-contrast-mode');
        if (saved === 'dark') root.classList.add('dark');
        else if (saved === 'high-contrast') root.classList.add('dark', 'high-contrast-mode');
        else root.classList.add('light');
        return saved;
      }
    }
    return 'light';
  });

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hg_high_contrast') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'high-contrast-mode');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'high-contrast') {
      root.classList.add('dark', 'high-contrast-mode');
    } else {
      root.classList.add('light');
    }

    if (isHighContrast) {
      root.classList.add('high-contrast-mode');
    }

    localStorage.setItem('hg_theme', theme);
    localStorage.setItem('hg_high_contrast', String(isHighContrast));
  }, [theme, isHighContrast]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isHighContrast,
        toggleHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
