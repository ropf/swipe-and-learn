
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Word } from '../data/words';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { WordsContextType } from './types';
import { calculateProgress } from './wordUtils';
import { fetchUserWords, seedInitialWords } from './databaseOperations';
import { useWordOperations } from '../hooks/useWordOperations';
import { useWordLearning } from '../hooks/useWordLearning';

const WordsContext = createContext<WordsContextType | undefined>(undefined);

export const useWords = () => {
  const context = useContext(WordsContext);
  if (!context) {
    throw new Error('useWords must be used within a WordsProvider');
  }
  return context;
};

export const WordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const progress = calculateProgress(words);

  const {
    currentWord,
    markKnown,
    markUnknown,
    nextWord,
    setWordsQueueForCurrentLevel
  } = useWordLearning(words, setWords);

  const {
    addWord,
    editWord,
    deleteWord,
    importWordsFromText
  } = useWordOperations(words, setWords, setWordsQueueForCurrentLevel, nextWord);

  useEffect(() => {
    const fetchUserAndWords = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      try {
        const userWords = await fetchUserWords(session.user.id);
        if (userWords.length > 0) {
          setWords(userWords);
        } else {
          const seededWords = await seedInitialWords(session.user.id);
          setWords(seededWords);
        }
      } catch (error) {
        setWords([]);
      }
      
      setLoading(false);
    };
    
    fetchUserAndWords();
  }, [navigate]);

  const value = {
    words,
    currentWord,
    loading,
    addWord,
    editWord,
    deleteWord,
    markKnown,
    markUnknown,
    nextWord,
    progress,
    importWordsFromText
  };

  return <WordsContext.Provider value={value}>{children}</WordsContext.Provider>;
};
