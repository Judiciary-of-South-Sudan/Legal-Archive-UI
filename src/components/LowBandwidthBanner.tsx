import React, { useState } from 'react';
import { WifiOff, X } from 'lucide-react';
import { useBandwidth } from '@/contexts/BandwidthContext';
import { useTranslation } from 'react-i18next';

const LowBandwidthBanner: React.FC = () => {
  const { lowBandwidth, toggle } = useBandwidth();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (!lowBandwidth || dismissed) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-200">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span className="flex-1">{t('common.low_bandwidth_banner', { defaultValue: 'Low bandwidth mode: PDF auto-loading is disabled to save data.' })}</span>
      <button
        onClick={toggle}
        className="shrink-0 text-xs text-amber-700 underline hover:text-amber-900 dark:text-amber-300"
      >
        {t('common.disable_low_bandwidth', { defaultValue: 'Disable' })}
      </button>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="ms-1 text-amber-600 hover:text-amber-900 dark:text-amber-400">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default LowBandwidthBanner;
