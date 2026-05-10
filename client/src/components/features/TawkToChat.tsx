import React, { useRef, useEffect } from "react";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import { useAuth } from "../../contexts/AuthContext";

const TawkToChat: React.FC = () => {
  const tawkRef = useRef<any>(null);
  const { user } = useAuth();

  const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID || "";
  const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID || "";

  // Set user attributes when user is available
  useEffect(() => {
    if (user && tawkRef.current) {
      tawkRef.current.setAttributes(
        {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          userId: user._id,
        },
        (error: Error | null) => {
          if (error) console.error("Error setting Tawk.to attributes:", error);
        }
      );
    }
  }, [user]);

  // Don't render if IDs are not configured
  if (!propertyId || !widgetId) {
    return null;
  }

  return (
    <TawkMessengerReact
      propertyId={propertyId}
      widgetId={widgetId}
      ref={tawkRef}
      onLoad={() => { /* Chat widget loaded */ }}
    />
  );
};

export default TawkToChat;
