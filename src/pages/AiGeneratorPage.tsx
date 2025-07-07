import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Wand2, Loader2, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { FlashcardSet} from '@/types';


const AiGeneratorPage = () => {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<{ front: string; back: string }[]>([]);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Helper function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  };

  const handleGenerate = async () => {
    if (!topic && !notes && !file) {
      alert("Please provide a topic, notes, or a file to generate flashcards.");
      return;
    }

    setIsLoading(true);
    setGeneratedCards([]);

    try {
      let fileContent = '';
      if (file) {
        fileContent = await readFileContent(file);
      }

      const prompt = `
        Based on the following information, generate a set of flashcards. Each flashcard should be a distinct concept.
        The topic is: "${topic}".
        Things to take into consideration: "${notes}".
        Content from uploaded file: "${fileContent}".

        Return the flashcards as a JSON array of objects, where each object has a "front" and a "back" key.
        Example: [{"front": "What is the capital of France?", "back": "Paris"}]
      `;

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
                          "front": { "type": "STRING" },
                          "back": { "type": "STRING" }
                      },
                      required: ["front", "back"]
                  }
              }
          }
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();

      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        const parsedCards = JSON.parse(result.candidates[0].content.parts[0].text);
        setGeneratedCards(parsedCards);
      } else {
        throw new Error("Failed to parse AI response.");
      }

    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("There was an error generating the flashcards. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSet = () => {
    if (generatedCards.length === 0) return;

    const newSet: FlashcardSet = {
      id: Date.now().toString(),
      title: topic || 'AI Generated Set',
      description: `Generated on ${new Date().toLocaleDateString()}`,
      cards: generatedCards.map((card, index) => ({ ...card, id: index.toString() })),
      createdAt: new Date().toISOString(),
    };

    // Retrieve existing sets, add the new one, and save back to localStorage
    const savedSets = localStorage.getItem('flashcardSets');
    const sets = savedSets ? JSON.parse(savedSets) : [];
    const updatedSets = [...sets, newSet];
    localStorage.setItem('flashcardSets', JSON.stringify(updatedSets));

    alert("Set saved successfully!");
    navigate('/'); // Navigate back to the homepage
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold font-heading text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            AI Flashcard Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Let AI do the heavy lifting. Provide a topic, upload your notes, or paste them in to instantly create a new study set.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Create with AI</CardTitle>
            <CardDescription>Enter the details below to generate your flashcards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="topic" className="font-medium">Topic *</label>
              <Input 
                id="topic" 
                placeholder="e.g., 'Cellular Biology', 'World War II', 'React Hooks'"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="font-medium">Paste Notes (Optional)</label>
              <Textarea 
                id="notes" 
                placeholder="Or paste your lecture notes, article text, or any relevant information here..." 
                className="min-h-[150px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="file-upload" className="font-medium">Upload File (Optional)</label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">TXT, MD, or other text files</p>
                  </div>
                  <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              {file && <p className="text-sm text-gray-600 mt-2">Selected file: {file.name}</p>}
            </div>

            <Button onClick={handleGenerate} size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              Generate Flashcards
            </Button>
          </CardContent>
        </Card>
        
        {generatedCards.length > 0 && (
          <Card className="max-w-4xl mx-auto mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Generated Cards</CardTitle>
                <CardDescription>Review the cards below and save them to a new set.</CardDescription>
              </div>
              <Button onClick={handleSaveSet}>
                <Save className="mr-2 h-4 w-4" />
                Save and Add to My Sets
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {generatedCards.map((card, index) => (
                <div key={index} className="p-3 border rounded-md bg-gray-50 grid grid-cols-2 gap-4">
                  <p><span className="font-semibold">Front:</span> {card.front}</p>
                  <p><span className="font-semibold">Back:</span> {card.back}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AiGeneratorPage;
