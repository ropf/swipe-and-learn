
import React, { useState, useCallback } from 'react';
import { useWords } from '../context/WordsContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const ImportWordsForm: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { importWordsFromText } = useWords();

  const processFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          toast.error('Die Datei konnte nicht gelesen werden.');
          return;
        }

        // Process the file content
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const wordPairs: { german: string; italian: string }[] = [];
        
        let invalidLines = 0;
        
        lines.forEach(line => {
          const parts = line.split(':');
          if (parts.length === 2) {
            const german = parts[0].trim();
            const italian = parts[1].trim();
            
            if (german && italian) {
              wordPairs.push({ german, italian });
            } else {
              invalidLines++;
            }
          } else {
            invalidLines++;
          }
        });
        
        if (wordPairs.length > 0) {
          await importWordsFromText(wordPairs);
          toast.success(`${wordPairs.length} Wörter wurden importiert.`);
          
          if (invalidLines > 0) {
            toast.warning(`${invalidLines} ungültige Zeilen wurden übersprungen.`);
          }
        } else {
          toast.error('Keine gültigen Wörter gefunden. Das Format sollte "deutsches Wort:italienisches Wort" sein.');
        }
      } catch (error) {
        console.error('Error importing words:', error);
        toast.error('Fehler beim Importieren der Wörter.');
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      toast.error('Fehler beim Lesen der Datei.');
      setIsUploading(false);
    };
    
    reader.readAsText(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        processFile(file);
      } else {
        toast.error('Bitte nur .txt Dateien hochladen');
      }
    }
  }, []);

  return (
    <motion.div
      className="mb-8 w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="glass-effect rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-medium mb-4">Wörter importieren</h2>
        <p className="text-sm text-gray-600 mb-4">
          Laden Sie eine Textdatei mit Wörtern hoch. Jede Zeile sollte im Format "deutsches Wort:italienisches Wort" sein.
        </p>
        
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'} rounded-lg cursor-pointer hover:bg-gray-100 transition-colors`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className={`w-8 h-8 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Klicken Sie zum Hochladen</span> oder ziehen Sie eine Datei hierher
              </p>
              <p className="text-xs text-gray-500">.txt Dateien</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        
        {isUploading && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Wörter werden importiert...
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ImportWordsForm;
