import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2, Sparkles, Trophy, History } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { FlashcardSet } from './Index'; 
import { cn } from '@/lib/utils';

type TestType = 'multiple-choice' | 'fill-in-the-blank' | 'true-false';

interface TestQuestion {
  type: TestType;
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}


export interface TestResult {
  setName: string;
  score: number;
  totalQuestions: number;
  date: string;
}

const PracticeTestPage = () => {
  const [allSets, setAllSets] = useState<FlashcardSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [testState, setTestState] = useState<'selecting' | 'generating' | 'taking' | 'results'>('selecting');
  const [numQuestions, setNumQuestions] = useState(5);
  const [testType, setTestType] = useState<TestType>('multiple-choice');
  const [previousTests, setPreviousTests] = useState<TestResult[]>([]);
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    const savedSets = localStorage.getItem('flashcardSets');
    if (savedSets) {
      setAllSets(JSON.parse(savedSets));
    }
    const savedResults = localStorage.getItem('practiceTestResults');
    if (savedResults) {
      setPreviousTests(JSON.parse(savedResults));
    }
  }, []);

  const handleGenerateTest = async () => {
    if (!selectedSet) return;
    setTestState('generating');

    let prompt = '';
    let responseSchema = {};

    switch (testType) {
      case 'fill-in-the-blank':
        prompt = `Based on the following flashcard set titled "${selectedSet.title}", create a fill-in-the-blank practice test with ${numQuestions} questions. Each question should have a single blank represented by "____". Return the test as a JSON array of objects. Each object must have a "question" string and a "correctAnswer" string for the word that fills the blank.`;
        responseSchema = { type: "ARRAY", items: { type: "OBJECT", properties: { "question": { "type": "STRING" }, "correctAnswer": { "type": "STRING" } }, required: ["question", "correctAnswer"] } };
        break;
      case 'true-false':
        prompt = `Based on the following flashcard set titled "${selectedSet.title}", create a true/false practice test with ${numQuestions} questions. Return the test as a JSON array of objects. Each object must have a "question" string (the statement) and a "correctAnswer" string (either "True" or "False").`;
        responseSchema = { type: "ARRAY", items: { type: "OBJECT", properties: { "question": { "type": "STRING" }, "correctAnswer": { "type": "STRING" } }, required: ["question", "correctAnswer"] } };
        break;
      default: // multiple-choice
        prompt = `Based on the following flashcard set titled "${selectedSet.title}", create a multiple-choice practice test with ${numQuestions} questions. Each question must test a concept from the flashcards. For each question, provide 4 options, one of which is the correct answer. Return the test as a JSON array of objects. Each object must have a "question", an "options" array of 4 strings, and a "correctAnswer" string.`;
        responseSchema = { type: "ARRAY", items: { type: "OBJECT", properties: { "question": { "type": "STRING" }, "options": { "type": "ARRAY", "items": { "type": "STRING" } }, "correctAnswer": { "type": "STRING" } }, required: ["question", "options", "correctAnswer"] } };
        break;
    }
    
    prompt += `\n\nFlashcard Content:\n${selectedSet.cards.map(card => `- ${card.front}: ${card.back}`).join('\n')}`;

    try {
      if (!apiKey) {
        alert("API Key not found. Please make sure you have set it up correctly in your .env file with the 'VITE_' prefix and have restarted the development server.");
        setTestState('selecting');
        return;
      }

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema }
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
        // This line is corrected to specify the type of 'q'
        const questionsWithType = parsedQuestions.map((q: Omit<TestQuestion, 'type'>) => ({ ...q, type: testType }));
        setTestQuestions(questionsWithType);
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
    let isCorrect = false;
    if (currentQuestion.type === 'fill-in-the-blank') {
        isCorrect = selectedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    } else {
        isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    }

    const updatedQuestions = [...testQuestions];
    updatedQuestions[currentQuestionIndex] = { ...currentQuestion, userAnswer: selectedAnswer, isCorrect };
    setTestQuestions(updatedQuestions);

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestionIndex < testQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const finalScore = updatedQuestions.filter(q => q.isCorrect).length;
        const newResult: TestResult = {
          setName: selectedSet!.title,
          score: finalScore,
          totalQuestions: updatedQuestions.length,
          date: new Date().toLocaleDateString(),
        };
        const updatedResults = [newResult, ...previousTests];
        setPreviousTests(updatedResults);
        localStorage.setItem('practiceTestResults', JSON.stringify(updatedResults));
        
        localStorage.setItem('lastStudiedDate', new Date().toISOString().split('T')[0]);

        setTestState('results');
      }
    }, 1000);
  };

  const score = testQuestions.filter(q => q.isCorrect).length;

  const renderContent = () => {
    switch (testState) {
      case 'selecting': {
        return (
          <>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Create a Practice Test</CardTitle>
                <CardDescription>Customize your test below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-3">1. Select a Set</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allSets.map(set => (
                      <Button key={set.id} variant={selectedSet?.id === set.id ? "default" : "outline"} onClick={() => setSelectedSet(set)} className="h-auto py-4">{set.title}</Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="num-questions" className="text-lg font-medium">2. Number of Questions</label>
                  <Input id="num-questions" type="number" value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))} className="max-w-[100px]" min="1" max="20" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium">3. Test Type</h3>
                  <div className="flex space-x-2">
                    <Button variant={testType === 'multiple-choice' ? 'default' : 'outline'} onClick={() => setTestType('multiple-choice')}>Multiple Choice</Button>
                    <Button variant={testType === 'fill-in-the-blank' ? 'default' : 'outline'} onClick={() => setTestType('fill-in-the-blank')}>Fill-in-the-Blank</Button>
                    <Button variant={testType === 'true-false' ? 'default' : 'outline'} onClick={() => setTestType('true-false')}>True/False</Button>
                  </div>
                </div>

                <Button onClick={handleGenerateTest} disabled={!selectedSet} className="w-full !mt-8" size="lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Practice Test
                </Button>
              </CardContent>
            </Card>

            {previousTests.length > 0 && (
              <div className="max-w-4xl mx-auto mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center"><History className="mr-2 h-6 w-6" />Previous Tests</h2>
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6 space-y-3">
                    {previousTests.slice(0, 5).map((result, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-semibold">{result.setName}</p>
                          <p className="text-sm text-gray-500">Taken on {result.date}</p>
                        </div>
                        <p className="font-bold text-lg">{result.score} / {result.totalQuestions}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        );
      }
      
      case 'generating': {
        return (
          <div className="text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" /><p className="mt-4 text-lg text-gray-700">Generating your test with AI...</p></div>
        );
      }

      case 'taking': {
        const question = testQuestions[currentQuestionIndex];
        const wasAnswered = question.userAnswer !== undefined;
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Question {currentQuestionIndex + 1} of {testQuestions.length}</CardTitle>
              <CardDescription className="text-lg pt-2">{question.question.replace('____', '______')}</CardDescription>
            </CardHeader>
            <CardContent>
              {question.type === 'multiple-choice' && (
                <RadioGroup value={selectedAnswer ?? undefined} onValueChange={setSelectedAnswer} disabled={wasAnswered}>
                  {question.options?.map((option, index) => (
                    <div key={index} className={cn("flex items-center space-x-2 p-3 rounded-md border transition-all", wasAnswered && question.correctAnswer === option && "bg-green-100 border-green-400", wasAnswered && selectedAnswer === option && selectedAnswer !== question.correctAnswer && "bg-red-100 border-red-400")}>
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <label htmlFor={`option-${index}`} className="flex-1">{option}</label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {question.type === 'fill-in-the-blank' && (
                <Input placeholder="Type your answer..." value={selectedAnswer || ''} onChange={(e) => setSelectedAnswer(e.target.value)} disabled={wasAnswered} />
              )}
              {question.type === 'true-false' && (
                <div className="flex space-x-4">
                  <Button onClick={() => setSelectedAnswer('True')} variant={selectedAnswer === 'True' ? 'default' : 'outline'} className="flex-1" disabled={wasAnswered}>True</Button>
                  <Button onClick={() => setSelectedAnswer('False')} variant={selectedAnswer === 'False' ? 'default' : 'outline'} className="flex-1" disabled={wasAnswered}>False</Button>
                </div>
              )}
              <Button onClick={handleAnswerSubmit} disabled={selectedAnswer === null || wasAnswered} className="w-full mt-6">Submit Answer</Button>
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
                    <p className={cn("mt-1", q.isCorrect ? 'text-green-600' : 'text-red-600')}>{q.isCorrect ? <Check className="inline-block mr-2 h-4 w-4"/> : <X className="inline-block mr-2 h-4 w-4"/>}Your answer: {q.userAnswer}</p>
                    {!q.isCorrect && <p className="mt-1 text-gray-600">Correct answer: {q.correctAnswer}</p>}
                  </div>
                ))}
              </div>
              <Button onClick={() => { setCurrentQuestionIndex(0); setTestState('selecting'); }} className="w-full mt-6">Take Another Test</Button>
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
          <h1 className="text-5xl font-bold font-heading text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">AI Practice Test</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default PracticeTestPage;
