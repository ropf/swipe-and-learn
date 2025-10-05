
import { motion } from 'framer-motion';
import Header from '../components/Header';
import CardDeck from '../components/CardDeck';
import SearchInput from '../components/SearchInput';
import WordsList from '../components/WordsList';
import { useWords } from '../context/WordsContext';

const Index = () => {
  const { isSearchActive, filteredWords, searchQuery } = useWords();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <motion.main 
        className="flex-1 flex flex-col items-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Search Input */}
          <div className="flex justify-center">
            <SearchInput />
          </div>

          {/* Content */}
          {isSearchActive ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">
                Suchergebnisse ({filteredWords.length})
              </h2>
              <WordsList words={filteredWords} searchQuery={searchQuery} />
            </div>
          ) : (
            <div className="flex justify-center">
              <CardDeck />
            </div>
          )}
        </div>
      </motion.main>
      
      <footer className="py-4 text-center text-gray-400 text-sm">
        {!isSearchActive && (
          <p>Wische nach links wenn du das Wort nicht kennst, nach rechts wenn du es weißt.</p>
        )}
      </footer>
    </div>
  );
};

export default Index;
