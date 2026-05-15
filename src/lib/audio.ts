let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speak = (text: string, lang: 'it-IT' | 'ja-JP' = 'it-IT') => {
  if (!window.speechSynthesis) return;

  // 実行中の音声をすべてキャンセル
  window.speechSynthesis.cancel();

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = lang;
  currentUtterance.rate = 1.0;
  currentUtterance.pitch = 1.0;

  // 利用可能な音声リストから最適なものを選択
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.lang === lang) || 
                        voices.find(v => v.lang.startsWith(lang.split('-')[0]));
  
  if (selectedVoice) {
    currentUtterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(currentUtterance);
};

export const playSuccessSound = () => {
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
  oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1); // A5

  gain.gain.setValueAtTime(0.1, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.3);
};

export const playErrorSound = () => {
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(150, context.currentTime);
  oscillator.frequency.linearRampToValueAtTime(100, context.currentTime + 0.2);

  gain.gain.setValueAtTime(0.1, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.4);
};

export const startListening = (onResult: (text: string) => void, onEnd: () => void) => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('音声入力はこのブラウザではサポートされていません。');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'it-IT';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();
  return recognition;
};
