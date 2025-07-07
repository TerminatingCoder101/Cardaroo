import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { FlashcardSet } from '@/types';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

const StudyPage = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [studySet, setStudySet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [correctCards, setCorrectCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const savedSets = localStorage.getItem('flashcardSets');
    if (savedSets) {
      const sets: FlashcardSet[] = JSON.parse(savedSets);
      const set = sets.find(s => s.id === setId);
      if (set) {
        setStudySet(set);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [setId, navigate]);

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (studySet && currentCardIndex < studySet.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(currentCardIndex + 1), 150);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(currentCardIndex - 1), 150);
    }
  };

  const handleKnow = () => {
    setStudiedCards(prev => new Set(prev).add(currentCardIndex));
    setCorrectCards(prev => new Set(prev).add(currentCardIndex));
    if (studySet && currentCardIndex < studySet.cards.length - 1) {
      handleNext();
    }
  };

  const handleDontKnow = () => {
    setStudiedCards(prev => new Set(prev).add(currentCardIndex));
    if (studySet && currentCardIndex < studySet.cards.length - 1) {
      handleNext();
    }
  };

  const handleReset = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setCorrectCards(new Set());
  };

  if (!studySet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Study set not found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const progress = (studiedCards.size / studySet.cards.length) * 100;
  const accuracy = studiedCards.size > 0 ? (correctCards.size / studiedCards.size) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-4">
                    <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="border-gray-300 hover:bg-gray-50 flex-shrink-0"
                    >
                    <ArrowLeft className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Back</span>
                    </Button>
                    <div className="text-center sm:text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{studySet.title}</h1>
                        <p className="text-sm sm:text-base text-gray-600">{studySet.description}</p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                </Button>
            </div>

            {/* Progress */}
            <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                    <span>Progress: {studiedCards.size} / {studySet.cards.length}</span>
                    <span>Accuracy: {Math.round(accuracy)}%</span>
                </div>
                <Progress value={progress} className="h-2 sm:h-3" />
            </div>

            {/* Flashcard */}
            <div className="flex justify-center mb-6">
                <div 
                    className="w-full h-64 sm:h-80 md:h-96 cursor-pointer"
                    style={{ perspective: '1000px' }}
                    onClick={handleCardFlip}
                >
                    <div 
                        className={cn(
                            "relative w-full h-full transition-transform duration-500",
                            isFlipped && "rotate-y-180"
                        )}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Front */}
                        <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                            <Card className="h-full bg-white shadow-xl flex items-center justify-center p-4">
                                <div className="text-center">
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full mb-4 inline-block">Front</span>
                                    <p className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed">
                                        {studySet.cards[currentCardIndex].front}
                                    </p>
                                </div>
                            </Card>
                        </div>
                        {/* Back */}
                        <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                             <Card className="h-full bg-slate-800 text-white shadow-xl flex items-center justify-center p-4">
                                <div className="text-center">
                                    <span className="text-xs font-medium text-slate-300 bg-slate-700 px-2 py-1 rounded-full mb-4 inline-block">Back</span>
                                    <p className="text-xl md:text-2xl font-medium leading-relaxed">
                                        {studySet.cards[currentCardIndex].back}
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Navigation */}
            <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentCardIndex === 0}
                className="border-gray-300 hover:bg-gray-50 disabled:opacity-50 h-12 w-12 sm:h-10 sm:w-10"
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <span className="text-base sm:text-lg font-medium text-gray-900 min-w-[80px] text-center">
                {currentCardIndex + 1} / {studySet.cards.length}
            </span>
            
            <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentCardIndex === studySet.cards.length - 1}
                className="border-gray-300 hover:bg-gray-50 disabled:opacity-50 h-12 w-12 sm:h-10 sm:w-10"
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
            </div>


            {isFlipped && (
            <div className="flex justify-center space-x-4 animate-fade-in">
                <Button
                onClick={handleDontKnow}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 flex-1 py-6 text-base"
                >
                <X className="mr-2 h-5 w-5" />
                Don't Know
                </Button>
                <Button
                onClick={handleKnow}
                className="bg-green-600 hover:bg-green-700 text-white flex-1 py-6 text-base"
                >
                <Check className="mr-2 h-5 w-5" />
                Know
                </Button>
            </div>
            )}

            {/* Completion Message */}
            {studiedCards.size === studySet.cards.length && (
            <div className="text-center mt-8 animate-fade-in">
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">🎉 Great job!</h2>
                    <p className="text-gray-600 mb-4">
                    You've completed the study set with {Math.round(accuracy)}% accuracy.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button onClick={handleReset} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Study Again
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/')}>
                        Back to Home
                    </Button>
                    </div>
                </CardContent>
                </Card>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
