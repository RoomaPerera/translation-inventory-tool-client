import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import languageService from '../services/languageService';
import { useAuthContext } from '../hooks/useAuthContext';

const TranslatorManagement = () => {
  const [users, setUsers] = useState([]);
  const [translators, setTranslators] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [activeTab, setActiveTab] = useState('translators');
  const modalRef = useRef(null);
  const { user } = useAuthContext();

  // Click outside to close modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLanguageModal(false);
      }
    }
    
    if (showLanguageModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLanguageModal]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, languagesData] = await Promise.all([
        userService.getUserList(),
        languageService.getLanguages()
      ]);
      
      setUsers(usersData);
      setTranslators(usersData.filter(u => u.role === 'Translator'));
      setLanguages(languagesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showNotification('Failed to load data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleAssignLanguages = (translator) => {
    setSelectedUser(translator);
    setSelectedLanguages(translator.languages || []);
    setShowLanguageModal(true);
  };

  const handleLanguageToggle = (languageCode) => {
    setSelectedLanguages(prev => {
      if (prev.includes(languageCode)) {
        return prev.filter(code => code !== languageCode);
      } else {
        return [...prev, languageCode];
      }
    });
  };

  const handleSaveLanguages = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.assignLanguages(selectedUser._id, selectedLanguages);
      
      // Update local state
      setTranslators(prev => prev.map(translator => 
        translator._id === selectedUser._id 
          ? { ...translator, languages: selectedLanguages }
          : translator
      ));
      
      showNotification(`Languages assigned to ${selectedUser.name} successfully!`);
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Failed to assign languages:', error);
      showNotification('Failed to assign languages. Please try again.', 'error');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await userService.approveUser(userId);
      
      // Refresh data
      await fetchData();
      
      showNotification('User approved successfully!');
    } catch (error) {
      console.error('Failed to approve user:', error);
      showNotification('Failed to approve user. Please try again.', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await userService.deleteUser(userId);
        
        // Refresh data
        await fetchData();
        
        showNotification(`User "${userName}" deleted successfully!`);
      } catch (error) {
        console.error('Failed to delete user:', error);
        showNotification('Failed to delete user. Please try again.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm mb-6">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage translators and assign languages</p>
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
        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${
              activeTab === 'translators'
                ? 'text-indigo-700 border-indigo-700 bg-white'
                : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('translators')}
          >
            Translators
          </button>
          <button
            className={`py-3 px-6 font-medium text-base mr-2 rounded-t-lg border-b-2 focus:outline-none transition-colors ${
              activeTab === 'all'
                ? 'text-indigo-700 border-indigo-700 bg-white'
                : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Users
          </button>
        </div>

        {/* Translators Tab */}
        {activeTab === 'translators' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Translators & Language Assignment</h2>
              <p className="text-gray-600 text-sm">REQ-18: Assign languages to translators</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Translator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Languages
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {translators.map((translator) => (
                    <tr key={translator._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{translator.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{translator.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          translator.roleStatus === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {translator.roleStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {translator.languages && translator.languages.length > 0 ? (
                            translator.languages.map((lang, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm italic">No languages assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleAssignLanguages(translator)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit Languages
                        </button>
                        {translator.roleStatus === 'Pending' && (
                          <button
                            onClick={() => handleApproveUser(translator._id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(translator._id, translator.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {translators.length === 0 && (
                <div className="bg-gray-50 rounded-md p-8 text-center">
                  <p className="text-gray-500">No translators found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">All Users</h2>
              <p className="text-gray-600 text-sm">Manage all users in the system</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'Admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'Developer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.roleStatus === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.roleStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.roleStatus === 'Pending' && (
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="bg-gray-50 rounded-md p-8 text-center">
                  <p className="text-gray-500">No users found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Language Assignment Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div ref={modalRef}>
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Assign Languages to {selectedUser?.name}
                </h3>
                
                <div className="space-y-2 mb-6">
                  {languages.map((language) => (
                    <label key={language._id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(language.code)}
                        onChange={() => handleLanguageToggle(language.code)}
                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      />
                      <span className="text-sm text-gray-700">{language.name} ({language.code})</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowLanguageModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveLanguages}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslatorManagement;