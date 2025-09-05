
import { Word } from '../data/words';

export interface WordsContextType {
  words: Word[];
  currentWord: Word | null;
  loading: boolean;
  addWord: (german: string, italian: string) => void;
  editWord: (id: string, german: string, italian: string) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  markKnown: () => void;
  markUnknown: () => void;
  nextWord: () => void;
  progress: number;
  importWordsFromText: (wordPairs: { german: string; italian: string }[]) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredWords: Word[];
  isSearchActive: boolean;
}
