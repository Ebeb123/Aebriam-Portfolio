/**
 * Centralized Color Palette for Portfolio
 * 
 * This file contains all colors used throughout the application
 * organized by semantic meaning and theme variants.
 */

export const colors = {
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Primary accent palette (steel blue). The key is still called "pink"
  // because the whole template references it by that name — change the hex
  // values here to re-theme the entire site.
  pink: {
    25: '#F7F9FC',
    50: '#F1F5FA',
    100: '#E2EAF3',
    200: '#C5D5E6',
    300: '#8DB4D9',       // accent on dark backgrounds
    400: '#5B8FC2',
    500: '#3A6F9F',       // main accent on light backgrounds
    600: '#2E5C86',
    700: '#27496A',       // navigation text
    800: '#1F3B57',       // main accent text
    900: '#172C41',
  },

  // Dark theme colors
  dark: {
    50: '#F8FAFC',        // Almost white
    100: '#F1F5F9',       // Very light gray
    200: '#E2E8F0',       // Light gray
    300: '#CBD5E1',       // Medium light gray
    400: '#94A3B8',       // Medium gray
    500: '#64748B',       // Neutral gray
    600: '#475569',       // Medium dark gray
    700: '#334155',       // Dark gray
    800: '#1E293B',       // Very dark gray
    900: '#0F172A',       // Almost black
    950: '#020617',       // Darkest
  },

  // Semantic colors
  background: {
    light: {
      primary: '#FFFFFF',
      secondary: '#F1F5FA',
      gradient: 'linear-gradient(180deg, rgb(245 250 254) 0%, rgb(241 247 253) 50%, rgb(236 245 253) 100%)',
      gradientEnd: 'rgb(236 245 253)', // End color of the main gradient for seamless transitions
      overlay: 'rgba(255, 255, 255, 0.5)',
      // Section-specific gradients - mostly white with very light pink brush at edges
      sections: {
        about: 'linear-gradient(180deg, rgb(255 255 255) 0%, rgb(250 252 254) 30%, #F8FBFE 100%)',
        skills: 'linear-gradient(180deg, rgb(248 251 254) 0%, rgb(252 253 254) 30%, rgb(252 253 254) 70%, rgb(255 255 255) 100%)',
        projects: 'linear-gradient(180deg, rgb(248 251 254) 0%, rgb(255 255 255) 15%, rgb(255 255 255) 85%, rgb(248 251 254) 100%)',
        experience: 'linear-gradient(180deg, rgb(248 251 254) 0%, rgb(252 253 254) 25%, rgb(252 253 254) 75%, rgb(248 251 254) 100%)',
        certifications: 'linear-gradient(180deg, rgb(255 255 255) 0%, rgb(255 255 255) 60%, rgb(252 253 254) 100%)',
      },
    },
    dark: {
      primary: '#0F172A',
      secondary: '#1E293B',
      gradient: '#0A0F1B',
      gradientEnd: '#0A0F1B', // Consistent dark background for seamless transitions
      overlay: 'rgba(0, 0, 0, 0.7)',
      // Dark mode sections maintain consistent dark background
      sections: {
        about: '#0A0F1B',
        skills: '#0A0F1B',
        projects: '#0A0F1B',
        experience: '#0A0F1B',
        certifications: '#0A0F1B',
      },
    },
  },

  // Text colors
  text: {
    light: {
      primary: '#1F2937',     // rgb(31, 41, 55)
      secondary: '#4B5563',   // rgb(75, 85, 99)
      tertiary: '#6B7280',    // rgb(107, 114, 128)
      accent: '#1F3B57',
      pink: '#2E5C86',        // rgb(20, 113, 194)
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#CBD5E1',
      tertiary: '#94A3B8',
      accent: '#8DB4D9',
      pink: '#8DB4D9',
    },
  },

  // Interactive elements
  interactive: {
    light: {
      primary: 'rgba(141, 180, 217, 0.1)',
      hover: 'rgba(141, 180, 217, 0.2)',
      active: '#8DB4D9',
      focus: 'rgba(141, 180, 217, 0.3)',
    },
    dark: {
      primary: 'rgba(141, 180, 217, 0.1)',
      hover: 'rgba(141, 180, 217, 0.2)',
      active: '#8DB4D9',
      focus: 'rgba(141, 180, 217, 0.3)',
    },
  },

  // Navigation specific
  navigation: {
    light: {
      background: 'rgba(233, 244, 254, 0.4)',
      backgroundScrolled: 'rgba(233, 244, 254, 0.6)',
      border: 'rgba(194, 227, 255, 0.15)',
      borderScrolled: 'rgba(194, 227, 255, 0.2)',
      shadow: 'rgba(194, 227, 255, 0.08)',
      shadowScrolled: 'rgba(194, 227, 255, 0.12)',
      mobile: 'rgba(248, 251, 254, 0.95)',
    },
    dark: {
      background: 'rgba(10, 15, 27, 0.4)',
      backgroundScrolled: 'rgba(10, 15, 27, 0.6)',
      border: 'rgba(141, 180, 217, 0.1)',
      borderScrolled: 'rgba(141, 180, 217, 0.15)',
      shadow: 'rgba(0, 0, 0, 0.2)',
      shadowScrolled: 'rgba(0, 0, 0, 0.3)',
      mobile: 'rgba(10, 15, 27, 0.95)',
    },
  },

  // Button variants
  button: {
    primary: {
      light: {
        background: '#2E5C86',
        text: '#FFFFFF',
        hover: '#27496A',
        shadow: 'rgba(141, 180, 217, 0.3)',
      },
      dark: {
        background: '#8DB4D9',
        text: '#0A0F1B',
        hover: '#A9C8E6',
        shadow: 'rgba(141, 180, 217, 0.4)',
      },
    },
    secondary: {
      light: {
        background: 'rgba(255, 255, 255, 0.8)',
        text: '#1F2937',
        border: '#8DB4D9',
        hover: '#E2EAF3',
      },
      dark: {
        background: 'rgba(31, 41, 55, 0.9)',
        text: '#FFFFFF',
        border: '#374151',
        hover: 'rgba(141, 180, 217, 0.1)',
      },
    },
    outline: {
      light: {
        background: 'transparent',
        text: '#3A6F9F',
        border: '#8DB4D9',
        hover: '#E2EAF3',
      },
      dark: {
        background: '#1F2937',
        text: '#8DB4D9',
        border: '#5B8FC2',
        hover: 'rgba(141, 180, 217, 0.1)',
      },
    },
  },

  // Card colors
  card: {
    light: {
      background: '#FFFFFF',
      border: 'rgba(141, 180, 217, 0.3)',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      background: '#1F2937',
      border: 'rgba(55, 65, 81, 0.3)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },

  // Special effects
  effects: {
    glow: 'rgba(194, 227, 255, 0.3)',
    dropShadow: 'rgba(141, 180, 217, 0.3)',
    textShadow: 'rgba(0, 0, 0, 0.1)',
    blur: 'rgba(255, 255, 255, 0.1)',
  },

  // Utility colors
  utility: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    neutral: '#6B7280',
  },

  // Special colors
  special: {
    dragMe: '#45A0F0',       // Hot pink for drag me star (rgb(69, 160, 240))
    aurora: {
      dark: '#94CDFF',       // Pink aurora for dark mode
      light: {
        1: '#CEE7FC',        // Light pink aurora stop 1
        2: '#CCE7FF',        // Light pink aurora stop 2
        3: '#D9ECFC',        // Light pink aurora stop 3
      }
    }
  },
} as const;

// Type definitions for better TypeScript support
type ColorTheme = 'light' | 'dark';
type ColorVariant = keyof typeof colors;

export type { ColorTheme, ColorVariant };

// Helper function to get theme-specific colors
export const getThemeColors = (theme: ColorTheme) => ({
  background: colors.background[theme],
  text: colors.text[theme],
  interactive: colors.interactive[theme],
  navigation: colors.navigation[theme],
  button: {
    primary: colors.button.primary[theme],
    secondary: colors.button.secondary[theme],
    outline: colors.button.outline[theme],
  },
  card: colors.card[theme],
});