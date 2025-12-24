import { AdminLayout } from "@/components/admin/AdminLayout";
import { useThemes, Theme, ThemeColors } from "@/hooks/useThemes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function ThemePreview({ colors }: { colors: ThemeColors }) {
  return (
    <div className="flex gap-1.5 mt-3">
      <div
        className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
        style={{ backgroundColor: `hsl(${colors.primary})` }}
        title="Primary"
      />
      <div
        className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
        style={{ backgroundColor: `hsl(${colors.secondary})` }}
        title="Secondary"
      />
      <div
        className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
        style={{ backgroundColor: `hsl(${colors.accent})` }}
        title="Accent"
      />
      <div
        className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
        style={{ backgroundColor: `hsl(${colors.background})` }}
        title="Background"
      />
      <div
        className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
        style={{ backgroundColor: `hsl(${colors.foreground})` }}
        title="Foreground"
      />
    </div>
  );
}

function ThemeCard({ theme, onActivate, isActivating }: { 
  theme: Theme; 
  onActivate: () => void;
  isActivating: boolean;
}) {
  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${theme.is_active ? 'ring-2 ring-primary' : ''}`}>
      {theme.is_active && (
        <Badge className="absolute top-3 right-3" variant="default">
          <Check className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="w-5 h-5 text-primary" />
          {theme.name}
        </CardTitle>
        <CardDescription>{theme.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ThemePreview colors={theme.colors} />
        
        <div className="mt-4 text-sm text-muted-foreground">
          <span className="font-medium">Fonts:</span>{" "}
          {theme.fonts.heading} / {theme.fonts.body}
        </div>

        <div className="mt-4">
          {theme.is_active ? (
            <Button variant="outline" disabled className="w-full">
              Currently Active
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="w-full"
              onClick={onActivate}
              disabled={isActivating}
            >
              {isActivating ? "Activating..." : "Activate Theme"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-6 h-6 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-36 mt-4" />
        <Skeleton className="h-10 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

export default function AdminThemes() {
  const { themes, isLoading, setActiveTheme } = useThemes();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your website's visual theme and color scheme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <ThemeCardSkeleton />
              <ThemeCardSkeleton />
              <ThemeCardSkeleton />
            </>
          ) : (
            themes?.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onActivate={() => setActiveTheme.mutate(theme.id)}
                isActivating={setActiveTheme.isPending}
              />
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
