/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, MessageCircle, PenTool, Home as HomeIcon } from 'lucide-react';
import { ViewState } from './types';
import Home from './components/Home';
import VocabPractice from './components/VocabPractice';
import PhrasePractice from './components/PhrasePractice';
import CompositionPractice from './components/CompositionPractice';

export default function App() {
  const [view, setView] = useState<ViewState>('home');

  const renderView = () => {
    switch (view) {
      case 'vocab':
        return <VocabPractice onBack={() => setView('home')} />;
      case 'phrase':
        return <PhrasePractice onBack={() => setView('home')} />;
      case 'composition':
        return <CompositionPractice onBack={() => setView('home')} />;
      default:
        return <Home onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-accent/20 z-50 px-6 py-3 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(61,64,91,0.05)] safe-area-bottom">
        <NavButton active={view === 'home'} onClick={() => setView('home')} icon={<HomeIcon size={22} />} label="HOME" />
        <NavButton active={view === 'vocab'} onClick={() => setView('vocab')} icon={<Book size={22} />} label="VOCAB" />
        <NavButton active={view === 'phrase'} onClick={() => setView('phrase')} icon={<MessageCircle size={22} />} label="PHRASES" />
        <NavButton active={view === 'composition'} onClick={() => setView('composition')} icon={<PenTool size={22} />} label="PRACTICE" />
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto pb-28 pt-10 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-brand-accent transform -translate-y-0.5' : 'text-brand-text/40 hover:text-brand-text/60'}`}
    >
      {icon}
      <span className="text-[9px] font-bold tracking-widest uppercase">{label}</span>
    </button>
  );
}

