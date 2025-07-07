import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Brain, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CreateSetModal from '@/components/CreateSetModal';
import StudySetCard from '@/components/StudySetCard';
import EditSetModal from '@/components/EditSetModal';
import { allAchievements } from '@/lib/achievements';
import { FlashcardSet, TestResult } from '@/types'; // Import from the new types file

const Index = () => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [setBeingEdited, setSetBeingEdited] = useState<FlashcardSet | null>(null);
  const [hasNewAchievement, setHasNewAchievement] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedSets: FlashcardSet[] = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
    setSets(savedSets);
    
    // Check for new achievements
    const tests: TestResult[] = JSON.parse(localStorage.getItem('practiceTestResults') || '[]');
    const currentUnlocked = allAchievements.filter(ach => ach.isUnlocked(savedSets, tests)).length;
    const seenCount = parseInt(localStorage.getItem('seenAchievementsCount') || '0', 10);

    if (currentUnlocked > seenCount) {
      setHasNewAchievement(true);
    }

  }, []);

  const handleCreateSet = (newSet: Omit<FlashcardSet, 'id' | 'createdAt'>) => {
    const set: FlashcardSet = {
      ...newSet,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      cards: newSet.cards || [],
    };
    const updatedSets = [...sets, set];
    setSets(updatedSets);
    localStorage.setItem('flashcardSets', JSON.stringify(updatedSets));
    setIsCreateModalOpen(false);
  };

  const handleDeleteSet = (setId: string) => {
    const updatedSets = sets.filter(set => set.id !== setId);
    setSets(updatedSets);
    localStorage.setItem('flashcardSets', JSON.stringify(updatedSets));
  };

  const handleRenameSet = (setId: string) => {
    const newSetName = prompt("Enter the new name for the set:");
    if (newSetName && newSetName.trim() !== "") {
      const updatedSets = sets.map(set => {
        if (set.id === setId) {
          return { ...set, title: newSetName.trim() };
        }
        return set;
      });
      setSets(updatedSets);
      localStorage.setItem('flashcardSets', JSON.stringify(updatedSets));
    } 
  };

  const handleOpenEditModal = (set: FlashcardSet) => {
    setSetBeingEdited(set);
    setIsEditModalOpen(true);
  };

  const handleUpdateSet = (updatedSet: FlashcardSet) => {
    const updatedSets = sets.map(set => 
      set.id === updatedSet.id ? updatedSet : set
    );
    setSets(updatedSets);
    localStorage.setItem('flashcardSets', JSON.stringify(updatedSets));
    setIsEditModalOpen(false);
    setSetBeingEdited(null);
  };

  const filteredSets = sets.filter(set =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} hasNewAchievement={hasNewAchievement} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-gray-900 mb-4 bg-gradient-to-r from-blue-800 to-purple-600 bg-clip-text text-transparent">
            Master Any Subject
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create flashcards, study smarter, and achieve your learning goals with our intuitive study platform.
          </p>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-purple-700 hover:to-purple-500 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Set
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{sets.length}</h3>
              <p className="text-gray-600">Study Sets</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {sets.reduce((total, set) => total + (set.cards?.length || 0), 0)}
              </h3>
              <p className="text-gray-600">Total Cards</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {Math.round(sets.reduce((total, set) => total + (set.studyProgress || 0), 0) / (sets.length || 1))}%
              </h3>
              <p className="text-gray-600">Avg Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Study Sets Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Study Sets</h2>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Set
            </Button>
          </div>
          
          {sets.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No study sets yet</h3>
                <p className="text-gray-600 mb-6">Create your first flashcard set to get started!</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Set
                </Button>
              </CardContent>
            </Card>
          ) : filteredSets.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try a different search term.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSets.map((set, index) => (
                <div key={set.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <StudySetCard 
                    set={set} 
                    onDelete={handleDeleteSet}
                    onStudy={() => navigate(`/study/${set.id}`)}
                    onRename={handleRenameSet}
                    onEdit={handleOpenEditModal}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateSetModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSet={handleCreateSet}
      />

      <EditSetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSetBeingEdited(null);
        }}
        onUpdateSet={handleUpdateSet}
        set={setBeingEdited}
      />
    </div>
  );
};

export default Index;
