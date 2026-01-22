import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, MapPin } from "lucide-react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

interface CountryData {
  country: string;
  countryCode: string;
  visitors: number;
  percentage: number;
}

interface WorldMapChartProps {
  data: CountryData[] | undefined;
  isLoading: boolean;
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map ISO 3166-1 alpha-2 to alpha-3 codes
const alpha2ToAlpha3: Record<string, string> = {
  US: "USA", CA: "CAN", BR: "BRA", GB: "GBR", DE: "DEU", FR: "FRA", ES: "ESP",
  IT: "ITA", RU: "RUS", CN: "CHN", JP: "JPN", IN: "IND", AU: "AUS", ZA: "ZAF",
  NG: "NGA", EG: "EGY", MX: "MEX", AR: "ARG", KR: "KOR", ID: "IDN", PK: "PAK",
  BD: "BGD", PH: "PHL", VN: "VNM", TH: "THA", TR: "TUR", SA: "SAU", AE: "ARE",
  PL: "POL", NL: "NLD", SE: "SWE", NO: "NOR", FI: "FIN", UA: "UKR", AT: "AUT",
  BE: "BEL", CH: "CHE", CZ: "CZE", DK: "DNK", GR: "GRC", HU: "HUN", IE: "IRL",
  IL: "ISR", MY: "MYS", NZ: "NZL", PT: "PRT", RO: "ROU", SG: "SGP", CL: "CHL",
  CO: "COL", PE: "PER", VE: "VEN", KE: "KEN", MA: "MAR", TN: "TUN", GH: "GHA",
};

function getColorIntensity(percentage: number, maxPercentage: number): string {
  if (percentage === 0) return "hsl(var(--muted))";
  const intensity = percentage / maxPercentage;
  if (intensity > 0.75) return "hsl(var(--primary))";
  if (intensity > 0.5) return "hsl(var(--primary) / 0.75)";
  if (intensity > 0.25) return "hsl(var(--primary) / 0.5)";
  return "hsl(var(--primary) / 0.3)";
}

export function WorldMapChart({ data, isLoading }: WorldMapChartProps) {
  const [tooltipContent, setTooltipContent] = useState<{ name: string; visitors: number; percentage: number } | null>(null);

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Create a map from alpha-3 codes to data
  const countryDataMap = new Map<string, CountryData>();
  data?.forEach(d => {
    const alpha3 = alpha2ToAlpha3[d.countryCode];
    if (alpha3) {
      countryDataMap.set(alpha3, d);
    }
    // Also try direct match for alpha-3 codes
    countryDataMap.set(d.countryCode, d);
  });

  const maxPercentage = Math.max(...(data?.map(d => d.percentage) || [1]), 1);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Visitor Locations
        </CardTitle>
        <CardDescription>Geographic distribution of your visitors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map visualization */}
          <div className="lg:col-span-2 relative">
            <TooltipProvider delayDuration={0}>
              <div className="relative">
                <ComposableMap
                  projectionConfig={{
                    rotate: [-10, 0, 0],
                    scale: 147,
                  }}
                  style={{ width: "100%", height: "auto" }}
                >
                  <ZoomableGroup center={[0, 20]} zoom={1}>
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const countryCode = geo.properties?.["ISO_A3"] || geo.id;
                          const countryData = countryDataMap.get(countryCode);
                          const hasData = countryData && countryData.visitors > 0;

                          return (
                            <Tooltip key={geo.rsmKey}>
                              <TooltipTrigger asChild>
                                <Geography
                                  geography={geo}
                                  onMouseEnter={() => {
                                    const name = geo.properties?.name || "Unknown";
                                    setTooltipContent({
                                      name,
                                      visitors: countryData?.visitors || 0,
                                      percentage: countryData?.percentage || 0,
                                    });
                                  }}
                                  onMouseLeave={() => setTooltipContent(null)}
                                  style={{
                                    default: {
                                      fill: getColorIntensity(countryData?.percentage || 0, maxPercentage),
                                      stroke: "hsl(var(--border))",
                                      strokeWidth: 0.5,
                                      outline: "none",
                                    },
                                    hover: {
                                      fill: hasData ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
                                      stroke: "hsl(var(--foreground))",
                                      strokeWidth: 1,
                                      outline: "none",
                                      cursor: "pointer",
                                    },
                                    pressed: {
                                      fill: "hsl(var(--primary))",
                                      outline: "none",
                                    },
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-semibold">{geo.properties?.name || "Unknown"}</p>
                                  {countryData && countryData.visitors > 0 ? (
                                    <>
                                      <p>{countryData.visitors.toLocaleString()} visitors</p>
                                      <p className="text-muted-foreground">{countryData.percentage}% of total</p>
                                    </>
                                  ) : (
                                    <p className="text-muted-foreground">No visitors yet</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              </div>
            </TooltipProvider>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--primary) / 0.3)" }} />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--primary) / 0.5)" }} />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--primary) / 0.75)" }} />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--primary))" }} />
                <span>Highest</span>
              </div>
            </div>
          </div>

          {/* Top countries list */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Top Countries
            </h4>
            {data && data.length > 0 ? (
              <div className="space-y-3">
                {data.slice(0, 8).map((country, index) => (
                  <div key={country.countryCode} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{country.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {country.visitors.toLocaleString()}
                      </span>
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary rounded-full h-1.5 transition-all"
                          style={{ width: `${Math.min(country.percentage * 2, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {country.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No location data available yet</p>
                <p className="text-xs mt-1">Location data will appear as visitors browse your site</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
