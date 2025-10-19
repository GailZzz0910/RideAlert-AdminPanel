import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

interface FleetInfo {
  company_name?: string;
  [key: string]: any;
}

interface User {
  id: string;
  company_name: string;
  company_code: string;
  contact_info?: Array<any>;
  subscription_plan: string;
  is_active: boolean;
  max_vehicles: number;
  role: string;
  created_at: string;
  last_updated: string;
  fleet_id?: string;
  fleet?: FleetInfo;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

// Helper to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const decoded = JSON.parse(atob(parts[1]));
    if (!decoded.exp) return false;

    // Token expired if exp time is less than current time
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to perform logout
  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }, []);

  // Function to validate tokens and refresh if needed
  const validateAndRefreshTokens = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refresh_token");

    // If no tokens stored, user is already logged out
    if (!storedToken || !storedRefreshToken) {
      return;
    }

    // Check if access token is expired
    if (isTokenExpired(storedToken)) {
      // Check if refresh token is also expired
      if (isTokenExpired(storedRefreshToken)) {
        // Both expired - force logout
        console.warn("🔐 Both tokens expired - forcing logout");
        signOut();
        return;
      }

      // Try to refresh the access token
      try {
        console.log("🔄 Access token expired, attempting refresh...");
        const res = await api.post("/fleets/refresh", {
          refresh_token: storedRefreshToken,
        });

        const newAccessToken = res.data.access_token;
        localStorage.setItem("token", newAccessToken);
        setToken(newAccessToken);
        console.log("✅ Token refreshed successfully");
      } catch (err) {
        // Refresh failed - logout
        console.warn("❌ Token refresh failed - forcing logout");
        signOut();
      }
    }
  }, [signOut]);

  // Initial load - restore user session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Validate tokens on app startup
        validateAndRefreshTokens();
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refresh_token");
      }
    }
    setLoading(false);
  }, [validateAndRefreshTokens]);

  // Set up interval to check token expiration every 5 seconds
  useEffect(() => {
    const tokenCheckInterval = setInterval(() => {
      validateAndRefreshTokens();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(tokenCheckInterval);
  }, [validateAndRefreshTokens]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/fleets/login", { email, password });
      const { access_token, fleet, refresh_token } = res.data;

      if (!["admin", "superadmin"].includes(fleet.role)) {
        setError("User account is prohibited from logging in.");
        return false;
      }

      setToken(access_token);
      setUser(fleet);
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(fleet));
      return true;
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403) {
        setError("User is not verified.");
      } else if (status === 401) {
        setError("Login failed. Please check your credentials.");
      }
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, token, login, signOut, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};