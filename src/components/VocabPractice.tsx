import { useState, useMemo, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Volume2, CheckCircle2, XCircle, Edit3, Grid, Layers, ListChecks } from 'lucide-react';
import { vocabData } from '../data/vocab';
import { speak, playSuccessSound, playErrorSound } from '../lib/audio';
import WordSearchGame from './WordSearchGame';

interface VocabPracticeProps {
  onBack: () => void;
}

type PracticeMode = 'flashcards' | 'multiple-choice' | 'writing' | 'cloze' | 'word-search';

export default function VocabPractice({ onBack }: VocabPracticeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mode, setMode] = useState<PracticeMode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'success' | 'wrong' | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [clozeWord, setClozeWord] = useState<{ original: string, display: string, blanks: number[] }>({ original: '', display: '', blanks: [] });

  const categories = useMemo(() => Array.from(new Set(vocabData.map(v => v.category))), []);

  const filteredVocab = useMemo(() => {
    if (!selectedCategory) return [];
    return [...vocabData].filter(v => v.category === selectedCategory).sort(() => Math.random() - 0.5);
  }, [selectedCategory]);

  const currentItem = filteredVocab[currentIndex];

  const generateCloze = () => {
    if (!currentItem) return;
    const word = currentItem.italian.toLowerCase();
    const chars = word.split('');
    const blanksCount = Math.max(1, Math.floor(word.length * 0.4));
    const blanks: number[] = [];
    
    // Simple logic to find blanks (avoid spaces and symbols)
    const validIndices = chars.map((c, i) => /[a-z]/.test(c) ? i : -1).filter(i => i !== -1);
    const shuffled = [...validIndices].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(blanksCount, shuffled.length); i++) {
        blanks.push(shuffled[i]);
    }

    const display = chars.map((c, i) => blanks.includes(i) ? '_' : c).join('');
    setClozeWord({ original: word, display, blanks });
  };

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
    if (mode === 'multiple-choice') {
      generateChoices();
    } else if (mode === 'cloze') {
      generateCloze();
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
    
    // Normalize string for comparison (ignore articles if needed? No, let's keep it strict but maybe a bit flexible with space)
    const normalizedTarget = currentItem.italian.toLowerCase().trim();
    
    if (finalAnswer === normalizedTarget) {
      setFeedback('success');
      playSuccessSound();
      speak(currentItem.italian);
      setTimeout(handleNext, 1200);
    } else {
      setFeedback('wrong');
      playErrorSound();
      if (mode === 'multiple-choice') {
        setInput(finalAnswerValue);
      }
    }
  };

  if (selectedCategory && mode === 'word-search') {
    return <WordSearchGame category={selectedCategory} onBack={() => setMode(null)} />;
  }

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
      <div className="space-y-10">
        <header className="flex items-center gap-4">
          <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-brand-text uppercase tracking-tighter">{selectedCategory}</h2>
            <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Select Mode</p>
          </div>
        </header>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <ModeCard
            icon={<Layers className="text-brand-sage" />}
            title="Flashcards"
            description="記憶用・暗記"
            onClick={() => setMode('flashcards')}
          />
          <ModeCard
            icon={<ListChecks className="text-brand-accent" />}
            title="Choice"
            description="選択式問題"
            onClick={() => setMode('multiple-choice')}
          />
          <ModeCard
            icon={<Edit3 className="text-brand-sand" />}
            title="Writing"
            description="書き込み式"
            onClick={() => setMode('writing')}
          />
          <ModeCard
            icon={<CheckCircle2 className="text-brand-blue" />}
            title="Cloze"
            description="穴埋め式"
            onClick={() => setMode('cloze')}
          />
          <ModeCard
            icon={<Grid className="text-brand-deep" />}
            title="Word Search"
            description="文字探し"
            onClick={() => setMode('word-search')}
          />
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

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {mode === 'flashcards' && (
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
              <div className={`absolute inset-0 bg-white border border-brand-text/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 shadow-2xl backface-hidden ${flipped ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
                <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-12">Japanese</p>
                <span className="text-4xl font-black text-brand-text tracking-tight text-center mb-8">{currentItem.japanese}</span>
                <Volume2 size={24} className="text-brand-text/10" />
              </div>
              <div className={`absolute inset-0 bg-[#E8F1EB] border-2 border-brand-sage/30 rounded-[2.5rem] flex flex-col items-center justify-center p-12 shadow-2xl backface-hidden rotate-y-180 ${flipped ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                <p className="text-[10px] font-black text-brand-sage uppercase tracking-[0.3em] mb-12">Italiano</p>
                <span className="text-4xl font-black text-brand-deep tracking-tighter uppercase mb-6">{currentItem.italian}</span>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-sage shadow-sm">
                  <Volume2 size={32} />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {mode === 'multiple-choice' && (
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
                    feedback === 'wrong' && choice === input ? 'border-brand-accent bg-brand-accent/5 text-brand-accent' :
                    'border-brand-text/5 bg-white hover:border-brand-text/20'
                  }`}
                >
                  <span>{choice.toUpperCase()}</span>
                  {feedback === 'success' && choice === currentItem.italian && <CheckCircle2 className="text-brand-sage" size={24} />}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {(mode === 'writing' || mode === 'cloze') && (
          <div className="space-y-8">
            <div className="bg-white border border-brand-text/5 p-12 rounded-[2.5rem] text-center shadow-xl relative">
              <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.3em] mb-8">
                {mode === 'writing' ? 'Translate to Italian' : 'Complete the word'}
              </p>
              <span className="text-4xl font-black text-brand-text tracking-tight block mb-4">{currentItem.japanese}</span>
              {mode === 'cloze' && (
                <div className="flex justify-center gap-1">
                  {clozeWord.display.split('').map((c, i) => (
                    <span key={i} className={`text-2xl font-black ${c === '_' ? 'text-brand-accent border-b-4 border-brand-accent w-6 inline-block' : 'text-brand-text/40'}`}>
                      {c === '_' ? '' : c.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="relative group">
              <input
                type="text"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="Type here..."
                className={`w-full p-6 pb-2 text-3xl font-black bg-transparent border-b-4 focus:outline-none transition-all uppercase tracking-tighter ${
                  feedback === 'success' ? 'border-brand-sage text-brand-sage' :
                  feedback === 'wrong' ? 'border-brand-accent text-brand-accent' :
                  'border-brand-text/10 focus:border-brand-text'
                }`}
              />
              <div className="absolute top-1/2 right-4 -translate-y-1/2 flex gap-2">
                {feedback === 'success' ? <CheckCircle2 className="text-brand-sage" /> : <Edit3 className="text-brand-text/10 group-focus-within:text-brand-text/30" />}
              </div>
            </div>

            <button
               onClick={() => checkAnswer()}
               className="w-full p-6 bg-brand-text text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl"
            >
              Check Answer
            </button>
          </div>
        )}
      </div>

      {mode === 'flashcards' && (
        <button
          onClick={handleNext}
          className="w-full p-6 bg-brand-sage text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-sage/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
        >
          Next Word
        </button>
      )}

      {feedback === 'wrong' && (
         <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center font-black text-brand-accent uppercase text-[10px] tracking-widest mt-4">
            Incorrect! Hint: {currentItem.italian.charAt(0)}...
         </motion.p>
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

function ModeCard({ icon, title, description, onClick }: { icon: ReactNode, title: string, description: string, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-6 bg-white border border-brand-text/5 rounded-3xl text-left shadow-sm hover:shadow-xl transition-all flex flex-col gap-4 group"
    >
      <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <div>
        <h3 className="font-black text-brand-text uppercase tracking-tight">{title}</h3>
        <p className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest mt-1">{description}</p>
      </div>
    </motion.button>
  );
}
