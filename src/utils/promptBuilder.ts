import { Question, KaganStructure } from '../types';

export interface PromptTemplate {
  role: string;
  task: string;
  format: string;
}

const PROMPT_TEMPLATES: Record<KaganStructure, PromptTemplate> = {
  'quiz-quiz-trade': {
    role: 'You are an expert instructional designer and teacher creating materials for a classroom.',
    task: 'Create a set of Quiz-Quiz-Trade strips based on the provided comprehension questions. For each question, convert it into a fill-in-the-blank format (with a blank space represented by "______") and generate a clear, concise, and accurate answer appropriate for students.',
    format: 'Output the materials as small strips of paper that students can easily trade. Format each strip as follows:\n\n"Question: [Question with blank]\nAnswer: [Answer]"\n\nEach strip should be compact (2-3 lines maximum) and designed to be printed and cut into small individual strips. The question should have a blank (______) where students need to fill in the answer. Format all strips in a simple list, one strip per line, separated by blank lines. Each strip should be self-contained and easy to cut out.',
  },
  'find-someone-who': {
    role: 'You are an expert instructional designer and teacher creating materials for a classroom.',
    task: 'Create a "Find Someone Who" activity worksheet based on the provided comprehension questions. Convert each question into a "Find someone who can..." or "Find someone who knows..." statement.',
    format: 'Output the materials as a grid in a Markdown table format (2x2 or 3x3 depending on the number of questions). Each cell should contain one of the "Find someone who..." prompts.',
  },
  'fan-n-pick': {
    role: 'You are an expert instructional designer and teacher creating materials for a classroom.',
    task: 'Create Fan-N-Pick question cards based on the provided comprehension questions. Each card should have a clear question that students can answer.',
    format: 'Output the materials as a numbered list where each item is a question card. Format each card as: "Card [number]: [Question]"',
  },
};

/**
 * Builds a master prompt for the Gemini API based on the selected structure and questions
 */
export function buildPrompt(structure: KaganStructure, questions: Question[]): string {
  const template = PROMPT_TEMPLATES[structure];
  const questionList = questions.map((q, idx) => `${idx + 1}. ${q.text}`).join('\n');

  return `${template.role}

${template.task}

${template.format}

Comprehension Questions:

${questionList}

Please generate the materials now.`;
}

/**
 * Get available Kagan structures
 */
export function getAvailableStructures(): KaganStructure[] {
  return Object.keys(PROMPT_TEMPLATES) as KaganStructure[];
}

