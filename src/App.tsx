import { useState, useEffect } from 'react';
import { ApiKeyManager } from './components/ApiKeyManager';
import { ImageUpload } from './components/ImageUpload';
import { OCRProcessor } from './components/OCRProcessor';
import { StructureSelector } from './components/StructureSelector';
import { OutputDisplay } from './components/OutputDisplay';
import { generateKaganActivity } from './services/geminiClient';
import { getApiKey } from './services/geminiClient';
import { Question, KaganStructure } from './types';
import { ParseMode } from './utils/questionParser';

function App() {
  const [apiKeySet, setApiKeySet] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [detectedTypes, setDetectedTypes] = useState<ParseMode[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<KaganStructure | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if API key is already set
  useEffect(() => {
    if (getApiKey()) {
      setApiKeySet(true);
    }
  }, []);

  const handleApiKeySet = () => {
    setApiKeySet(true);
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setQuestions([]);
    setGeneratedOutput('');
    setError(null);
  };

  const handleOCRComplete = (_text: string, parsedQuestions: Question[], types: ParseMode[]) => {
    setQuestions(parsedQuestions);
    setDetectedTypes(types);
  };

  const handleGenerate = async () => {
    if (!selectedStructure) {
      setError('Please select a Kagan structure');
      return;
    }

    if (questions.length === 0) {
      setError('No questions found. Please upload an image with questions.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedOutput('');

    try {
      const output = await generateKaganActivity(questions, selectedStructure);
      setGeneratedOutput(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate activity');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kagan Activity Generator
          </h1>
          <p className="text-gray-600">
            Upload textbook images, extract questions, and generate Kagan cooperative learning activities
          </p>
        </header>

        <div className="space-y-6">
          {/* API Key Manager */}
          <ApiKeyManager onApiKeySet={handleApiKeySet} />

          {/* Image Upload */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Step 1: Upload Image
            </h2>
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImage={imageFile}
            />
          </section>

          {/* OCR Processing */}
          {imageFile && (
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Step 2: Extract and Detect Questions
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                The app will automatically detect all question types (regular questions, fill-in-the-blank, ordering, matching, and graphic organizers) from your image.
              </p>
              <OCRProcessor
                imageFile={imageFile}
                onOCRComplete={handleOCRComplete}
              />
            </section>
          )}

          {/* Structure Selector */}
          {questions.length > 0 && (
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Step 3: Select Kagan Structure
              </h2>
              <StructureSelector
                selectedStructure={selectedStructure}
                onStructureSelect={setSelectedStructure}
              />
            </section>
          )}

          {/* Generate Button */}
          {questions.length > 0 && selectedStructure && apiKeySet && (
            <section className="bg-white rounded-lg shadow p-6">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={`
                  w-full px-6 py-3 rounded-lg font-semibold text-white
                  ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                `}
              >
                {isLoading ? 'Generating...' : 'Generate Kagan Activity'}
              </button>
            </section>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Output Display */}
          {generatedOutput && (
            <section className="bg-white rounded-lg shadow p-6">
              <OutputDisplay output={generatedOutput} structure={selectedStructure} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

