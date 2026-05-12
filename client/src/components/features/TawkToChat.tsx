import React, { useRef } from "react";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import { useAuth } from "../../contexts/AuthContext";

const TawkToChat: React.FC = () => {
  const tawkRef = useRef<any>(null);
  const { user } = useAuth();

  const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID || "";
  const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID || "";

  if (!propertyId || !widgetId) return null;

  const handleLoad = () => {
    if (user && tawkRef.current && user.email) {
      tawkRef.current.setAttributes(
        {
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          userId: user._id,
        },
        (error: Error | null) => {
          if (error) console.error("Tawk.to setAttributes error:", error);
        }
      );
    }
  };

  return (
    <TawkMessengerReact
      propertyId={propertyId}
      widgetId={widgetId}
      ref={tawkRef}
      onLoad={handleLoad}
    />
  );
};

export default TawkToChat;
