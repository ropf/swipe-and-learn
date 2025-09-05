
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
      // No more words in current level, check for next level
      const nextLevel = currentLevel + 1;
      const wordsAtNextLevel = getWordsAtLevel(sortedWords, nextLevel);
      
      if (wordsAtNextLevel.length > 0) {
        // Move to next level
        setCurrentLevel(nextLevel);
        setWordsQueueForCurrentLevel(wordsAtNextLevel);
        setCurrentWord(wordsAtNextLevel[0]);
      } else {
        // No more levels, start over from level 0
        const level0Words = getWordsAtLevel(sortedWords, 0);
        if (level0Words.length > 0) {
          setCurrentLevel(0);
          setWordsQueueForCurrentLevel(level0Words);
          setCurrentWord(level0Words[0]);
        } else {
          // All words are above level 0, start from lowest available level
          const lowestLevel = getLowestLevel(sortedWords);
          const lowestLevelWords = getWordsAtLevel(sortedWords, lowestLevel);
          setCurrentLevel(lowestLevel);
          setWordsQueueForCurrentLevel(lowestLevelWords);
          setCurrentWord(lowestLevelWords[0]);
        }
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
    
    // If word has been correct twice in this session, remove it from queue completely
    if (newProgress >= 2) {
      setWordsQueueForCurrentLevel(prev => prev.filter(word => word.id !== currentWord.id));
      
      // Find next word in queue or move to next level
      setTimeout(() => {
        const remainingQueue = wordsQueueForCurrentLevel.filter(word => word.id !== currentWord.id);
        if (remainingQueue.length > 0) {
          setCurrentWord(remainingQueue[0]);
        } else {
          updateQueueAfterLevelChange();
        }
      }, 0);
    } else {
      // Use timeout to ensure state update has been processed
      setTimeout(() => {
        const stillInCurrentLevel = updateQueueAfterLevelChange();
        if (stillInCurrentLevel) {
          nextWord();
        }
      }, 0);
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
    
    // Use timeout to ensure state update has been processed
    setTimeout(() => {
      const stillInCurrentLevel = updateQueueAfterLevelChange();
      if (stillInCurrentLevel) {
        nextWord();
      }
    }, 0);
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
      const sortedWords = sortWords(words);
      const nextLevel = currentLevel + 1;
      const wordsAtNextLevel = getWordsAtLevel(sortedWords, nextLevel);
      
      if (wordsAtNextLevel.length > 0) {
        // Move to next level
        setCurrentLevel(nextLevel);
        setWordsQueueForCurrentLevel(wordsAtNextLevel);
        setCurrentWord(wordsAtNextLevel[0]);
      } else {
        // No more levels, start over from level 0
        const level0Words = getWordsAtLevel(sortedWords, 0);
        if (level0Words.length > 0) {
          setCurrentLevel(0);
          setWordsQueueForCurrentLevel(level0Words);
          setCurrentWord(level0Words[0]);
        } else {
          // All words are above level 0, start from lowest available level
          const lowestLevel = getLowestLevel(sortedWords);
          const lowestLevelWords = getWordsAtLevel(sortedWords, lowestLevel);
          setCurrentLevel(lowestLevel);
          setWordsQueueForCurrentLevel(lowestLevelWords);
          setCurrentWord(lowestLevelWords[0]);
        }
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
