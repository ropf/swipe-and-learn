
import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import CardDeck from '../components/CardDeck';
import { WordsProvider } from '../context/WordsContext';

const Index: React.FC = () => {
  return (
    <WordsProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
        <Header />
        
        <motion.main 
          className="flex-1 flex flex-col items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-2xl mx-auto">
            <CardDeck />
          </div>
        </motion.main>
        
        <footer className="py-4 text-center text-gray-400 text-sm">
          <p>Wische nach links wenn du das Wort nicht kennst, nach rechts wenn du es weißt.</p>
        </footer>
      </div>
    </WordsProvider>
  );
};

export default Index;
