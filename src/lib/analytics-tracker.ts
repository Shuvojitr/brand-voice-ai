import { supabase } from "@/integrations/supabase/client";

interface TrackingEvent {
  event_type: string;
  event_name?: string;
  page_path?: string;
  page_title?: string;
  previous_page_path?: string;
  properties?: Record<string, any>;
  time_on_page?: number;
  scroll_depth?: number;
  conversion_type?: string;
  conversion_value?: number;
}

interface SessionData {
  sessionId: string;
  anonymousId: string;
  isNewVisitor: boolean;
  startTime: number;
  pageViews: number;
  referrer: string;
  utmParams: Record<string, string>;
  geoData?: GeoData;
}

interface GeoData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
}

const SESSION_KEY = "analytics_session";
const VISITOR_KEY = "analytics_visitor";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const GEO_KEY = "analytics_geo";
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Fetch geolocation data from free IP-API
async function fetchGeoData(): Promise<GeoData | null> {
  try {
    // Check cache first
    const cached = localStorage.getItem(GEO_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < GEO_CACHE_TTL) {
        return data as GeoData;
      }
    }

    // Fetch from ip-api.com (free, no API key required, 45 req/min limit)
    const response = await fetch("http://ip-api.com/json/?fields=status,country,countryCode,regionName,city");
    
    if (!response.ok) {
      throw new Error("Geolocation API failed");
    }

    const result = await response.json();
    
    if (result.status !== "success") {
      throw new Error("Geolocation lookup failed");
    }

    const geoData: GeoData = {
      country: result.country || "Unknown",
      countryCode: result.countryCode || "XX",
      region: result.regionName || "",
      city: result.city || "",
    };

    // Cache the result
    localStorage.setItem(GEO_KEY, JSON.stringify({
      data: geoData,
      timestamp: Date.now(),
    }));

    return geoData;
  } catch (error) {
    console.warn("Geolocation fetch failed:", error);
    return null;
  }
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function getBrowserInfo(): { browser: string; version: string } {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let version = "";

  if (ua.includes("Firefox/")) {
    browser = "Firefox";
    version = ua.split("Firefox/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Chrome/") && !ua.includes("Edg/")) {
    browser = "Chrome";
    version = ua.split("Chrome/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    browser = "Safari";
    version = ua.split("Version/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Edg/")) {
    browser = "Edge";
    version = ua.split("Edg/")[1]?.split(" ")[0] || "";
  }

  return { browser, version };
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
}

function getUTMParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(key => {
    const value = params.get(key);
    if (value) utmParams[key] = value;
  });
  
  return utmParams;
}

function getTrafficSource(referrer: string, utmParams: Record<string, string>): string {
  // Check UTM parameters first
  if (utmParams.utm_medium) {
    const medium = utmParams.utm_medium.toLowerCase();
    if (medium === "cpc" || medium === "ppc" || medium === "paid") return "paid";
    if (medium === "email") return "email";
    if (medium === "social") return "social";
    if (medium === "referral") return "referral";
    if (medium === "organic") return "organic";
  }

  if (!referrer) return "direct";

  try {
    const referrerUrl = new URL(referrer);
    const domain = referrerUrl.hostname.toLowerCase();

    // Search engines
    const searchEngines = ["google", "bing", "yahoo", "duckduckgo", "baidu", "yandex"];
    if (searchEngines.some(se => domain.includes(se))) return "organic";

    // Social networks
    const socialNetworks = ["facebook", "twitter", "linkedin", "instagram", "pinterest", "youtube", "tiktok", "reddit"];
    if (socialNetworks.some(sn => domain.includes(sn))) return "social";

    // Same domain
    if (domain === window.location.hostname) return "direct";

    return "referral";
  } catch {
    return "direct";
  }
}

function getReferrerDomain(referrer: string): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}

function getSession(): SessionData {
  const stored = sessionStorage.getItem(SESSION_KEY);
  const visitorId = localStorage.getItem(VISITOR_KEY);
  const isNewVisitor = !visitorId;
  
  if (stored) {
    const session = JSON.parse(stored) as SessionData;
    const now = Date.now();
    
    // Check if session is still valid
    if (now - session.startTime < SESSION_TIMEOUT) {
      return session;
    }
  }

  // Create new session
  const anonymousId = visitorId || generateId();
  if (!visitorId) {
    localStorage.setItem(VISITOR_KEY, anonymousId);
  }

  const referrer = document.referrer || "";
  const utmParams = getUTMParams();

  const session: SessionData = {
    sessionId: generateId(),
    anonymousId,
    isNewVisitor,
    startTime: Date.now(),
    pageViews: 0,
    referrer,
    utmParams,
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function updateSession(updates: Partial<SessionData>): SessionData {
  const session = getSession();
  const updated = { ...session, ...updates };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

let previousPagePath: string | null = null;
let pageEnterTime: number = Date.now();

export async function trackEvent(event: TrackingEvent): Promise<void> {
  try {
    const session = getSession();
    const { browser, version: browserVersion } = getBrowserInfo();
    const utmParams = session.utmParams;

    // Get geolocation data (from cache or fetch)
    let geoData = session.geoData;
    if (!geoData) {
      geoData = await fetchGeoData() || undefined;
      if (geoData) {
        updateSession({ geoData });
      }
    }

    const { data: { user } } = await supabase.auth.getUser();

    const eventData = {
      session_id: session.sessionId,
      user_id: user?.id || null,
      anonymous_id: session.anonymousId,
      is_new_visitor: session.isNewVisitor,
      event_type: event.event_type,
      event_name: event.event_name || null,
      page_path: event.page_path || window.location.pathname,
      page_title: event.page_title || document.title,
      previous_page_path: event.previous_page_path || previousPagePath,
      referrer: session.referrer || null,
      referrer_domain: getReferrerDomain(session.referrer),
      utm_source: utmParams.utm_source || null,
      utm_medium: utmParams.utm_medium || null,
      utm_campaign: utmParams.utm_campaign || null,
      utm_content: utmParams.utm_content || null,
      utm_term: utmParams.utm_term || null,
      traffic_source: getTrafficSource(session.referrer, utmParams),
      device_type: getDeviceType(),
      browser,
      browser_version: browserVersion,
      operating_system: getOS(),
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      country: geoData?.country || null,
      region: geoData?.region || null,
      city: geoData?.city || null,
      time_on_page: event.time_on_page || null,
      scroll_depth: event.scroll_depth || null,
      conversion_type: event.conversion_type || null,
      conversion_value: event.conversion_value || null,
      properties: event.properties || {},
    };

    await supabase.from("analytics_events").insert(eventData);
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
}

export function trackPageView(path?: string): void {
  // Calculate time on previous page
  const timeOnPage = Math.round((Date.now() - pageEnterTime) / 1000);
  
  // Update page views count
  const session = getSession();
  updateSession({ pageViews: session.pageViews + 1 });

  // Track with time on previous page if not first page
  trackEvent({
    event_type: "page_view",
    page_path: path || window.location.pathname,
    previous_page_path: previousPagePath || undefined,
    time_on_page: previousPagePath ? timeOnPage : undefined,
  });

  // Update state for next page
  previousPagePath = path || window.location.pathname;
  pageEnterTime = Date.now();
}

export function trackClick(elementId: string, elementText?: string, properties?: Record<string, any>): void {
  trackEvent({
    event_type: "click",
    event_name: elementId,
    properties: {
      element_id: elementId,
      element_text: elementText,
      ...properties,
    },
  });
}

export function trackFormSubmit(formName: string, success: boolean, properties?: Record<string, any>): void {
  trackEvent({
    event_type: "form_submit",
    event_name: formName,
    properties: {
      form_name: formName,
      success,
      ...properties,
    },
  });
}

export function trackConversion(
  type: "signup" | "subscription" | "content_generation",
  value?: number,
  properties?: Record<string, any>
): void {
  trackEvent({
    event_type: "conversion",
    event_name: `${type}_completed`,
    conversion_type: type,
    conversion_value: value,
    properties,
  });
}

export function trackScrollDepth(depth: number): void {
  trackEvent({
    event_type: "scroll",
    event_name: `scroll_${depth}`,
    scroll_depth: depth,
  });
}

// Track scroll milestones
let maxScrollDepth = 0;
const scrollMilestones = [25, 50, 75, 100];

function handleScroll(): void {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return;
  
  const scrolled = window.scrollY;
  const depth = Math.round((scrolled / scrollHeight) * 100);
  
  if (depth > maxScrollDepth) {
    const milestone = scrollMilestones.find(m => m <= depth && m > maxScrollDepth);
    if (milestone) {
      trackScrollDepth(milestone);
    }
    maxScrollDepth = depth;
  }
}

let scrollTimeout: NodeJS.Timeout | null = null;

function throttledScrollHandler(): void {
  if (!scrollTimeout) {
    scrollTimeout = setTimeout(() => {
      handleScroll();
      scrollTimeout = null;
    }, 250);
  }
}

// Track page exit
function handlePageExit(): void {
  const timeOnPage = Math.round((Date.now() - pageEnterTime) / 1000);
  
  // Use sendBeacon for reliability on page unload
  const session = getSession();
  const data = {
    session_id: session.sessionId,
    event_type: "page_exit",
    page_path: window.location.pathname,
    time_on_page: timeOnPage,
    scroll_depth: maxScrollDepth,
    properties: {},
  };

  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  navigator.sendBeacon(
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/analytics_events`,
    blob
  );
}

// Initialize tracking
export function initializeTracking(): () => void {
  // Initial page view
  trackPageView();

  // Track scroll depth
  window.addEventListener("scroll", throttledScrollHandler, { passive: true });

  // Track page visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      handlePageExit();
    }
  });

  // Track before unload
  window.addEventListener("beforeunload", handlePageExit);

  // Cleanup function
  return () => {
    window.removeEventListener("scroll", throttledScrollHandler);
    window.removeEventListener("beforeunload", handlePageExit);
    if (scrollTimeout) clearTimeout(scrollTimeout);
  };
}

// Get current session info (for real-time display)
export function getCurrentSession(): SessionData {
  return getSession();
}
