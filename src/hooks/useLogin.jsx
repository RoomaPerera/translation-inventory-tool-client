import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { API_BASE } from "../config/env";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Login failed");
        setIsLoading(false);
        return false;
      }
      // Always save the latest token from backend response to localStorage
      // This ensures Authorization header uses the freshest token for all API calls
      localStorage.setItem("user", JSON.stringify(json));
      // Log the user object being saved
      console.log("[useLogin] Saved user to localStorage:", json);
      dispatch({ type: "LOGIN", payload: json });
      setIsLoading(false);
      return true;
    } catch {
      setError("Network error");
      setIsLoading(false);
      return false;
    }
  };

  return { login, isLoading, error };
};
