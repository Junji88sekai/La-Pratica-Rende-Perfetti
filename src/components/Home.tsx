import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { Book, MessageCircle, PenTool, Flag } from 'lucide-react';
import { ViewState } from '../types';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-deep to-brand-sage rounded-lg flex items-center justify-center shadow-lg shadow-brand-deep/20">
            <span className="text-white font-black text-sm tracking-tighter">IT</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase text-brand-text">Impara Pro</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent/60">Linguaggio Italiano</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-text flex items-center justify-center text-white ring-4 ring-white shadow-sm font-bold text-xs">
          JP
        </div>
      </header>

      <div className="grid gap-5">
        <MenuCard
          title="語彙練習"
          description="Vocabolario - Category based learning"
          icon={<Book className="text-brand-sage" size={28} />}
          onClick={() => onNavigate('vocab')}
          borderColor="border-brand-sage"
        />
        <MenuCard
          title="フレーズ練習"
          description="Frasi Comuni - Everyday expressions"
          icon={<MessageCircle className="text-brand-accent" size={28} />}
          onClick={() => onNavigate('phrase')}
          borderColor="border-brand-accent"
        />
        <MenuCard
          title="瞬間作文"
          description="Composizione - Thinking in Italian"
          icon={<PenTool className="text-brand-sand" size={28} />}
          onClick={() => onNavigate('composition')}
          borderColor="border-brand-text"
        />
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-brand-text/5 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-sand/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent mb-6">Today's Progress</h3>
        <div className="grid grid-cols-3 gap-6 relative z-10">
          <Stat label="VOCAB" value="152" unit="" />
          <Stat label="PHRASES" value="48" unit="" />
          <Stat label="STREAK" value="14" unit="days" />
        </div>
      </div>
    </div>
  );
}

function MenuCard({ title, description, icon, onClick, borderColor }: { title: string, description: string, icon: ReactNode, onClick: () => void, borderColor: string }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white border-l-8 ${borderColor} p-6 rounded-2xl flex items-center gap-6 text-left shadow-geometric transition-all hover:shadow-xl cursor-pointer group`}
    >
      <div className="shrink-0 p-3 bg-brand-bg rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <h2 className="text-lg font-black text-brand-text tracking-tight uppercase">{title}</h2>
        <p className="text-[10px] font-bold text-brand-text/40 uppercase tracking-wider">{description}</p>
      </div>
    </motion.button>
  );
}

function Stat({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="flex-1">
      <div className="text-3xl font-black text-brand-text flex items-baseline">
        {value}
        {unit && <span className="text-[8px] ml-0.5 opacity-50 uppercase tracking-tighter">{unit}</span>}
      </div>
      <div className="text-[8px] font-black text-brand-text/30 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
