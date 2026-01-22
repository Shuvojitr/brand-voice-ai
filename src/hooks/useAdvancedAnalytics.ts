import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  totalSessions: number;
  totalPageViews: number;
}

export interface EngagementStats {
  avgSessionDuration: number;
  avgPagesPerSession: number;
  bounceRate: number;
  avgScrollDepth: number;
}

export interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

export interface PageStats {
  path: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
}

export interface BrowserStats {
  browser: string;
  count: number;
  percentage: number;
}

export interface ConversionData {
  type: string;
  count: number;
  value: number;
  rate: number;
}

export interface DailyVisitorData {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  newVisitors: number;
}

export interface TemplateUsage {
  template: string;
  count: number;
  percentage: number;
}

export interface UserCostAnalysis {
  userId: string;
  email: string;
  creditsUsed: number;
  subscriptionValue: number;
  costPerCredit: number;
  efficiency: string;
}

export interface RealtimeVisitor {
  sessionId: string;
  pagePath: string;
  device: string;
  country: string;
  startTime: string;
}

export interface CountryStats {
  country: string;
  countryCode: string;
  visitors: number;
  percentage: number;
}

// Fetch visitor stats for a date range
export function useVisitorStats(days: number = 7) {
  return useQuery({
    queryKey: ["analytics-visitors", days],
    queryFn: async (): Promise<VisitorStats> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("session_id, anonymous_id, is_new_visitor, event_type")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;

      const sessions = new Set(events?.map(e => e.session_id) || []);
      const uniqueAnonymousIds = new Set(events?.map(e => e.anonymous_id) || []);
      const pageViews = events?.filter(e => e.event_type === "page_view") || [];
      const newVisitorSessions = new Set(
        events?.filter(e => e.is_new_visitor).map(e => e.session_id) || []
      );

      return {
        totalVisitors: events?.length || 0,
        uniqueVisitors: uniqueAnonymousIds.size,
        newVisitors: newVisitorSessions.size,
        returningVisitors: sessions.size - newVisitorSessions.size,
        totalSessions: sessions.size,
        totalPageViews: pageViews.length,
      };
    },
  });
}

// Fetch engagement stats
export function useEngagementStats(days: number = 7) {
  return useQuery({
    queryKey: ["analytics-engagement", days],
    queryFn: async (): Promise<EngagementStats> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("session_id, event_type, time_on_page, scroll_depth")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;

      // Calculate average session duration
      const sessionDurations: Record<string, number> = {};
      events?.forEach(e => {
        if (e.time_on_page) {
          sessionDurations[e.session_id] = (sessionDurations[e.session_id] || 0) + e.time_on_page;
        }
      });
      const avgDurations = Object.values(sessionDurations);
      const avgSessionDuration = avgDurations.length > 0
        ? avgDurations.reduce((a, b) => a + b, 0) / avgDurations.length
        : 0;

      // Calculate pages per session
      const sessionPages: Record<string, number> = {};
      events?.filter(e => e.event_type === "page_view").forEach(e => {
        sessionPages[e.session_id] = (sessionPages[e.session_id] || 0) + 1;
      });
      const pageCounts = Object.values(sessionPages);
      const avgPagesPerSession = pageCounts.length > 0
        ? pageCounts.reduce((a, b) => a + b, 0) / pageCounts.length
        : 0;

      // Calculate bounce rate (sessions with only 1 page view)
      const bounces = pageCounts.filter(p => p === 1).length;
      const bounceRate = pageCounts.length > 0 ? (bounces / pageCounts.length) * 100 : 0;

      // Calculate average scroll depth
      const scrollDepths = events?.filter(e => e.scroll_depth).map(e => e.scroll_depth!) || [];
      const avgScrollDepth = scrollDepths.length > 0
        ? scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length
        : 0;

      return {
        avgSessionDuration: Math.round(avgSessionDuration),
        avgPagesPerSession: Math.round(avgPagesPerSession * 10) / 10,
        bounceRate: Math.round(bounceRate * 10) / 10,
        avgScrollDepth: Math.round(avgScrollDepth),
      };
    },
  });
}

// Fetch traffic sources
export function useTrafficSources(days: number = 7) {
  return useQuery({
    queryKey: ["analytics-traffic-sources", days],
    queryFn: async (): Promise<TrafficSource[]> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("session_id, traffic_source")
        .eq("event_type", "page_view")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;

      // Get unique sessions per traffic source
      const sessionsBySource: Record<string, Set<string>> = {};
      events?.forEach(e => {
        const source = e.traffic_source || "direct";
        if (!sessionsBySource[source]) sessionsBySource[source] = new Set();
        sessionsBySource[source].add(e.session_id);
      });

      const totalSessions = new Set(events?.map(e => e.session_id) || []).size;

      return Object.entries(sessionsBySource)
        .map(([source, sessions]) => ({
          source: source.charAt(0).toUpperCase() + source.slice(1),
          visits: sessions.size,
          percentage: totalSessions > 0 ? Math.round((sessions.size / totalSessions) * 100) : 0,
        }))
        .sort((a, b) => b.visits - a.visits);
    },
  });
}

// Fetch top pages
export function useTopPages(days: number = 7, limit: number = 10) {
  return useQuery({
    queryKey: ["analytics-top-pages", days, limit],
    queryFn: async (): Promise<PageStats[]> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("page_path, session_id, time_on_page")
        .eq("event_type", "page_view")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;

      // Aggregate by page
      const pageData: Record<string, { views: number; sessions: Set<string>; timeOnPage: number[] }> = {};
      
      events?.forEach(e => {
        const path = e.page_path || "/";
        if (!pageData[path]) {
          pageData[path] = { views: 0, sessions: new Set(), timeOnPage: [] };
        }
        pageData[path].views++;
        pageData[path].sessions.add(e.session_id);
        if (e.time_on_page) pageData[path].timeOnPage.push(e.time_on_page);
      });

      return Object.entries(pageData)
        .map(([path, data]) => {
          const avgTime = data.timeOnPage.length > 0
            ? data.timeOnPage.reduce((a, b) => a + b, 0) / data.timeOnPage.length
            : 0;
          
          // Calculate bounce rate for this page (sessions that only viewed this page)
          // This is simplified - in reality would need more complex logic
          const bounceRate = data.sessions.size === 1 ? 100 : 0;

          return {
            path,
            views: data.views,
            uniqueViews: data.sessions.size,
            avgTimeOnPage: Math.round(avgTime),
            bounceRate,
          };
        })
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    },
  });
}

// Fetch device stats
export function useDeviceStats(days: number = 7) {
  return useQuery({
    queryKey: ["analytics-devices", days],
    queryFn: async (): Promise<DeviceStats[]> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("session_id, device_type")
        .eq("event_type", "page_view")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;

      // Get unique sessions per device
      const sessionsByDevice: Record<string, Set<string>> = {};
      events?.forEach(e => {
        const device = e.device_type || "unknown";
        if (!sessionsByDevice[device]) sessionsByDevice[device] = new Set();
        sessionsByDevice[device].add(e.session_id);
      });

      const totalSessions = new Set(events?.map(e => e.session_id) || []).size;

      return Object.entries(sessionsByDevice)
        .map(([device, sessions]) => ({
          device: device.charAt(0).toUpperCase() + device.slice(1),
          count: sessions.size,
          percentage: totalSessions > 0 ? Math.round((sessions.size / totalSessions) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },
  });
}

// Fetch browser stats
export function useBrowserStats(days: number = 7) {
  return useQuery({
    queryKey: ["analytics-browsers", days],
    queryFn: async (): Promise<BrowserStats[]> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("session_id, browser")
        .eq("event_type", "page_view")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;

      // Get unique sessions per browser
      const sessionsByBrowser: Record<string, Set<string>> = {};
      events?.forEach(e => {
        const browser = e.browser || "Unknown";
        if (!sessionsByBrowser[browser]) sessionsByBrowser[browser] = new Set();
        sessionsByBrowser[browser].add(e.session_id);
      });

      const totalSessions = new Set(events?.map(e => e.session_id) || []).size;

      return Object.entries(sessionsByBrowser)
        .map(([browser, sessions]) => ({
          browser,
          count: sessions.size,
          percentage: totalSessions > 0 ? Math.round((sessions.size / totalSessions) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },
  });
}

// Fetch daily visitor trend
export function useDailyVisitorTrend(days: number = 7) {
  return useQuery({
    queryKey: ["analytics-daily-trend", days],
    queryFn: async (): Promise<DailyVisitorData[]> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("created_at, session_id, anonymous_id, is_new_visitor, event_type")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;

      // Group by date
      const dailyData: Record<string, {
        visitors: Set<string>;
        sessions: Set<string>;
        pageViews: number;
        newVisitors: Set<string>;
      }> = {};

      events?.forEach(e => {
        const date = format(new Date(e.created_at), "yyyy-MM-dd");
        if (!dailyData[date]) {
          dailyData[date] = {
            visitors: new Set(),
            sessions: new Set(),
            pageViews: 0,
            newVisitors: new Set(),
          };
        }
        dailyData[date].visitors.add(e.anonymous_id);
        dailyData[date].sessions.add(e.session_id);
        if (e.event_type === "page_view") dailyData[date].pageViews++;
        if (e.is_new_visitor) dailyData[date].newVisitors.add(e.anonymous_id);
      });

      // Generate all dates in range
      const result: DailyVisitorData[] = [];
      for (let i = days; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        const data = dailyData[date];
        result.push({
          date: format(subDays(new Date(), i), "MMM dd"),
          visitors: data?.visitors.size || 0,
          sessions: data?.sessions.size || 0,
          pageViews: data?.pageViews || 0,
          newVisitors: data?.newVisitors.size || 0,
        });
      }

      return result;
    },
  });
}

// Fetch template usage (Most Popular Templates)
export function useTemplateUsage(days: number = 30) {
  return useQuery({
    queryKey: ["analytics-template-usage", days],
    queryFn: async (): Promise<TemplateUsage[]> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();

      const { data: documents, error } = await supabase
        .from("documents")
        .select("template_type")
        .gte("created_at", startDate)
        .not("template_type", "is", null);

      if (error) throw error;

      // Count by template type
      const templateCounts: Record<string, number> = {};
      documents?.forEach(d => {
        const template = d.template_type || "Unknown";
        templateCounts[template] = (templateCounts[template] || 0) + 1;
      });

      const total = documents?.length || 0;

      return Object.entries(templateCounts)
        .map(([template, count]) => ({
          template: template.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },
  });
}

// Fetch cost per user analysis
export function useUserCostAnalysis(limit: number = 20) {
  return useQuery({
    queryKey: ["analytics-user-cost", limit],
    queryFn: async (): Promise<UserCostAnalysis[]> => {
      // Get credit usage
      const { data: creditUsage, error: creditError } = await supabase
        .from("credit_usage")
        .select("user_id, credits_consumed, organization_id");

      if (creditError) throw creditError;

      // Get organizations with subscription data
      const { data: orgs, error: orgError } = await supabase
        .from("organizations")
        .select("id, subscription_tier, monthly_credits, credits_used");

      if (orgError) throw orgError;

      // Get profiles for emails
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email");

      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);
      const orgMap = new Map(orgs?.map(o => [o.id, o]) || []);

      // Aggregate by user
      const userCredits: Record<string, { total: number; orgId: string }> = {};
      creditUsage?.forEach(cu => {
        if (!userCredits[cu.user_id]) {
          userCredits[cu.user_id] = { total: 0, orgId: cu.organization_id };
        }
        userCredits[cu.user_id].total += cu.credits_consumed || 0;
      });

      // Calculate subscription values (rough estimates)
      const tierValues: Record<string, number> = {
        free: 0,
        starter: 9,
        pro: 29,
        enterprise: 99,
      };

      return Object.entries(userCredits)
        .map(([userId, { total, orgId }]) => {
          const org = orgMap.get(orgId);
          const subscriptionValue = tierValues[org?.subscription_tier || "free"] || 0;
          const costPerCredit = total > 0 ? subscriptionValue / total : 0;

          let efficiency = "N/A";
          if (subscriptionValue > 0) {
            if (costPerCredit < 0.01) efficiency = "Excellent";
            else if (costPerCredit < 0.05) efficiency = "Good";
            else if (costPerCredit < 0.1) efficiency = "Average";
            else efficiency = "Low";
          }

          return {
            userId,
            email: profileMap.get(userId) || "Unknown",
            creditsUsed: total,
            subscriptionValue,
            costPerCredit: Math.round(costPerCredit * 1000) / 1000,
            efficiency,
          };
        })
        .filter(u => u.creditsUsed > 0)
        .sort((a, b) => b.creditsUsed - a.creditsUsed)
        .slice(0, limit);
    },
  });
}

// Fetch conversions
export function useConversions(days: number = 30) {
  return useQuery({
    queryKey: ["analytics-conversions", days],
    queryFn: async (): Promise<ConversionData[]> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      // Get total visitors for rate calculation
      const { data: events, error: eventsError } = await supabase
        .from("analytics_events")
        .select("session_id, event_type, conversion_type, conversion_value")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (eventsError) throw eventsError;

      const totalSessions = new Set(events?.map(e => e.session_id) || []).size;
      const conversions = events?.filter(e => e.event_type === "conversion") || [];

      // Also get signup count from profiles and documents
      const { count: signupCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate);

      const { count: docCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate);

      // Aggregate by conversion type
      const conversionData: Record<string, { count: number; value: number }> = {
        signup: { count: signupCount || 0, value: 0 },
        content_generation: { count: docCount || 0, value: 0 },
        subscription: { count: 0, value: 0 },
      };

      conversions.forEach(c => {
        const type = c.conversion_type || "other";
        if (!conversionData[type]) conversionData[type] = { count: 0, value: 0 };
        conversionData[type].count++;
        conversionData[type].value += c.conversion_value || 0;
      });

      return Object.entries(conversionData)
        .map(([type, data]) => ({
          type: type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          count: data.count,
          value: data.value,
          rate: totalSessions > 0 ? Math.round((data.count / totalSessions) * 100 * 10) / 10 : 0,
        }))
        .filter(c => c.count > 0);
    },
  });
}

// Real-time active visitors
export function useRealtimeVisitors() {
  return useQuery({
    queryKey: ["analytics-realtime-visitors"],
    queryFn: async (): Promise<RealtimeVisitor[]> => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("session_id, page_path, device_type, country, created_at")
        .gte("created_at", fiveMinutesAgo)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get latest event per session
      const sessionsMap = new Map<string, RealtimeVisitor>();
      events?.forEach(e => {
        if (!sessionsMap.has(e.session_id)) {
          sessionsMap.set(e.session_id, {
            sessionId: e.session_id,
            pagePath: e.page_path || "/",
            device: e.device_type || "unknown",
            country: e.country || "Unknown",
            startTime: e.created_at,
          });
        }
      });

      return Array.from(sessionsMap.values());
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Fetch visitor locations by country
export function useCountryStats(days: number = 7) {
  return useQuery({
    queryKey: ["analytics-country-stats", days],
    queryFn: async (): Promise<CountryStats[]> => {
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("session_id, country")
        .eq("event_type", "page_view")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;

      // Get unique sessions per country
      const sessionsByCountry: Record<string, Set<string>> = {};
      events?.forEach(e => {
        const country = e.country || "Unknown";
        if (!sessionsByCountry[country]) sessionsByCountry[country] = new Set();
        sessionsByCountry[country].add(e.session_id);
      });

      const totalSessions = new Set(events?.map(e => e.session_id) || []).size;

      // Map country names to codes
      const countryCodeMap: Record<string, string> = {
        "United States": "US",
        "Canada": "CA",
        "Brazil": "BR",
        "United Kingdom": "GB",
        "Germany": "DE",
        "France": "FR",
        "Spain": "ES",
        "Italy": "IT",
        "Russia": "RU",
        "China": "CN",
        "Japan": "JP",
        "India": "IN",
        "Australia": "AU",
        "South Africa": "ZA",
        "Nigeria": "NG",
        "Egypt": "EG",
        "Mexico": "MX",
        "Argentina": "AR",
        "South Korea": "KR",
        "Indonesia": "ID",
        "Pakistan": "PK",
        "Bangladesh": "BD",
        "Philippines": "PH",
        "Vietnam": "VN",
        "Thailand": "TH",
        "Turkey": "TR",
        "Saudi Arabia": "SA",
        "UAE": "AE",
        "Poland": "PL",
        "Netherlands": "NL",
        "Sweden": "SE",
        "Norway": "NO",
        "Finland": "FI",
        "Ukraine": "UA",
        "Unknown": "XX",
      };

      return Object.entries(sessionsByCountry)
        .map(([country, sessions]) => ({
          country,
          countryCode: countryCodeMap[country] || country.substring(0, 2).toUpperCase(),
          visitors: sessions.size,
          percentage: totalSessions > 0 ? Math.round((sessions.size / totalSessions) * 100) : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors);
    },
  });
}
