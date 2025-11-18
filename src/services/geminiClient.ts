import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt } from '../utils/promptBuilder';
import { Question, KaganStructure } from '../types';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

/**
 * Get the stored API key from localStorage
 */
export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

/**
 * Save the API key to localStorage
 */
export function saveApiKey(apiKey: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

/**
 * Remove the stored API key
 */
export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

/**
 * Generate Kagan activity materials using Gemini API
 */
export async function generateKaganActivity(
  questions: Question[],
  structure: KaganStructure
): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API key not found. Please enter your Gemini API key.');
  }

  if (questions.length === 0) {
    throw new Error('No questions provided.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = buildPrompt(structure, questions);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        throw new Error('Invalid API key. Please check your Gemini API key.');
      }
      throw new Error(`Failed to generate activity: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the activity.');
  }
}

