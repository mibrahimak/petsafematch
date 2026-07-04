import { useState, useCallback, useRef } from 'react';

export function useRefresh(refreshFunction) {
  const [refreshing, setRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  const onRefresh = useCallback(async () => {
    if (isRefreshingRef.current || !refreshFunction) return;

    setRefreshing(true);
    try {
      await refreshFunction();
    } catch (err) {
      console.error('Yenileme sırasında hata oluştu', err);
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false); // Spinner'ı kapatıyoruz
    }
  }, [refreshFunction]);

  return { refreshing, onRefresh };
}
