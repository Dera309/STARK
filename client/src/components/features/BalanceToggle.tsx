import React from "react";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const BalanceToggle: React.FC = () => {
  const { preferences, toggleBalanceVisibility } = useUserPreferences();

  return (
    <button
      onClick={toggleBalanceVisibility}
      className="p-2 rounded-lg hover:bg-surface-container-high transition-colors group"
      aria-label={preferences.hideBalance ? "Show balance" : "Hide balance"}
    >
      <span
        className={`material-symbols-outlined text-lg transition-colors ${
          preferences.hideBalance ? "text-outline" : "text-primary"
        }`}
      >
        {preferences.hideBalance ? "visibility_off" : "visibility"}
      </span>
    </button>
  );
};

export default BalanceToggle;
