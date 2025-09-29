# Theme System Documentation

## Overview

This application features a modular theme system that allows users to switch between different color themes. The system is built with:

- **Theme Provider**: React context for theme management
- **Local Storage**: Persistent theme preferences
- **Sonner Toasts**: User feedback for theme changes
- **Nested Dropdowns**: Intuitive theme selection UI

## Current Themes

### 1. Bubble Gum (Default)
- **Primary**: Pink/Magenta tones
- **Secondary**: Teal/Cyan colors
- **Accent**: Yellow/Orange highlights
- **Destructive**: Red/Pink warning colors

### 2. Amber
- **Primary**: Amber/Orange tones
- **Secondary**: Light gray colors
- **Accent**: Light yellow highlights
- **Destructive**: Red warning colors

## How to Add a New Theme

### Step 1: Define Theme Colors
Add your new theme to the `themes` array in `/lib/themes.ts`:

```typescript
{
  id: "your-theme-id",
  name: "Your Theme Name",
  colors: {
    primary: "hsl(xxx xxx% xx%)",      // Main brand color
    secondary: "hsl(xxx xxx% xx%)",    // Secondary accent
    accent: "hsl(xxx xxx% xx%)",       // Highlight color
    destructive: "hsl(xxx xxx% xx%)",  // Error/warning color
  },
  cssVariables: {
    light: {
      // Light mode CSS variables
      "--background": "xxx xxx% xx%",
      "--foreground": "xxx xxx% xx%",
      // ... add all other variables
    },
    dark: {
      // Dark mode CSS variables
      "--background": "xxx xxx% xx%",
      "--foreground": "xxx xxx% xx%",
      // ... add all other variables
    },
  },
}
```

### Step 2: Required CSS Variables

Each theme must include all these CSS variables for both light and dark modes:

#### Core Colors
- `--background`: Main background color
- `--foreground`: Main text color
- `--card`: Card background
- `--card-foreground`: Card text color
- `--popover`: Popover background
- `--popover-foreground`: Popover text color

#### Theme Colors
- `--primary`: Primary brand color
- `--primary-foreground`: Text on primary color
- `--secondary`: Secondary color
- `--secondary-foreground`: Text on secondary color
- `--muted`: Muted background
- `--muted-foreground`: Muted text
- `--accent`: Accent color
- `--accent-foreground`: Text on accent color
- `--destructive`: Error/warning color
- `--destructive-foreground`: Text on destructive color

#### UI Elements
- `--border`: Border color
- `--input`: Input background
- `--ring`: Focus ring color

#### Charts (5 colors)
- `--chart-1` through `--chart-5`: Chart colors

#### Sidebar
- `--sidebar`: Sidebar background
- `--sidebar-foreground`: Sidebar text
- `--sidebar-primary`: Sidebar primary color
- `--sidebar-primary-foreground`: Text on sidebar primary
- `--sidebar-accent`: Sidebar accent color
- `--sidebar-accent-foreground`: Text on sidebar accent
- `--sidebar-border`: Sidebar border color
- `--sidebar-ring`: Sidebar focus ring

#### Shadows
- `--shadow-2xs` through `--shadow-2xl`: Shadow definitions

### Step 3: Update Theme Descriptions (Optional)

In `/components/theme-selector.tsx`, add a description for your theme:

```typescript
<span className="text-xs text-muted-foreground">
  {theme.id === "bubble-gum" && "Pink & Blue vibes"}
  {theme.id === "amber" && "Warm amber tones"}
  {theme.id === "your-theme-id" && "Your theme description"}
</span>
```

### Step 4: Test Your Theme

1. Run the application
2. Click on the theme selector (palette icon)
3. Hover over your new theme to see the preview
4. Click to apply and test all UI components
5. Toggle dark mode to ensure both variants work

## Color Guidelines

### HSL Format
Use HSL (Hue, Saturation, Lightness) format for better color manipulation:
```css
--primary: 325.5814 57.8475% 56.2745%;
```

### Accessibility
- Ensure sufficient contrast between foreground and background colors
- Test with both light and dark modes
- Use tools like WebAIM's contrast checker

### Consistency
- Keep the same hue family for related colors
- Use consistent saturation levels within a theme
- Maintain proper lightness relationships

## File Structure

```
lib/
  themes.ts              # Theme definitions and configuration
providers/
  theme-provider.tsx     # React context for theme management
components/
  theme-selector.tsx     # Theme selection dropdown UI
app/
  layout.tsx            # Theme provider integration
  globals.css           # Default theme CSS variables
```

## Features

- ✅ **Persistent Storage**: Themes are saved to localStorage
- ✅ **Default Fallback**: Uses Bubble Gum theme if no preference is saved
- ✅ **Toast Notifications**: User feedback via Sonner
- ✅ **Dark Mode Support**: Each theme includes light and dark variants
- ✅ **Nested Dropdowns**: Hover-to-preview, click-to-select UI
- ✅ **Color Previews**: Visual color dots in the dropdown
- ✅ **Instant Application**: Themes apply immediately upon selection

## Usage in Components

The theme system automatically applies to all UI components using CSS variables. No additional code is required in your components - just use the standard Tailwind classes:

```tsx
<Button className="bg-primary text-primary-foreground">
  Primary Button
</Button>

<Card className="bg-card text-card-foreground border-border">
  <CardContent>Content using theme colors</CardContent>
</Card>
```
