
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { FlashcardSet, TestResult } from '@/types';
import Navbar from '@/components/Navbar';

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
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 pt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Study set not found</h1>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progress = (studiedCards.size / studySet.cards.length) * 100;
  const accuracy = studiedCards.size > 0 ? (correctCards.size / studiedCards.size) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">      
      <div className="container mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{studySet.title}</h1>
              <p className="text-gray-600">{studySet.description}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="border-gray-300 hover:bg-gray-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progress: {studiedCards.size} / {studySet.cards.length} cards</span>
            <span>Accuracy: {Math.round(accuracy)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-2xl">
            <Card 
              className="h-80 cursor-pointer bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={handleCardFlip}
            >
              <CardContent className="h-full flex items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
                <div className="text-center z-10 w-full">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {isFlipped ? 'Back' : 'Front'}
                    </span>
                  </div>
                  <div className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed">
                    {isFlipped 
                      ? studySet.cards[currentCardIndex].back 
                      : studySet.cards[currentCardIndex].front
                    }
                  </div>
                  <div className="mt-6 text-sm text-gray-500">
                    Click to flip
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Card Navigation */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-lg font-medium text-gray-900 min-w-[100px] text-center">
            {currentCardIndex + 1} / {studySet.cards.length}
          </span>
          
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentCardIndex === studySet.cards.length - 1}
            className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>


        {isFlipped && (
          <div className="flex justify-center space-x-4 animate-fade-in">
            <Button
              onClick={handleDontKnow}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
            >
              <X className="mr-2 h-4 w-4" />
              Don't Know
            </Button>
            <Button
              onClick={handleKnow}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              Know
            </Button>
          </div>
        )}

        {/* Completion Message */}
        {studiedCards.size === studySet.cards.length && (
          <div className="text-center mt-8 animate-fade-in">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Great job!</h2>
                <p className="text-gray-600 mb-4">
                  You've completed the study set with {Math.round(accuracy)}% accuracy.
                </p>
                <div className="flex justify-center space-x-4">
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
  );
};

export default StudyPage;

