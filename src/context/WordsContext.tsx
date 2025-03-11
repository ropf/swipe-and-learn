
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

export const WordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Calculate progress (percentage of words with level > 0)
  const progress = words.length 
    ? Math.round((words.filter(word => word.level > 0).length / words.length) * 100) 
    : 0;

  // Get user session and words from Supabase
  useEffect(() => {
    const fetchUserAndWords = async () => {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not authenticated, redirect to login
        navigate('/login');
        return;
      }
      
      // Fetch words for the authenticated user
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', session.user.id)
        .order('level', { ascending: true })
        .order('last_seen', { ascending: true });
        
      if (error) {
        console.error('Error fetching words:', error);
        toast.error('Failed to load words');
        setWords([]); // Set empty array on error
      } else if (data && data.length > 0) {
        // Map database format to our app format
        const mappedWords: Word[] = data.map(word => ({
          id: word.id,
          german: word.german,
          italian: word.italian,
          level: word.level,
          lastSeen: word.last_seen
        }));
        setWords(mappedWords);
      } else {
        // If no words exist for the user yet, seed with initial words
        await seedInitialWords(session.user.id);
      }
      
      setLoading(false);
    };
    
    fetchUserAndWords();
  }, [navigate]);

  // Function to seed initial words for new users
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
      // Fetch the words again to get the IDs assigned by Supabase
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

  // Sort words by level and last seen date
  const sortedWords = [...words].sort((a, b) => {
    // First by level (lower levels first)
    if (a.level !== b.level) return a.level - b.level;
    
    // Then by lastSeen (older first)
    return a.lastSeen - b.lastSeen;
  });

  const currentWord = sortedWords.length > 0 ? sortedWords[currentWordIndex] : null;

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
    setCurrentWordIndex(prev => 
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
