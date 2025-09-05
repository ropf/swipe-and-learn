import React, { useState } from 'react';
import { Word } from '../data/words';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useWords } from '../context/WordsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface WordsListProps {
  words: Word[];
  searchQuery: string;
}

const WordsList: React.FC<WordsListProps> = ({ words, searchQuery }) => {
  const { editWord, deleteWord } = useWords();
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [deleteWordId, setDeleteWordId] = useState<string | null>(null);
  const [editGerman, setEditGerman] = useState('');
  const [editItalian, setEditItalian] = useState('');

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleEditClick = (word: Word) => {
    setEditingWord(word);
    setEditGerman(word.german);
    setEditItalian(word.italian);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWord) return;

    try {
      await editWord(editingWord.id, editGerman, editItalian);
      setEditingWord(null);
      setEditGerman('');
      setEditItalian('');
    } catch (error) {
      toast.error('Fehler beim Bearbeiten des Wortes');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteWordId) return;

    try {
      await deleteWord(deleteWordId);
      setDeleteWordId(null);
    } catch (error) {
      toast.error('Fehler beim Löschen des Wortes');
    }
  };

  if (words.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Keine Wörter gefunden.</p>
        <p className="text-sm text-gray-400 mt-1">
          Versuche eine andere Suche oder füge neue Wörter hinzu.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {words.map((word) => (
          <Card key={word.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {highlightText(word.german, searchQuery)}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {highlightText(word.italian, searchQuery)}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Level {word.level}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(word)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteWordId(word.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingWord} onOpenChange={() => setEditingWord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wort bearbeiten</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="german">Deutsch</Label>
              <Input
                id="german"
                value={editGerman}
                onChange={(e) => setEditGerman(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="italian">Italienisch</Label>
              <Input
                id="italian"
                value={editItalian}
                onChange={(e) => setEditItalian(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingWord(null)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteWordId} onOpenChange={() => setDeleteWordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wort löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du dieses Wort löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WordsList;