import ReactMarkdown from 'react-markdown';

interface OutputDisplayProps {
  output: string;
  structure: string | null;
}

export function OutputDisplay({ output, structure }: OutputDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    alert('Copied to clipboard!');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Kagan Activity - ${structure}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
              ${structure === 'quiz-quiz-trade' ? `
                .quiz-strip {
                  border: 1px dashed #ccc;
                  padding: 10px;
                  margin: 10px 0;
                  page-break-inside: avoid;
                }
                .quiz-strip .question {
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .quiz-strip .answer {
                  color: #666;
                  font-size: 0.9em;
                }
                @media print {
                  .quiz-strip {
                    border: 1px solid #000;
                    margin: 5px 0;
                  }
                }
              ` : ''}
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 10px 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h1>Kagan Activity: ${structure}</h1>
            <div>${formatOutputForPrint(output, structure)}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!output) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Generated Activity
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            Copy
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Print
          </button>
        </div>
      </div>

      <div
        className={`
          bg-white border border-gray-200 rounded-lg p-6
          ${structure === 'quiz-quiz-trade' ? 'quiz-strip-container' : ''}
        `}
      >
        {structure === 'quiz-quiz-trade' ? (
          <div className="quiz-strip-format">
            {formatQuizStrips(output)}
          </div>
        ) : (
          <ReactMarkdown className="prose max-w-none">{output}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function formatQuizStrips(output: string): JSX.Element[] {
  // Parse the output to create individual strips
  const strips = output.split(/\n\s*\n/).filter((s) => s.trim().length > 0);
  
  return (
    <div className="space-y-4">
      {strips.map((strip, index) => {
        // Extract question and answer from the strip
        const questionMatch = strip.match(/Question:\s*(.+?)(?:\n|Answer:|$)/is);
        const answerMatch = strip.match(/Answer:\s*(.+?)$/is);
        
        const question = questionMatch ? questionMatch[1].trim() : '';
        const answer = answerMatch ? answerMatch[1].trim() : '';
        
        if (!question && !answer) {
          // Fallback: just display the strip as-is
          return (
            <div key={index} className="quiz-strip border-2 border-dashed border-gray-300 p-4 rounded">
              <div className="text-sm whitespace-pre-wrap">{strip}</div>
            </div>
          );
        }
        
        return (
          <div
            key={index}
            className="quiz-strip border-2 border-dashed border-gray-300 p-4 rounded bg-gray-50"
          >
            <div className="question text-sm font-semibold mb-2">
              {question || strip}
            </div>
            {answer && (
              <div className="answer text-xs text-gray-600 border-t border-gray-200 pt-2">
                <strong>Answer:</strong> {answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatOutputForPrint(output: string, structure: string | null): string {
  if (structure === 'quiz-quiz-trade') {
    const strips = output.split(/\n\s*\n/).filter((s) => s.trim().length > 0);
    return strips
      .map((strip) => {
        const questionMatch = strip.match(/Question:\s*(.+?)(?:\n|Answer:|$)/is);
        const answerMatch = strip.match(/Answer:\s*(.+?)$/is);
        
        const question = questionMatch ? questionMatch[1].trim() : strip;
        const answer = answerMatch ? answerMatch[1].trim() : '';
        
        return `
          <div class="quiz-strip">
            <div class="question">${question}</div>
            ${answer ? `<div class="answer"><strong>Answer:</strong> ${answer}</div>` : ''}
          </div>
        `;
      })
      .join('');
  }
  
  // For other structures, convert markdown to HTML
  return output
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

