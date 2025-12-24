import { Link } from "react-router-dom";
import { Sparkles, Twitter, Linkedin, Github, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSiteSettings, SocialLink } from "@/hooks/useSiteSettings";

const socialIconMap: Record<string, React.FC<{ className?: string }>> = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  email: Mail,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

// Fallback values
const defaultFooterNav = [
  {
    title: "Product",
    links: [
      { label: "Templates", href: "/templates" },
      { label: "Brand Voice", href: "/brand-voice" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const defaultSocialLinks: SocialLink[] = [
  { platform: "twitter", url: "https://twitter.com/mygenai" },
  { platform: "linkedin", url: "https://linkedin.com/company/mygenai" },
  { platform: "github", url: "https://github.com/mygenai" },
];

export function Footer() {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  const footerNav = settings?.footer_nav?.length ? settings.footer_nav : defaultFooterNav;
  
  // Only fall back to defaults if no social links are configured at all
  const hasConfiguredSocialLinks = settings?.social_links?.some((s) => s.url);
  const filteredSocialLinks = settings?.social_links?.filter((s) => s.url && s.visible !== false);
  // Only use defaults if user hasn't configured any social links
  const socialLinks = hasConfiguredSocialLinks ? (filteredSocialLinks || []) : defaultSocialLinks;
  const siteDescription = settings?.site_description || "Generate high-quality marketing content with AI. Create blog posts, social media content, ads, and emails in seconds.";
  const copyrightText = settings?.copyright_text || `© ${currentYear} MyGenAI. All rights reserved.`;
  const siteName = settings?.site_name || "MyGenAI";
  const footerLogoUrl = settings?.footer_logo_url;

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              {footerLogoUrl ? (
                <img src={footerLogoUrl} alt={siteName} className="h-12 w-auto max-w-[200px] object-contain" />
              ) : (
                <>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">
                    {siteName.includes("AI") ? (
                      <>
                        {siteName.replace("AI", "")}
                        <span className="gradient-text">AI</span>
                      </>
                    ) : (
                      siteName
                    )}
                  </span>
                </>
              )}
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {siteDescription}
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIconMap[social.platform] || Mail;
                const href = social.platform === "email" 
                  ? (social.url.startsWith("mailto:") ? social.url : `mailto:${social.url}`)
                  : social.url;
                return (
                  <a
                    key={social.platform}
                    href={href}
                    target={social.platform === "email" ? undefined : "_blank"}
                    rel={social.platform === "email" ? undefined : "noopener noreferrer"}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label={social.platform}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Dynamic Footer Columns */}
          {footerNav.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
