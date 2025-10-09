import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Router, RouteConfig } from './router';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import AnimalBoxGame from './games/animal-box';
import { BlockBuilderPage } from './pages/BlockBuilderPage';
import { BasketballPage } from './pages/BasketballPage';
import { BlockBreakerPage } from './pages/BlockBreakerPage';
import { GreenLightSquadPage } from './pages/GreenLightSquadPage';
import { SpellingPage } from './pages/SpellingPage';
import { MathPage } from './pages/MathPage';
import { FlashCardsPlaceholder } from './pages/FlashCardsPlaceholder';
import './ui/layout.css';
import './ui/components.css';

const routes: RouteConfig[] = [
  { path: '/', element: <HomePage /> },
  { path: '/spelling', element: <SpellingPage /> },
  { path: '/math', element: <MathPage /> },
  { path: '/math/flash-cards', element: <FlashCardsPlaceholder /> },
  { path: '/games', element: <SpellingPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/games/animal-box', element: <AnimalBoxGame /> },
  { path: '/games/block-builder', element: <BlockBuilderPage /> },
  { path: '/games/basketball', element: <BasketballPage /> },
  { path: '/games/block-breaker', element: <BlockBreakerPage /> },
  { path: '/games/green-light-squad', element: <GreenLightSquadPage /> }
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
