import React, { createContext, useState } from 'react';

export const ScrollContext = createContext();

export function ScrollProvider({ children }) {
  const [shouldHideTabBar, setShouldHideTabBar] = useState(false);

  return (
    <ScrollContext.Provider value={{ shouldHideTabBar, setShouldHideTabBar }}>
      {children}
    </ScrollContext.Provider>
  );
}
