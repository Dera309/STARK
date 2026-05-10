import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: '#000000',
        'primary-container': '#0d1c32',
        'on-primary': '#ffffff',
        'on-primary-container': '#76849f',
        'primary-fixed': '#d6e3ff',
        'primary-fixed-dim': '#b9c7e4',
        'on-primary-fixed': '#0d1c32',
        'on-primary-fixed-variant': '#39475f',
        'inverse-primary': '#b9c7e4',
        // Secondary
        secondary: '#775a19',
        'secondary-container': '#fed488',
        'secondary-fixed': '#ffdea5',
        'secondary-fixed-dim': '#e9c176',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#785a1a',
        'on-secondary-fixed': '#261900',
        'on-secondary-fixed-variant': '#5d4201',
        // Tertiary
        tertiary: '#000000',
        'tertiary-container': '#001b3d',
        'tertiary-fixed': '#d6e3ff',
        'tertiary-fixed-dim': '#aec7f7',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#6c85b0',
        'on-tertiary-fixed': '#001b3d',
        'on-tertiary-fixed-variant': '#2e476f',
        // Surface
        surface: '#f8f9fa',
        'surface-bright': '#f8f9fa',
        'surface-dim': '#d9dadb',
        'surface-variant': '#e1e3e4',
        'surface-tint': '#515f78',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4f5',
        'surface-container': '#edeeef',
        'surface-container-high': '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'on-surface': '#191c1d',
        'on-surface-variant': '#44474d',
        'on-background': '#191c1d',
        'inverse-surface': '#2e3132',
        'inverse-on-surface': '#f0f1f2',
        background: '#f8f9fa',
        // Outline
        outline: '#75777e',
        'outline-variant': '#c5c6cd',
        // Error
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        // Success (custom)
        success: '#1a7a4a',
        warning: '#b45309',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
