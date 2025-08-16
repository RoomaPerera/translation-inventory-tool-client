import React, { useState, useEffect } from 'react';
import NavBar from '../components/reusableComponents/NavBar';
import GTNPortal from '../components/reusableComponents/GTNPortal';
import Button from '../components/reusableComponents/Button';
import ResultCard from '../components/ResultCard';
import FileUpload from '../components/FileUpload';
import API from '../services/api';

const ReadabilityValidator = () => {
  const [user, setUser] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [savedResults, setSavedResults] = useState([]);

  // Load user and saved results from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const storedResults = localStorage.getItem(`savedResults_${parsedUser.email}`);
      setSavedResults(storedResults ? JSON.parse(storedResults) : []);
    }
  }, []);

  // Persist savedResults whenever they change and user is set
  useEffect(() => {
    if (user) {
      localStorage.setItem(`savedResults_${user.email}`, JSON.stringify(savedResults));
    }
  }, [savedResults, user]);

  // Calculate a visual readability score between 0 and 10
  const computeVisualScore = (scores) => {
    if (!scores) return null;
    const avgGrade = (scores.fleschKincaidGrade + scores.gunningFog + scores.smogIndex) / 3;
    return Math.max(0, Math.min(10, (20 - avgGrade) / 2)).toFixed(1);
  };

  // Determine complexity label based on average grade
  const getComplexityLabel = (scores) => {
    if (!scores) return null;
    const avgGrade = (scores.fleschKincaidGrade + scores.gunningFog + scores.smogIndex) / 3;
    if (avgGrade <= 8) return '✅ Normal';
    if (avgGrade <= 12) return '⚠️ Medium';
    return '❌ High';
  };

  // Handle text input readability analysis
  const handleTextAnalyze = async () => {
    setError('');
    setResult(null);
    setFileName('');

    const trimmedText = textInput.trim();
    if (!trimmedText) {
      setError('Please enter text for readability analysis.');
      return;
    }

    // Detect input type heuristically
    let inputType = 'Plain Text';
    if (trimmedText.startsWith('{') && trimmedText.endsWith('}')) {
      inputType = 'JSON Text';
    } else if (trimmedText.includes(',') && trimmedText.includes('\n')) {
      inputType = 'CSV Text';
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in first.');
        return;
      }

      const postPayload = { text: trimmedText };
      if (inputType === 'JSON Text') postPayload.fileType = 'json';
      if (inputType === 'CSV Text') postPayload.fileType = 'csv';

      const response = await API.post(
        '/api/tools/validate', // Use relative path, base URL is set in API module
        postPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Save with proper input name suffix
      let inputNameForSave = 'plain.text';
      if (inputType === 'JSON Text') inputNameForSave = 'json.text';
      else if (inputType === 'CSV Text') inputNameForSave = 'csv.text';

      setResult(response.data);
      setSavedResults((prev) => [
        ...prev,
        { id: Date.now(), type: 'Text', inputName: inputNameForSave, result: response.data },
      ]);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
      } else {
        setError(err.response?.data?.error || 'Something went wrong during readability analysis.');
      }
    }
  };

  // Handle file validation for CSV or JSON files
  const handleFileAnalyze = async () => {
    setError('');
    setResult(null);

    if (!file) {
      setError('Please select a CSV or JSON file to validate.');
      return;
    }
    if (!fileType) {
      setError('Please select the correct file type (CSV or JSON).');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please log in first.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const fileContent = e.target.result;

        const response = await API.post(
          '/api/tools/validate',
          {
            fileContent,
            fileType,
            fileName: file.name,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setResult(response.data);
        setSavedResults((prev) => [
          ...prev,
          { id: Date.now(), type: 'File', inputName: file.name, result: response.data },
        ]);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired or unauthorized. Please log in again.');
        } else {
          setError(err.response?.data?.error || 'Something went wrong during file validation.');
        }
      }
    };

    reader.readAsText(file);
  };

  // Clear all saved results after confirmation
  const clearSavedResults = () => {
    if (window.confirm('Are you sure you want to clear all your saved results?')) {
      setSavedResults([]);
      if (user) {
        localStorage.removeItem(`savedResults_${user.email}`);
      }
    }
  };

  // Show loading state while fetching user
  if (!user) {
    return <div className="p-8 text-center">Loading user info...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64">
        <NavBar
          user={user}
          onLogout={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            window.location.href = '/login';
          }}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <GTNPortal />
        <p className="mb-6 font-semibold text-gray-700">
          Current Role: <span className="text-indigo-600">{user.role}</span>
        </p>

        <h2 className="text-2xl font-bold mb-4">📊 Readability & Format Validator</h2>

        {/* Text Analysis Section */}
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste text, JSON, or CSV here for readability analysis..."
          className="w-full border p-2 mb-2 rounded h-40"
        />
        <Button onClick={handleTextAnalyze} className="w-full bg-blue-600 text-white mb-4">
          Analyze Readability
        </Button>

        {/* File Upload Section */}
        <FileUpload file={file} setFile={setFile} fileType={fileType} setFileType={setFileType} />
        <Button onClick={handleFileAnalyze} className="w-full bg-green-600 text-white mb-4">
          Validate File
        </Button>

        {error && <p className="text-red-600 mt-3">{error}</p>}

        {/* Result Card Section */}
        {result && (
          <ResultCard
            result={result}
            fileName={fileName}
            computeVisualScore={computeVisualScore}
            getComplexityLabel={getComplexityLabel}
          />
        )}

        {/* Saved Results Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">📝 Saved Validation Results</h3>
            <Button onClick={clearSavedResults} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
              Clear All
            </Button>
          </div>

          {savedResults.length === 0 ? (
            <p>No saved results yet.</p>
          ) : (
            <div className="overflow-x-auto max-h-80 border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="border px-3 py-1 text-left">#</th>
                    <th className="border px-3 py-1 text-left">Type</th>
                    <th className="border px-3 py-1 text-left">Input Name</th>
                    <th className="border px-3 py-1 text-left">Readability Score</th>
                    <th className="border px-3 py-1 text-left">Complexity</th>
                    <th className="border px-3 py-1 text-left">File Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {savedResults.map((item, idx) => {
                    const visualScore = item.result.readabilityScores
                      ? computeVisualScore(item.result.readabilityScores)
                      : item.result.fileValidation?.readabilityScores
                      ? computeVisualScore(item.result.fileValidation.readabilityScores)
                      : 'N/A';

                    const complexityLabel = item.result.readabilityScores
                      ? getComplexityLabel(item.result.readabilityScores)
                      : item.result.fileValidation?.readabilityScores
                      ? getComplexityLabel(item.result.fileValidation.readabilityScores)
                      : 'N/A';

                    const fileValidation = item.result.fileValidation
                      ? JSON.stringify(item.result.fileValidation, null, 2)
                      : 'N/A';

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border px-3 py-1">{idx + 1}</td>
                        <td className="border px-3 py-1">{item.type}</td>
                        <td className="border px-3 py-1 truncate" title={item.inputName}>{item.inputName}</td>
                        <td className="border px-3 py-1">{visualScore}</td>
                        <td className="border px-3 py-1">{complexityLabel}</td>
                        <td
                          className="border px-3 py-1 break-all"
                          style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                        >
                          {fileValidation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReadabilityValidator;
