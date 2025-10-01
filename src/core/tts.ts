export function speak(text: string, rate = 1) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Unable to speak text', err);
  }
}

export function speakSlow(text: string) {
  speak(text, 0.8);
}
