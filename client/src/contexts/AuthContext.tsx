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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      await api.post("/auth/logout");
    } catch {
      // ignore — still clear client state
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
    // Hard redirect so all component state is cleared
    window.location.href = "/login";
  }, []);

  const login = (userData: User, authToken: string) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    setIsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser?.email);
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await getIdToken(firebaseUser);
          
          // Sync with backend to get user data
          const response = await api.post("/auth/firebase-sync", {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });

          const userData = response.data.user;
          localStorage.setItem("token", idToken);
          localStorage.setItem("user", JSON.stringify(userData));
          setToken(idToken);
          setUser(userData);
        } catch (error) {
          console.error('Error syncing with backend:', error);
          // Still set basic user data from Firebase
          const basicUser: User = {
            _id: firebaseUser.uid,
            email: firebaseUser.email || "",
            firstName: firebaseUser.displayName?.split(' ')[0] || "",
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || "",
            role: "USER",
            kycTier: 0,
            status: "ACTIVE",
          };
          const idToken = await getIdToken(firebaseUser);
          localStorage.setItem("token", idToken);
          localStorage.setItem("user", JSON.stringify(basicUser));
          setToken(idToken);
          setUser(basicUser);
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
