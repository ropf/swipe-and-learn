
import { supabase } from '../lib/supabase';
import { initialWords, Word } from '../data/words';
import { toast } from 'sonner';

export const fetchUserWords = async (userId: string): Promise<Word[]> => {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('user_id', userId)
    .order('level', { ascending: true })
    .order('last_seen', { ascending: true });
    
  if (error) {
    console.error('Error fetching words:', error);
    toast.error('Failed to load words');
    throw error;
  }
  
  return data ? data.map(word => ({
    id: word.id,
    german: word.german,
    italian: word.italian,
    level: word.level,
    lastSeen: word.last_seen
  })) : [];
};

export const seedInitialWords = async (userId: string): Promise<Word[]> => {
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
    throw error;
  }
  
  const { data } = await supabase
    .from('words')
    .select('*')
    .eq('user_id', userId);
    
  return data ? data.map(word => ({
    id: word.id,
    german: word.german,
    italian: word.italian,
    level: word.level,
    lastSeen: word.last_seen
  })) : [];
};

export const insertWord = async (german: string, italian: string, userId: string) => {
  const newWord = {
    german,
    italian,
    level: 0,
    last_seen: Date.now(),
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('words')
    .insert([newWord])
    .select();
    
  if (error) {
    console.error('Error adding word:', error);
    toast.error('Failed to add word');
    throw error;
  }
  
  if (data) {
    return {
      id: data[0].id,
      german: data[0].german,
      italian: data[0].italian,
      level: data[0].level,
      lastSeen: data[0].last_seen
    };
  }
  
  throw new Error('No data returned from insert');
};

export const updateWordContent = async (id: string, german: string, italian: string, userId: string) => {
  const { error } = await supabase
    .from('words')
    .update({ german, italian })
    .eq('id', id)
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error updating word:', error);
    toast.error('Failed to update word');
    throw error;
  }
};

export const updateWordLevel = async (id: string, level: number, lastSeen: number) => {
  const { error } = await supabase
    .from('words')
    .update({ level, last_seen: lastSeen })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating word:', error);
    toast.error('Failed to update word');
    throw error;
  }
};

export const removeWord = async (id: string, userId: string) => {
  const { error } = await supabase
    .from('words')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error deleting word:', error);
    toast.error('Failed to delete word');
    throw error;
  }
};

export const importWords = async (wordPairs: { german: string; italian: string }[], userId: string) => {
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
  
  return data ? data.map(word => ({
    id: word.id,
    german: word.german,
    italian: word.italian,
    level: word.level,
    lastSeen: word.last_seen
  })) : [];
};
