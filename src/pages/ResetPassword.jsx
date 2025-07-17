import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Side from '../components/Side';
import { PasswordInput } from '../components/PasswordInput';  // import your reusable password input

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert('Password should be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    // Simulate API call to update password
    setTimeout(() => {
      console.log('Password updated:', password);
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="flex flex-row min-h-screen">
      <Side />

      <div className="flex w-1/2 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-bold text-purple-700">GTN Portal</h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
            Reset Your Password
          </h2>

          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <PasswordInput
                label="New Password"
                name="password"
                placeholder="Enter new password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                placeholder="Re-enter new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <Link
                  to="/login"
                  className="text-sm font-medium text-purple-600 hover:text-purple-500"
                >
                  Back to Log In
                </Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className={`inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
