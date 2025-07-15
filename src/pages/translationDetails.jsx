import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectService from '../services/projectService';
import translationService from '../services/translationService';
import { useAuthContext } from '../hooks/useAuthContext';

const TranslationDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [filters, setFilters] = useState({
    language: '',
    word: '',
    key: ''
  });
  const { user } = useAuthContext();

  useEffect(() => {
    fetchProjectData();
    fetchTranslations();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const projectData = await projectService.getProjectById(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      showNotification('Failed to load project data.', 'error');
    }
  };

  const fetchTranslations = async () => {
    try {
      const translationsData = await translationService.getTranslations({
        projectId,
        ...filters
      });
      setTranslations(translationsData);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      showNotification('Failed to load translations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleGenerateFile = async (format) => {
    if (!project) return;
    
    setDownloading(true);
    try {
      const { blob, filename } = await translationService.generateTranslationFiles(projectId, format);
      
      // Download the file
      translationService.downloadFile(blob, filename);
      
      showNotification(`${format.toUpperCase()} file generated and downloaded successfully!`);
    } catch (error) {
      console.error(`Failed to generate ${format} file:`, error);
      showNotification(`Failed to generate ${format} file. Please try again.`, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      showNotification('Please select a file to upload.', 'error');
      return;
    }

    setUploading(true);
    try {
      await translationService.uploadTranslationFile(projectId, uploadFile);
      showNotification('Translation file uploaded successfully!');
      setUploadFile(null);
      // Refresh translations
      await fetchTranslations();
    } catch (error) {
      console.error('Failed to upload file:', error);
      showNotification('Failed to upload file. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchTranslations();
  };

  const handleClearFilters = () => {
    setFilters({
      language: '',
      word: '',
      key: ''
    });
    setLoading(true);
    fetchTranslations();
  };

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm mb-6">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Translation Details - {project?.name}
          </h1>
          <p className="text-gray-600">REQ-19: Generate translation files for developers</p>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="px-6 py-4">
          <div className={`rounded-md p-4 ${
            notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-4">
        {/* Project Info */}
        {project && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Project Name</p>
                <p className="font-medium">{project.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium">{project.description || 'No description'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Languages</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.languages && project.languages.length > 0 ? (
                    project.languages.map((lang, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No languages assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Generation Section - REQ-19 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Generate Translation Files</h2>
          <p className="text-gray-600 mb-4">Download translation files in different formats for developers</p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleGenerateFile('json')}
              disabled={downloading}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading ? 'Generating...' : 'Download JSON'}
            </button>
            
            <button
              onClick={() => handleGenerateFile('csv')}
              disabled={downloading}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading ? 'Generating...' : 'Download CSV'}
            </button>
          </div>
        </div>

        {/* File Upload Section - REQ-20 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload Translation File</h2>
          <p className="text-gray-600 mb-4">REQ-20: Upload translation files to update existing translations</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Translation File (JSON format)
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            
            {uploadFile && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Selected: {uploadFile.name}</span>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filter Translations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input
                type="text"
                name="language"
                value={filters.language}
                onChange={handleFilterChange}
                placeholder="e.g., EN, AR"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Translation Key</label>
              <input
                type="text"
                name="key"
                value={filters.key}
                onChange={handleFilterChange}
                placeholder="e.g., ABOUT, WELCOME"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Word</label>
              <input
                type="text"
                name="word"
                value={filters.word}
                onChange={handleFilterChange}
                placeholder="Search in translations"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Translations Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Translations</h2>
            <p className="text-gray-600 text-sm">{translations.length} translation(s) found</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Translation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Context
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {translations.map((translation) => (
                  <tr key={translation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {translation.translationKey}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {translation.language}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {translation.translatedText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {translation.context || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        translation.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : translation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {translation.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {translations.length === 0 && !loading && (
              <div className="bg-gray-50 rounded-md p-8 text-center">
                <p className="text-gray-500">No translations found for this project.</p>
              </div>
            )}
            
            {loading && (
              <div className="bg-gray-50 rounded-md p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading translations...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDetails;
