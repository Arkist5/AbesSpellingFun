export type WordItem = {
  text: string;
  hint?: string;
  sentence?: string;
};

export type WordList = {
  id: string;
  name: string;
  words: WordItem[];
  createdAt: number;
  lastUsedAt?: number;
};

export type Settings = {
  voiceId?: string;
  ttsRate: number;
  showHints: boolean;
  dyslexicFont: boolean;
  sfx: boolean;
};

export type AppState = {
  lists: WordList[];
  currentListId?: string;
  settings: Settings;
};

type Listener = (state: AppState) => void;

const STORAGE_KEYS = {
  lists: 'asgs.lists',
  currentListId: 'asgs.currentListId',
  settings: 'asgs.settings'
} as const;

const DEFAULT_SETTINGS: Settings = {
  ttsRate: 1,
  showHints: true,
  dyslexicFont: false,
  sfx: true
};

const listeners = new Set<Listener>();

let state: AppState = {
  lists: [],
  currentListId: undefined,
  settings: DEFAULT_SETTINGS
};

function loadState() {
  if (typeof window === 'undefined') return;
  try {
    const storedLists = window.localStorage.getItem(STORAGE_KEYS.lists);
    const storedSettings = window.localStorage.getItem(STORAGE_KEYS.settings);
    const storedCurrentListId = window.localStorage.getItem(STORAGE_KEYS.currentListId);
    if (storedLists) {
      const parsed = JSON.parse(storedLists) as WordList[];
      if (Array.isArray(parsed)) {
        state.lists = parsed.map((list) => ({
          ...list,
          words: list.words.map((word) => ({
            ...word,
            text: word.text.trim().toLowerCase()
          }))
        }));
      }
    }
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings) as Partial<Settings>;
      state.settings = { ...DEFAULT_SETTINGS, ...parsed };
    }
    if (storedCurrentListId) {
      state.currentListId = storedCurrentListId;
    }
  } catch (error) {
    console.warn('Failed to load state', error);
  }
}

if (typeof window !== 'undefined') {
  loadState();
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.lists, JSON.stringify(state.lists));
    if (state.currentListId) {
      window.localStorage.setItem(STORAGE_KEYS.currentListId, state.currentListId);
    }
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  } catch (error) {
    console.warn('Failed to persist state', error);
  }
}

function emit() {
  for (const listener of listeners) {
    listener(state);
  }
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export function getState(): AppState {
  return state;
}

export function getCurrentList(): WordList | undefined {
  return state.lists.find((list) => list.id === state.currentListId);
}

export function parseWords(raw: string): string[] {
  return raw
    .split(/[\n,]/g)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean)
    .filter((word, index, array) => array.indexOf(word) === index);
}

export function upsertWordList(name: string, rawWords: string) {
  const words = parseWords(rawWords).map<WordItem>((word) => ({ text: word }));
  const existing = getCurrentList();
  if (existing) {
    existing.words = words;
    existing.name = name || existing.name;
    existing.lastUsedAt = Date.now();
  } else {
    const newList: WordList = {
      id: crypto.randomUUID(),
      name: name || 'My Word List',
      words,
      createdAt: Date.now(),
      lastUsedAt: Date.now()
    };
    state.lists = [newList, ...state.lists];
    state.currentListId = newList.id;
  }
  persist();
  emit();
}

export function setCurrentListId(id: string) {
  if (state.currentListId === id) return;
  state.currentListId = id;
  const list = getCurrentList();
  if (list) {
    list.lastUsedAt = Date.now();
  }
  persist();
  emit();
}

export function deleteList(id: string) {
  state.lists = state.lists.filter((list) => list.id !== id);
  if (state.currentListId === id) {
    state.currentListId = state.lists[0]?.id;
  }
  persist();
  emit();
}

export function updateSettings(patch: Partial<Settings>) {
  state.settings = { ...state.settings, ...patch };
  persist();
  emit();
}

export function ensureDefaultList() {
  if (state.lists.length === 0) {
    const starterWords = ['cat', 'dog', 'run', 'sun'].map<WordItem>((text) => ({ text }));
    const starter: WordList = {
      id: crypto.randomUUID(),
      name: 'Sample List',
      words: starterWords,
      createdAt: Date.now(),
      lastUsedAt: Date.now()
    };
    state.lists.push(starter);
    state.currentListId = starter.id;
    persist();
  }
}

export function saveState() {
  persist();
}

export function getWordsForPlay(): WordItem[] {
  const list = getCurrentList();
  return list?.words ?? [];
}
