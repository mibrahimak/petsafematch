import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme bir ThemeProvider içinde kullanılmalıdır');
  }

  const { theme, setTheme, colors } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return {
    theme,
    colors,
    toggleTheme,
  };
};
