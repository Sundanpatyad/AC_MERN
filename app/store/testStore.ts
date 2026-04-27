import { create } from 'zustand';

interface Answer {
  questionId: string;
  selectedOption: string | number;
  timeTaken: number; // in seconds
}

interface TestState {
  answers: Record<string, Answer>; // Keyed by question ID
  timeRemaining: number;
  isTestActive: boolean;
  setAnswer: (questionId: string, answer: Answer) => void;
  clearAnswer: (questionId: string) => void;
  setTimeRemaining: (time: number) => void;
  startTest: (durationMins: number) => void;
  endTest: () => void;
  resetTest: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  answers: {},
  timeRemaining: 0,
  isTestActive: false,
  
  setAnswer: (questionId, answer) => 
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer
      }
    })),

  clearAnswer: (questionId) =>
    set((state) => {
      const newAnswers = { ...state.answers };
      delete newAnswers[questionId];
      return { answers: newAnswers };
    }),
    
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  
  startTest: (durationMins) => set({ 
    isTestActive: true, 
    timeRemaining: durationMins * 60,
    answers: {} 
  }),
  
  endTest: () => set({ isTestActive: false }),
  
  resetTest: () => set({ answers: {}, timeRemaining: 0, isTestActive: false }),
}));
