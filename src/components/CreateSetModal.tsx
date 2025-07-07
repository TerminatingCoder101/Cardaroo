
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from 'lucide-react';
import { FlashcardSet } from '@/types';

interface CreateSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSet: (set: Omit<FlashcardSet, 'id' | 'createdAt'>) => void;
}

interface Card {
  id: string;
  front: string;
  back: string;
}

const CreateSetModal = ({ isOpen, onClose, onCreateSet }: CreateSetModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<Card[]>([
    { id: '1', front: '', back: '' },
    { id: '2', front: '', back: '' }
  ]);

  const handleAddCard = () => {
    const newCard: Card = {
      id: Date.now().toString(),
      front: '',
      back: ''
    };
    setCards([...cards, newCard]);
  };

  const handleRemoveCard = (cardId: string) => {
    if (cards.length > 2) {
      setCards(cards.filter(card => card.id !== cardId));
    }
  };

  const handleCardChange = (cardId: string, field: 'front' | 'back', value: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    const validCards = cards.filter(card => card.front.trim() && card.back.trim());
    if (validCards.length === 0) return;

    onCreateSet({
      title: title.trim(),
      description: description.trim(),
      cards: validCards
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCards([
      { id: '1', front: '', back: '' },
      { id: '2', front: '', back: '' }
    ]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Create New Study Set</DialogTitle>
          <DialogDescription className="text-gray-600">
            Add a title, description, and flashcards to create your study set.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-900">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter a title for your study set"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-900">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900">
                Flashcards
              </Label>
              <Button
                type="button"
                onClick={handleAddCard}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Card
              </Button>
            </div>

            {cards.map((card, index) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Card {index + 1}</span>
                  {cards.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCard(card.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Front</Label>
                    <Textarea
                      placeholder="Enter front side"
                      value={card.front}
                      onChange={(e) => handleCardChange(card.id, 'front', e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none bg-white"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Back</Label>
                    <Textarea
                      placeholder="Enter back side"
                      value={card.back}
                      onChange={(e) => handleCardChange(card.id, 'back', e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none bg-white"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim() || cards.filter(card => card.front.trim() && card.back.trim()).length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Create Study Set
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSetModal;

