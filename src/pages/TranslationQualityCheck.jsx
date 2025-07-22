import React, { useState } from 'react';
import axios from 'axios';

const TranslationQualityCheck = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [expectedTargetLanguage, setExpectedTargetLanguage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/translation/quality-check', {
        inputText,
        translatedText,
        expectedTargetLanguage
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Translation Quality Check</h2>
      
      <textarea
        placeholder="Input Text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <textarea
        placeholder="Translated Text"
        value={translatedText}
        onChange={(e) => setTranslatedText(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Expected Target Language (e.g., en, es, fr)"
        value={expectedTargetLanguage}
        onChange={(e) => setExpectedTargetLanguage(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <button
        onClick={handleCheck}
        disabled={loading || !inputText || !translatedText || !expectedTargetLanguage}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check Quality'}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {result && (
        <div className="mt-4 bg-gray-100 p-3 rounded">
          <p>Detected Target Language: {result.detectedTargetLanguage}</p>
          <p>
            Language Match:{" "}
            <span className={result.languageMatch ? "text-green-600" : "text-red-600"}>
              {result.languageMatch ? "Yes" : "No"}
            </span>
          </p>
          <p>Score: {result.score}</p>
          <p>Marks: {result.marks}</p>
        </div>
      )}
    </div>
  );
};

export default TranslationQualityCheck;
