
import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import AddWordForm from '../components/AddWordForm';
import { WordsProvider } from '../context/WordsContext';

const AddWord: React.FC = () => {
  return (
    <WordsProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
        <Header />
        
        <motion.main 
          className="flex-1 flex flex-col items-center pt-8 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AddWordForm />
        </motion.main>
      </div>
    </WordsProvider>
  );
};

export default AddWord;
