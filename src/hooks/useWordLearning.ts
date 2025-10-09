
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

  // Initialize with lowest level words, filtering out words shown 3+ times
  useEffect(() => {
    if (words.length > 0) {
      const sortedWords = sortWords(words);
      const lowestLevel = getLowestLevel(sortedWords);
      
      if (currentLevel !== lowestLevel) {
        setCurrentLevel(lowestLevel);
      }
      
      // Filter out words that have been shown 3 or more times
      const wordsAtLevel = getWordsAtLevel(sortedWords, currentLevel).filter(
        word => (sessionShownCount[word.id] || 0) < 3
      );
      
      if (wordsQueueForCurrentLevel.length === 0 || currentLevel !== (wordsQueueForCurrentLevel[0]?.level ?? -1)) {
        setWordsQueueForCurrentLevel(wordsAtLevel);
        if (wordsAtLevel.length > 0) {
          setCurrentWord(wordsAtLevel[0]);
        }
      }
    }
  }, [words, currentLevel]);

  const moveToNextAvailableWord = () => {
    const sortedWords = sortWords(words);
    
    // Try to find next word in current level that hasn't been shown 3 times
    let foundWord = false;
    
    for (let level = currentLevel; level <= 5; level++) {
      const wordsAtLevel = getWordsAtLevel(sortedWords, level).filter(
        word => (sessionShownCount[word.id] || 0) < 3
      );
      
      if (wordsAtLevel.length > 0) {
        if (level !== currentLevel) {
          setCurrentLevel(level);
        }
        setWordsQueueForCurrentLevel(wordsAtLevel);
        setCurrentWord(wordsAtLevel[0]);
        foundWord = true;
        break;
      }
    }
    
    // If no words found in any level, reset session and start from lowest level
    if (!foundWord) {
      setSessionShownCount({});
      const lowestLevel = getLowestLevel(sortedWords);
      const lowestLevelWords = getWordsAtLevel(sortedWords, lowestLevel);
      setCurrentLevel(lowestLevel);
      setWordsQueueForCurrentLevel(lowestLevelWords);
      setCurrentWord(lowestLevelWords.length > 0 ? lowestLevelWords[0] : null);
    }
  };

  const markKnown = async () => {
    if (!currentWord) return;
    
    // Increment shown count
    const newCount = (sessionShownCount[currentWord.id] || 0) + 1;
    setSessionShownCount(prev => ({
      ...prev,
      [currentWord.id]: newCount
    }));
    
    // Update level (+1)
    const updatedLevel = Math.min(5, currentWord.level + 1);
    const updatedLastSeen = Date.now();
    
    try {
      await updateWordLevel(currentWord.id, updatedLevel, updatedLastSeen);
      setWords(prev => 
        prev.map(word => 
          word.id === currentWord.id
            ? { ...word, level: updatedLevel, lastSeen: updatedLastSeen }
            : word
        )
      );
    } catch (error) {
      // Error already handled in updateWordLevel
    }
    
    // Remove word from current level queue
    // It will appear again when we reach its new (higher) level
    const remainingQueue = wordsQueueForCurrentLevel.filter(word => word.id !== currentWord.id);
    setWordsQueueForCurrentLevel(remainingQueue);
    
    if (remainingQueue.length > 0) {
      setCurrentWord(remainingQueue[0]);
    } else {
      moveToNextAvailableWord();
    }
  };

  const markUnknown = async () => {
    if (!currentWord) return;
    
    // Increment shown count
    const newCount = (sessionShownCount[currentWord.id] || 0) + 1;
    setSessionShownCount(prev => ({
      ...prev,
      [currentWord.id]: newCount
    }));
    
    // Update level (-1)
    const updatedLevel = Math.max(0, currentWord.level - 1);
    const updatedLastSeen = Date.now();
    
    try {
      await updateWordLevel(currentWord.id, updatedLevel, updatedLastSeen);
      setWords(prev => 
        prev.map(word => 
          word.id === currentWord.id
            ? { ...word, level: updatedLevel, lastSeen: updatedLastSeen }
            : word
        )
      );
    } catch (error) {
      // Error already handled in updateWordLevel
    }
    
    // Remove word from current level queue
    // It will appear again when we reach its new (lower) level
    const remainingQueue = wordsQueueForCurrentLevel.filter(word => word.id !== currentWord.id);
    setWordsQueueForCurrentLevel(remainingQueue);
    
    if (remainingQueue.length > 0) {
      setCurrentWord(remainingQueue[0]);
    } else {
      moveToNextAvailableWord();
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
