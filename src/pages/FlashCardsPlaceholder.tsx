import { Layout } from '../ui/Layout';

export function FlashCardsPlaceholder() {
  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h1>Flash Cards</h1>
        <p>Coming soon</p>
        {/* TODO: Implement math flash card practice mode */}
      </div>
    </Layout>
  );
}
