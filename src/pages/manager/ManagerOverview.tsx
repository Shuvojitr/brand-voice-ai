import { ManagerLayout } from "@/components/manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileStack, MessageSquareQuote, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  {
    title: "Templates",
    description: "Manage content templates",
    icon: FileText,
    href: "/manager/templates",
    color: "bg-blue-500",
  },
  {
    title: "Pages",
    description: "Manage static pages",
    icon: FileStack,
    href: "/manager/pages",
    color: "bg-purple-500",
  },
  {
    title: "Testimonials",
    description: "Manage customer reviews",
    icon: MessageSquareQuote,
    href: "/manager/testimonials",
    color: "bg-amber-500",
  },
  {
    title: "FAQs",
    description: "Manage FAQ content",
    icon: HelpCircle,
    href: "/manager/faqs",
    color: "bg-emerald-500",
  },
];

export default function ManagerOverview() {
  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage content, templates, and site information.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className={`p-2 rounded-lg ${link.color} text-white`}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome, Manager</CardTitle>
            <CardDescription>
              You have access to manage content, templates, testimonials, FAQs, and pages. 
              User management and billing settings are restricted to administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Your permissions include:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create, edit, and delete content templates</li>
                <li>Manage static pages</li>
                <li>Add and edit customer testimonials</li>
                <li>Manage FAQ entries</li>
                <li>View content reports and analytics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}
