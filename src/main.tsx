import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Router, RouteConfig } from './router';
import { RootHomePage } from './pages/RootHomePage';
import { SettingsPage } from './pages/SettingsPage';
import { SpellingHomePage } from './pages/SpellingHomePage';
import { MathHomePage } from './pages/MathHomePage';
import MathFlashCardsAddition from './pages/MathFlashCardsAddition';
import './ui/layout.css';
import './ui/components.css';

const routes: RouteConfig[] = [
  // NOTE: Root home page (Spelling vs Math) is rendered from <RootHomePage /> via this route.
  { path: '/', element: <RootHomePage /> },
  { path: '/spelling', element: <SpellingHomePage /> },
  { path: '/math', element: <MathHomePage /> },
  { path: '/math/flash-cards-addition', element: <MathFlashCardsAddition /> },
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
