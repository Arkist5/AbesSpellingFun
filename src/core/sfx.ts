const sounds: Record<string, HTMLAudioElement> = {};

const baseFromEnv =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
const basePrefix = baseFromEnv.endsWith('/') ? baseFromEnv : `${baseFromEnv}/`;

function withBase(path: string) {
  const normalized = path.replace(/^\/+/, '');
  return `${basePrefix}${normalized}`;
}

const SOUND_FILES = {
  buzzer: withBase('assets/sfx/buzzer.mp3'),
  confetti: withBase('assets/sfx/confetti.mp3'),
  pop: withBase('assets/sfx/pop.mp3'),
  swish: withBase('assets/sfx/swish.mp3')
};

function loadSound(key: keyof typeof SOUND_FILES) {
  if (sounds[key]) return sounds[key];
  const audio = new Audio(SOUND_FILES[key]);
  audio.preload = 'auto';
  sounds[key] = audio;
  return audio;
}

export function playSound(key: keyof typeof SOUND_FILES) {
  const audio = loadSound(key);
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // Ignore autoplay restrictions.
  });
}
