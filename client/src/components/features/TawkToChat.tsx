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

  // Log for debugging
  console.log('Tawk.to configuration:', { propertyId, widgetId, hasUser: !!user });

  if (!propertyId || !widgetId) {
    console.warn('Tawk.to not configured: Missing VITE_TAWK_PROPERTY_ID or VITE_TAWK_WIDGET_ID');
    return null;
  }

  const handleLoad = () => {
    console.log('Tawk.to widget loaded');
    const currentUser = userRef.current;
    if (currentUser?._id && currentUser?.email && tawkRef.current) {
      console.log('Setting Tawk.to user attributes:', {
        name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        email: currentUser.email,
        userId: currentUser._id,
      });
      tawkRef.current.setAttributes(
        {
          name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
          email: currentUser.email,
          userId: currentUser._id,
        },
        (error: Error | null) => {
          if (error) {
            console.error("Tawk.to setAttributes error:", error);
          } else {
            console.log('Tawk.to user attributes set successfully');
          }
        }
      );
    } else {
      console.log('Tawk.to: User not logged in or missing required fields');
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
      console.log('Tawk.to onLoad callback triggered');
      // Try to reposition the widget after it loads as backup
      setTimeout(() => {
        const widgetContainer = document.querySelector('[class*="tawk"]');
        if (widgetContainer) {
          console.log('Tawk.to: Repositioning widget container');
          (widgetContainer as HTMLElement).style.top = '100px';
          (widgetContainer as HTMLElement).style.bottom = 'auto';
          (widgetContainer as HTMLElement).style.right = '20px';
          (widgetContainer as HTMLElement).style.zIndex = '9999';
        } else {
          console.warn('Tawk.to: Widget container not found for repositioning');
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
