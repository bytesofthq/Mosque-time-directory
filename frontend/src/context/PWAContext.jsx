import React, { createContext, useContext, useState, useEffect } from 'react';

const PWAContext = createContext({
  isInstallable: false,
  isOffline: false,
  installApp: () => {},
  showInstallBanner: false,
  setShowInstallBanner: () => {},
  needUpdate: false,
  updateApp: () => {}
});

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [needUpdate, setNeedUpdate] = useState(false);
  const [updateSWFn, setUpdateSWFn] = useState(null);

  useEffect(() => {
    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log('beforeinstallprompt event triggered and captured');
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Auto-trigger installation banner unless dismissed this session
      const dismissed = sessionStorage.getItem('pwa-dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('Salah Directory was successfully installed!');
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Listen for SW update event from main.jsx
    const handleSWUpdate = (e) => {
      console.log('SW Update detected in PWAContext');
      setNeedUpdate(true);
      if (e.detail && e.detail.updateSW) {
        setUpdateSWFn(() => e.detail.updateSW);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('No deferred installation prompt available.');
      return;
    }
    
    // Show prompt
    deferredPrompt.prompt();
    
    // Wait for choice
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const updateApp = () => {
    console.log('Triggering SW update reload...');
    if (updateSWFn) {
      updateSWFn(true); // activates and reloads
    } else {
      window.location.reload();
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isOffline,
        installApp,
        showInstallBanner,
        setShowInstallBanner,
        needUpdate,
        updateApp
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => useContext(PWAContext);
