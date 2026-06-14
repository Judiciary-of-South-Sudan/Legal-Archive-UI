import React, { createContext, useContext, useEffect, useState } from 'react';

interface BandwidthContextValue {
  lowBandwidth: boolean;
  toggle: () => void;
}

const BandwidthContext = createContext<BandwidthContextValue>({ lowBandwidth: false, toggle: () => {} });

export const useBandwidth = () => useContext(BandwidthContext);

export const BandwidthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lowBandwidth, setLowBandwidth] = useState(() => {
    const stored = localStorage.getItem('lowBandwidth');
    if (stored !== null) return stored === 'true';
    // navigator.connection is Chrome/Android-only — undefined on iOS Safari.
    // Default to low-bandwidth when the API is unavailable (opt-out model) so iOS
    // users on slow connections aren't penalised. Users can disable via the header toggle.
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    if (!conn) return true;
    return conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData === true;
  });

  useEffect(() => {
    localStorage.setItem('lowBandwidth', String(lowBandwidth));
  }, [lowBandwidth]);

  const toggle = () => {
    setLowBandwidth(v => {
      // Clear banner dismissal so it reappears if low-bandwidth is re-enabled
      if (!v) localStorage.removeItem('bwBannerDismissed');
      return !v;
    });
  };

  return (
    <BandwidthContext.Provider value={{ lowBandwidth, toggle }}>
      {children}
    </BandwidthContext.Provider>
  );
};
