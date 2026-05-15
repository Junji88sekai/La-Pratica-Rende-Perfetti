import { useState, useMemo, Key } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Volume2, Search } from 'lucide-react';
import { phraseData } from '../data/phrases';
import { speak } from '../lib/audio';
import { PhraseItem } from '../types';

interface PhrasePracticeProps {
  onBack: () => void;
}

export default function PhrasePractice({ onBack }: PhrasePracticeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => Array.from(new Set(phraseData.map(p => p.category))), []);

  const filteredPhrases = useMemo(() => {
    if (!searchQuery) return phraseData;
    const query = searchQuery.toLowerCase();
    return phraseData.filter(p => 
      p.italian.toLowerCase().includes(query) || 
      p.japanese.includes(query) ||
      p.category.includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight">フレーズ練習</h1>
          <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Espressioni Comuni</p>
        </div>
      </header>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/30 group-focus-within:text-brand-accent transition-colors" size={20} />
        <input
          type="text"
          placeholder="Cerca espressioni..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-brand-text/5 rounded-[1.5rem] focus:border-brand-accent/50 focus:shadow-xl outline-none transition-all placeholder:text-brand-text/20 font-medium"
        />
      </div>

      <div className="space-y-10">
        {categories.map(cat => {
          const categoryItems = filteredPhrases.filter(p => p.category === cat);
          if (categoryItems.length === 0) return null;

          return (
            <div key={cat} className="space-y-4">
              <h2 className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.3em] pl-2">{cat}</h2>
              <div className="grid gap-3">
                {categoryItems.map((phrase, idx) => (
                  <PhraseRow key={idx} phrase={phrase} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhraseRow({ phrase }: { phrase: PhraseItem, key?: Key }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => speak(phrase.italian)}
      className="bg-white border border-brand-text/5 p-5 rounded-2xl flex items-center justify-between text-left hover:border-brand-accent/30 hover:shadow-lg transition-all group"
    >
      <div className="space-y-1">
        <div className="text-lg font-black text-brand-text tracking-tight uppercase leading-tight">{phrase.italian}</div>
        <div className="text-xs font-bold text-brand-text/40">{phrase.japanese}</div>
      </div>
      <div className="shrink-0 w-12 h-12 bg-brand-bg text-brand-text/40 rounded-xl flex items-center justify-center group-hover:bg-brand-accent group-hover:text-white transition-all shadow-sm">
        <Volume2 size={20} />
      </div>
    </motion.button>
  );
}
