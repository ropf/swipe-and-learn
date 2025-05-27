
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { Word } from '../data/words';
import {
  insertWord,
  updateWordContent,
  updateWordLevel,
  removeWord,
  importWords
} from '../context/databaseOperations';

export const useWordOperations = (
  words: Word[],
  setWords: React.Dispatch<React.SetStateAction<Word[]>>,
  setWordsQueueForCurrentLevel: React.Dispatch<React.SetStateAction<Word[]>>,
  nextWord: () => void
) => {
  const navigate = useNavigate();

  const addWord = async (german: string, italian: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('You must be logged in to add words');
      navigate('/login');
      return;
    }
    
    try {
      const addedWord = await insertWord(german, italian, session.user.id);
      setWords(prev => [...prev, addedWord]);
      toast.success('Word added successfully');
    } catch (error) {
      // Error already handled in insertWord
    }
  };

  const editWord = async (id: string, german: string, italian: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('You must be logged in to edit words');
      navigate('/login');
      return;
    }
    
    try {
      await updateWordContent(id, german, italian, session.user.id);
      setWords(prev => 
        prev.map(word => 
          word.id === id
            ? { ...word, german, italian }
            : word
        )
      );
      toast.success('Word updated successfully');
    } catch (error) {
      throw error;
    }
  };

  const deleteWord = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('You must be logged in to delete words');
      navigate('/login');
      return;
    }
    
    try {
      await removeWord(id, session.user.id);
      setWords(prev => prev.filter(word => word.id !== id));
      setWordsQueueForCurrentLevel(prev => prev.filter(word => word.id !== id));
      nextWord();
      toast.success('Word deleted successfully');
    } catch (error) {
      throw error;
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
    
    try {
      const addedWords = await importWords(wordPairs, session.user.id);
      setWords(prev => [...prev, ...addedWords]);
    } catch (error) {
      throw error;
    }
  };

  return {
    addWord,
    editWord,
    deleteWord,
    importWordsFromText
  };
};
