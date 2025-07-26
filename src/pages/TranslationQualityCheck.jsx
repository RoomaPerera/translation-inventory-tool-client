// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const TranslationQualityCheck = ({
//   initialInputText = '',
//   initialTranslatedText = '',
//   initialExpectedTargetLanguage = ''
// }) => {
//   const [inputText, setInputText] = useState(initialInputText);
//   const [translatedText, setTranslatedText] = useState(initialTranslatedText);
//   const [expectedTargetLanguage, setExpectedTargetLanguage] = useState(initialExpectedTargetLanguage);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Update automatically if props change after initial mount
//   useEffect(() => {
//     setInputText(initialInputText);
//     setTranslatedText(initialTranslatedText);
//     setExpectedTargetLanguage(initialExpectedTargetLanguage);
//   }, [initialInputText, initialTranslatedText, initialExpectedTargetLanguage]);

//   const handleCheck = async () => {
//     setError('');
//     setResult(null);
//     setLoading(true);

//     try {
//       const response = await axios.post('http://localhost:5000/api/translations/quality-check', {
//         inputText,
//         translatedText,
//         expectedTargetLanguage
//       });
//       setResult(response.data);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-4 border rounded shadow bg-white">
//       <h2 className="text-lg font-bold mb-4 text-indigo-700">Translation Quality Check</h2>

//       <div className="space-y-2">
//         <div>
//           <label className="text-sm font-medium text-gray-600">Input Text</label>
//           <textarea
//             placeholder="Input Text"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500"
//             rows={3}
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium text-gray-600">Translated Text</label>
//           <textarea
//             placeholder="Translated Text"
//             value={translatedText}
//             onChange={(e) => setTranslatedText(e.target.value)}
//             className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500"
//             rows={3}
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium text-gray-600">Expected Target Language (e.g., en, es, fr)</label>
//           <input
//             type="text"
//             placeholder="Expected Target Language"
//             value={expectedTargetLanguage}
//             onChange={(e) => setExpectedTargetLanguage(e.target.value)}
//             className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500"
//           />
//         </div>

//         <button
//           onClick={handleCheck}
//           disabled={loading || !inputText || !translatedText || !expectedTargetLanguage}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full mt-2"
//         >
//           {loading ? 'Checking...' : 'Check Quality'}
//         </button>
//       </div>

//       {error && <p className="text-red-600 mt-2">{error}</p>}

//       {result && (
//         <div className="mt-4 bg-gray-50 p-3 rounded space-y-1">
//           <p><strong>Detected Target Language:</strong> {result.detectedTargetLanguage}</p>
//           <p>
//             <strong>Language Match:</strong>{" "}
//             <span className={result.languageMatch ? "text-green-600" : "text-red-600"}>
//               {result.languageMatch ? "Yes" : "No"}
//             </span>
//           </p>
//           <p><strong>Score:</strong> {result.score}</p>
//           <p><strong>Marks:</strong> {result.marks}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TranslationQualityCheck;
