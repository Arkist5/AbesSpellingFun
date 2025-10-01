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

type ToneOptions = {
  frequency: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
  start?: number;
};

let audioCtx: AudioContext | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctx();
    } catch (err) {
      console.warn('Unable to create audio context', err);
      return null;
    }
  }
  return audioCtx;
}

function scheduleTone({
  frequency,
  duration = 0.2,
  type = 'sine',
  volume = 0.1,
  start = 0
}: ToneOptions) {
  const context = ensureContext();
  if (!context) return;

  try {
    if (context.state === 'suspended') {
      context.resume().catch(() => {
        /* ignore */
      });
    }
  } catch (err) {
    console.warn('Unable to resume audio context', err);
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  const now = context.currentTime;
  const startTime = Math.max(now, now + start);
  const endTime = startTime + Math.max(0.02, duration);

  gain.gain.setValueAtTime(Math.max(0.0001, volume), startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(endTime + 0.01);

  oscillator.onended = () => {
    try {
      oscillator.disconnect();
      gain.disconnect();
    } catch (err) {
      console.warn('Unable to clean up oscillator', err);
    }
  };
}

export function playClickTone() {
  scheduleTone({ frequency: 880, duration: 0.08, type: 'square', volume: 0.08 });
}

export function playErrorTone() {
  scheduleTone({ frequency: 220, duration: 0.28, type: 'sawtooth', volume: 0.12 });
  scheduleTone({ frequency: 180, duration: 0.24, type: 'sawtooth', volume: 0.1, start: 0.12 });
}

export function playSuccessTone() {
  scheduleTone({ frequency: 660, duration: 0.18, type: 'triangle', volume: 0.12 });
  scheduleTone({ frequency: 990, duration: 0.24, type: 'triangle', volume: 0.1, start: 0.12 });
}
