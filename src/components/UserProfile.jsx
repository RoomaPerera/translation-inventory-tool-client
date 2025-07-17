import React, { useState } from 'react';
import { PasswordInput } from './PasswordInput';
import Button from './Button';
// import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const UserProfile = () => {
  // Simulated user data
  const [user] = useState({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    profileImage: '', // fallback to avatar with initial if empty
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordUpdate = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    // TODO: Replace with backend API call
    console.log({ currentPassword, newPassword, confirmPassword });
    alert('Password updated successfully.');
    
    // Clear inputs after success
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <p className="text-gray-600">
        Manage your personal info, reset your password, or deactivate your account.
      </p>

      {/* User Info with fallback avatar */}
      <div className="flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="h-16 w-16 rounded-full object-cover border-2 border-green-500"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-green-500">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-gray-900">{user.name || 'User Name'}</p>
          <p className="text-sm text-gray-600">{user.email || 'user@email.com'}</p>
        </div>
      </div>

      {/* Change Password */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-indigo-700">Change Password</h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-sm">
          <PasswordInput
            label="Current Password"
            name="current-password"
            placeholder="Enter current password"
            required
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          <PasswordInput
            label="New Password"
            name="new-password"
            placeholder="Enter new password"
            required
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <PasswordInput
            label="Confirm New Password"
            name="confirm-password"
            placeholder="Re-enter new password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Deactivate Account */}
      <div className="space-y-3 border-t border-gray-200 pt-8 max-w-sm">
        <h3 className="text-lg font-bold text-indigo-700">Deactivate Account</h3>
        <p className="max-w-2xl text-sm text-gray-600">
          Deactivating your account will disable your access to the GTN Portal. You can reactivate by contacting an administrator.
        </p>
        <div>
          <Button
            type="button"
            variant="primary"
            className="bg-red-600 hover:bg-red-700"
          >
            Deactivate Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
