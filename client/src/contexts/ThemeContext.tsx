import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('stark-theme') as Theme;
    if (savedTheme) return savedTheme;
    
    // Fallback for browsers that don't support matchMedia
    try {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch (e) {
      console.warn('matchMedia not supported, defaulting to dark mode');
      return 'dark';
    }
  });

  const setTheme = (newTheme: Theme) => {
    console.log('Setting theme to:', newTheme);
    setThemeState(newTheme);
    try {
      localStorage.setItem('stark-theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('dark', 'light');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Update CSS custom properties based on theme
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
    }
    
    // Update theme-color meta tag for browser UI
    const themeColorMeta = document.getElementById('theme-color');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'light' ? '#fafafa' : '#131313');
    }
    
    // Log for debugging
    console.log('Theme applied:', theme, 'Classes:', root.className);
    
    // Verify CSS variables are set
    const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary');
    console.log('CSS variable --color-primary:', primaryColor);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if no theme is saved in localStorage
        if (!localStorage.getItem('stark-theme')) {
          setThemeState(e.matches ? 'light' : 'dark');
        }
      };

      // Use addEventListener with fallback for older browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if ((mediaQuery as any).addListener) {
        // Fallback for older browsers
        (mediaQuery as any).addListener(handleChange);
        return () => (mediaQuery as any).removeListener(handleChange);
      }
    } catch (e) {
      console.warn('System theme detection not supported:', e);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};