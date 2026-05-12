import React, { useRef, useEffect } from "react";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import { useAuth } from "../../contexts/AuthContext";

const TawkToChat: React.FC = () => {
  const tawkRef = useRef<any>(null);
  const { user } = useAuth();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID || "";
  const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID || "";

  if (!propertyId || !widgetId) return null;

  const handleLoad = () => {
    const currentUser = userRef.current;
    if (currentUser?._id && currentUser?.email && tawkRef.current) {
      tawkRef.current.setAttributes(
        {
          name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
          email: currentUser.email,
          userId: currentUser._id,
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
