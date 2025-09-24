import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BigButton, Card } from './Components';
import { Link } from '../router';
import {
  AppState,
  ensureDefaultList,
  parseWords,
  subscribe,
  upsertWordList
} from '../core/store';

function wordsToTextarea(words: string[]): string {
  return words.join('\n');
}

type ToastMessage = {
  id: number;
  text: string;
};

export function Home() {
  const [listName, setListName] = useState('');
  const [wordsText, setWordsText] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    ensureDefaultList();
    return subscribe((next: AppState) => {
      const current = next.lists.find((list) => list.id === next.currentListId);
      if (current) {
        setListName(current.name);
        setWordsText(wordsToTextarea(current.words.map((word) => word.text)));
      }
    });
  }, []);

  const normalizedWords = useMemo(() => parseWords(wordsText), [wordsText]);

  const hasWords = normalizedWords.length > 0;

  function pushToast(text: string) {
    const toast: ToastMessage = { id: Date.now(), text };
    setToasts((current) => [...current, toast]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, 2400);
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    upsertWordList(listName, wordsText);
    pushToast('List saved!');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(normalizedWords.join('\n'));
      pushToast('List copied to clipboard');
    } catch (error) {
      console.error(error);
      pushToast('Unable to copy list');
    }
  };

  const handleComingSoon = (feature: string) => {
    pushToast(`${feature} coming soon!`);
  };

  return (
    <div>
      <form className="Home-grid" onSubmit={handleSubmit}>
        <Card
          title="Your words"
          description={
            <input
              type="text"
              value={listName}
              onChange={(event) => setListName(event.target.value)}
              placeholder="List name"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1.1rem',
                borderRadius: '1rem',
                border: '1px solid rgba(0,0,0,0.12)'
              }}
            />
          }
          actions={
            <textarea
              className="WordInput"
              value={wordsText}
              placeholder={'lick\nluck\nbricks'}
              onChange={(event) => setWordsText(event.target.value)}
            />
          }
        />
        <div className="Home-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <BigButton type="submit" disabled={!hasWords}>
            💾 Save List
          </BigButton>
          <BigButton type="button" onClick={copyToClipboard} disabled={!hasWords}>
            📋 Copy List
          </BigButton>
          <BigButton type="button" onClick={() => handleComingSoon('Practice Mode')}>
            🔁 Practice Mode
          </BigButton>
          <BigButton type="button" onClick={() => handleComingSoon('Speed Round')}>
            ⚡ Speed Round
          </BigButton>
          <Link to="/games" className="BigButton-link">
            🎮 Play Games
          </Link>
        </div>
      </form>
      {toasts.map((toast) => (
        <div key={toast.id} className="Toast">
          {toast.text}
        </div>
      ))}
    </div>
  );
}
