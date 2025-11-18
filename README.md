# Kagan Activity Generator

A browser-based web application that uses OCR to extract questions from textbook images and transforms them into Kagan cooperative learning activity materials.

## Features

- **OCR Text Extraction**: Uses Tesseract.js to extract text from images (no API keys needed)
- **Multiple Content Types**: Supports questions, fill-in-the-blank, ordering tasks, matching tasks, and graphic organizers
- **Kagan Structures**: Generates materials for Quiz-Quiz-Trade, Find Someone Who, and Fan-N-Pick
- **Quiz-Quiz-Trade Format**: Creates small, printable strips with questions (blanks) and answers for easy trading
- **Gemini AI Integration**: Uses Google Gemini API to intelligently transform questions into Kagan activities

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Usage

1. **Enter API Key**: On first use, enter your Gemini API key (stored locally in your browser)
2. **Upload Image**: Drag and drop or select an image/PDF containing questions
3. **Select Content Type**: Choose the type of content (questions, fill-in-the-blank, etc.)
4. **Review Extracted Text**: The OCR will extract and parse the text automatically
5. **Select Kagan Structure**: Choose which Kagan activity format you want
6. **Generate**: Click "Generate Kagan Activity" to create the materials
7. **Print/Copy**: Use the output to print or copy the generated materials

## Supported Formats

### Content Types
- **Questions**: Numbered or listed questions
- **Fill-in-the-Blank**: Converts sentences into fill-in-the-blank format
- **Ordering Tasks**: Parses sequencing and ordering activities
- **Matching Tasks**: Extracts matching pairs and connections
- **Graphic Organizers**: Parses tables, diagrams, and structured data

### Kagan Structures
- **Quiz-Quiz-Trade**: Small strips with questions (blanks) and answers
- **Find Someone Who**: Worksheet format for finding classmates
- **Fan-N-Pick**: Question cards for cooperative learning

## Technology Stack

- React + TypeScript
- Vite (build tool)
- Tesseract.js (OCR)
- Google Gemini API (LLM)
- Tailwind CSS (styling)

## License

MIT

