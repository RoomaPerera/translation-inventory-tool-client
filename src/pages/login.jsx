import { React, useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useLogin();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await login(email, password)) nav("/");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border rounded"
    >
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border p-2 mb-3 w-full"
      />
      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border p-2 mb-3 w-full"
      />
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
