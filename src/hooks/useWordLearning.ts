
import React, { useState, useEffect } from 'react';
import { Word } from '../data/words';
import { updateWordLevel } from '../context/databaseOperations';
import { sortWords, getLowestLevel, getWordsAtLevel } from '../context/wordUtils';

export const useWordLearning = (
  words: Word[],
  setWords: React.Dispatch<React.SetStateAction<Word[]>>
) => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [wordsQueueForCurrentLevel, setWordsQueueForCurrentLevel] = useState<Word[]>([]);
  // Track how many times each word has been shown in this session
  const [sessionShownCount, setSessionShownCount] = useState<Record<string, number>>({});
  // Track words that were just moved to a different level to prevent immediate re-showing
  const [justMovedWords, setJustMovedWords] = useState<Set<string>>(new Set());

  // Initialize with lowest level words, filtering out words shown 3+ times and just moved words
  useEffect(() => {
    if (words.length > 0) {
      const sortedWords = sortWords(words);
      const lowestLevel = getLowestLevel(sortedWords);
      
      if (currentLevel !== lowestLevel) {
        setCurrentLevel(lowestLevel);
        // Clear justMovedWords when changing levels
        setJustMovedWords(new Set());
      }
      
      // Filter out words that have been shown 3 or more times and just moved words
      const wordsAtLevel = getWordsAtLevel(sortedWords, currentLevel).filter(
        word => (sessionShownCount[word.id] || 0) < 3 && !justMovedWords.has(word.id)
      );
      
      if (wordsQueueForCurrentLevel.length === 0 || currentLevel !== (wordsQueueForCurrentLevel[0]?.level ?? -1)) {
        setWordsQueueForCurrentLevel(wordsAtLevel);
        if (wordsAtLevel.length > 0) {
          setCurrentWord(wordsAtLevel[0]);
        }
      }
    }
  }, [words, currentLevel]);

  const moveToNextAvailableWord = (excludeWordId?: string) => {
    const sortedWords = sortWords(words);
    
    // First, try to find another word in the CURRENT level only
    const currentLevelWords = getWordsAtLevel(sortedWords, currentLevel).filter(
      word => (sessionShownCount[word.id] || 0) < 3 && word.id !== excludeWordId && !justMovedWords.has(word.id)
    );
    
    if (currentLevelWords.length > 0) {
      // Stay at current level
      setWordsQueueForCurrentLevel(currentLevelWords);
      setCurrentWord(currentLevelWords[0]);
      return;
    }
    
    // Current level is done, clear justMovedWords and find the next lowest level available
    setJustMovedWords(new Set());
    let foundWord = false;
    const lowestLevel = getLowestLevel(sortedWords);
    
    for (let level = lowestLevel; level <= 5; level++) {
      if (level === currentLevel) continue; // Skip current level, we already checked it
      
      const wordsAtLevel = getWordsAtLevel(sortedWords, level).filter(
        word => (sessionShownCount[word.id] || 0) < 3 && word.id !== excludeWordId
      );
      
      if (wordsAtLevel.length > 0) {
        setCurrentLevel(level);
        setWordsQueueForCurrentLevel(wordsAtLevel);
        setCurrentWord(wordsAtLevel[0]);
        foundWord = true;
        break;
      }
    }
    
    // If no words found in any level, reset session and start from lowest level
    if (!foundWord) {
      setSessionShownCount({});
      setJustMovedWords(new Set());
      const lowestLevel = getLowestLevel(sortedWords);
      const lowestLevelWords = getWordsAtLevel(sortedWords, lowestLevel);
      setCurrentLevel(lowestLevel);
      setWordsQueueForCurrentLevel(lowestLevelWords);
      setCurrentWord(lowestLevelWords.length > 0 ? lowestLevelWords[0] : null);
    }
  };

  const markKnown = async () => {
    if (!currentWord) return;
    
    const wordId = currentWord.id;
    const originalLevel = currentWord.level;
    
    // Increment shown count
    const newCount = (sessionShownCount[wordId] || 0) + 1;
    setSessionShownCount(prev => ({
      ...prev,
      [wordId]: newCount
    }));
    
    // Update level (+1)
    const updatedLevel = Math.min(5, currentWord.level + 1);
    const updatedLastSeen = Date.now();
    
    // If word is moved to a different level, mark it as just moved
    const levelChanged = updatedLevel !== originalLevel;
    if (levelChanged) {
      setJustMovedWords(prev => new Set(prev).add(wordId));
    }
    
    try {
      await updateWordLevel(wordId, updatedLevel, updatedLastSeen);
      
      // Create updated words array manually (don't wait for state)
      const updatedWords = words.map(word => 
        word.id === wordId
          ? { ...word, level: updatedLevel, lastSeen: updatedLastSeen }
          : word
      );
      
      setWords(updatedWords);
      
      // Calculate remaining queue from current level with updated data
      const remainingQueue = wordsQueueForCurrentLevel.filter(word => {
        if (word.id === wordId) return false;
        
        // Check if word still exists at current level in updated words
        const updatedWord = updatedWords.find(w => w.id === word.id);
        if (!updatedWord || updatedWord.level !== currentLevel) return false;
        
        // Check session count and just moved
        if ((sessionShownCount[word.id] || 0) >= 3) return false;
        if (justMovedWords.has(word.id)) return false;
        
        return true;
      });
      
      setWordsQueueForCurrentLevel(remainingQueue);
      
      if (remainingQueue.length > 0) {
        setCurrentWord(remainingQueue[0]);
      } else {
        moveToNextAvailableWord();
      }
    } catch (error) {
      // Error already handled in updateWordLevel
    }
  };

  const markUnknown = async () => {
    if (!currentWord) return;
    
    const wordId = currentWord.id;
    const originalLevel = currentWord.level;
    
    // Increment shown count
    const newCount = (sessionShownCount[wordId] || 0) + 1;
    setSessionShownCount(prev => ({
      ...prev,
      [wordId]: newCount
    }));
    
    // Update level (-1)
    const updatedLevel = Math.max(0, currentWord.level - 1);
    const updatedLastSeen = Date.now();
    
    // If word is moved to a different level, mark it as just moved
    const levelChanged = updatedLevel !== originalLevel;
    if (levelChanged) {
      setJustMovedWords(prev => new Set(prev).add(wordId));
    }
    
    try {
      await updateWordLevel(wordId, updatedLevel, updatedLastSeen);
      
      // Create updated words array manually (don't wait for state)
      const updatedWords = words.map(word => 
        word.id === wordId
          ? { ...word, level: updatedLevel, lastSeen: updatedLastSeen }
          : word
      );
      
      setWords(updatedWords);
      
      // Calculate remaining queue from current level with updated data
      const remainingQueue = wordsQueueForCurrentLevel.filter(word => {
        if (word.id === wordId) return false;
        
        // Check if word still exists at current level in updated words
        const updatedWord = updatedWords.find(w => w.id === word.id);
        if (!updatedWord || updatedWord.level !== currentLevel) return false;
        
        // Check session count and just moved
        if ((sessionShownCount[word.id] || 0) >= 3) return false;
        if (justMovedWords.has(word.id)) return false;
        
        return true;
      });
      
      setWordsQueueForCurrentLevel(remainingQueue);
      
      if (remainingQueue.length > 0) {
        setCurrentWord(remainingQueue[0]);
      } else {
        // Exclude the just-moved word from immediate re-selection
        moveToNextAvailableWord(wordId);
      }
    } catch (error) {
      // Error already handled in updateWordLevel
    }
  };

  const nextWord = () => {
    if (wordsQueueForCurrentLevel.length === 0) return;
    
    // Remove current word from queue
    const remainingWords = wordsQueueForCurrentLevel.slice(1);
    setWordsQueueForCurrentLevel(remainingWords);
    
    if (remainingWords.length > 0) {
      setCurrentWord(remainingWords[0]);
    } else {
      moveToNextAvailableWord();
    }
  };

  return {
    currentWord,
    markKnown,
    markUnknown,
    nextWord,
    setWordsQueueForCurrentLevel
  };
};
