import { createContext, useReducer, useEffect } from "react";
import API from "../services/axiosInstance";

export const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, authReady: true };
    case "LOGOUT":
      return { ...state, user: null, authReady: true };
    case "AUTH_READY":
      return { ...state, authReady: true };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    authReady: false,
  });

  // Function to check authentication status with server
  const checkAuthStatus = async () => {
    try {
      // Make a request to verify the HTTP-only cookie
      // requireAuth middleware will automatically refresh the token
      const response = await API.get("/auth/me");
      if (response.data.user) {
        dispatch({ type: "LOGIN", payload: response.data.user });
      } else {
        dispatch({ type: "AUTH_READY" });
      }
    } catch (error) {
      // Cookie is invalid/expired or user is not authenticated
      console.log("Auth check failed:", error.response?.data || error.message);
      dispatch({ type: "AUTH_READY" });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Setup axios interceptors to handle authentication errors
  useEffect(() => {
    const responseInterceptor = API.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 (Unauthorized) responses
        if (error.response?.status === 401) {
          console.log("401 error - logging out user");
          dispatch({ type: "LOGOUT" });
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      API.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = (userData) => {
    dispatch({ type: "LOGIN", payload: userData });
  };

  const logout = async () => {
    try {
      // Call server logout to clear the HTTP-only cookie
      await API.get("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used inside AuthContextProvider");
  return context;
};
