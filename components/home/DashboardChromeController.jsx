import { useEffect } from 'react';
import { useSegments } from 'expo-router';
import { useHomeScreen } from '../../contexts/HomeScreenContext';

const isHomeSegment = (segments) =>
  segments[0] === '(dashboard)' &&
  (segments.length === 1 || segments[1] === 'index');

const DashboardChromeController = () => {
  const segments = useSegments();
  const { resetUiVisible } = useHomeScreen();

  useEffect(() => {
    if (!isHomeSegment(segments)) {
      resetUiVisible();
    }
  }, [segments, resetUiVisible]);

  return null;
};

export default DashboardChromeController;
