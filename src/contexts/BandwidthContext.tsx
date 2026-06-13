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
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    return conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g';
  });

  useEffect(() => {
    localStorage.setItem('lowBandwidth', String(lowBandwidth));
  }, [lowBandwidth]);

  return (
    <BandwidthContext.Provider value={{ lowBandwidth, toggle: () => setLowBandwidth(v => !v) }}>
      {children}
    </BandwidthContext.Provider>
  );
};
