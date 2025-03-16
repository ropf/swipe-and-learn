
import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Word } from '../data/words';
import { CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';
import { useWords } from '../context/WordsContext';

interface FlashCardProps {
  word: Word;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ word, onSwipeLeft, onSwipeRight }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [germanEdit, setGermanEdit] = useState(word.german);
  const [italianEdit, setItalianEdit] = useState(word.italian);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { editWord, deleteWord } = useWords();
  
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);

  // Color indicators for swipe direction
  const leftIndicatorOpacity = useTransform(x, [-150, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 150], [0, 1]);
  
  const handleDragEnd = (e: any, { offset }: any) => {
    if (offset.x < -100) {
      setDirection('left');
      setTimeout(() => {
        onSwipeLeft();
        setDirection(null);
        setIsFlipped(false);
      }, 300);
    } else if (offset.x > 100) {
      setDirection('right');
      setTimeout(() => {
        onSwipeRight();
        setDirection(null);
        setIsFlipped(false);
      }, 300);
    }
  };

  // Edit and Delete button handlers
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking the edit button
    setGermanEdit(word.german);
    setItalianEdit(word.italian);
    setShowEditModal(true);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking the delete button
    setShowDeleteModal(true);
  };
  
  // Edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!germanEdit.trim() || !italianEdit.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await editWord(word.id, germanEdit.trim(), italianEdit.trim());
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to edit word:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete confirmation
  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    
    try {
      await deleteWord(word.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete word:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Reset position when word changes
  useEffect(() => {
    x.set(0);
    setIsFlipped(false);
    setGermanEdit(word.german);
    setItalianEdit(word.italian);
  }, [word, x]);

  return (
    <div className="relative w-full max-w-md mx-auto h-96 card-container">
      <AnimatePresence mode="wait">
        <motion.div
          ref={cardRef}
          className={`absolute inset-0 rounded-2xl shadow-card card-drag 
                      ${isFlipped ? 'card-flipped' : ''} 
                      ${direction ? `animate-slide-out-${direction}` : ''}`}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate, opacity }}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: "grabbing" }}
          key={word.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Card Front (German) */}
          <div 
            className="card-content card-front absolute inset-0 rounded-2xl bg-white p-8 flex flex-col items-center justify-center"
            onClick={flipCard}
          >
            <div className="text-sm font-medium text-blue-600 mb-2 tracking-wide">DEUTSCH</div>
            <div className="text-4xl font-semibold mb-8 text-center">{word.german}</div>
            <div className="text-gray-400 text-sm">Tippen zum Umdrehen</div>
            
            {/* Control buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={handleEditClick}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Edit word"
              >
                <Pencil size={16} className="text-gray-600" />
              </button>
              <button 
                onClick={handleDeleteClick}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Delete word"
              >
                <Trash2 size={16} className="text-gray-600" />
              </button>
            </div>
            
            {/* Level indicator */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i < word.level ? 'bg-blue-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Card Back (Italian) */}
          <div 
            className="card-content card-back absolute inset-0 rounded-2xl bg-white p-8 flex flex-col items-center justify-center"
            onClick={flipCard}
          >
            <div className="text-sm font-medium text-green-600 mb-2 tracking-wide">ITALIANO</div>
            <div className="text-4xl font-semibold mb-8 text-center">{word.italian}</div>
            <div className="text-gray-400 text-sm">Tippen zum Umdrehen</div>
            
            {/* Control buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={handleEditClick}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Edit word"
              >
                <Pencil size={16} className="text-gray-600" />
              </button>
              <button 
                onClick={handleDeleteClick}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Delete word"
              >
                <Trash2 size={16} className="text-gray-600" />
              </button>
            </div>
            
            {/* Level indicator */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i < word.level ? 'bg-blue-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Swipe indicators */}
      <motion.div 
        className="absolute top-1/2 left-6 -translate-y-1/2 text-red-500"
        style={{ opacity: leftIndicatorOpacity }}
      >
        <XCircle size={40} />
      </motion.div>
      
      <motion.div 
        className="absolute top-1/2 right-6 -translate-y-1/2 text-green-500"
        style={{ opacity: rightIndicatorOpacity }}
      >
        <CheckCircle size={40} />
      </motion.div>
      
      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 pb-4 text-sm text-gray-500">
        <div>Weiß nicht ←</div>
        <div>→ Weiß ich</div>
      </div>
      
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Wort bearbeiten</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="germanEdit" className="block text-sm font-medium text-gray-700 mb-1">
                  Deutsch
                </label>
                <input
                  type="text"
                  id="germanEdit"
                  value={germanEdit}
                  onChange={(e) => setGermanEdit(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="italianEdit" className="block text-sm font-medium text-gray-700 mb-1">
                  Italienisch
                </label>
                <input
                  type="text"
                  id="italianEdit"
                  value={italianEdit}
                  onChange={(e) => setItalianEdit(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  disabled={isSubmitting || !germanEdit.trim() || !italianEdit.trim()}
                >
                  {isSubmitting ? 'Speichern...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Wort löschen</h3>
            <p className="mb-6">
              Möchtest du wirklich das Wort "{word.german}" löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Löschen...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCard;
