import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

export interface ThemeSettings {
  mode: 'light' | 'dark';
  preset: 'standard' | 'dark' | 'professional' | 'bright';
  borderRadius: number;
  spacing: number;
  fontSize: 'small' | 'medium' | 'large';
}

interface ThemeContextType {
  themeSettings: ThemeSettings;
  updateTheme: (settings: Partial<ThemeSettings>) => void;
  toggleTheme: () => void;
}

const defaultThemeSettings: ThemeSettings = {
  mode: 'light',
  preset: 'standard',
  borderRadius: 8,
  spacing: 8,
  fontSize: 'medium',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('theme_settings');
    return saved ? JSON.parse(saved) : defaultThemeSettings;
  });

  const updateTheme = (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...themeSettings, ...newSettings };
    setThemeSettings(updated);
    localStorage.setItem('theme_settings', JSON.stringify(updated));
  };

  const toggleTheme = () => {
    const newMode = themeSettings.mode === 'light' ? 'dark' : 'light';
    updateTheme({ mode: newMode });
  };

  // Создаем тему Material-UI на основе настроек
  const theme = createTheme({
    palette: {
      mode: themeSettings.mode,
      primary: {
        main: themeSettings.mode === 'dark' ? '#90caf9' : '#1976d2',
        light: themeSettings.mode === 'dark' ? '#e3f2fd' : '#42a5f5',
        dark: themeSettings.mode === 'dark' ? '#42a5f5' : '#1565c0',
      },
      secondary: {
        main: themeSettings.mode === 'dark' ? '#f48fb1' : '#dc004e',
        light: themeSettings.mode === 'dark' ? '#f8bbd9' : '#ff5983',
        dark: themeSettings.mode === 'dark' ? '#c2185b' : '#9a0036',
      },
      background: {
        default: themeSettings.mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: themeSettings.mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: themeSettings.mode === 'dark' ? '#ffffff' : '#000000',
        secondary: themeSettings.mode === 'dark' ? '#b0b0b0' : '#666666',
      },
      divider: themeSettings.mode === 'dark' ? '#333333' : '#e0e0e0',
      action: {
        hover: themeSettings.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: themeSettings.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: themeSettings.fontSize === 'small' ? 14 : themeSettings.fontSize === 'large' ? 18 : 16,
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: themeSettings.borderRadius,
    },
    spacing: themeSettings.spacing,
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: themeSettings.mode === 'dark' 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 4px 20px rgba(0,0,0,0.1)',
            border: themeSettings.mode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
            backgroundColor: themeSettings.mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: themeSettings.borderRadius,
            fontWeight: 500,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: themeSettings.mode === 'dark' ? '#1e1e1e' : '#ffffff',
            borderRight: themeSettings.mode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: themeSettings.mode === 'dark' ? '#1e1e1e' : '#ffffff',
            color: themeSettings.mode === 'dark' ? '#ffffff' : '#000000',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: themeSettings.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: themeSettings.mode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.1)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ themeSettings, updateTheme, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
