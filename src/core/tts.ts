export type SpeakOpts = {
  rate?: number;
  voiceId?: string;
};

export type VoiceMeta = {
  id: string;
  name: string;
  lang: string;
};

let voiceCache: SpeechSynthesisVoice[] = [];
let selectedVoiceId: string | undefined;

function resolveVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (voiceCache.length > 0) {
      resolve(voiceCache);
      return;
    }
    const synth = window.speechSynthesis;
    const available = synth.getVoices();
    if (available.length > 0) {
      voiceCache = available;
      resolve(voiceCache);
      return;
    }
    synth.onvoiceschanged = () => {
      voiceCache = synth.getVoices();
      resolve(voiceCache);
    };
  });
}

function pickDefaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const preferredNames = ['Samantha', 'Google US English', 'Google UK English Female'];
  for (const name of preferredNames) {
    const match = voices.find((voice) => voice.name.includes(name));
    if (match) return match;
  }
  return voices.find((voice) => voice.lang.startsWith('en')) ?? voices[0];
}

async function getVoice(id?: string): Promise<SpeechSynthesisVoice | undefined> {
  const voices = await resolveVoices();
  if (id) {
    const match = voices.find((voice) => voice.voiceURI === id || voice.name === id);
    if (match) return match;
  }
  if (selectedVoiceId) {
    const match = voices.find((voice) => voice.voiceURI === selectedVoiceId);
    if (match) return match;
  }
  const fallback = pickDefaultVoice(voices);
  selectedVoiceId = fallback?.voiceURI;
  return fallback;
}

export async function speak(text: string, opts: SpeakOpts = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = await getVoice(opts.voiceId);
  if (voice) {
    utterance.voice = voice;
  }
  if (opts.rate) {
    utterance.rate = opts.rate;
  }
  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export function speakSlow(text: string) {
  return speak(text, { rate: 0.85 });
}

export function speakSentence(sentence: string) {
  return speak(sentence, { rate: 0.95 });
}

export async function getVoices(): Promise<VoiceMeta[]> {
  if (typeof window === 'undefined') return [];
  const voices = await resolveVoices();
  return voices.map((voice) => ({
    id: voice.voiceURI,
    name: voice.name,
    lang: voice.lang
  }));
}

export function setVoice(id: string) {
  selectedVoiceId = id;
}
