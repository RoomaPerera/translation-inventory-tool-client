import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../services/projectService';
import languageService from '../services/languageService';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [translations, setTranslations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Sample translations
  useEffect(() => {
    const sampleTranslations = [
      { id: 1, key: 'ABOUT', language: 'EN', translation: 'About' },
      { id: 2, key: 'ABOUT', language: 'AR', translation: 'حول' },
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
    }
  };

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
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
    }
  };

  const handleCancelSelection = () => {
    setSelectedLanguages([]);
    setShowLanguageDropdown(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#f9fafb] to-[#e9f5f9] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm border border-[#e3f2fd]">
        <h1 className="text-xl font-bold text-[#164481]">GTN Portal</h1>

        <div className="flex items-center space-x-4">
          <div className="flex">
            <select
              className="border border-[#76b0e3] rounded-l px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#178aaa] text-[#202b3b]"
              value={selectedProject}
              onChange={handleProjectChange}
            >
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
              {projects.length === 0 && <option value="">No projects</option>}
            </select>

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
                className="border border-[#76b0e3] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#178aaa] w-40 text-[#202b3b]"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#58738c]">
                Keys | Words
              </span>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center">
              <button
                className="bg-[#164481] hover:bg-[#10325c] text-white px-3 py-1.5 rounded flex items-center transition-colors shadow-sm"
                onClick={fetchLanguages}
              >
                <span className="mr-1">+</span> Assign New Language
              </button>

              {showLanguageDropdown && selectedLanguages.length > 0 && (
                <div className="flex ml-2">
                  <button
                    className="px-3 py-1.5 bg-[#ca4c4c] hover:bg-[#b33c3c] text-white rounded-l transition-colors shadow-sm"
                    onClick={handleCancelSelection}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1.5 bg-[#178c78] hover:bg-[#0f7361] text-white rounded-r transition-colors shadow-sm"
                    onClick={handleAssignLanguages}
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#76b0e3] rounded-lg shadow-lg z-10 max-h-72 overflow-y-auto">
                <div className="p-2">
                  <h3 className="font-medium text-[#164481] mb-2 border-b border-[#e3f2fd] pb-1">Select Languages</h3>
                  
                  {languages.length === 0 ? (
                    <p className="text-[#58738c] py-2">No languages available</p>
                  ) : (
                    <div className="space-y-1">
                      {languages.map((lang) => (
                        <div 
                          key={lang._id}
                          className={`flex items-center p-2 hover:bg-[#f0f8ff] rounded cursor-pointer transition-colors ${
                            selectedLanguages.includes(lang.code) ? 'bg-[#e3f2fd]' : ''
                          }`}
                          onClick={() => toggleLanguageSelection(lang.code)}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#178aaa] focus:ring-[#76b0e3] border-[#76b0e3] rounded"
                            checked={selectedLanguages.includes(lang.code)}
                            onChange={() => {}}
                          />
                          <label className="ml-2 block text-sm text-[#202b3b]">
                            <span className="font-medium">{lang.name}</span>
                            <span className="text-[#58738c] ml-1">({lang.code})</span>
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

      {/* Notification */}
      {notification.show && (
        <div className={`mb-6 p-3 rounded-md shadow-sm ${
          notification.type === 'success' 
            ? 'bg-[#e3f8f5] text-[#0f7361] border-l-4 border-[#178c78]' 
            : 'bg-[#fde8e8] text-[#b33c3c] border-l-4 border-[#ca4c4c]'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Display user's languages if they exist */}
      {selectedLanguages.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-[#e3f2fd]">
          <h2 className="text-lg font-semibold text-[#164481] mb-3">Selected Languages</h2>
          <div className="flex flex-wrap gap-2">
            {selectedLanguages.map(langCode => {
              const lang = languages.find(l => l.code === langCode);
              return (
                <div key={langCode} className="bg-[#e3f2fd] text-[#164481] px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-sm">
                  {lang ? lang.name : langCode}
                  <button 
                    onClick={() => toggleLanguageSelection(langCode)}
                    className="ml-1 text-[#178aaa] hover:text-[#10708c] focus:outline-none"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content area - can be expanded with more sections */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-[#e3f2fd]">
        <h2 className="text-lg font-semibold text-[#164481] mb-4">Translation Dashboard</h2>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#178aaa]"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-[#58738c]">
            <p>No projects found. Create a new project to get started.</p>
            <button className="mt-4 px-4 py-2 bg-[#178aaa] hover:bg-[#10708c] text-white rounded">
              Create Project
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#e3f2fd]">
            <table className="min-w-full divide-y divide-[#e3f2fd]">
              <thead className="bg-[#f0f8ff]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#58738c] uppercase tracking-wider">
                    Key
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#58738c] uppercase tracking-wider">
                    Language
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#58738c] uppercase tracking-wider">
                    Translation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#e3f2fd]">
                {translations.map((translation) => (
                  <tr key={`${translation.id}-${translation.language}`} className="hover:bg-[#f9fafb]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#202b3b]">{translation.key}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#58738c]">{translation.language}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#202b3b]">{translation.translation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;