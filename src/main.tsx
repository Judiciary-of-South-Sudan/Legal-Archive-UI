import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { BandwidthProvider } from './contexts/BandwidthContext.tsx'

createRoot(document.getElementById("root")!).render(
  <BandwidthProvider>
    <App />
  </BandwidthProvider>
);
