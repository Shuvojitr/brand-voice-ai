import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

// SVG paths for major countries (simplified world map)
const COUNTRY_PATHS: Record<string, { path: string; center: { x: number; y: number } }> = {
  US: {
    path: "M45,95 L85,95 L90,105 L80,115 L45,115 L40,105 Z",
    center: { x: 65, y: 105 }
  },
  CA: {
    path: "M40,50 L100,50 L110,70 L100,85 L40,85 L30,70 Z",
    center: { x: 70, y: 67 }
  },
  BR: {
    path: "M95,150 L130,140 L140,170 L120,195 L90,180 Z",
    center: { x: 115, y: 170 }
  },
  GB: {
    path: "M175,75 L182,70 L188,78 L180,85 Z",
    center: { x: 181, y: 77 }
  },
  DE: {
    path: "M195,78 L210,75 L215,90 L200,95 Z",
    center: { x: 205, y: 85 }
  },
  FR: {
    path: "M178,88 L198,85 L200,105 L180,108 Z",
    center: { x: 189, y: 96 }
  },
  ES: {
    path: "M165,100 L185,100 L185,115 L165,115 Z",
    center: { x: 175, y: 107 }
  },
  IT: {
    path: "M200,95 L215,98 L210,120 L202,115 Z",
    center: { x: 208, y: 107 }
  },
  RU: {
    path: "M220,40 L350,40 L360,80 L330,100 L240,95 L220,70 Z",
    center: { x: 290, y: 65 }
  },
  CN: {
    path: "M300,90 L360,85 L370,130 L320,140 L295,120 Z",
    center: { x: 335, y: 110 }
  },
  JP: {
    path: "M375,100 L390,95 L395,115 L380,120 Z",
    center: { x: 385, y: 107 }
  },
  IN: {
    path: "M290,120 L320,115 L325,160 L295,165 L285,140 Z",
    center: { x: 305, y: 140 }
  },
  AU: {
    path: "M340,180 L390,175 L400,210 L350,220 L335,200 Z",
    center: { x: 365, y: 195 }
  },
  ZA: {
    path: "M210,190 L235,185 L240,210 L215,215 Z",
    center: { x: 225, y: 200 }
  },
  NG: {
    path: "M195,145 L215,143 L218,160 L195,162 Z",
    center: { x: 206, y: 152 }
  },
  EG: {
    path: "M215,115 L235,112 L240,135 L220,138 Z",
    center: { x: 227, y: 125 }
  },
  MX: {
    path: "M35,115 L70,115 L75,140 L45,145 L30,130 Z",
    center: { x: 52, y: 128 }
  },
  AR: {
    path: "M85,195 L105,185 L115,230 L90,240 Z",
    center: { x: 98, y: 212 }
  },
  KR: {
    path: "M365,95 L378,92 L380,108 L367,110 Z",
    center: { x: 372, y: 100 }
  },
  ID: {
    path: "M335,165 L380,160 L385,175 L340,180 Z",
    center: { x: 358, y: 170 }
  },
  PK: {
    path: "M275,110 L295,105 L300,130 L280,135 Z",
    center: { x: 287, y: 120 }
  },
  BD: {
    path: "M310,125 L325,122 L328,140 L312,143 Z",
    center: { x: 318, y: 132 }
  },
  PH: {
    path: "M365,140 L378,135 L382,155 L368,158 Z",
    center: { x: 373, y: 147 }
  },
  VN: {
    path: "M340,130 L355,125 L360,155 L345,160 Z",
    center: { x: 350, y: 142 }
  },
  TH: {
    path: "M330,135 L345,130 L350,160 L335,165 Z",
    center: { x: 340, y: 147 }
  },
  TR: {
    path: "M230,95 L265,90 L270,110 L235,115 Z",
    center: { x: 250, y: 102 }
  },
  SA: {
    path: "M250,120 L280,115 L285,145 L255,150 Z",
    center: { x: 267, y: 132 }
  },
  AE: {
    path: "M270,130 L285,128 L287,140 L272,142 Z",
    center: { x: 278, y: 135 }
  },
  PL: {
    path: "M210,72 L230,70 L232,85 L212,87 Z",
    center: { x: 221, y: 78 }
  },
  NL: {
    path: "M190,72 L200,70 L202,80 L192,82 Z",
    center: { x: 196, y: 76 }
  },
  SE: {
    path: "M205,45 L220,42 L225,70 L210,73 Z",
    center: { x: 215, y: 57 }
  },
  NO: {
    path: "M190,35 L210,32 L215,60 L195,63 Z",
    center: { x: 202, y: 47 }
  },
  FI: {
    path: "M225,35 L245,32 L250,60 L230,63 Z",
    center: { x: 237, y: 47 }
  },
  UA: {
    path: "M235,72 L265,68 L270,88 L240,92 Z",
    center: { x: 252, y: 80 }
  },
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  BR: "Brazil",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  RU: "Russia",
  CN: "China",
  JP: "Japan",
  IN: "India",
  AU: "Australia",
  ZA: "South Africa",
  NG: "Nigeria",
  EG: "Egypt",
  MX: "Mexico",
  AR: "Argentina",
  KR: "South Korea",
  ID: "Indonesia",
  PK: "Pakistan",
  BD: "Bangladesh",
  PH: "Philippines",
  VN: "Vietnam",
  TH: "Thailand",
  TR: "Turkey",
  SA: "Saudi Arabia",
  AE: "UAE",
  PL: "Poland",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
  FI: "Finland",
  UA: "Ukraine",
};

function getColorIntensity(percentage: number, maxPercentage: number): string {
  if (percentage === 0) return "hsl(var(--muted))";
  const intensity = (percentage / maxPercentage);
  if (intensity > 0.75) return "hsl(var(--primary))";
  if (intensity > 0.5) return "hsl(var(--primary) / 0.75)";
  if (intensity > 0.25) return "hsl(var(--primary) / 0.5)";
  return "hsl(var(--primary) / 0.25)";
}

export function WorldMapChart({ data, isLoading }: WorldMapChartProps) {
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

  const countryDataMap = new Map(data?.map(d => [d.countryCode, d]) || []);
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
            <TooltipProvider delayDuration={100}>
              <svg
                viewBox="0 0 430 260"
                className="w-full h-auto"
                style={{ maxHeight: "350px" }}
              >
                {/* Ocean background */}
                <rect x="0" y="0" width="430" height="260" fill="hsl(var(--muted) / 0.3)" rx="8" />
                
                {/* Render country shapes */}
                {Object.entries(COUNTRY_PATHS).map(([code, { path, center }]) => {
                  const countryData = countryDataMap.get(code);
                  const hasData = countryData && countryData.visitors > 0;
                  
                  return (
                    <Tooltip key={code}>
                      <TooltipTrigger asChild>
                        <g className="cursor-pointer transition-all hover:opacity-80">
                          <path
                            d={path}
                            fill={getColorIntensity(countryData?.percentage || 0, maxPercentage)}
                            stroke="hsl(var(--border))"
                            strokeWidth="0.5"
                            className="transition-colors duration-200"
                          />
                          {hasData && (
                            <circle
                              cx={center.x}
                              cy={center.y}
                              r="3"
                              fill="hsl(var(--primary))"
                              className="animate-pulse"
                            />
                          )}
                        </g>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-semibold">{COUNTRY_NAMES[code] || code}</p>
                          {countryData ? (
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
                })}
              </svg>
            </TooltipProvider>
            
            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary/25" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary/50" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary/75" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary" />
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
