import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from './reusableComponents/PasswordInput';
import Button from './reusableComponents/Button';
import Modal from './reusableComponents/Modal';
import TranslationQualityCheck from '../pages/TranslationQualityCheck';

// Helper to generate a consistent color based on the user identifier
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 50%)`;
};

const UserProfile = () => {
  const [user, setUser] = useState({ userName: '', email: '', role: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal states for delete account
  const [showModal, setShowModal] = useState(false);
  const [modalEmail, setModalEmail] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setModalEmail(JSON.parse(storedUser).email || '');
    }
  }, []);

  const handleTranslationQualityCheck = () => {
    navigate('/quality-check');
  };

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    clearMessages();

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          oldPassword: currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update password.');
      } else {
        setMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: modalEmail,
          password: modalPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || 'Failed to delete account.');
      } else {
        alert('Account deleted successfully.');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      setModalError('Server error. Please try again later.');
    }
    setModalLoading(false);
  };

  const userInitial = (user.userName || user.email || '?').charAt(0).toUpperCase();
  const avatarColor = stringToColor(user.userName || user.email || 'User');

  return (
    <div className="max-w-2xl mx-left  bg-white rounded-lg">
      <p className="text-gray-600 mb-6">
        Manage your personal info, reset your password, or deactivate your account.
      </p>

      {/* User Info */}
      <div className="flex w-full items-center gap-7 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-gray-300">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2"
          style={{ backgroundColor: avatarColor, borderColor: avatarColor }}
        >
          {userInitial}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{user.userName || 'User Name'}</p>
          <p className="text-sm text-gray-600">{user.email || 'user@email.com'}</p>
          <p className="text-xs text-gray-500 italic">{user.role || 'Role'}</p>
        </div>
      </div>

      {/* Password Update */}
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-bold text-indigo-700">Change Password</h3>

        {message && <p className="text-green-600 font-medium">{message}</p>}
        {error && <p className="text-red-600 font-medium">{error}</p>}

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <PasswordInput
            label="Current Password"
            name="current-password"
            placeholder="Enter current password"
            required
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              clearMessages();
            }}
          />
          <PasswordInput
            label="New Password"
            name="new-password"
            placeholder="Enter new password"
            required
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              clearMessages();
            }}
          />
          <PasswordInput
            label="Confirm New Password"
            name="confirm-password"
            placeholder="Re-enter new password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearMessages();
            }}
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>

      {/* Deactivate Account */}
      <div className="space-y-3 border-t border-gray-200 pt-8 mt-8">
        <h3 className="text-lg font-bold text-indigo-700">Deactivate Account</h3>
        <p className="text-sm text-gray-600">
          Deactivating your account will permanently delete your data and disable your access to the GTN Portal.
        </p>
        <Button
          type="button"
          variant="primary"
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowModal(true)}
        >
          Deactivate Account
        </Button>
      </div>
      {/* ------------------------------------- */}
      <div className="space-y-3 border-t border-gray-200 pt-8 mt-8">
        <h3 className="text-lg font-bold text-indigo-700">TranslationQualityCheck</h3>
        
        <Button
          type="button"
          variant="primary"
          className="bg-red-600 hover:bg-red-700"
          onClick={handleTranslationQualityCheck}
        >
          TranslationQualityCheck
        </Button>
      </div>
      {/* -------------------------------------------- */}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Account Deletion"
        subtitle="Please enter your email and password to confirm deletion."
      >
        {modalError && <p className="text-red-600 mb-2">{modalError}</p>}

        <input
          type="email"
          placeholder="Email"
          value={modalEmail}
          onChange={(e) => setModalEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={modalPassword}
          onChange={(e) => setModalPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowModal(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={modalLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {modalLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
