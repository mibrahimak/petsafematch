import { createContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');

  // Sistem teması değiştiğinde state'i güncelle
  useEffect(() => {
    setTheme(colorScheme || 'light');
  }, [colorScheme]);

  const colors = useMemo(() => {
    return { ...Colors, ...Colors[theme] };
  }, [theme]);

  const value = useMemo(() => {
    return {
      theme,
      colors,
      setTheme,
    };
  }, [theme, colors]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
