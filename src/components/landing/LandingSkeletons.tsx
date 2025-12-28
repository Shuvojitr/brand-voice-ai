import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function HeroSkeleton() {
  return (
    <section className="relative py-24 md:py-36">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge skeleton */}
          <Skeleton className="mx-auto mb-6 h-10 w-48 rounded-full" />
          
          {/* Headline skeleton */}
          <div className="mb-6 space-y-4">
            <Skeleton className="mx-auto h-12 w-3/4 md:h-16" />
            <Skeleton className="mx-auto h-12 w-1/2 md:h-16" />
          </div>
          
          {/* Subheadline skeleton */}
          <Skeleton className="mx-auto mb-10 h-6 w-2/3" />
          
          {/* CTA buttons skeleton */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Skeleton className="h-14 w-40" />
            <Skeleton className="h-14 w-40" />
          </div>
          
          {/* Trust text skeleton */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>

        {/* Dashboard mockup skeleton */}
        <div className="mt-20">
          <div className="mx-auto max-w-5xl">
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        </div>
        
        {/* Social proof skeleton */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
    </section>
  );
}

export function FeaturesSkeleton() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container">
        {/* Header skeleton */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Skeleton className="mx-auto mb-4 h-8 w-28 rounded-full" />
          <div className="space-y-2 mb-4">
            <Skeleton className="mx-auto h-10 w-64" />
            <Skeleton className="mx-auto h-10 w-48" />
          </div>
          <Skeleton className="mx-auto h-6 w-80" />
        </div>
        
        {/* Features grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardHeader>
                <Skeleton className="mb-3 h-14 w-14 rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StepsSkeleton() {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        {/* Header skeleton */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Skeleton className="mx-auto mb-4 h-8 w-32 rounded-full" />
          <div className="space-y-2 mb-4">
            <Skeleton className="mx-auto h-10 w-56" />
            <Skeleton className="mx-auto h-10 w-44" />
          </div>
          <Skeleton className="mx-auto h-6 w-72" />
        </div>
        
        {/* Steps grid skeleton */}
        <div className="grid gap-8 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="relative text-center">
              <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
                <Skeleton className="h-full w-full rounded-3xl" />
              </div>
              <Skeleton className="mx-auto mb-3 h-6 w-40" />
              <Skeleton className="mx-auto h-4 w-56" />
              <Skeleton className="mx-auto mt-2 h-4 w-48" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSkeleton() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <Skeleton className="mx-auto mb-6 h-16 w-16 rounded-full" />
          <div className="space-y-2 mb-6">
            <Skeleton className="mx-auto h-10 w-64" />
            <Skeleton className="mx-auto h-10 w-56" />
          </div>
          <Skeleton className="mx-auto mb-10 h-6 w-80" />
          <Skeleton className="mx-auto h-14 w-52" />
        </div>
      </div>
    </section>
  );
}
