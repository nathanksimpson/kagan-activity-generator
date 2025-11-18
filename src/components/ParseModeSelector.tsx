import { ParseMode } from '../utils/questionParser';

interface ParseModeSelectorProps {
  selectedMode: ParseMode;
  onModeSelect: (mode: ParseMode) => void;
}

const PARSE_MODES: { value: ParseMode; label: string; description: string }[] = [
  {
    value: 'questions',
    label: 'Questions',
    description: 'Extract numbered or listed questions',
  },
  {
    value: 'fill-in-the-blank',
    label: 'Fill-in-the-Blank',
    description: 'Create blanks from paragraph sentences',
  },
  {
    value: 'ordering',
    label: 'Ordering Tasks',
    description: 'Parse sequencing and ordering activities',
  },
  {
    value: 'matching',
    label: 'Matching Tasks',
    description: 'Extract matching pairs and connections',
  },
  {
    value: 'graphic-organizer',
    label: 'Graphic Organizer',
    description: 'Parse tables, diagrams, and structured data',
  },
];

export function ParseModeSelector({
  selectedMode,
  onModeSelect,
}: ParseModeSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Content Type
      </h3>
      <select
        value={selectedMode}
        onChange={(e) => onModeSelect(e.target.value as ParseMode)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {PARSE_MODES.map((mode) => (
          <option key={mode.value} value={mode.value}>
            {mode.label} - {mode.description}
          </option>
        ))}
      </select>
    </div>
  );
}

