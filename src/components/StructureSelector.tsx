import { KaganStructure } from '../types';

interface StructureSelectorProps {
  selectedStructure: KaganStructure | null;
  onStructureSelect: (structure: KaganStructure) => void;
}

const STRUCTURE_OPTIONS: { value: KaganStructure; label: string; description: string }[] = [
  {
    value: 'quiz-quiz-trade',
    label: 'Quiz-Quiz-Trade',
    description: 'Small strips with questions (blanks) and answers for students to trade',
  },
  {
    value: 'find-someone-who',
    label: 'Find Someone Who',
    description: 'Worksheet with prompts for students to find classmates',
  },
  {
    value: 'fan-n-pick',
    label: 'Fan-N-Pick',
    description: 'Question cards for cooperative learning',
  },
];

export function StructureSelector({
  selectedStructure,
  onStructureSelect,
}: StructureSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Select Kagan Structure
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STRUCTURE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onStructureSelect(option.value)}
            className={`
              p-4 border-2 rounded-lg text-left transition-all
              ${
                selectedStructure === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
            <div className="text-xs text-gray-600">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

