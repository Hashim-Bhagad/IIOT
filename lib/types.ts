export type DiagramData = {
  type: 'flow' | 'branch' | 'layers' | 'loop';
  title: string;
  nodes: { label: string; detail: string }[];
  caption: string;
};

export type QuickNotes = {
  summary: string;
  points: string[];
  diagram?: DiagramData;
};

export type Section = {
  id: string;
  title: string;
  intro: string;
  paragraphs: string[];
  keyPoints: string[];
  terms: { term: string; meaning: string }[];
  comparison?: { headers: string[]; rows: string[][] };
  diagram?: DiagramData;
  example?: { title: string; steps: string[] };
  traps: string[];
  quick: QuickNotes;
};

export type Question = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sectionId: string;
  sourceNote?: string;
  brief: string[];
};

export type Week = {
  id: number;
  title: string;
  summary: string;
  objectives: string[];
  sections: Section[];
  quiz: Question[];
  revision: string[];
  quick: QuickNotes;
};

export type WeekIndex = { id: number; title: string; questions: number; sectionIds: string[] };
export type Progress = {
  answers: Record<string, { selected: number; correct: boolean }>;
  understood: Record<string, boolean>;
  flagged: Record<string, boolean>;
};

export type PyqSource = { year: number; assignment: number; number: number; file: string; reference: string; answer: string };
export type PyqQuestion = Omit<Question, 'correctIndex'> & {
  correctIndex: number | null;
  weekId: number;
  sources: PyqSource[];
};
export type PyqBank = {
  summary: {
    sourceQuestions: number;
    weeklyQuestions: number;
    addedQuestions: number;
    coveredOccurrences: number;
    duplicateOccurrences: number;
    reviewOnlyQuestions: number;
    method: string;
  };
  questions: PyqQuestion[];
};
