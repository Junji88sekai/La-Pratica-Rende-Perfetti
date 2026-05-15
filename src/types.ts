export interface VocabularyItem {
  italian: string;
  japanese: string;
  category: string;
}

export interface PhraseItem {
  italian: string;
  japanese: string;
  category: string;
}

export interface CompositionItem {
  japanese: string;
  italian: string;
  chapter: number;
}

export type ViewState = 'home' | 'vocab' | 'phrase' | 'composition';
export type PracticeMode = 'learn' | 'quiz';
export type CompositionMode = 'typing' | 'sorting' | 'voice';
