import { useState, useMemo, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Mic, Keyboard, Shuffle, CheckCircle2, RotateCcw, Volume2, PenTool } from 'lucide-react';
import { compositionData } from '../data/composition';
import { speak, startListening, playSuccessSound, playErrorSound } from '../lib/audio';

interface CompositionPracticeProps {
  onBack: () => void;
}

export default function CompositionPractice({ onBack }: CompositionPracticeProps) {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [mode, setMode] = useState<'typing' | 'sorting' | 'voice' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; show: boolean }>({ isCorrect: false, show: false });
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const chapters = useMemo(() => Array.from(new Set(compositionData.map(c => c.chapter))), []);

  const filteredItems = useMemo(() => {
    if (selectedChapter === null) return [];
    return compositionData.filter(c => c.chapter === selectedChapter);
  }, [selectedChapter]);

  const currentItem = filteredItems[currentIndex];

  useEffect(() => {
    if (currentItem && mode === 'sorting') {
      const words = currentItem.italian.replace(/[.!?]/g, '').split(' ');
      setShuffledWords([...words].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
    }
  }, [currentItem, mode]);

  const handleNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInputValue('');
      setFeedback({ isCorrect: false, show: false });
      setSelectedWords([]);
    } else {
      setSelectedChapter(null);
      setMode(null);
      setCurrentIndex(0);
    }
  };

  const checkTyping = () => {
    const normalize = (s: string) => s.toLowerCase().replace(/[.!?]/g, '').trim();
    const isCorrect = normalize(inputValue) === normalize(currentItem.italian);
    setFeedback({ isCorrect, show: true });
    if (isCorrect) {
      playSuccessSound();
      speak(currentItem.italian);
      setTimeout(handleNext, 1500);
    } else {
      playErrorSound();
    }
  };

  const toggleVoice = () => {
    if (isListening) return;
    setIsListening(true);
    startListening(
      (text) => {
        setInputValue(text);
        const normalize = (s: string) => s.toLowerCase().replace(/[.!?]/g, '').trim();
        const isCorrect = normalize(text) === normalize(currentItem.italian);
        setFeedback({ isCorrect, show: true });
        if (isCorrect) {
          playSuccessSound();
          speak(currentItem.italian);
          setTimeout(handleNext, 1500);
        } else {
          playErrorSound();
        }
      },
      () => setIsListening(false)
    );
  };

  const handleWordClick = (word: string, index: number) => {
    setSelectedWords([...selectedWords, word]);
    const nextWords = [...shuffledWords];
    nextWords.splice(index, 1);
    setShuffledWords(nextWords);

    const currentSentence = [...selectedWords, word].join(' ');
    const normalize = (s: string) => s.toLowerCase().replace(/[.!?]/g, '').trim();
    
    if (normalize(currentSentence) === normalize(currentItem.italian)) {
      playSuccessSound();
      setFeedback({ isCorrect: true, show: true });
      speak(currentItem.italian);
      setTimeout(handleNext, 1500);
    }
  };

  const resetSorting = () => {
    const words = currentItem.italian.replace(/[.!?]/g, '').split(' ');
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
    setSelectedWords([]);
    setFeedback({ isCorrect: false, show: false });
  };

  if (selectedChapter === null) {
    return (
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">瞬間作文チャプター</h1>
            <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Composizione Istantanea</p>
          </div>
        </header>
        <div className="grid gap-4">
          {chapters.map(ch => (
            <button
              key={ch}
              onClick={() => setSelectedChapter(ch)}
              className="p-6 bg-white border border-brand-text/5 rounded-2xl flex justify-between items-center hover:border-brand-sand transition-all group shadow-sm hover:shadow-lg"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] mb-1">Capitolo</span>
                <span className="font-black text-2xl text-brand-text tracking-tighter">第 {ch} 章</span>
              </div>
              <div className="w-10 h-10 bg-brand-sand/10 rounded-xl flex items-center justify-center text-brand-sand group-hover:bg-brand-sand group-hover:text-white transition-all">
                →
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="space-y-12 pt-8 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-brand-text uppercase tracking-tighter">Capitolo {selectedChapter}</h2>
          <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Scegli la modalità</p>
        </div>
        <div className="grid gap-4 max-w-xs mx-auto">
          <ModeButton icon={<Keyboard />} label="Keyboard Input" onClick={() => setMode('typing')} />
          <ModeButton icon={<Shuffle />} label="Word Sorting" onClick={() => setMode('sorting')} />
          <ModeButton icon={<Mic />} label="Voice Input" onClick={() => setMode('voice')} />
          <button onClick={() => setSelectedChapter(null)} className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.3em] mt-8 hover:text-brand-text/60 transition-colors">Torna ai Capitoli</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <button onClick={() => setMode(null)} className="p-2 -ml-2 text-brand-text/40">
          <ChevronLeft size={24} />
        </button>
        <div className="bg-brand-sand/10 border border-brand-sand/20 text-brand-text/60 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          {currentIndex + 1} OF {filteredItems.length}
        </div>
        <div className="w-10"></div>
      </header>

      <div className="bg-brand-text text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <p className="text-brand-accent text-[10px] font-black uppercase tracking-[0.3em]">Japanese Input</p>
          <h3 className="text-2xl font-black leading-tight tracking-tight">{currentItem.japanese}</h3>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <PenTool size={120} />
        </div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-brand-sage/20 rounded-full blur-xl" />
      </div>

      <div className="min-h-[220px] flex flex-col justify-center gap-8">
        {mode === 'typing' && (
          <div className="space-y-4">
            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Traduci in italiano..."
              className="w-full p-6 bg-white border-2 border-brand-text/5 rounded-2xl text-xl font-black tracking-tight outline-none focus:border-brand-accent/40 shadow-sm transition-all focus:shadow-xl"
              onKeyDown={(e) => e.key === 'Enter' && checkTyping()}
            />
            <button onClick={checkTyping} className="w-full p-5 bg-brand-accent text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:scale-[1.02] active:scale-95 transition-all">
              Check Composition
            </button>
          </div>
        )}

        {mode === 'sorting' && (
          <div className="space-y-10">
            <div className="flex flex-wrap gap-2.5 min-h-[72px] p-6 bg-white border-2 border-dashed border-brand-text/10 rounded-[2rem] shadow-inner">
              {selectedWords.map((word, i) => (
                <span key={i} className="px-5 py-2.5 bg-[#E8F1EB] text-brand-deep rounded-xl font-black border-2 border-brand-sage shadow-sm uppercase text-sm tracking-tight">
                  {word}
                </span>
              ))}
              {selectedWords.length === 0 && <span className="text-brand-text/20 font-black uppercase text-sm tracking-widest m-auto">Componi la frase</span>}
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {shuffledWords.map((word, i) => (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={i}
                  onClick={() => handleWordClick(word, i)}
                  className="px-6 py-4 bg-brand-sand hover:bg-brand-sand/80 rounded-xl font-black text-brand-text shadow-md hover:shadow-lg transition-all uppercase text-sm"
                >
                  {word}
                </motion.button>
              ))}
            </div>
            <button onClick={resetSorting} className="flex items-center gap-2 text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em] mx-auto hover:text-brand-text transition-colors">
              <RotateCcw size={14} /> Start Over
            </button>
          </div>
        )}

        {mode === 'voice' && (
          <div className="flex flex-col items-center gap-8">
            <motion.button
              animate={isListening ? { scale: [1, 1.15, 1], boxShadow: "0 0 40px rgba(224, 122, 95, 0.4)" } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              onClick={toggleVoice}
              className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-brand-accent text-white hover:scale-105'}`}
            >
              {isListening ? <div className="w-6 h-6 bg-white rounded-sm animate-pulse" /> : <Mic size={44} />}
            </motion.button>
            <div className="text-center space-y-2">
              <p className="text-brand-text/40 text-[10px] font-black uppercase tracking-[0.3em]">
                {isListening ? 'Parla ora...' : 'Tocca il microfono'}
              </p>
              {inputValue && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-black text-brand-text tracking-tight px-4">
                  "{inputValue}"
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {feedback.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-8 rounded-[2rem] flex items-center gap-6 shadow-2xl border ${feedback.isCorrect ? 'bg-[#E8F1EB] text-brand-deep border-brand-sage/30' : 'bg-red-50 text-red-800 border-red-200'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${feedback.isCorrect ? 'bg-brand-sage text-white' : 'bg-red-500 text-white'}`}>
              {feedback.isCorrect ? <CheckCircle2 size={32} /> : <RotateCcw size={32} />}
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">{feedback.isCorrect ? 'Corretto' : 'Riprova'}</div>
              <div className="text-xl font-black tracking-tight">{feedback.isCorrect ? 'Ottimo lavoro!' : 'Non proprio...'}</div>
              <div className="text-sm font-bold opacity-60 mt-1 uppercase leading-tight">{currentItem.italian}</div>
            </div>
            <button onClick={() => speak(currentItem.italian)} className="p-4 bg-white/50 hover:bg-white rounded-2xl transition-colors text-brand-text shadow-sm">
              <Volume2 size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden border border-brand-text/5 p-0.5">
        <motion.div
          className="bg-brand-accent h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / filteredItems.length) * 100}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
        />
      </div>
    </div>
  );
}

function ModeButton({ icon, label, onClick }: { icon: ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white border border-brand-text/5 p-6 rounded-3xl flex items-center gap-5 text-left hover:border-brand-accent/40 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="p-4 bg-brand-bg text-brand-text/40 rounded-2xl group-hover:bg-brand-accent group-hover:text-white transition-all">{icon}</div>
      <span className="text-lg font-black text-brand-text tracking-tight uppercase tracking-tight">{label}</span>
    </motion.button>
  );
}
