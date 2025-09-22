
import { useState, useEffect } from 'react';
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
  const [sessionProgress, setSessionProgress] = useState<Record<string, number>>({});

  // Update queue when words or current level changes
  useEffect(() => {
    if (words.length > 0) {
      const sortedWords = sortWords(words);
      const lowestLevel = getLowestLevel(sortedWords);
      
      if (currentLevel !== lowestLevel) {
        setCurrentLevel(lowestLevel);
      }
      
      const wordsAtLevel = getWordsAtLevel(sortedWords, currentLevel);
      
      // Only update queue if it's empty or if we're starting a new level
      if (wordsQueueForCurrentLevel.length === 0 || currentLevel !== (wordsQueueForCurrentLevel[0]?.level ?? -1)) {
        setWordsQueueForCurrentLevel(wordsAtLevel);
        if (wordsAtLevel.length > 0) {
          setCurrentWord(wordsAtLevel[0]);
        }
      }
    }
  }, [words, currentLevel]);

  const updateQueueAfterLevelChange = () => {
    const sortedWords = sortWords(words);
    const actualWordsAtCurrentLevel = getWordsAtLevel(sortedWords, currentLevel);
    
    // Remove words that are no longer at the current level from queue
    const updatedQueue = wordsQueueForCurrentLevel.filter(queueWord => 
      actualWordsAtCurrentLevel.some(levelWord => levelWord.id === queueWord.id)
    );
    
    setWordsQueueForCurrentLevel(updatedQueue);
    
    if (updatedQueue.length > 0) {
      setCurrentWord(updatedQueue[0]);
      return true; // Still words in current level
    } else {
      // No more words in current level, systematically move to next higher level
      const maxLevel = Math.max(...sortedWords.map(w => w.level));
      
      // Try each level from current+1 to maxLevel
      for (let nextLevel = currentLevel + 1; nextLevel <= maxLevel; nextLevel++) {
        const wordsAtNextLevel = getWordsAtLevel(sortedWords, nextLevel);
        if (wordsAtNextLevel.length > 0) {
          setCurrentLevel(nextLevel);
          setWordsQueueForCurrentLevel(wordsAtNextLevel);
          setCurrentWord(wordsAtNextLevel[0]);
          return false; // Moved to different level
        }
      }
      
      // All higher levels are empty, start over from lowest available level
      const lowestLevel = getLowestLevel(sortedWords);
      const lowestLevelWords = getWordsAtLevel(sortedWords, lowestLevel);
      if (lowestLevelWords.length > 0) {
        setCurrentLevel(lowestLevel);
        setWordsQueueForCurrentLevel(lowestLevelWords);
        setCurrentWord(lowestLevelWords[0]);
      }
      
      return false; // Moved to different level
    }
  };

  const markKnown = async () => {
    if (!currentWord) return;
    
    // Track session progress for this word
    const currentProgress = sessionProgress[currentWord.id] || 0;
    const newProgress = currentProgress + 1;
    
    // Update session progress
    setSessionProgress(prev => ({
      ...prev,
      [currentWord.id]: newProgress
    }));
    
    const updatedLevel = Math.min(5, currentWord.level + 1);
    const updatedLastSeen = Date.now();
    
    try {
      await updateWordLevel(currentWord.id, updatedLevel, updatedLastSeen);
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
    } catch (error) {
      // Error already handled in updateWordLevel
    }
    
    // If word has been correct once in this session, remove it from queue completely
    if (newProgress >= 1) {
      const remainingQueue = wordsQueueForCurrentLevel.filter(word => word.id !== currentWord.id);
      setWordsQueueForCurrentLevel(remainingQueue);
      
      if (remainingQueue.length > 0) {
        setCurrentWord(remainingQueue[0]);
      } else {
        updateQueueAfterLevelChange();
      }
    } else {
      updateQueueAfterLevelChange();
    }
  };

  const markUnknown = async () => {
    if (!currentWord) return;
    
    // Reset session progress for this word when it's marked as unknown
    setSessionProgress(prev => ({
      ...prev,
      [currentWord.id]: 0
    }));
    
    const updatedLevel = Math.max(0, currentWord.level - 1);
    const updatedLastSeen = Date.now();
    
    try {
      await updateWordLevel(currentWord.id, updatedLevel, updatedLastSeen);
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
    } catch (error) {
      // Error already handled in updateWordLevel
    }
    
    updateQueueAfterLevelChange();
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
      // Current level is complete, systematically move to next higher level
      const sortedWords = sortWords(words);
      const maxLevel = Math.max(...sortedWords.map(w => w.level));
      
      // Try each level from current+1 to maxLevel
      for (let nextLevel = currentLevel + 1; nextLevel <= maxLevel; nextLevel++) {
        const wordsAtNextLevel = getWordsAtLevel(sortedWords, nextLevel);
        if (wordsAtNextLevel.length > 0) {
          setCurrentLevel(nextLevel);
          setWordsQueueForCurrentLevel(wordsAtNextLevel);
          setCurrentWord(wordsAtNextLevel[0]);
          return;
        }
      }
      
      // All higher levels are empty, start over from lowest available level
      const lowestLevel = getLowestLevel(sortedWords);
      const lowestLevelWords = getWordsAtLevel(sortedWords, lowestLevel);
      if (lowestLevelWords.length > 0) {
        setCurrentLevel(lowestLevel);
        setWordsQueueForCurrentLevel(lowestLevelWords);
        setCurrentWord(lowestLevelWords[0]);
      }
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
