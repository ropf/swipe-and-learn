
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWords } from '../context/WordsContext';
import { motion } from 'framer-motion';

const AddWordForm: React.FC = () => {
  const [german, setGerman] = useState('');
  const [italian, setItalian] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addWord } = useWords();
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!german.trim() || !italian.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      addWord(german.trim(), italian.trim());
      setGerman('');
      setItalian('');
      setIsSubmitting(false);
      navigate('/');
    }, 300);
  };
  
  return (
    <motion.div 
      className="w-full max-w-md mx-auto px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="glass-effect rounded-xl p-6 shadow-card">
        <div className="mb-6">
          <label htmlFor="german" className="block text-sm font-medium text-gray-700 mb-1">
            Deutsch
          </label>
          <input
            type="text"
            id="german"
            value={german}
            onChange={(e) => setGerman(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Deutsches Wort eingeben..."
            required
          />
        </div>
        
        <div className="mb-8">
          <label htmlFor="italian" className="block text-sm font-medium text-gray-700 mb-1">
            Italienisch
          </label>
          <input
            type="text"
            id="italian"
            value={italian}
            onChange={(e) => setItalian(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Italienisches Wort eingeben..."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !german.trim() || !italian.trim()}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Hinzufügen...' : 'Wort hinzufügen'}
        </button>
      </form>
    </motion.div>
  );
};

export default AddWordForm;
