const sounds: Record<string, HTMLAudioElement> = {};

const SOUND_FILES = {
  buzzer: '/assets/sfx/buzzer.mp3',
  confetti: '/assets/sfx/confetti.mp3',
  pop: '/assets/sfx/pop.mp3',
  swish: '/assets/sfx/swish.mp3'
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
