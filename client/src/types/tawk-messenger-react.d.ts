declare module "@tawk.to/tawk-messenger-react" {
  import { ComponentClass, RefObject } from "react";

  interface TawkMessengerRef {
    setAttributes: (attributes: Record<string, string>, callback?: (error: Error | null) => void) => void;
  }

  interface TawkMessengerReactProps {
    propertyId: string;
    widgetId: string;
    ref?: RefObject<TawkMessengerRef>;
    onLoad?: () => void;
    customStyle?: {
      visibility?: {
        desktop?: {
          position?: string;
          xOffset?: number;
          yOffset?: number;
        };
        mobile?: {
          position?: string;
          xOffset?: number;
          yOffset?: number;
        };
      };
    };
  }

  const TawkMessengerReact: ComponentClass<TawkMessengerReactProps>;

  export default TawkMessengerReact;
}
