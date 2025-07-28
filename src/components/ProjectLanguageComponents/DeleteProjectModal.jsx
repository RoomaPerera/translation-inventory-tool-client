import { useState } from 'react';
import projectService from '../../services/projectService';

const DeleteProjectModal = ({ project, onSuccess, onCancel }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  // Debug log to see what's being passed
  console.log('DeleteProjectModal - project:', project);

  const projectName = project?.name || project?.title || 'Unnamed Project';
  const confirmationText = 'DELETE';

  const handleDelete = async () => {
    if (confirmText !== confirmationText) {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await projectService.deleteProject(project._id);
      if (onSuccess) {
        onSuccess(project._id);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError(err.message || 'Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmTextChange = (e) => {
    setConfirmText(e.target.value);
    if (error) setError(null); // Clear error when user starts typing
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Warning Header */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-lg">⚠️</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold mb-1">
              Delete Project: "{projectName}"
            </h3>
            <p className="text-red-700 text-sm">
              This action cannot be undone. This will permanently delete the project and all associated data.
            </p>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">Project Details:</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div><strong>Name:</strong> {projectName}</div>
          {project?.description && (
            <div><strong>Description:</strong> {project.description}</div>
          )}
          {project?.languages && project.languages.length > 0 && (
            <div>
              <strong>Languages:</strong> {Array.isArray(project.languages) ? project.languages.join(', ') : project.languages}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Created: {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
      </div>

      {/* Confirmation Section */}
      <div className="space-y-3">
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            To confirm deletion, please type <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono">{confirmationText}</code> below:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={handleConfirmTextChange}
            placeholder={`Type "${confirmationText}" to confirm`}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
            disabled={isDeleting}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4 gap-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="text-gray-700 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || confirmText !== confirmationText}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isDeleting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
        </button>
      </div>

      {/* Additional Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-600 text-sm">💡</span>
          <p className="text-yellow-800 text-xs">
            <strong>Alternative:</strong> Consider archiving this project instead of deleting it permanently if you might need it in the future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;