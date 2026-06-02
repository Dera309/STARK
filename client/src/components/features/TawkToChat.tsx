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

  // Configure Tawk.to widget position before it loads
  useEffect(() => {
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_API.customStyle = {
      visibility: {
        desktop: {
          position: 'cr',
          xOffset: 20,
          yOffset: 100
        },
        mobile: {
          position: 'cr',
          xOffset: 20,
          yOffset: 100
        }
      }
    };

    (window as any).Tawk_API.onLoad = function() {
      // Try to reposition the widget after it loads as backup
      setTimeout(() => {
        const widgetContainer = document.querySelector('[class*="tawk"]');
        if (widgetContainer) {
          (widgetContainer as HTMLElement).style.top = '100px';
          (widgetContainer as HTMLElement).style.bottom = 'auto';
          (widgetContainer as HTMLElement).style.right = '20px';
          (widgetContainer as HTMLElement).style.zIndex = '9999';
        }
      }, 2000);
    };
  }, []);

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
