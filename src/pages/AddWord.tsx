
import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import AddWordForm from '../components/AddWordForm';
import ImportWordsForm from '../components/ImportWordsForm';
import { WordsProvider } from '../context/WordsContext';

const AddWord: React.FC = () => {
  return (
    <WordsProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
        <Header />
        
        <motion.main 
          className="flex-1 flex flex-col items-center pt-8 px-4 pb-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Wörter hinzufügen</h1>
            <AddWordForm />
            <ImportWordsForm />
          </div>
        </motion.main>
      </div>
    </WordsProvider>
  );
};

export default AddWord;
