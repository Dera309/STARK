import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "../types";
import api from "../services/api";
import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdToken,
} from "firebase/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  firebaseUser: FirebaseUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const logout = useCallback(async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth).catch(() => {});
      }
      await api.post("/auth/logout").catch(() => {});
    } catch {
      // ignore — still clear client state
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      setFirebaseUser(null);
      // Hard redirect so all component state is cleared
      window.location.href = "/login";
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const idToken = await getIdToken(fbUser);
          const response = await api.post("/auth/firebase-sync", {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
          });

          const userData = response.data.user;
          localStorage.setItem("token", idToken);
          localStorage.setItem("user", JSON.stringify(userData));
          setToken(idToken);
          setUser(userData);
        } catch (error) {
          console.error('Error syncing with backend:', error);
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role?.toUpperCase() === "ADMIN",
    isLoading,
    firebaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
