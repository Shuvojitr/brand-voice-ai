import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initializeTracking, trackPageView, trackConversion } from "@/lib/analytics-tracker";

export function useAnalyticsTracking() {
  const location = useLocation();
  const initialized = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize tracking only once
    if (!initialized.current) {
      cleanupRef.current = initializeTracking();
      initialized.current = true;
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (initialized.current) {
      trackPageView(location.pathname);
    }
  }, [location.pathname]);

  return { trackConversion };
}
