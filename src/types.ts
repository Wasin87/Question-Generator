export interface Question {
  question: string;
  options: {
    "ক": string;
    "খ": string;
    "গ": string;
    "ঘ": string;
  };
  answer: string;
}

export interface HistoryItem {
  id: number;
  topic: string;
  class_name: string;
  marks: number;
  duration: string;
  quantity: number;
  content: string;
  questions: Question[];
  created_at: string;
}

export type View = 'dashboard' | 'generate' | 'history' | 'settings';
