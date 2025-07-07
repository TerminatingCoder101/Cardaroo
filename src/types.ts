export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  createdAt: string;
  studyProgress?: number;
}

export interface TestResult {
  setName: string;
  score: number;
  totalQuestions: number;
  date: string;
}
