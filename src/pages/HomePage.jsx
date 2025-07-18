import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import languageService from '../services/languageService';
import projectService from '../services/projectService';

const HomePage = () => {
  const { user } = useAuthContext();
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [translationsFilter, setTranslationsFilter] = useState('Translations');
  const [downloadFormat, setDownloadFormat] = useState('JSON Format');
  const [languages, setLanguages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects();
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]._id);
      } catch (err) {
        console.error('Error fetching projects:', err);
        // Fallback to sample data if API fails
        const sampleProjects = [
          { _id: 'rubix', name: 'Rubix' },
          { _id: 'project2', name: 'Project 2' },
          { _id: 'project3', name: 'Project 3' }
        ];
        setProjects(sampleProjects);
        setSelectedProject('rubix');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Sample data - you can replace with actual API calls
  useEffect(() => {
    const sampleTranslations = [
      { no: 1, key: 'ABOUT', language: 'EN', translation: 'About' },
      { no: 2, key: 'ABOUT', language: 'AR', translation: 'حول' },
    ];
    setTranslations(sampleTranslations);
  }, [selectedProject]);

  // Fetch available languages
  const fetchLanguages = async () => {
    try {
      const data = await languageService.getLanguages();
      setLanguages(data);
      setShowLanguageDropdown(true);
    } catch (err) {
      console.error('Error fetching languages:', err);
      // Fallback to sample languages if API fails
      const sampleLanguages = [
        { _id: '1', name: 'English', code: 'EN' },
        { _id: '2', name: 'Arabic', code: 'AR' },
        { _id: '3', name: 'French', code: 'FR' },
        { _id: '4', name: 'Spanish', code: 'ES' }
      ];
      setLanguages(sampleLanguages);
      setShowLanguageDropdown(true);
    }
  };

  const toggleLanguageSelection = (langCode) => {
    setSelectedLanguages(prev => {
      if (prev.includes(langCode)) {
        return prev.filter(code => code !== langCode);
      } else {
        return [...prev, langCode];
      }
    });
  };

  const handleAssignLanguages = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setNotification({
          show: true,
          message: 'You must be logged in to assign languages',
          type: 'error'
        });
        return;
      }

      await languageService.assignLanguagesToUser(userId, selectedLanguages);
      
      setNotification({
        show: true,
        message: 'Languages assigned successfully!',
        type: 'success'
      });
      
      setShowLanguageDropdown(false);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error assigning languages:', error);
      setNotification({
        show: true,
        message: 'Failed to assign languages. Please try again.',
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleCancelSelection = () => {
    setSelectedLanguages([]);
    setShowLanguageDropdown(false);
  };

  const handleAddNewTranslation = () => {
    // Handle add new translation logic
    console.log('Add new translation clicked');
  };

  const handleAssignNewLanguage = () => {
    // Handle assign new language logic
    fetchLanguages();
  };

  const handleDownload = () => {
    // Handle download logic
    console.log('Download clicked with format:', downloadFormat);
  };

  const handleEdit = (translationNo) => {
    console.log('Edit translation:', translationNo);
  };

  const handleDelete = (translationNo) => {
    console.log('Delete translation:', translationNo);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with GTN Portal branding */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">GTN Portal</h1>
          
          <div className="flex items-center space-x-4">
            {/* Project Selector */}
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
              {projects.length === 0 && <option value="">No projects</option>}
            </select>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                Keys | Words
              </span>
            </div>

            {/* Assign New Language Button */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center">
                <button
                  onClick={handleAssignNewLanguage}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  + Assign New Language
                </button>

                {showLanguageDropdown && selectedLanguages.length > 0 && (
                  <div className="flex ml-2">
                    <button
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-l transition-colors text-sm"
                      onClick={handleCancelSelection}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r transition-colors text-sm"
                      onClick={handleAssignLanguages}
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>

              {showLanguageDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-72 overflow-y-auto">
                  <div className="p-2">
                    <h3 className="font-medium text-gray-900 mb-2 border-b border-gray-200 pb-1">Select Languages</h3>
                    
                    {languages.length === 0 ? (
                      <p className="text-gray-500 py-2">No languages available</p>
                    ) : (
                      <div className="space-y-1">
                        {languages.map((lang) => (
                          <div 
                            key={lang._id}
                            className={`flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors ${
                              selectedLanguages.includes(lang.code) ? 'bg-purple-50' : ''
                            }`}
                            onClick={() => toggleLanguageSelection(lang.code)}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              checked={selectedLanguages.includes(lang.code)}
                              onChange={() => {}}
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                              <span className="font-medium">{lang.name}</span>
                              <span className="text-gray-500 ml-1">({lang.code})</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-3 rounded-md shadow-sm ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
              : 'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Display selected languages if they exist */}
        {selectedLanguages.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Selected Languages</h2>
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map(langCode => {
                const lang = languages.find(l => l.code === langCode);
                return (
                  <div key={langCode} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-sm">
                    {lang ? lang.name : langCode}
                    <button 
                      onClick={() => toggleLanguageSelection(langCode)}
                      className="ml-1 text-purple-600 hover:text-purple-800 focus:outline-none"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Control Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Add New Translation Button */}
              <button
                onClick={handleAddNewTranslation}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                + Add new Translation
              </button>

              {/* Filter Dropdowns */}
              <select 
                value="Show All Entries"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Show All Entries">Show All Entries</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>

              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All Languages">All Languages</option>
                <option value="EN">English</option>
                <option value="AR">Arabic</option>
              </select>

              <select 
                value={translationsFilter}
                onChange={(e) => setTranslationsFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Translations">Translations</option>
                <option value="Keys Only">Keys Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {/* Download Section */}
              <span className="text-sm text-gray-600">Download</span>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="json"
                  name="format"
                  checked={downloadFormat === 'JSON Format'}
                  onChange={() => setDownloadFormat('JSON Format')}
                  className="text-purple-600"
                />
                <label htmlFor="json" className="ml-1 text-sm text-gray-600">JSON Format</label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="csv"
                  name="format"
                  checked={downloadFormat === 'CSV'}
                  onChange={() => setDownloadFormat('CSV')}
                  className="text-purple-600"
                />
                <label htmlFor="csv" className="ml-1 text-sm text-gray-600">CSV</label>
              </div>

              <button
                onClick={handleDownload}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Translations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-purple-600 text-white">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 font-medium text-sm">
              <div className="col-span-1">No</div>
              <div className="col-span-3">Key</div>
              <div className="col-span-2">Language</div>
              <div className="col-span-4">Translation</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading translations...</p>
              </div>
            ) : translations.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No translations found.</p>
              </div>
            ) : (
              translations.map((translation) => (
                <div 
                  key={translation.no}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-1 text-sm text-gray-900">
                    {translation.no}
                  </div>
                  <div className="col-span-3 text-sm font-medium text-gray-900">
                    {translation.key}
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    {translation.language}
                  </div>
                  <div className="col-span-4 text-sm text-gray-900">
                    {translation.translation}
                  </div>
                  <div className="col-span-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(translation.no)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(translation.no)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;