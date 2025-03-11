
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useWords } from '../context/WordsContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { progress } = useWords();
  const isHome = location.pathname === '/';
  
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between z-10">
      <div className="flex items-center">
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Zurück"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-xl font-semibold tracking-tight">
          {isHome ? 'Vokabelkarten' : 'Neues Wort hinzufügen'}
        </h1>
      </div>
      
      {isHome && (
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center">
            <span className="text-sm text-gray-500 mr-2">Fortschritt</span>
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full progress-bar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="ml-2 text-sm font-medium">{progress}%</span>
          </div>
          
          <button
            onClick={() => navigate('/add')}
            className="p-2 rounded-full bg-primary text-white shadow-sm hover:shadow-md transition-shadow"
            aria-label="Neues Wort hinzufügen"
          >
            <Plus size={20} />
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
