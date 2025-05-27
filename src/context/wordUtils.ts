
import { Word } from '../data/words';

export const sortWords = (words: Word[]) => {
  return [...words].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.lastSeen - b.lastSeen;
  });
};

export const calculateProgress = (words: Word[]) => {
  return words.length 
    ? Math.round((words.filter(word => word.level > 0).length / words.length) * 100) 
    : 0;
};

export const getLowestLevel = (words: Word[]) => {
  if (words.length === 0) return 0;
  return Math.min(...words.map(w => w.level));
};

export const getWordsAtLevel = (words: Word[], level: number) => {
  return words.filter(word => word.level === level);
};
