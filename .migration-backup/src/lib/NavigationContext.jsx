import React, { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext();

const TAB_ROOTS = {
  '/dashboard': '/dashboard',
  '/vault': '/vault',
  '/add-entry': '/add-entry',
  '/search': '/search',
  '/settings': '/settings',
};

export function NavigationProvider({ children }) {
  const [tabStacks, setTabStacks] = useState({
    '/dashboard': ['/dashboard'],
    '/vault': ['/vault'],
    '/add-entry': ['/add-entry'],
    '/search': ['/search'],
    '/settings': ['/settings'],
  });

  const [activeTab, setActiveTab] = useState('/dashboard');

  const pushToTab = useCallback((path) => {
    const tabRoot = Object.values(TAB_ROOTS).find(root => path === root || path.startsWith(root + '/'));
    if (!tabRoot) return;

    setTabStacks(prev => ({
      ...prev,
      [tabRoot]: [...(prev[tabRoot] || []), path].filter((p, i, a) => a.indexOf(p) === i),
    }));
    setActiveTab(tabRoot);
  }, []);

  const popTab = useCallback(() => {
    setTabStacks(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].slice(0, -1) || [activeTab],
    }));
  }, [activeTab]);

  const resetTab = useCallback((tabRoot) => {
    setTabStacks(prev => ({
      ...prev,
      [tabRoot]: [tabRoot],
    }));
  }, []);

  const value = {
    tabStacks,
    activeTab,
    setActiveTab,
    pushToTab,
    popTab,
    resetTab,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}