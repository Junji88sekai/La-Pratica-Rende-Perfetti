import { useState, useMemo, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { vocabData } from '../data/vocab';
import { speak, playSuccessSound, playErrorSound } from '../lib/audio';

interface VocabPracticeProps {
  onBack: () => void;
}

export default function VocabPractice({ onBack }: VocabPracticeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mode, setMode] = useState<'learn' | 'quiz' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'success' | 'wrong' | null>(null);
  const [choices, setChoices] = useState<string[]>([]);

  const categories = useMemo(() => Array.from(new Set(vocabData.map(v => v.category))), []);

  const filteredVocab = useMemo(() => {
    if (!selectedCategory) return [];
    return vocabData.filter(v => v.category === selectedCategory);
  }, [selectedCategory]);

  const currentItem = filteredVocab[currentIndex];

  const generateChoices = () => {
    if (!currentItem) return;
    const sameCat = vocabData.filter(v => v.category === currentItem.category && v.italian !== currentItem.italian);
    const others = vocabData.filter(v => v.category !== currentItem.category);
    
    let distractors = [...sameCat].sort(() => Math.random() - 0.5).slice(0, 3);
    if (distractors.length < 3) {
      const more = [...others].sort(() => Math.random() - 0.5).slice(0, 3 - distractors.length);
      distractors = [...distractors, ...more];
    }
    
    const all = [...distractors.map(d => d.italian), currentItem.italian].sort(() => Math.random() - 0.5);
    setChoices(all);
  };

  useEffect(() => {
    if (mode === 'quiz') {
      generateChoices();
    }
  }, [currentIndex, mode, selectedCategory]);

  const handleNext = () => {
    if (currentIndex < filteredVocab.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
      setInput('');
      setFeedback(null);
    } else {
      setSelectedCategory(null);
      setMode(null);
      setCurrentIndex(0);
    }
  };

  const checkAnswer = (answer?: string) => {
    const finalAnswerValue = answer || input;
    const finalAnswer = finalAnswerValue.toLowerCase().trim();
    setInput(finalAnswerValue);
    if (finalAnswer === currentItem.italian.toLowerCase()) {
      setFeedback('success');
      playSuccessSound();
      speak(currentItem.italian);
      setTimeout(handleNext, 1200);
    } else {
      setFeedback('wrong');
      playErrorSound();
    }
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">カテゴリー選択</h1>
            <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Scegli una categoria</p>
          </div>
        </header>

        <div className="grid gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="p-5 bg-white border border-brand-text/5 rounded-2xl text-left hover:border-brand-sage hover:shadow-lg transition-all flex justify-between items-center group"
            >
              <span className="font-bold text-brand-text">{cat}</span>
              <span className="text-[10px] bg-brand-sage/10 text-brand-sage px-3 py-1 rounded-full font-black uppercase tracking-widest group-hover:bg-brand-sage group-hover:text-white transition-colors">Select</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="space-y-12 text-center pt-8">
        <div>
          <h2 className="text-3xl font-black text-brand-text uppercase tracking-tighter">{selectedCategory}</h2>
          <div className="w-12 h-1 bg-brand-accent mx-auto mt-4 rounded-full" />
        </div>
        
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <button
            onClick={() => setMode('learn')}
            className="p-6 bg-brand-text text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-brand-text/90 transition-all flex items-center justify-between"
          >
            <span>Learn Words</span>
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">→</div>
          </button>
          <button
            onClick={() => setMode('quiz')}
            className="p-6 bg-white border-2 border-brand-text text-brand-text rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-brand-text hover:text-white transition-all flex items-center justify-between"
          >
            <span>Write Mode</span>
            <div className="w-8 h-8 bg-brand-text/10 rounded-lg flex items-center justify-center">→</div>
          </button>
          <button onClick={() => setSelectedCategory(null)} className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.3em] mt-8 hover:text-brand-text/60 transition-colors">Indietro / Back</button>
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
        <div className="bg-brand-accent/10 border border-brand-accent/20 text-brand-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          {currentIndex + 1} OF {filteredVocab.length}
        </div>
        <div className="w-10"></div>
      </header>

      {mode === 'learn' ? (
        <div className="perspective-1000 h-[360px]">
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-full h-full cursor-pointer"
            onClick={() => {
              setFlipped(!flipped);
              if (!flipped) speak(currentItem.italian);
            }}
          >
            {/* Front */}
            <div
              className={`absolute inset-0 bg-white border border-brand-text/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 shadow-2xl backface-hidden ${flipped ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            >
              <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-12">Japanese</p>
              <span className="text-4xl font-black text-brand-text tracking-tight text-center mb-8">{currentItem.japanese}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  speak(currentItem.italian);
                }}
                className="p-3 bg-brand-bg rounded-xl text-brand-text/40 hover:text-brand-accent transition-colors"
              >
                <Volume2 size={20} />
              </button>
            </div>
            {/* Back */}
            <div
              className={`absolute inset-0 bg-[#E8F1EB] border-2 border-brand-sage/30 rounded-[2.5rem] flex flex-col items-center justify-center p-12 shadow-2xl backface-hidden rotate-y-180 ${flipped ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              <p className="text-[10px] font-black text-brand-sage uppercase tracking-[0.3em] mb-12">Italiano</p>
              <span className="text-4xl font-black text-brand-deep tracking-tighter uppercase mb-6">{currentItem.italian}</span>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-sage shadow-sm">
                <Volume2 size={32} />
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white border border-brand-text/5 p-12 rounded-[2.5rem] text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-brand-accent" />
            <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.3em] mb-8">Choose the correct translation</p>
            <span className="text-4xl font-black text-brand-text tracking-tight">{currentItem.japanese}</span>
          </div>

          <div className="grid gap-3">
            {choices.map((choice, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => checkAnswer(choice)}
                className={`w-full p-5 rounded-2xl border-2 text-xl font-black tracking-tight transition-all text-left flex items-center justify-between group ${
                  feedback === 'success' && choice === currentItem.italian ? 'border-brand-sage bg-brand-sage/10 text-brand-deep' :
                  feedback === 'wrong' && choice.toLowerCase() === input.toLowerCase() ? 'border-brand-accent bg-brand-accent/5 text-brand-accent' :
                  'border-brand-text/5 bg-white hover:border-brand-text/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(choice);
                    }}
                    className="p-2 bg-brand-bg rounded-lg text-brand-text/20 group-hover:text-brand-text/40 transition-colors"
                  >
                    <Volume2 size={16} />
                  </button>
                  <span>{choice.toUpperCase()}</span>
                </div>
                {feedback === 'success' && choice === currentItem.italian && <CheckCircle2 className="text-brand-sage" size={24} />}
              </motion.button>
            ))}
          </div>
          
          {feedback === 'wrong' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-brand-accent font-black uppercase text-[10px] tracking-widest">
              Try again!
            </motion.p>
          )}
        </div>
      )}

      {mode === 'learn' && (
        <button
          onClick={handleNext}
          className="w-full p-6 bg-brand-sage text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-sage/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
        >
          Next Word
        </button>
      )}

      <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden border border-brand-text/5 p-0.5">
        <motion.div
          className="bg-brand-sage h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / filteredVocab.length) * 100}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
        />
      </div>
    </div>
  );
}
