import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Side from '../components/Side';
import { PasswordInput } from '../components/PasswordInput';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resetToken, setResetToken] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if ((step === 'otp' || step === 'reset') && isResendDisabled) {
      countdown = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [step, isResendDisabled]);

  const handleEmailSubmit = async e => {
    e.preventDefault();
    if (!email.trim()) return alert('Please enter your email');
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      if (!data.resetToken) throw new Error('Server did not send resetToken');

      console.log('✅ resetToken:', data.resetToken);
      setResetToken(data.resetToken);
      setStep('otp');
      setTimer(60);
      setIsResendDisabled(true);
      alert('OTP sent to your email');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpContinue = e => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(otp.trim())) {
      return alert('Enter a valid 6-digit OTP');
    }
    setStep('reset');
  };

  const handleResetSubmit = async e => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return alert('Fill all password fields');
    if (newPassword !== confirmPassword) return alert('Passwords do not match');
    if (!resetToken) return alert('Token missing, please restart the process.');

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      alert('Password reset successful! Redirecting to login...');
      navigate('/login');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      if (!data.resetToken) throw new Error('Server did not send resetToken');

      console.log('✅ Resent resetToken:', data.resetToken);
      setResetToken(data.resetToken);
      setTimer(60);
      setIsResendDisabled(true);
      alert('OTP resent to your email');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-row min-h-screen">
      <Side />
      <div className="flex w-1/2 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-bold text-purple-700">GTN Portal</h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">Forgot Your Password?</h2>

          {/* Step 1: Email Form */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
              <p className="text-center text-sm text-gray-600 mb-6">Enter your email address below to receive a 6-digit OTP.</p>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-between items-center">
                <Link to="/login" className="text-purple-600 hover:text-purple-800 text-sm font-medium">Back to Login</Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleOtpContinue} className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
              <p className="text-center text-sm text-gray-600 mb-6">We've sent a 6-digit OTP to <strong>{email}</strong>. Enter it below:</p>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="------"
                className="w-full px-3 py-2 border rounded-md text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  disabled={isResendDisabled || isLoading}
                  onClick={handleResendOtp}
                  className={`px-4 py-2 rounded-md text-sm ${isResendDisabled || isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500'}`}
                >
                  {isResendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
              <p className="text-center text-sm text-gray-600 mb-6">Set a new password for <strong>{email}</strong>.</p>
              <PasswordInput
                label="New Password"
                name="newPassword"
                placeholder="New password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
