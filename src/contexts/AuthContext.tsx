import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAuthAxios } from "../utils/apiLogicFactory";

// TODO: decouple axios from here by making axiosprovider a child of auth provider
// it can use values from auth provider to make an api instance for itself
// https://blog.logrocket.com/react-native-jwt-authentication-using-axios-interceptors/

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isLoadingSendOtp: boolean,
  isLoadingVerifyOtp: boolean,
  error: string | null;
  api: ReturnType<typeof createAuthAxios>;
  sendOtp: (phone: string) => Promise<string | null>;
  verifyOtp: (tid: string, otp: string) => Promise<boolean>;
  signIn: (newAccessToken: string, newRefreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSendOtp, setIsLoadingSendOtp] = useState(false);
  const [isLoadingVerifyOtp, setIsLoadingVerifyOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign-out function
  const signOut = async () => {
    setAccessToken(null);
    setRefreshToken(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_KEY);
  };

  // Sign-in function
  const signIn = async (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setIsLoggedIn(true);

    await AsyncStorage.setItem(TOKEN_KEY, newAccessToken);
    await AsyncStorage.setItem(REFRESH_KEY, newRefreshToken);
  };

  // Initialize API instance
  const api = createAuthAxios({
    accessToken: accessToken || "",
    refreshToken: refreshToken || "",
    setAccessToken,
    signOut,
  });

  // API Functions
  const sendOtp = async (phone: string): Promise<string | null> => {
    setIsLoadingSendOtp(true);
    setError(null);
    try {
      const response = await api.post("/auth/sendOtp", { phone });
      return response.data.tid; // Return the transaction ID
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
      return null;
    } finally {
      setIsLoadingSendOtp(false);
    }
  };

  // Verify OTP (returns boolean)
  const verifyOtp = async (tid: string, otp: string): Promise<boolean> => {
    setIsLoadingVerifyOtp(true);
    setError(null);
    try {
      const response = await api.post("/auth/verifyOtp", { tid, otp });
      if (response.data.success) {
        await signIn(response.data.accessToken, response.data.refreshToken);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
      return false;
    } finally {
      setIsLoadingVerifyOtp(false);
    }
  };

  // Load tokens from storage and determine login state
  useEffect(() => {
    const loadTokens = async () => {
      setIsLoading(true);
      setError(null);

      const storedAccess = await AsyncStorage.getItem(TOKEN_KEY);
      const storedRefresh = await AsyncStorage.getItem(REFRESH_KEY);

      if (storedRefresh) {
        setRefreshToken(storedRefresh);
        setAccessToken(storedAccess);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }

      setIsLoading(false);
    };

    loadTokens();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        isLoggedIn,
        isLoading,
        isLoadingSendOtp,
        isLoadingVerifyOtp,
        error,
        api,
        sendOtp,
        verifyOtp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};