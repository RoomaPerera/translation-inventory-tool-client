import { useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import projectService from '../../services/projectService';

const EditProjectForm = ({ project = {}, onSuccess, availableLanguages = [] }) => {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    languages: project?.languages || [],
  });

  const [showLanguageSection, setShowLanguageSection] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addLanguage = () => {
    if (!newLanguage.trim()) return;
    const newLangs = newLanguage
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l && !formData.languages.includes(l));
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, ...newLangs],
    }));
    setNewLanguage('');
  };

  const removeLanguage = (index) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const toggleLanguage = (langCode) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(langCode)
        ? prev.languages.filter((c) => c !== langCode)
        : [...prev.languages, langCode],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const projectData = { ...formData };
      if (project?._id) {
        await projectService.updateProject(project._id, projectData);
        setSuccess('Project updated successfully!');
      } else {
        if (user?._id) projectData.createdBy = user._id;
        await projectService.addProject(projectData);
        setSuccess('Project created successfully!');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded">{success}</div>}

      <div>
        <label className="block mb-1 font-medium">
          Project Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1.5 text-sm focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="2"
          className="w-full border rounded px-2 py-1.5 text-sm focus:ring-indigo-500"
        ></textarea>
      </div>

      {/* Toggle Button - Left aligned */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">Languages</label>
        <button
          type="button"
          onClick={() => setShowLanguageSection(!showLanguageSection)}
          className="text-indigo-600 hover:underline text-sm mb-2"
        >
          {showLanguageSection ? 'Hide Languages' : 'Edit Languages'}
        </button>
      </div>


      {/* Conditionally Show Language Section */}
      {showLanguageSection && (
        <div>
          <label className="block mb-1 font-medium">Languages</label>

          <div className="flex flex-wrap gap-1 mb-2">
            {availableLanguages.map((lang) => (
              <button
                type="button"
                key={lang._id}
                onClick={() => toggleLanguage(lang.code)}
                title={lang.name} // This shows the language name on hover
                className={`px-2 py-1 rounded text-xs border ${formData.languages.includes(lang.code)
                    ? 'bg-indigo-200 border-indigo-400 text-indigo-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-indigo-50'
                  }`}
              >
                {lang.code}
              </button>

            ))}
          </div>

          {/* Selected Language Tags */}
          {formData.languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-1">
              {formData.languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full flex items-center text-xs"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(idx)}
                    className="ml-1 text-indigo-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Manual Add Language */}
          <div className="flex items-center mt-1">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLanguage();
                }
              }}
              placeholder="EN, FR"
              className="flex-1 px-2 py-1 text-sm border rounded-l focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={addLanguage}
              className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-r hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2 gap-2 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onSuccess && onSuccess()}
          className="text-gray-700 bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Saving...' : 'Update'}
        </button>
      </div>
    </form>
  );
};

export default EditProjectForm;
