import { useCallback, useRef } from 'react';

const SCROLL_TOP_THRESHOLD = 10;
const SCROLL_DIRECTION_THRESHOLD = 8;

export const useScrollHideUi = (setUiVisible) => {
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(
    (event) => {
      const current = event.nativeEvent.contentOffset.y;

      if (current < SCROLL_TOP_THRESHOLD) {
        setUiVisible(true);
      } else if (current > lastScrollY.current + SCROLL_DIRECTION_THRESHOLD) {
        setUiVisible(false);
      } else if (current < lastScrollY.current - SCROLL_DIRECTION_THRESHOLD) {
        setUiVisible(true);
      }

      lastScrollY.current = current;
    },
    [setUiVisible]
  );

  return handleScroll;
};
