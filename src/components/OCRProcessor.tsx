import { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { autoDetectQuestions, ParseMode } from '../utils/questionParser';
import { Question } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
        const ocrWorker = await createWorker('eng');
        let imageUrl: string;
        let shouldRevokeUrl = false;

        // Check if it's a PDF
        if (imageFile.type === 'application/pdf') {
          setStatus('Loading PDF...');
          
          // Convert PDF to image
          const arrayBuffer = await imageFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          setStatus(`Processing PDF page 1 of ${pdf.numPages}...`);
          
          // Process first page (you can extend this to process all pages)
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2.0 });
          
          // Create canvas to render PDF page
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context!,
            viewport: viewport,
          }).promise;
          
          // Convert canvas to blob URL
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve);
          });
          
          if (!blob) {
            throw new Error('Failed to convert PDF page to image');
          }
          
          imageUrl = URL.createObjectURL(blob);
          shouldRevokeUrl = true;
          
          // If we have multiple pages, process them too
          if (pdf.numPages > 1) {
            setStatus(`Processing ${pdf.numPages} pages...`);
            // For now, we'll just process the first page
            // You can extend this to concatenate text from all pages
          }
        } else {
          // Regular image file
          imageUrl = URL.createObjectURL(imageFile);
          shouldRevokeUrl = true;
        }

        setStatus('Processing with OCR...');
        const {
          data: { text },
        } = await ocrWorker.recognize(imageUrl, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatus(`Recognizing text... ${Math.round(m.progress * 100)}%`);
            }
          },
        } as any);

        await ocrWorker.terminate();
        if (shouldRevokeUrl) {
          URL.revokeObjectURL(imageUrl);
        }

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

