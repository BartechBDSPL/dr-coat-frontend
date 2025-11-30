'use client';

import React from 'react';
import { Palette, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeSelector() {
  const { theme: currentTheme, setTheme, themes, isLoading } = useTheme();

  const handleThemeChange = (themeId: string) => {
    if (currentTheme === themeId) return;
    setTheme(themeId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <Palette className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Color Themes
        </DropdownMenuLabel>

        <div className="grid grid-cols-1 gap-1 p-1">
          {themes.map(theme => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={cn(
                'cursor-pointer rounded-md p-3',
                'hover:bg-accent/50 focus:bg-accent/50',
                currentTheme === theme.id && 'bg-accent text-accent-foreground',
                'flex items-center gap-3'
              )}
            >
              <div className="flex shrink-0 gap-1">
                <div
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{theme.name}</span>
                  {currentTheme === theme.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Choose your preferred color scheme
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
