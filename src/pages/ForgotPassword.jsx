import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Side from '../components/Side';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (step === 'otp' && isResendDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
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

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      console.log('Reset link sent to:', email);
      setIsLoading(false);
      setStep('otp');
      setTimer(60);
      setIsResendDisabled(true);
    }, 1500);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      alert('Please enter a valid 6-digit OTP.');
      return;
    }

    console.log('OTP entered:', otp);

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/reset-password');
    }, 1500);
  };

  const handleResendOtp = () => {
    console.log('Resending OTP to:', email);
    setTimer(60);
    setIsResendDisabled(true);

    // Simulate OTP resend logic
    // In production, call your backend here
  };

  return (
    <div className="flex flex-row min-h-screen">
      <Side />

      <div className="flex w-1/2 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-bold text-purple-700">GTN Portal</h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
            Forgot Your Password?
          </h2>

          {step === 'email' && (
            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <p className="text-sm text-gray-600 mb-6 text-center">
                Enter your email address below, and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>

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
                    className={`inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'otp' && (
            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <p className="text-sm text-gray-600 mb-6 text-center">
                We've sent a 6-digit verification code to <strong>{email}</strong>.
                Please enter it below to continue.
              </p>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Enter 6-digit OTP
                  </label>
                  <div className="mt-1">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="- - - - - -"
                      className="placeholder-black placeholder-opacity-100 placeholder-font-bold ... appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-center tracking-widest text-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendDisabled}
                    className={`inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                      isResendDisabled
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    }`}
                  >
                    {isResendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
