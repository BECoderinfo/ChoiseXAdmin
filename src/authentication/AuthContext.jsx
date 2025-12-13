import { useState, useEffect } from "react";
import { AuthContext } from "./context";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
  }, [refreshToken]);

  const login = (accessToken, refreshTokenValue) => {
    setToken(accessToken);
    if (refreshTokenValue) {
      setRefreshToken(refreshTokenValue);
    }
  };
  
  const logout = () => {
    setToken(null);
    setRefreshToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
