
import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Word } from '../data/words';
import { CheckCircle, XCircle } from 'lucide-react';

interface FlashCardProps {
  word: Word;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ word, onSwipeLeft, onSwipeRight }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
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

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Reset position when word changes
  useEffect(() => {
    x.set(0);
    setIsFlipped(false);
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
    </div>
  );
};

export default FlashCard;
