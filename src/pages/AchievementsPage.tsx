import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Award, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { allAchievements } from '@/lib/achievements';
import { FlashcardSet, TestResult } from '@/types';

const AchievementsPage = () => {
  const [studyStreak, setStudyStreak] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  
  useEffect(() => {

    const lastStudiedDateStr = localStorage.getItem('lastStudiedDate');
    if (lastStudiedDateStr) {
      const today = new Date();
      const lastStudied = new Date(lastStudiedDateStr);
      const differenceInTime = today.getTime() - lastStudied.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);

      if (differenceInDays <= 1) {
        setStudyStreak(1); 
      }
    }


    const sets: FlashcardSet[] = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
    const tests: TestResult[] = JSON.parse(localStorage.getItem('practiceTestResults') || '[]');
    
    const currentlyUnlocked = allAchievements.filter(ach => ach.isUnlocked(sets, tests));
    setUnlockedAchievements(currentlyUnlocked.map(ach => ach.id));

    localStorage.setItem('seenAchievementsCount', currentlyUnlocked.length.toString());

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-gray-900 mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Your Progress
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Stay motivated by tracking your study streaks and earning achievements!
          </p>
        </div>

        {/* Study Streak Card */}
        <Card className="max-w-4xl mx-auto mb-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <Flame className="h-12 sm:h-16 w-12 sm:w-16 mx-auto text-orange-500" />
            <CardTitle className="text-2xl sm:text-3xl mt-2">Study Streak</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-5xl sm:text-6xl font-bold">{studyStreak}</p>
            <p className="text-gray-600">day{studyStreak !== 1 && 's'}</p>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="mr-2 h-6 w-6" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAchievements.map(achievement => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              return (
                <Card key={achievement.id} className={cn("bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all", !isUnlocked && "opacity-50")}>
                  <CardContent className="p-6 text-center">
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", isUnlocked ? "bg-green-100" : "bg-gray-100")}>
                      {isUnlocked ? 
                        <CheckCircle2 className="h-8 w-8 text-green-600" /> :
                        <achievement.icon className="h-8 w-8 text-gray-500" />
                      }
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{achievement.name}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
