
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialWords, Word } from '../data/words';
import { toast } from 'sonner';

interface WordsContextType {
  words: Word[];
  currentWord: Word | null;
  loading: boolean;
  addWord: (german: string, italian: string) => void;
  markKnown: () => void;
  markUnknown: () => void;
  nextWord: () => void;
  progress: number;
}

const WordsContext = createContext<WordsContextType | undefined>(undefined);

export const useWords = () => {
  const context = useContext(WordsContext);
  if (!context) {
    throw new Error('useWords must be used within a WordsProvider');
  }
  return context;
};

const STORAGE_KEY = 'flashcard-words';

export const WordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Calculate progress (percentage of words with level > 0)
  const progress = words.length 
    ? Math.round((words.filter(word => word.level > 0).length / words.length) * 100) 
    : 0;

  // Load words from localStorage on initial render
  useEffect(() => {
    const storedWords = localStorage.getItem(STORAGE_KEY);
    
    if (storedWords) {
      try {
        setWords(JSON.parse(storedWords));
      } catch (e) {
        console.error('Error parsing stored words:', e);
        setWords(initialWords);
      }
    } else {
      setWords(initialWords);
    }
    
    setLoading(false);
  }, []);

  // Save words to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    }
  }, [words, loading]);

  // Sort words by level and last seen date to prioritize unknown/old words
  const sortedWords = [...words].sort((a, b) => {
    // First by level (lower levels first)
    if (a.level !== b.level) return a.level - b.level;
    
    // Then by lastSeen (older first)
    return a.lastSeen - b.lastSeen;
  });

  const currentWord = sortedWords.length > 0 ? sortedWords[currentWordIndex] : null;

  const addWord = (german: string, italian: string) => {
    const newWord: Word = {
      id: Date.now().toString(),
      german,
      italian,
      level: 0,
      lastSeen: Date.now(),
    };
    
    setWords((prev) => [...prev, newWord]);
    toast.success('Wort hinzugefügt');
  };

  const markKnown = () => {
    if (!currentWord) return;
    
    setWords((prev) => 
      prev.map((word) => 
        word.id === currentWord.id
          ? { 
              ...word, 
              level: Math.min(5, word.level + 1), 
              lastSeen: Date.now() 
            }
          : word
      )
    );
    
    nextWord();
  };

  const markUnknown = () => {
    if (!currentWord) return;
    
    setWords((prev) => 
      prev.map((word) => 
        word.id === currentWord.id
          ? { 
              ...word, 
              level: Math.max(0, word.level - 1), 
              lastSeen: Date.now() 
            }
          : word
      )
    );
    
    nextWord();
  };

  const nextWord = () => {
    setCurrentWordIndex((prev) => 
      prev < sortedWords.length - 1 ? prev + 1 : 0
    );
  };

  const value = {
    words,
    currentWord,
    loading,
    addWord,
    markKnown,
    markUnknown,
    nextWord,
    progress
  };

  return <WordsContext.Provider value={value}>{children}</WordsContext.Provider>;
};
