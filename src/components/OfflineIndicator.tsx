import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => setShowOfflineToast(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toast de offline
  if (showOfflineToast) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>Você está offline - Dados salvos localmente</span>
        <button 
          onClick={() => setShowOfflineToast(false)}
          className="ml-2 hover:bg-orange-600 rounded px-2 py-1"
        >
          ✕
        </button>
      </div>
    );
  }

  // Indicador permanente quando offline
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg z-40 flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">Offline</span>
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;
