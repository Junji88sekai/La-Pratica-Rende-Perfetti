import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import { vocabData } from '../data/vocab';
import { VocabularyItem } from '../types';
import { playSuccessSound, playErrorSound, speak } from '../lib/audio';

interface WordSearchGameProps {
  category: string;
  onBack: () => void;
}

interface Cell {
  x: number;
  y: number;
  char: string;
  isPartOfWord: boolean;
  isSelected: boolean;
  isFound: boolean;
}

export default function WordSearchGame({ category, onBack }: WordSearchGameProps) {
  const GRID_SIZE = 12;
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<{ word: string; found: boolean; italian: string }[]>([]);
  const [selection, setSelection] = useState<{ x: number; y: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const cleanWord = (str: string) => str.toLowerCase().replace(/[\s']/g, '');

  useEffect(() => {
    generateGame();
  }, [category]);

  const generateGame = () => {
    const items = vocabData
      .filter(v => v.category === category)
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    const words = items.map(v => ({
      word: cleanWord(v.italian),
      italian: v.italian,
      found: false
    })).filter(w => w.word.length <= GRID_SIZE);

    const tempGrid: Cell[][] = Array(GRID_SIZE).fill(0).map((_, y) =>
      Array(GRID_SIZE).fill(0).map((_, x) => ({
        x, y, char: '', isPartOfWord: false, isSelected: false, isFound: false
      }))
    );

    const directions = [
      [0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]
    ];

    words.forEach(w => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startX = Math.floor(Math.random() * GRID_SIZE);
        const startY = Math.floor(Math.random() * GRID_SIZE);

        if (canPlace(w.word, startX, startY, dir, tempGrid)) {
          placeWord(w.word, startX, startY, dir, tempGrid);
          placed = true;
        }
        attempts++;
      }
    });

    // Fill empty cells
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (tempGrid[y][x].char === '') {
          tempGrid[y][x].char = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(tempGrid);
    setWordsToFind(words);
    setFoundWords([]);
    setSelection([]);
    setIsGameOver(false);
  };

  const canPlace = (word: string, x: number, y: number, dir: number[], g: Cell[][]) => {
    for (let i = 0; i < word.length; i++) {
      const nx = x + i * dir[1];
      const ny = y + i * dir[0];
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;
      if (g[ny][nx].char !== '' && g[ny][nx].char !== word[i]) return false;
    }
    return true;
  };

  const placeWord = (word: string, x: number, y: number, dir: number[], g: Cell[][]) => {
    for (let i = 0; i < word.length; i++) {
      const nx = x + i * dir[1];
      const ny = y + i * dir[0];
      g[ny][nx].char = word[i];
      g[ny][nx].isPartOfWord = true;
    }
  };

  const handleCellClick = (x: number, y: number) => {
    if (isGameOver) return;

    const isAlreadySelected = selection.some(s => s.x === x && s.y === y);
    let newSelection = [...selection];

    if (isAlreadySelected) {
      newSelection = newSelection.filter(s => !(s.x === x && s.y === y));
    } else {
      newSelection.push({ x, y });
    }

    setSelection(newSelection);

    // Check if new selection forms a word
    const selectedChars = newSelection.map(s => grid[s.y][s.x].char).join('');
    const reversedSelectedChars = selectedChars.split('').reverse().join('');

    const foundIdx = wordsToFind.findIndex(w => (w.word === selectedChars || w.word === reversedSelectedChars) && !w.found);

    if (foundIdx !== -1) {
      const targetWord = wordsToFind[foundIdx].word;
      playSuccessSound();
      speak(wordsToFind[foundIdx].italian);
      
      const newGrid = [...grid];
      newSelection.forEach(s => {
        newGrid[s.y][s.x].isFound = true;
      });
      setGrid(newGrid);

      const newWordsToFind = [...wordsToFind];
      newWordsToFind[foundIdx].found = true;
      setWordsToFind(newWordsToFind);
      setFoundWords([...foundWords, targetWord]);
      setSelection([]);

      if (newWordsToFind.every(w => w.found)) {
        setIsGameOver(true);
      }
    }
  };

  return (
    <div className="space-y-6 max-h-screen overflow-hidden flex flex-col">
      <header className="flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-brand-text/40">
          <ChevronLeft size={24} />
        </button>
        <div className="bg-brand-accent/10 border border-brand-accent/20 text-brand-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          WORD SEARCH: {category}
        </div>
        <button onClick={generateGame} className="p-2 text-brand-text/40">
          <RotateCcw size={20} />
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-start flex-1 min-h-0">
        {/* Grid Area */}
        <div className="bg-white p-3 rounded-3xl shadow-xl border border-brand-text/5 mx-auto lg:mx-0 shrink-0">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(28px, 32px))` }}>
            {grid.map((row, y) => row.map((cell, x) => {
              const isSelected = selection.some(s => s.x === x && s.y === y);
              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-sm font-black transition-all cursor-pointer select-none
                    ${cell.isFound ? 'bg-brand-sage text-white' : isSelected ? 'bg-brand-accent text-white scale-110 z-10' : 'bg-brand-bg text-brand-text/40 hover:bg-brand-text/5'}
                  `}
                >
                  {cell.char.toUpperCase()}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Word List Area */}
        <div className="flex-1 w-full flex flex-col gap-4 min-h-0">
          <div className="bg-white p-5 rounded-3xl border border-brand-text/5 shadow-sm overflow-y-auto flex-1 h-full">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-4">Words to find</h3>
            <div className="grid grid-cols-2 gap-3">
              {wordsToFind.map((w, i) => (
                <div 
                  key={i} 
                  className={`text-xs font-bold p-2 px-3 rounded-xl transition-all flex items-center gap-2
                    ${w.found ? 'bg-brand-sage/10 text-brand-sage line-through' : 'bg-brand-bg text-brand-text/60'}
                  `}
                >
                  <div className={`w-2 h-2 rounded-full ${w.found ? 'bg-brand-sage' : 'bg-brand-text/20'}`} />
                  {w.italian}
                </div>
              ))}
            </div>
          </div>

          {isGameOver && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-sage/10 border-2 border-brand-sage p-5 rounded-3xl flex items-center justify-between text-brand-deep shrink-0"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} />
                <div>
                  <p className="font-black uppercase tracking-tight text-lg leading-none">Ottimo!</p>
                  <p className="text-[10px] font-bold opacity-60">Pasticceria completata</p>
                </div>
              </div>
              <button 
                onClick={onBack}
                className="px-5 py-2 bg-brand-sage text-white rounded-xl font-black uppercase text-[10px] tracking-widest"
              >
                Back
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
