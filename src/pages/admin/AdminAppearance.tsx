import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings, NavLink, FooterColumn, SocialLink } from "@/hooks/useSiteSettings";
import { Plus, Trash2, GripVertical, Save, Loader2, Twitter, Linkedin, Github, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const socialPlatforms = [
  { platform: "twitter", icon: Twitter, label: "Twitter / X" },
  { platform: "linkedin", icon: Linkedin, label: "LinkedIn" },
  { platform: "github", icon: Github, label: "GitHub" },
  { platform: "facebook", icon: Facebook, label: "Facebook" },
  { platform: "instagram", icon: Instagram, label: "Instagram" },
  { platform: "youtube", icon: Youtube, label: "YouTube" },
  { platform: "email", icon: Mail, label: "Email" },
];

export default function AdminAppearance() {
  const { settings, isLoading, updateSettings } = useSiteSettings();
  
  // General settings
  const [logoUrl, setLogoUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  
  // Header nav
  const [headerNav, setHeaderNav] = useState<NavLink[]>([]);
  
  // Footer
  const [footerNav, setFooterNav] = useState<FooterColumn[]>([]);
  const [copyrightText, setCopyrightText] = useState("");
  const [bottomTagline, setBottomTagline] = useState("");
  
  // Socials
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Load settings
  useEffect(() => {
    if (settings) {
      setLogoUrl(settings.logo_url || "");
      setSiteName(settings.site_name || "");
      setSiteDescription(settings.site_description || "");
      setHeaderNav(settings.header_nav || []);
      setFooterNav(settings.footer_nav || []);
      setCopyrightText(settings.copyright_text || "");
      setBottomTagline(settings.bottom_tagline || "");
      setSocialLinks(settings.social_links || []);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      logo_url: logoUrl || null,
      site_name: siteName,
      site_description: siteDescription || null,
      header_nav: headerNav,
      footer_nav: footerNav,
      copyright_text: copyrightText || null,
      bottom_tagline: bottomTagline || null,
      social_links: socialLinks,
    });
  };

  // Header nav handlers
  const addHeaderLink = () => {
    setHeaderNav([...headerNav, { label: "", href: "" }]);
  };

  const updateHeaderLink = (index: number, field: keyof NavLink, value: string) => {
    const updated = [...headerNav];
    updated[index] = { ...updated[index], [field]: value };
    setHeaderNav(updated);
  };

  const removeHeaderLink = (index: number) => {
    setHeaderNav(headerNav.filter((_, i) => i !== index));
  };

  // Footer column handlers
  const addFooterColumn = () => {
    setFooterNav([...footerNav, { title: "", links: [] }]);
  };

  const updateFooterColumnTitle = (columnIndex: number, title: string) => {
    const updated = [...footerNav];
    updated[columnIndex] = { ...updated[columnIndex], title };
    setFooterNav(updated);
  };

  const removeFooterColumn = (columnIndex: number) => {
    setFooterNav(footerNav.filter((_, i) => i !== columnIndex));
  };

  const addFooterLink = (columnIndex: number) => {
    const updated = [...footerNav];
    updated[columnIndex] = {
      ...updated[columnIndex],
      links: [...updated[columnIndex].links, { label: "", href: "" }],
    };
    setFooterNav(updated);
  };

  const updateFooterLink = (columnIndex: number, linkIndex: number, field: keyof NavLink, value: string) => {
    const updated = [...footerNav];
    const links = [...updated[columnIndex].links];
    links[linkIndex] = { ...links[linkIndex], [field]: value };
    updated[columnIndex] = { ...updated[columnIndex], links };
    setFooterNav(updated);
  };

  const removeFooterLink = (columnIndex: number, linkIndex: number) => {
    const updated = [...footerNav];
    updated[columnIndex] = {
      ...updated[columnIndex],
      links: updated[columnIndex].links.filter((_, i) => i !== linkIndex),
    };
    setFooterNav(updated);
  };

  // Social links handlers
  const updateSocialLink = (platform: string, url: string) => {
    const existing = socialLinks.find((s) => s.platform === platform);
    if (existing) {
      setSocialLinks(socialLinks.map((s) => (s.platform === platform ? { ...s, url } : s)));
    } else {
      setSocialLinks([...socialLinks, { platform, url }]);
    }
  };

  const getSocialUrl = (platform: string) => {
    return socialLinks.find((s) => s.platform === platform)?.url || "";
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Site Appearance</h1>
            <p className="text-muted-foreground">Manage your header, footer, and site branding</p>
          </div>
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your site's basic branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to use the default logo</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    placeholder="MyGenAI"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Used for SEO and alt text</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Footer Description</Label>
                  <Textarea
                    id="siteDescription"
                    placeholder="AI-powered content creation platform..."
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Shown below the logo in the footer</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Header Tab */}
          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle>Header Navigation</CardTitle>
                <CardDescription>Configure the navigation links shown in the header (for non-authenticated users)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {headerNav.map((link, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Input
                      placeholder="Label (e.g., Home)"
                      value={link.label}
                      onChange={(e) => updateHeaderLink(index, "label", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="URL (e.g., /)"
                      value={link.href}
                      onChange={(e) => updateHeaderLink(index, "href", e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeHeaderLink(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addHeaderLink} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Navigation Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer" className="space-y-6">
            {/* Footer Columns */}
            <Card>
              <CardHeader>
                <CardTitle>Footer Columns</CardTitle>
                <CardDescription>Organize links into columns (e.g., Product, Resources, Company)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {footerNav.map((column, columnIndex) => (
                  <div key={columnIndex} className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Column Title (e.g., Product)"
                        value={column.title}
                        onChange={(e) => updateFooterColumnTitle(columnIndex, e.target.value)}
                        className="font-semibold"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeFooterColumn(columnIndex)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2 pl-4">
                      {column.links.map((link, linkIndex) => (
                        <div key={linkIndex} className="flex items-center gap-3">
                          <Input
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) => updateFooterLink(columnIndex, linkIndex, "label", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="URL"
                            value={link.href}
                            onChange={(e) => updateFooterLink(columnIndex, linkIndex, "href", e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeFooterLink(columnIndex, linkIndex)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => addFooterLink(columnIndex)} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Link
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addFooterColumn} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Column
                </Button>
              </CardContent>
            </Card>

            {/* Footer Bottom */}
            <Card>
              <CardHeader>
                <CardTitle>Footer Bottom</CardTitle>
                <CardDescription>Copyright and tagline shown at the bottom</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="copyright">Copyright Text</Label>
                  <Input
                    id="copyright"
                    placeholder="© 2025 MyGenAI. All rights reserved."
                    value={copyrightText}
                    onChange={(e) => setCopyrightText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Bottom Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="Made with ❤️ for content creators."
                    value={bottomTagline}
                    onChange={(e) => setBottomTagline(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: "Built in Bangladesh" or "Made with ❤️ for content creators"
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Configure social media links shown in the footer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialPlatforms.map((social) => (
                  <div key={social.platform} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <social.icon className="h-4 w-4" />
                    </div>
                    <Label className="w-24">{social.label}</Label>
                    <Input
                      placeholder={`https://${social.platform}.com/yourhandle`}
                      value={getSocialUrl(social.platform)}
                      onChange={(e) => updateSocialLink(social.platform, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
