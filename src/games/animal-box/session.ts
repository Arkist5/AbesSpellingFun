export type GameSession = {
  listId: string;
  words: string[];
  wordsPending: string[];
  wordsDone: string[];
  openedBoxIndices: number[];
  animalByBox: Record<number, string>;
  currentWord?: string;
};

const STORAGE_PREFIX = 'animal-box:';

function storageKey(listId: string) {
  return `${STORAGE_PREFIX}${listId}`;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createSession(
  listId: string,
  words: string[],
  animalsPool: string[]
): GameSession {
  const wordsCopy = [...words];
  const pending = [...words];
  const shuffledAnimals = shuffle(animalsPool.length ? animalsPool : words.map((_, i) => `animal-${i}`));
  const animalByBox: Record<number, string> = {};
  for (let i = 0; i < words.length; i++) {
    const animal = shuffledAnimals[i % shuffledAnimals.length];
    animalByBox[i] = animal;
  }

  const session: GameSession = {
    listId,
    words: wordsCopy,
    wordsPending: pending,
    wordsDone: [],
    openedBoxIndices: [],
    animalByBox
  };

  pickNextWord(session);
  return session;
}

export function saveSession(session: GameSession): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(storageKey(session.listId), JSON.stringify(session));
  } catch (err) {
    console.warn('Unable to save animal box session', err);
  }
}

export function loadSession(listId: string): GameSession | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(storageKey(listId));
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<GameSession> & {
      animalByBox?: Record<string, string>;
    };

    if (!data || !Array.isArray(data.words) || !Array.isArray(data.wordsPending)) return null;

    const words = [...data.words];
    const pending = Array.isArray(data.wordsPending) ? [...data.wordsPending] : [...words];
    const done = Array.isArray(data.wordsDone) ? [...data.wordsDone] : [];
    const opened = Array.isArray(data.openedBoxIndices)
      ? Array.from(new Set(data.openedBoxIndices.map((n) => Number(n)))).filter((n) => Number.isFinite(n))
      : [];

    const animalByBox: Record<number, string> = {};
    if (data.animalByBox && typeof data.animalByBox === 'object') {
      for (const key of Object.keys(data.animalByBox)) {
        const idx = Number(key);
        const value = data.animalByBox[key];
        if (Number.isFinite(idx) && typeof value === 'string') {
          animalByBox[idx] = value;
        }
      }
    }

    const session: GameSession = {
      listId,
      words,
      wordsPending: pending,
      wordsDone: done,
      openedBoxIndices: opened,
      animalByBox,
      currentWord: typeof data.currentWord === 'string' ? data.currentWord : undefined
    };

    return session;
  } catch (err) {
    console.warn('Unable to load animal box session', err);
    return null;
  }
}

export function pickNextWord(session: GameSession): void {
  if (!session.wordsPending.length) {
    session.currentWord = undefined;
    return;
  }
  const idx = Math.floor(Math.random() * session.wordsPending.length);
  session.currentWord = session.wordsPending[idx];
}

export function clearSession(listId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(storageKey(listId));
  } catch (err) {
    console.warn('Unable to clear animal box session', err);
  }
}
