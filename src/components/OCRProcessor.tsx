import { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { autoDetectQuestions, ParseMode } from '../utils/questionParser';
import { Question } from '../types';

interface OCRProcessorProps {
  imageFile: File | null;
  onOCRComplete: (text: string, questions: Question[], detectedTypes: ParseMode[]) => void;
}

export function OCRProcessor({
  imageFile,
  onOCRComplete,
}: OCRProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [detectedTypes, setDetectedTypes] = useState<ParseMode[]>([]);

  useEffect(() => {
    if (!imageFile) {
      setExtractedText('');
      setQuestions([]);
      return;
    }

    const processImage = async () => {
      setIsProcessing(true);
      setProgress(0);
      setStatus('Initializing OCR...');
      setExtractedText('');
      setQuestions([]);

      try {
        const worker = await createWorker('eng');

        // Convert PDF to image if needed (for now, we'll handle PDFs as images)
        // Note: For full PDF support, you'd need pdf-lib or similar
        const imageUrl = URL.createObjectURL(imageFile);

        setStatus('Processing image...');
        const {
          data: { text },
        } = await worker.recognize(imageUrl, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatus(`Recognizing text... ${Math.round(m.progress * 100)}%`);
            }
          },
        } as any);

        await worker.terminate();
        URL.revokeObjectURL(imageUrl);

        setExtractedText(text);
        setStatus('Detecting question types...');
        
        // Auto-detect all question types
        const { questions: detectedQuestions, detectedTypes: types } = autoDetectQuestions(text);
        setQuestions(detectedQuestions);
        setDetectedTypes(types);

        setStatus('OCR complete!');
        onOCRComplete(text, detectedQuestions, types);
      } catch (error) {
        console.error('OCR Error:', error);
        setStatus('Error processing image. Please try again.');
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    };

    processImage();
  }, [imageFile, onOCRComplete]);

  if (!imageFile) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-blue-900 mb-1">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!isProcessing && extractedText && (
        <div className="space-y-4">
          {detectedTypes.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-green-800 mb-1">
                Detected Question Types:
              </h3>
              <div className="flex flex-wrap gap-2">
                {detectedTypes.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                  >
                    {type.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Extracted Text ({questions.length} items found):
            </h3>
            <textarea
              readOnly
              value={extractedText}
              className="w-full h-32 p-2 text-sm border border-gray-300 rounded-md bg-white font-mono"
            />
          </div>

          {questions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Parsed Questions/Tasks:
              </h3>
              <ul className="space-y-1">
                {questions.map((q) => (
                  <li
                    key={q.id}
                    className="text-sm text-gray-600 p-2 bg-gray-50 rounded"
                  >
                    {q.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

