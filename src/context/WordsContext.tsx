import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialWords, Word } from '../data/words';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface WordsContextType {
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
}

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
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [wordsQueueForCurrentLevel, setWordsQueueForCurrentLevel] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const progress = words.length 
    ? Math.round((words.filter(word => word.level > 0).length / words.length) * 100) 
    : 0;

  // Update queue when words or current level changes
  useEffect(() => {
    if (words.length > 0) {
      const sortedWords = [...words].sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.lastSeen - b.lastSeen;
      });
      
      const lowestLevel = Math.min(...sortedWords.map(w => w.level));
      
      if (currentLevel !== lowestLevel) {
        setCurrentLevel(lowestLevel);
      }
      
      const wordsAtLevel = sortedWords.filter(word => word.level === currentLevel);
      
      // Only update queue if it's empty or if we're starting a new level
      if (wordsQueueForCurrentLevel.length === 0 || currentLevel !== (wordsQueueForCurrentLevel[0]?.level ?? -1)) {
        setWordsQueueForCurrentLevel(wordsAtLevel);
        if (wordsAtLevel.length > 0) {
          setCurrentWord(wordsAtLevel[0]);
        }
      }
    }
  }, [words, currentLevel]);

  useEffect(() => {
    const fetchUserAndWords = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', session.user.id)
        .order('level', { ascending: true })
        .order('last_seen', { ascending: true });
        
      if (error) {
        console.error('Error fetching words:', error);
        toast.error('Failed to load words');
        setWords([]);
      } else if (data && data.length > 0) {
        const mappedWords: Word[] = data.map(word => ({
          id: word.id,
          german: word.german,
          italian: word.italian,
          level: word.level,
          lastSeen: word.last_seen
        }));
        setWords(mappedWords);
      } else {
        await seedInitialWords(session.user.id);
      }
      
      setLoading(false);
    };
    
    fetchUserAndWords();
  }, [navigate]);

  const seedInitialWords = async (userId: string) => {
    const initialWordsWithUserId = initialWords.map(word => ({
      ...word,
      user_id: userId,
      last_seen: word.lastSeen
    }));
    
    const { error } = await supabase
      .from('words')
      .insert(initialWordsWithUserId);
      
    if (error) {
      console.error('Error seeding initial words:', error);
      toast.error('Failed to set up initial vocabulary');
      setWords([]);
    } else {
      const { data } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', userId);
        
      if (data) {
        const mappedWords: Word[] = data.map(word => ({
          id: word.id,
          german: word.german,
          italian: word.italian,
          level: word.level,
          lastSeen: word.last_seen
        }));
        setWords(mappedWords);
      }
    }
  };

  const addWord = async (german: string, italian: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('You must be logged in to add words');
      navigate('/login');
      return;
    }
    
    const newWord = {
      german,
      italian,
      level: 0,
      last_seen: Date.now(),
      user_id: session.user.id
    };
    
    const { data, error } = await supabase
      .from('words')
      .insert([newWord])
      .select();
      
    if (error) {
      console.error('Error adding word:', error);
      toast.error('Failed to add word');
    } else if (data) {
      const addedWord: Word = {
        id: data[0].id,
        german: data[0].german,
        italian: data[0].italian,
        level: data[0].level,
        lastSeen: data[0].last_seen
      };
      
      setWords(prev => [...prev, addedWord]);
      toast.success('Word added successfully');
    }
  };

  const editWord = async (id: string, german: string, italian: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('You must be logged in to edit words');
      navigate('/login');
      return;
    }
    
    const { error } = await supabase
      .from('words')
      .update({ 
        german, 
        italian
      })
      .eq('id', id)
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error updating word:', error);
      toast.error('Failed to update word');
      throw new Error('Failed to update word');
    } else {
      setWords(prev => 
        prev.map(word => 
          word.id === id
            ? { ...word, german, italian }
            : word
        )
      );
      toast.success('Word updated successfully');
    }
  };

  const deleteWord = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('You must be logged in to delete words');
      navigate('/login');
      return;
    }
    
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error('Error deleting word:', error);
      toast.error('Failed to delete word');
      throw new Error('Failed to delete word');
    } else {
      setWords(prev => prev.filter(word => word.id !== id));
      
      // Remove from queue if present
      setWordsQueueForCurrentLevel(prev => prev.filter(word => word.id !== id));
      
      nextWord();
      toast.success('Word deleted successfully');
    }
  };

  const markKnown = async () => {
    if (!currentWord) return;
    
    const updatedLevel = Math.min(5, currentWord.level + 1);
    const updatedLastSeen = Date.now();
    
    const { error } = await supabase
      .from('words')
      .update({ 
        level: updatedLevel, 
        last_seen: updatedLastSeen 
      })
      .eq('id', currentWord.id);
      
    if (error) {
      console.error('Error updating word:', error);
      toast.error('Failed to update word');
    } else {
      setWords(prev => 
        prev.map(word => 
          word.id === currentWord.id
            ? { 
                ...word, 
                level: updatedLevel, 
                lastSeen: updatedLastSeen 
              }
            : word
        )
      );
    }
    
    nextWord();
  };

  const markUnknown = async () => {
    if (!currentWord) return;
    
    const updatedLevel = Math.max(0, currentWord.level - 1);
    const updatedLastSeen = Date.now();
    
    const { error } = await supabase
      .from('words')
      .update({ 
        level: updatedLevel, 
        last_seen: updatedLastSeen 
      })
      .eq('id', currentWord.id);
      
    if (error) {
      console.error('Error updating word:', error);
      toast.error('Failed to update word');
    } else {
      setWords(prev => 
        prev.map(word => 
          word.id === currentWord.id
            ? { 
                ...word, 
                level: updatedLevel, 
                lastSeen: updatedLastSeen 
              }
            : word
        )
      );
    }
    
    nextWord();
  };

  const nextWord = () => {
    if (wordsQueueForCurrentLevel.length === 0) return;
    
    // Remove current word from queue
    const remainingWords = wordsQueueForCurrentLevel.slice(1);
    setWordsQueueForCurrentLevel(remainingWords);
    
    if (remainingWords.length > 0) {
      // More words in current level
      setCurrentWord(remainingWords[0]);
    } else {
      // Current level is complete, move to next level
      const sortedWords = [...words].sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.lastSeen - b.lastSeen;
      });
      
      const nextLevel = currentLevel + 1;
      const wordsAtNextLevel = sortedWords.filter(word => word.level === nextLevel);
      
      if (wordsAtNextLevel.length > 0) {
        // Move to next level
        setCurrentLevel(nextLevel);
        setWordsQueueForCurrentLevel(wordsAtNextLevel);
        setCurrentWord(wordsAtNextLevel[0]);
      } else {
        // No more levels, start over from level 0
        const level0Words = sortedWords.filter(word => word.level === 0);
        if (level0Words.length > 0) {
          setCurrentLevel(0);
          setWordsQueueForCurrentLevel(level0Words);
          setCurrentWord(level0Words[0]);
        } else {
          // All words are above level 0, start from lowest available level
          const lowestLevel = Math.min(...sortedWords.map(w => w.level));
          const lowestLevelWords = sortedWords.filter(word => word.level === lowestLevel);
          setCurrentLevel(lowestLevel);
          setWordsQueueForCurrentLevel(lowestLevelWords);
          setCurrentWord(lowestLevelWords[0]);
        }
      }
    }
  };

  const importWordsFromText = async (wordPairs: { german: string; italian: string }[]) => {
    if (wordPairs.length === 0) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('You must be logged in to import words');
      navigate('/login');
      return;
    }
    
    const userId = session.user.id;
    
    const wordsToInsert = wordPairs.map(pair => ({
      german: pair.german,
      italian: pair.italian,
      level: 0,
      last_seen: Date.now(),
      user_id: userId
    }));
    
    const { data, error } = await supabase
      .from('words')
      .insert(wordsToInsert)
      .select();
      
    if (error) {
      console.error('Error importing words:', error);
      throw new Error('Failed to import words');
    }
    
    if (data) {
      const addedWords: Word[] = data.map(word => ({
        id: word.id,
        german: word.german,
        italian: word.italian,
        level: word.level,
        lastSeen: word.last_seen
      }));
      
      setWords(prev => [...prev, ...addedWords]);
    }
  };

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
