import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FlashcardSet } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface EditSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSet: (updatedSet: FlashcardSet) => void;
  set: FlashcardSet | null;
}

const EditSetModal: React.FC<EditSetModalProps> = ({ isOpen, onClose, onUpdateSet, set }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<{ id: string; front: string; back: string }[]>([]);

  useEffect(() => {
    // When the 'set' prop changes (i.e., when the modal is opened for a specific set),
    // populate the form with that set's data.
    if (set) {
      setTitle(set.title);
      setDescription(set.description);
      setCards(set.cards);
    }
  }, [set]);

  const handleCardChange = (index: number, field: 'front' | 'back', value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleAddCard = () => {
    setCards([...cards, { id: Date.now().toString(), front: '', back: '' }]);
  };

  const handleRemoveCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
  };

  const handleSubmit = () => {
    if (!set) return;

    const updatedSet: FlashcardSet = {
      ...set,
      title,
      description,
      cards,
    };
    onUpdateSet(updatedSet);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Study Set</DialogTitle>
          <DialogDescription>
            Modify the details of your study set below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-3">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title">Title *</label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Flashcards</h4>
              {cards.map((card, index) => (
                <div key={card.id || index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-center text-gray-500">{index + 1}</div>
                  <div className="col-span-5">
                    <Input placeholder="Front" value={card.front} onChange={(e) => handleCardChange(index, 'front', e.target.value)} />
                  </div>
                  <div className="col-span-5">
                    <Input placeholder="Back" value={card.back} onChange={(e) => handleCardChange(index, 'back', e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCard(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddCard} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Card
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSetModal;
