import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Router, RouteConfig } from './router';
import { HomePage } from './pages/HomePage';
import { GameSelectPage } from './pages/GameSelectPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnimalBoxPage } from './pages/AnimalBoxPage';
import { BlockBuilderPage } from './pages/BlockBuilderPage';
import { BasketballPage } from './pages/BasketballPage';
import { BlockBreakerPage } from './pages/BlockBreakerPage';
import './ui/layout.css';
import './ui/components.css';

const routes: RouteConfig[] = [
  { path: '/', element: <HomePage /> },
  { path: '/games', element: <GameSelectPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/games/animal-box', element: <AnimalBoxPage /> },
  { path: '/games/block-builder', element: <BlockBuilderPage /> },
  { path: '/games/basketball', element: <BasketballPage /> },
  { path: '/games/block-breaker', element: <BlockBreakerPage /> }
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
