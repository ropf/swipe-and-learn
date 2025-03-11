
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FlashCard from './FlashCard';
import { useWords } from '../context/WordsContext';
import { Loader2 } from 'lucide-react';

const CardDeck: React.FC = () => {
  const { currentWord, markKnown, markUnknown, loading } = useWords();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-500">Lade Wörter...</p>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl text-gray-500">Keine Wörter zum Lernen.</p>
        <p className="mt-2 text-gray-400">Füge neue Wörter hinzu, um zu beginnen.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] w-full px-4 flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <FlashCard
            word={currentWord}
            onSwipeLeft={markUnknown}
            onSwipeRight={markKnown}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CardDeck;
