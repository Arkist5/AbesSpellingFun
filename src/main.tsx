import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Router, RouteConfig } from './router';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { SpellingPage } from './pages/SpellingPage';
import { MathPage } from './pages/MathPage';
import MathFlashCardsAddition from './pages/MathFlashCardsAddition';
import './ui/layout.css';
import './ui/components.css';

const routes: RouteConfig[] = [
  { path: '/', element: <HomePage /> },
  { path: '/spelling', element: <SpellingPage /> },
  { path: '/math', element: <MathPage /> },
  { path: '/math/flash-cards-addition', element: <MathFlashCardsAddition /> },
  { path: '/games', element: <SpellingPage /> },
  { path: '/settings', element: <SettingsPage /> }
];

function App() {
  useEffect(() => {
    if (typeof document !== 'undefined' && document.body) {
      document.body.dataset.appLoaded = 'true';
    }
    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.dataset.appLoaded = 'false';
      }
    };
  }, []);

  return <Router routes={routes} />;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
