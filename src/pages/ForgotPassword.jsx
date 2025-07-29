import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PasswordInput } from "../components/reusableComponents/PasswordInput";
import Button from "../components/reusableComponents/Button";
import GTNLogo from "../assets/images/gtn-logo.png";

const ForgotPassword = () => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if ((step === "otp" || step === "reset") && isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, isResendDisabled]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim()) return setError("Please enter your email.");
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      if (!data.resetToken) throw new Error("No reset token received");

      setResetToken(data.resetToken);
      setStep("otp");
      setTimer(60);
      setIsResendDisabled(true);
      setMessage("OTP sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!/^\d{6}$/.test(otp)) return setError("Enter a valid 6-digit OTP.");
    if (!resetToken) return setError("Token missing. Restart the process.");
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid or expired OTP.");

      setMessage("OTP verified. You can now reset your password.");
      setStep("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!newPassword || !confirmPassword)
      return setError("Please fill all password fields.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");
    if (!resetToken) return setError("Token missing. Restart the process.");
    setIsLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/resetPasswordWithToken",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp, newPassword, confirmPassword, token: resetToken }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password.");
      setMessage("Password reset successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      if (!data.resetToken) throw new Error("No reset token received");

      setResetToken(data.resetToken);
      setTimer(60);
      setIsResendDisabled(true);
      setMessage("OTP resent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden font-sans">
      {/* Left Side (Sidebar) */}
      <div className="w-2/5 bg-gradient-to-b from-purple-800 to-teal-500 text-white flex flex-col items-center justify-center px-10 py-12">
        <img src={GTNLogo} alt="GTN Logo" className="w-32 h-auto mb-4" />
        <h1 className="text-3xl font-semibold text-center">GTN Portal</h1>
      </div>

      {/* Right Side (Form) */}
      <div className="w-3/5 bg-gray-100 flex items-center justify-center px-6 py-10">
        <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-center text-purple-700 mb-4">
            Forgot Password
          </h2>

          {message && (
            <p className="text-green-600 text-sm text-center font-medium mb-2">
              {message}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-sm text-center font-medium mb-2">
              {error}
            </p>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
              <p className="text-sm text-center mt-2">
                Back to{" "}
                <Link to="/login" className="text-purple-700 font-medium">
                  Login
                </Link>
              </p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded-md text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <div className="flex justify-between items-center gap-2">
                <Button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResendDisabled || isLoading}
                  className="text-xs"
                >
                  {isResendDisabled ? `Resend in ${timer}s` : "Resend OTP"}
                </Button>
                <Button type="submit" disabled={isLoading || !isResendDisabled}>
                  {isLoading ? "Verifying..." : "Continue"}
                </Button>
              </div>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <PasswordInput
                label="New Password"
                name="newPassword"
                placeholder="New password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
