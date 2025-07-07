import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2, Sparkles, Trophy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { FlashcardSet } from './Index'; // Adjust path if needed
import { cn } from '@/lib/utils';

// Define the structure for a single AI-generated question
interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

const PracticeTestPage = () => {
  const [allSets, setAllSets] = useState<FlashcardSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [testState, setTestState] = useState<'selecting' | 'generating' | 'taking' | 'results'>('selecting');
  const [numQuestions, setNumQuestions] = useState(5); // 1. State for number of questions
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Load all study sets from local storage when the page loads
  useEffect(() => {
    const savedSets = localStorage.getItem('flashcardSets');
    if (savedSets) {
      setAllSets(JSON.parse(savedSets));
    }
  }, []);

  const handleGenerateTest = async () => {
    if (!selectedSet) return;
    setTestState('generating');

    // 2. Use the numQuestions state in the prompt
    const prompt = `
      Based on the following flashcard set titled "${selectedSet.title}", create a multiple-choice practice test with ${numQuestions} questions.
      Each question must test a concept from the flashcards.
      For each question, provide 4 options, one of which is the correct answer.
        No tricky questions. 
      Flashcard Content:
      ${selectedSet.cards.map(card => `- ${card.front}: ${card.back}`).join('\n')}

      Return the test as a JSON array of objects. Each object must have a "question", an "options" array of 4 strings, and a "correctAnswer" string.
      Example: [{"question": "What is the capital of France?", "options": ["London", "Berlin", "Paris", "Madrid"], "correctAnswer": "Paris"}]
    `;

    try {
      if (!apiKey) {
        alert("API Key not found. Please make sure you have set it up correctly in your .env file with the 'VITE_' prefix and have restarted the development server.");
        setTestState('selecting');
        return;
      }

      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "question": { "type": "STRING" },
                "options": { "type": "ARRAY", "items": { "type": "STRING" } },
                "correctAnswer": { "type": "STRING" }
              },
              required: ["question", "options", "correctAnswer"]
            }
          }
        }
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
      
      const result = await response.json();
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        const parsedQuestions = JSON.parse(result.candidates[0].content.parts[0].text);
        setTestQuestions(parsedQuestions);
        setTestState('taking');
      } else {
        throw new Error("Failed to parse AI response.");
      }
    } catch (error) {
      console.error("Error generating test:", error);
      alert("There was an error generating the test. Please check your API key and try again.");
      setTestState('selecting');
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = testQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // Update the question with the user's answer and result
    const updatedQuestions = [...testQuestions];
    updatedQuestions[currentQuestionIndex] = { ...currentQuestion, userAnswer: selectedAnswer, isCorrect };
    setTestQuestions(updatedQuestions);

    // Move to the next question or to the results page
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestionIndex < testQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setTestState('results');
      }
    }, 1000); // Wait 1 second to show feedback
  };

  const score = testQuestions.filter(q => q.isCorrect).length;

  // Renders the main content based on the current testState
  const renderContent = () => {
    switch (testState) {
      case 'selecting': {
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Select a Study Set</CardTitle>
              <CardDescription>Choose which set you'd like to be tested on and how many questions you want.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Select a Set</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allSets.map(set => (
                    <Button 
                      key={set.id} 
                      variant={selectedSet?.id === set.id ? "default" : "outline"}
                      onClick={() => setSelectedSet(set)}
                      className="h-auto py-4"
                    >
                      {set.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* 3. Add the number input to the UI */}
              <div className="space-y-2">
                <label htmlFor="num-questions" className="text-lg font-medium">2. Number of Questions</label>
                <Input
                  id="num-questions"
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="max-w-[100px]"
                  min="1"
                  max="20"
                />
              </div>

              <Button onClick={handleGenerateTest} disabled={!selectedSet} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Practice Test
              </Button>
            </CardContent>
          </Card>
        );
      }
      
      case 'generating': {
        return (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
            <p className="mt-4 text-lg text-gray-700">Generating your test with AI...</p>
          </div>
        );
      }

      case 'taking': {
        const question = testQuestions[currentQuestionIndex];
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Question {currentQuestionIndex + 1} of {testQuestions.length}</CardTitle>
              <CardDescription>{question.question}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAnswer ?? undefined} onValueChange={setSelectedAnswer}>
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = question.correctAnswer === option;
                  const wasAnswered = question.userAnswer !== undefined;

                  return (
                    <div key={index} className={cn(
                      "flex items-center space-x-2 p-3 rounded-md border transition-all",
                      wasAnswered && isCorrect && "bg-green-100 border-green-400",
                      wasAnswered && !isCorrect && isSelected && "bg-red-100 border-red-400"
                    )}>
                      <RadioGroupItem value={option} id={`option-${index}`} disabled={wasAnswered} />
                      <label htmlFor={`option-${index}`} className="flex-1">{option}</label>
                    </div>
                  );
                })}
              </RadioGroup>
              <Button onClick={handleAnswerSubmit} disabled={selectedAnswer === null || question.userAnswer !== undefined} className="w-full mt-6">
                Submit Answer
              </Button>
            </CardContent>
          </Card>
        );
      }

      case 'results': {
        return (
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
              <CardTitle className="text-3xl">Test Complete!</CardTitle>
              <CardDescription className="text-xl">You scored</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-6xl font-bold mb-4">{score} / {testQuestions.length}</p>
              <div className="space-y-4 text-left">
                {testQuestions.map((q, i) => (
                  <div key={i} className="p-3 border rounded-md">
                    <p className="font-semibold">{i + 1}. {q.question}</p>
                    <p className={cn("mt-1", q.isCorrect ? 'text-green-600' : 'text-red-600')}>
                      {q.isCorrect ? <Check className="inline-block mr-2 h-4 w-4"/> : <X className="inline-block mr-2 h-4 w-4"/>}
                      Your answer: {q.userAnswer}
                    </p>
                    {!q.isCorrect && <p className="mt-1 text-gray-600">Correct answer: {q.correctAnswer}</p>}
                  </div>
                ))}
              </div>
              <Button onClick={() => setTestState('selecting')} className="w-full mt-6">
                Take Another Test
              </Button>
            </CardContent>
          </Card>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold font-heading text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            AI Practice Test
          </h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default PracticeTestPage;
