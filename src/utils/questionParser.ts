import { Question } from '../types';

export type ParseMode = 'questions' | 'fill-in-the-blank' | 'ordering' | 'matching' | 'graphic-organizer' | 'auto-detect';

export interface DetectedQuestion {
  question: Question;
  type: ParseMode;
}

/**
 * Splits text into sentences
 */
function splitIntoSentences(text: string): string[] {
  // Split by sentence-ending punctuation, but keep the punctuation
  const sentences = text
    .replace(/([.!?])\s+/g, '$1|SPLIT|')
    .split('|SPLIT|')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  return sentences;
}

/**
 * Creates a fill-in-the-blank question from a sentence
 * Identifies key words (nouns, important verbs, adjectives) and replaces one with a blank
 */
function createFillInTheBlank(sentence: string): string {
  // Remove leading/trailing whitespace and ensure it ends with punctuation
  let cleaned = sentence.trim();
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  // Common words to avoid blanking (articles, prepositions, common verbs)
  const skipWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
  ]);

  // Split sentence into words, preserving punctuation
  const words = cleaned.match(/\b\w+\b|[^\w\s]/g) || [];
  
  // Find a good word to blank (prefer nouns, important verbs, adjectives)
  // Skip first and last few words, and skip common words
  let blankIndex = -1;
  const startIndex = Math.max(2, Math.floor(words.length * 0.2));
  const endIndex = Math.min(words.length - 2, Math.floor(words.length * 0.8));
  
  for (let i = startIndex; i < endIndex; i++) {
    const word = words[i]?.toLowerCase();
    if (word && word.length > 3 && !skipWords.has(word) && /^[a-z]+$/i.test(words[i] || '')) {
      blankIndex = i;
      break;
    }
  }
  
  // If no good candidate found, pick a middle word
  if (blankIndex === -1 && words.length > 4) {
    blankIndex = Math.floor(words.length / 2);
  }
  
  // Create the fill-in-the-blank
  if (blankIndex >= 0 && blankIndex < words.length) {
    const before = words.slice(0, blankIndex).join(' ');
    const after = words.slice(blankIndex + 1).join(' ');
    return `${before} ______ ${after}`;
  }
  
  // Fallback: just add a blank in the middle
  const midPoint = Math.floor(cleaned.length / 2);
  return cleaned.slice(0, midPoint) + ' ______' + cleaned.slice(midPoint);
}

/**
 * Parses ordering tasks from text
 * Looks for patterns like "Order: A, B, C" or "Put in order: Item1, Item2, Item3"
 */
function parseOrderingTasks(text: string): Question[] {
  const questions: Question[] = [];
  
  // Patterns for ordering tasks
  const orderingPatterns = [
    /(?:order|arrange|put|sequence|sort).*?[:]\s*([^\.!?\n]+)/gi,
    /(?:in\s+order|chronological|sequence).*?[:]\s*([^\.!?\n]+)/gi,
  ];
  
  for (const pattern of orderingPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const itemsText = match[1]?.trim();
      if (itemsText && itemsText.length > 5) {
        // Split by commas, semicolons, or newlines
        const items = itemsText
          .split(/[,;]\s*|\n/)
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        if (items.length >= 2) {
          questions.push({
            id: `order-${questions.length + 1}`,
            text: `Order the following: ${items.join(', ')}`,
          });
        }
      }
    }
  }
  
  // Also look for numbered or lettered lists that might be ordering tasks
  const listPattern = /([A-Z]\.\s*[^\n]+(?:\n[A-Z]\.\s*[^\n]+)+)/g;
  const listMatches = text.matchAll(listPattern);
  for (const match of listMatches) {
    const listText = match[1];
    const items = listText
      .split(/\n[A-Z]\.\s*/)
      .map(item => item.replace(/^[A-Z]\.\s*/, '').trim())
      .filter(item => item.length > 0);
    
    if (items.length >= 2) {
      questions.push({
        id: `order-${questions.length + 1}`,
        text: `Order the following: ${items.join(', ')}`,
      });
    }
  }
  
  return questions;
}

/**
 * Parses matching tasks from text
 * Looks for patterns like "Match: A - 1, B - 2" or "Match: Word = Definition"
 */
function parseMatchingTasks(text: string): Question[] {
  const questions: Question[] = [];
  
  // Patterns for matching tasks
  const matchingPatterns = [
    /(?:match|connect|pair).*?[:]\s*([^\.!?\n]+)/gi,
  ];
  
  for (const pattern of matchingPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const pairsText = match[1]?.trim();
      if (pairsText && pairsText.length > 5) {
        // Try to extract pairs separated by dashes, equals, or colons
        const pairs: string[] = [];
        
        // Split by commas first, then check each for pairs
        const segments = pairsText.split(/[,;]\s*/);
        for (const segment of segments) {
          const trimmed = segment.trim();
          // Look for pairs with dash, equals, or colon
          const pairMatch = trimmed.match(/(.+?)\s*[-=:]\s*(.+)/);
          if (pairMatch) {
            pairs.push(`${pairMatch[1].trim()} - ${pairMatch[2].trim()}`);
          } else if (trimmed.length > 3) {
            // If no separator found, might be a single item in a list
            pairs.push(trimmed);
          }
        }
        
        if (pairs.length >= 2) {
          questions.push({
            id: `match-${questions.length + 1}`,
            text: `Match the following: ${pairs.join(', ')}`,
          });
        }
      }
    }
  }
  
  // Also look for two-column format (left side | right side)
  const twoColumnPattern = /([^\n\|]+\s*\|\s*[^\n\|]+(?:\n[^\n\|]+\s*\|\s*[^\n\|]+)+)/g;
  const columnMatches = text.matchAll(twoColumnPattern);
  for (const match of columnMatches) {
    const columnText = match[1];
    const rows = columnText
      .split('\n')
      .map(row => {
        const [left, right] = row.split('|').map(s => s.trim());
        return left && right ? `${left} - ${right}` : row.trim();
      })
      .filter(row => row.length > 0);
    
    if (rows.length >= 2) {
      questions.push({
        id: `match-${questions.length + 1}`,
        text: `Match the following: ${rows.join(', ')}`,
      });
    }
  }
  
  return questions;
}

/**
 * Parses graphic organizers (tables, structured data) and converts to fill-in-the-blank questions
 * Handles tables, labeled diagrams, concept maps, etc.
 */
function parseGraphicOrganizers(text: string): Question[] {
  const questions: Question[] = [];
  
  // Pattern 1: Tables with headers and cells
  // Look for table-like structures with separators (|, tabs, multiple spaces)
  const tablePattern = /([^\n]+\|.+\n(?:[^\n]+\|.+\n?)+)/g;
  const tableMatches = text.matchAll(tablePattern);
  
  for (const match of tableMatches) {
    const tableText = match[1];
    const rows = tableText.split('\n').filter(row => row.trim().length > 0);
    
    if (rows.length >= 2) {
      // First row is likely headers
      const headers = rows[0].split('|').map(h => h.trim()).filter(h => h.length > 0);
      
      // Process data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split('|').map(c => c.trim());
        
        // Create fill-in-the-blank questions for each cell that might be empty or needs filling
        for (let j = 0; j < Math.min(headers.length, cells.length); j++) {
          const header = headers[j];
          const cell = cells[j];
          
          // If cell is empty or very short, create a fill-in-the-blank
          if (!cell || cell.length < 3) {
            // Build context from other filled cells in the row
            const context = cells
              .map((c, idx) => idx !== j && c && c.length > 3 ? `${headers[idx]}: ${c}` : null)
              .filter(Boolean)
              .join(', ');
            
            const questionText = context 
              ? `In the ${header} row, ${context ? `given ${context}, ` : ''}fill in: ${header} = ______`
              : `Fill in the ${header}: ______`;
            
            questions.push({
              id: `graphic-${questions.length + 1}`,
              text: questionText,
            });
          }
        }
      }
    }
  }
  
  // Pattern 2: Labeled structures (Category: item1, item2, etc.)
  const labeledPattern = /([A-Z][^:]+):\s*([^\n\.!?]+)/g;
  const labeledMatches = text.matchAll(labeledPattern);
  
  for (const match of labeledMatches) {
    const category = match[1].trim();
    const itemsText = match[2].trim();
    
    // Split items by commas, semicolons, or newlines
    const items = itemsText.split(/[,;]\s*|\n/).map(item => item.trim()).filter(item => item.length > 0);
    
    // Create fill-in-the-blank questions for each item
    for (const item of items) {
      // If item looks incomplete or is very short, create a blank
      if (item.length < 5 || /^[a-z]+\s*$|^[A-Z]\s*$/.test(item)) {
        questions.push({
          id: `graphic-${questions.length + 1}`,
          text: `Under ${category}, fill in: ______`,
        });
      } else {
        // Create a question asking to identify the category or complete the item
        questions.push({
          id: `graphic-${questions.length + 1}`,
          text: `${category}: ${item} (complete or identify)`,
        });
      }
    }
  }
  
  // Pattern 3: Structured lists with indentation or bullets that suggest hierarchy
  const structuredListPattern = /((?:^\s*[-•*]\s*[^\n]+(?:\n\s+[-•*]\s*[^\n]+)+)+)/gm;
  const listMatches = text.matchAll(structuredListPattern);
  
  for (const match of listMatches) {
    const listText = match[1];
    const lines = listText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length >= 2) {
      // Look for a main category (first line or line with less indentation)
      let mainCategory = '';
      const items: string[] = [];
      
      for (const line of lines) {
        const cleaned = line.replace(/^[-•*]\s*/, '');
        if (!mainCategory || line.match(/^\s{0,2}[-•*]/)) {
          mainCategory = cleaned;
        } else {
          items.push(cleaned);
        }
      }
      
      // Create questions for items
      for (const item of items) {
        if (item.length > 3) {
          questions.push({
            id: `graphic-${questions.length + 1}`,
            text: mainCategory ? `Complete: ${mainCategory} - ${item.replace(/\w+/, '______')}` : `Fill in: ${item.replace(/\w+/, '______')}`,
          });
        }
      }
    }
  }
  
  // Pattern 4: Arrow or connection patterns (A -> B, A: B, etc.)
  const connectionPattern = /([A-Za-z][^\n]+?)\s*[-=:>→]\s*([A-Za-z][^\n]+?)(?:\n|$)/g;
  const connectionMatches = text.matchAll(connectionPattern);
  
  for (const match of connectionMatches) {
    const left = match[1].trim();
    const right = match[2].trim();
    
    if (left.length > 2 && right.length > 2) {
      // Create fill-in-the-blank for either side
      questions.push({
        id: `graphic-${questions.length + 1}`,
        text: `Complete the connection: ${left} → ______`,
      });
      questions.push({
        id: `graphic-${questions.length + 1}`,
        text: `Complete the connection: ______ → ${right}`,
      });
    }
  }
  
  return questions;
}

/**
 * Parses OCR text to extract individual questions or create fill-in-the-blank questions
 * Handles various formats: numbered, bulleted, fill-in-the-blank from paragraphs, ordering, matching, graphic organizers
 */
export function parseQuestions(text: string, mode: ParseMode = 'questions'): Question[] {
  if (!text.trim()) {
    return [];
  }

  // Fill-in-the-blank mode: split into sentences and create blanks
  if (mode === 'fill-in-the-blank') {
    const sentences = splitIntoSentences(text);
    const questions: Question[] = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      // Only process sentences that are substantial (more than 10 characters)
      if (sentence.length > 10) {
        const fillBlank = createFillInTheBlank(sentence);
        questions.push({
          id: `fill-${i + 1}`,
          text: fillBlank,
        });
      }
    }
    
    return questions;
  }

  // Ordering mode: parse ordering tasks
  if (mode === 'ordering') {
    return parseOrderingTasks(text);
  }

  // Matching mode: parse matching tasks
  if (mode === 'matching') {
    return parseMatchingTasks(text);
  }

  // Graphic organizer mode: parse structured data and convert to fill-in-the-blank
  if (mode === 'graphic-organizer') {
    return parseGraphicOrganizers(text);
  }

  // Regular question parsing mode
  // Split by common question patterns
  // Look for numbered questions (1., 2., etc.) or question marks followed by newlines
  const questionPatterns = [
    /(\d+[\.\)]\s*[^\d]+?)(?=\d+[\.\)]|$)/g, // Numbered questions: "1. Question text"
    /([A-Z][^\.!?]*\?)/g, // Questions ending with ?
    /(^|\n)([^\n]+?\?)/g, // Questions on separate lines
  ];

  const questions: Question[] = [];
  const seen = new Set<string>();

  // Try each pattern
  for (const pattern of questionPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      let questionText = match[1] || match[0];
      questionText = questionText.trim();
      
      // Clean up the text
      questionText = questionText.replace(/^\d+[\.\)]\s*/, ''); // Remove leading numbers
      questionText = questionText.replace(/\s+/g, ' '); // Normalize whitespace
      
      if (questionText.length > 10 && !seen.has(questionText.toLowerCase())) {
        seen.add(questionText.toLowerCase());
        questions.push({
          id: `q-${questions.length + 1}`,
          text: questionText,
        });
      }
    }
  }

  // If no patterns matched, try splitting by double newlines or question marks
  if (questions.length === 0) {
    const lines = text.split(/\n\s*\n|\?/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 10 && trimmed.includes('?')) {
        const cleanText = trimmed.replace(/^\d+[\.\)]\s*/, '').trim();
        if (!seen.has(cleanText.toLowerCase())) {
          seen.add(cleanText.toLowerCase());
          questions.push({
            id: `q-${questions.length + 1}`,
            text: cleanText,
          });
        }
      }
    }
  }

  return questions;
}

/**
 * Validates if a string looks like a question
 */
export function isValidQuestion(text: string): boolean {
  return text.trim().length > 10 && (text.includes('?') || text.length > 20);
}

/**
 * Auto-detects all question types from text and combines them
 * Returns all unique questions found across all parse modes
 */
export function autoDetectQuestions(text: string): { questions: Question[]; detectedTypes: ParseMode[] } {
  if (!text.trim()) {
    return { questions: [], detectedTypes: [] };
  }

  const allQuestions: Question[] = [];
  const detectedTypes: ParseMode[] = [];
  const seen = new Set<string>();

  // Try each parse mode (except auto-detect itself)
  const modes: ParseMode[] = ['questions', 'fill-in-the-blank', 'ordering', 'matching', 'graphic-organizer'];
  
  for (const mode of modes) {
    const questions = parseQuestions(text, mode);
    if (questions.length > 0) {
      detectedTypes.push(mode);
      
      // Add unique questions (avoid duplicates)
      for (const q of questions) {
        const normalized = q.text.toLowerCase().trim();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          allQuestions.push({
            id: `auto-${allQuestions.length + 1}`,
            text: q.text,
          });
        }
      }
    }
  }

  return { questions: allQuestions, detectedTypes };
}

