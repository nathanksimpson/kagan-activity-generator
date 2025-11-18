export interface Question {
  id: string;
  text: string;
}

export type KaganStructure = 'quiz-quiz-trade' | 'find-someone-who' | 'fan-n-pick';

export interface AppState {
  imageFile: File | null;
  ocrText: string;
  questions: Question[];
  selectedStructure: KaganStructure | null;
  generatedOutput: string;
  isLoading: boolean;
  error: string | null;
}

