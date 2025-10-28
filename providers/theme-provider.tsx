'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, DEFAULT_THEME, Theme } from '@/lib/themes';
import { toast } from 'sonner';
import { Loading } from '@/components/loading';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themes: Theme[];
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(DEFAULT_THEME);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme immediately on client-side to prevent flash
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 10));

        // Clean up any duplicate style tags that might exist
        const existingStyleTags = document.querySelectorAll(
          '#dynamic-theme-vars'
        );
        if (existingStyleTags.length > 1) {
          // Keep only the first one, remove others
          Array.from(existingStyleTags)
            .slice(1)
            .forEach(tag => tag.remove());
        }

        // Load theme from localStorage and sessionStorage (for immediate access)
        const savedTheme =
          localStorage.getItem('app-theme') ||
          sessionStorage.getItem('app-theme');
        const themeToApply =
          savedTheme && themes.find(t => t.id === savedTheme)
            ? savedTheme
            : DEFAULT_THEME;

        // Apply theme immediately
        applyTheme(themeToApply, true);
        setThemeState(themeToApply);
        setIsHydrated(true);

        // Store in sessionStorage for immediate access on subsequent loads
        sessionStorage.setItem('app-theme', themeToApply);

        // Minimal delay for smooth loading
        setTimeout(() => {
          setIsLoading(false);
        }, 50); // Reduced to 50ms for instant feel
      } catch (error) {
        console.error('Error initializing theme:', error);
        // Fallback to default theme
        applyTheme(DEFAULT_THEME, true);
        setThemeState(DEFAULT_THEME);
        setIsHydrated(true);
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  const applyTheme = (themeId: string, immediate: boolean = false) => {
    if (!isHydrated && !immediate) return;

    const selectedTheme = themes.find(t => t.id === themeId);
    if (!selectedTheme) return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    // Get all current classes
    const currentClasses = Array.from(root.classList);

    // Remove only theme- classes, keep everything else (including 'dark')
    const nonThemeClasses = currentClasses.filter(
      cls => !cls.startsWith('theme-')
    );

    // Set classes: keep non-theme classes and add the new theme class
    root.className = [...nonThemeClasses, `theme-${themeId}`].join(' ');

    // Get the correct variables for current mode
    const variables = isDark
      ? selectedTheme.cssVariables.dark
      : selectedTheme.cssVariables.light;

    // Use a <style> tag instead of inline styles for better performance
    let styleTag = document.getElementById(
      'dynamic-theme-vars'
    ) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme-vars';
      document.head.appendChild(styleTag);
    }

    // Only update if content has changed to prevent unnecessary re-renders
    const cssVars = Object.entries(variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n    ');

    const newContent = `:root.theme-${themeId}${isDark ? '.dark' : ''} {\n    ${cssVars}\n  }`;

    if (styleTag.textContent !== newContent) {
      styleTag.textContent = newContent;
    }
  };

  const setTheme = (themeId: string) => {
    const selectedTheme = themes.find(t => t.id === themeId);
    if (!selectedTheme) return;

    // Apply theme instantly without any loading state
    setThemeState(themeId);
    applyTheme(themeId, true);

    // Store in both storage types
    localStorage.setItem('app-theme', themeId);
    sessionStorage.setItem('app-theme', themeId);

    // Simple success toast without delays
    toast.success(`${selectedTheme.name} applied`, {
      duration: 1000,
    });
  };

  // Listen for dark mode changes and reapply theme
  useEffect(() => {
    if (!isHydrated) return;

    let isApplyingTheme = false; // Flag to prevent infinite loops

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          !isApplyingTheme
        ) {
          const root = document.documentElement;
          const currentIsDark = root.classList.contains('dark');
          const previousIsDark = mutation.oldValue?.includes('dark') ?? false;

          // Only reapply if dark mode actually changed
          if (currentIsDark !== previousIsDark) {
            isApplyingTheme = true;
            applyTheme(theme, true);
            // Reset flag after a short delay
            setTimeout(() => {
              isApplyingTheme = false;
            }, 100);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true, // Need this to compare old vs new
    });

    return () => observer.disconnect();
  }, [theme, isHydrated]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, isLoading }}>
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loading className="min-h-screen" size="lg" />
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
