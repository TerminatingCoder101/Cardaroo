import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { FlashcardSet } from '@/types';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';

const StudyPage = () => {
  const { setId } = useParams<{ setId: string }>();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedSets: FlashcardSet[] = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
    const currentSet = savedSets.find(s => s.id === setId);
    if (currentSet) {
      setSet(currentSet);
    }
  }, [setId]);

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % (set?.cards.length || 1));
    }, 150); 
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + (set?.cards.length || 1)) % (set?.cards.length || 1));
    }, 150);
  };

  const handleReset = () => {
    setIsFlipped(false);
    setCurrentCardIndex(0);
  };

  if (!set) {
    return <div>Loading...</div>;
  }

  const currentCard = set.cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{set.title}</h1>
              <p className="text-gray-600">{set.description}</p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sets
            </Button>
          </div>

          {/* Flashcard */}
          <div 
            className="perspective-1000 w-full h-64 sm:h-80 md:h-96"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div 
              className={cn(
                "relative w-full h-full transform-style-preserve-3d transition-transform duration-700",
                isFlipped && "rotate-y-180"
              )}
            >
              {/* Front of Card */}
              <div className="absolute w-full h-full backface-hidden">
                <Card className="w-full h-full flex items-center justify-center p-6 text-center bg-white shadow-xl">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-semibold">{currentCard.front}</p>
                </Card>
              </div>
              {/* Back of Card */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180">
                <Card className="w-full h-full flex items-center justify-center p-6 text-center bg-slate-800 text-white shadow-xl">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-semibold">{currentCard.back}</p>
                </Card>
              </div>
            </div>
          </div>

          {/* Progress and Controls */}
          <div className="mt-6 text-center text-gray-600">
            <p>Card {currentCardIndex + 1} of {set.cards.length}</p>
          </div>

          <div className="mt-4 flex justify-center items-center space-x-4">
            <Button onClick={handlePrevCard} variant="outline" size="lg">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button onClick={handleNextCard} variant="outline" size="lg">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
