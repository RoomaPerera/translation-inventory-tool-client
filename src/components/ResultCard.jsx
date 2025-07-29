import React from 'react';

const ResultCard = ({ result, fileName, computeVisualScore, getComplexityLabel }) => (
  <div className="bg-gray-50 mt-4 p-4 rounded text-sm">
    {fileName && <p className="font-semibold mb-2">📁 File: {fileName}</p>}
    {result.readabilityScores && (
      <div className="mb-3">
        <h4 className="font-semibold mb-1">📖 Readability Scores:</h4>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(result.readabilityScores, null, 2)}
        </pre>
        <p className="mt-1">📊 Visual Score: <span className="font-semibold">{computeVisualScore(result.readabilityScores)}/10</span></p>
        <p className="mt-1">🩺 Complexity: <span className="font-semibold">{getComplexityLabel(result.readabilityScores)}</span></p>
      </div>
    )}
    {result.fileValidation && (
      <div className="mt-2">
        <h4 className="font-semibold mb-1">🗂️ File Validation:</h4>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(result.fileValidation, null, 2)}
        </pre>
      </div>
    )}
    {result.complexityMessage && <p className="mt-2 text-yellow-700">{result.complexityMessage}</p>}
    {result.fileErrorMessage && <p className="mt-2 text-red-600">{result.fileErrorMessage}</p>}
  </div>
);

export default ResultCard;
