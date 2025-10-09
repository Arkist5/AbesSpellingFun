/**
 * DEPRECATED (2025-10-09):
 * Replaced by <SpellingPage /> at path "/spelling".
 * This file is intentionally kept to avoid breaking imports in old branches/links.
 * Prefer importing `SpellingPage` and linking to "/spelling".
 */
import { GameSelect } from '../ui/GameSelect';
import { Layout } from '../ui/Layout';

export function GameSelectPage() {
  return (
    <Layout>
      <GameSelect />
    </Layout>
  );
}
