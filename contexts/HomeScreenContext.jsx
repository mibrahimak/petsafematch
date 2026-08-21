import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const HomeScreenContext = createContext(null);

export const HomeScreenProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState('large');
  const [uiVisible, setUiVisible] = useState(true);

  const resetUiVisible = useCallback(() => {
    setUiVisible(true);
  }, []);

  const value = useMemo(
    () => ({
      viewMode,
      setViewMode,
      isCompactView: viewMode === 'compact',
      uiVisible,
      setUiVisible,
      resetUiVisible,
    }),
    [viewMode, uiVisible, resetUiVisible]
  );

  return (
    <HomeScreenContext.Provider value={value}>
      {children}
    </HomeScreenContext.Provider>
  );
};

export const useHomeScreen = () => {
  const context = useContext(HomeScreenContext);

  if (!context) {
    throw new Error('useHomeScreen bir HomeScreenProvider içinde kullanılmalıdır');
  }

  return context;
};
