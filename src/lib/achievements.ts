import { FlashcardSet } from "@/pages/Index";
import { TestResult } from "@/pages/PracticeTestPage";
import { Book, PlusCircle, BrainCircuit, Target, Trophy, LucideIcon } from "lucide-react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isUnlocked: (sets: FlashcardSet[], tests: TestResult[]) => boolean;
}

export const allAchievements: Achievement[] = [
  {
    id: 'first-set',
    name: 'Getting Started',
    description: 'Create your first study set.',
    icon: PlusCircle,
    isUnlocked: (sets) => sets.length >= 1,
  },
  {
    id: 'five-sets',
    name: 'Set Collector',
    description: 'Create 5 different study sets.',
    icon: Book,
    isUnlocked: (sets) => sets.length >= 5,
  },
  {
    id: 'ai-creator',
    name: 'AI Assistant',
    description: 'Generate a set using the AI.',
    icon: BrainCircuit,
    isUnlocked: (sets) => sets.some(set => set.title.includes('AI Generated Set')),
  },
  {
    id: 'first-test',
    name: 'First Steps',
    description: 'Take your first practice test.',
    icon: Target,
    isUnlocked: (_, tests) => tests.length >= 1,
  },
  {
    id: 'perfect-score',
    name: 'Perfectionist',
    description: 'Get a perfect score on a test.',
    icon: Trophy,
    isUnlocked: (_, tests) => tests.some(test => test.score === test.totalQuestions),
  },
];
