export interface Question {
  question: string;
  options: {
    [key: string]: string;
  };
  answer: string;
}

export type View = 'generate' | 'settings';
