import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface UserPreferences {
  hideBalance: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  toggleBalanceVisibility: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: UserPreferences = {
  hideBalance: false,
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const initializePreferences = () => {
      const stored = localStorage.getItem("userPreferences");
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch {
          // Use defaults if stored data is corrupted
        }
      }
    };

    // Initialize immediately to avoid blocking UI
    initializePreferences();
  }, []);

  const updatePreferences = useCallback(
    (newPrefs: Partial<UserPreferences>) => {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);
      localStorage.setItem("userPreferences", JSON.stringify(updated));
    },
    [preferences]
  );

  const toggleBalanceVisibility = useCallback(() => {
    updatePreferences({ hideBalance: !preferences.hideBalance });
  }, [preferences.hideBalance, updatePreferences]);

  const value = {
    preferences,
    toggleBalanceVisibility,
    updatePreferences,
  };

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
};
