import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { useTestimonials, Testimonial } from "@/hooks/useTestimonials";

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.user_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group relative flex-shrink-0 w-[350px] p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-card/60 to-background/40 backdrop-blur-xl" />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-2xl border border-border/50 group-hover:border-primary/30 transition-colors duration-300" />
      <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex gap-1 mb-4">
          {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-warning text-warning drop-shadow-[0_0_3px_hsl(var(--warning)/0.5)]" />
          ))}
        </div>
        <p className="text-foreground/90 mb-6 leading-relaxed">
          "{testimonial.review_text}"
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={testimonial.user_avatar || undefined} alt={testimonial.user_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{testimonial.user_name}</p>
            {testimonial.user_role && (
              <p className="text-xs text-muted-foreground">{testimonial.user_role}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ testimonials, direction = "left" }: { testimonials: Testimonial[]; direction?: "left" | "right" }) {
  // Double the testimonials for seamless loop
  const doubled = [...testimonials, ...testimonials];

  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div 
        className={`flex gap-6 ${direction === "right" ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ 
          animationDuration: `${testimonials.length * 8}s`,
        }}
      >
        {doubled.map((testimonial, i) => (
          <TestimonialCard key={`${testimonial.id}-${i}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useTestimonials();

  // Don't render section if no testimonials
  if (!isLoading && (!testimonials || testimonials.length === 0)) {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <section className="py-20 md:py-28 border-t border-border overflow-hidden">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Loved by{" "}
              <span className="gradient-text">Creators Worldwide</span>
            </h2>
          </div>
          <div className="flex gap-6 justify-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[350px] h-[200px] rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Split testimonials into two rows for marquee
  const midpoint = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, midpoint);
  const row2 = testimonials.slice(midpoint);

  return (
    <section className="py-20 md:py-28 border-t border-border overflow-hidden">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <Badge variant="outline" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Loved by{" "}
            <span className="gradient-text">Creators Worldwide</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            See what our users have to say about their experience.
          </p>
        </div>
      </div>

      {/* Full-width marquee */}
      <div className="space-y-6">
        <MarqueeRow testimonials={row1} direction="left" />
        {row2.length > 0 && <MarqueeRow testimonials={row2} direction="right" />}
      </div>
    </section>
  );
}
