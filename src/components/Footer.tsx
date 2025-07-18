import { Scale, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Use", href: "/terms" },
    { name: "Site Map", href: "/sitemap" },
  ];

  const legalSections = [
    { name: "Supreme Court Judgments", href: "/judgments/supreme-court" },
    { name: "Court of Appeal", href: "/judgments/court-of-appeal" },
    { name: "High Court", href: "/judgments/high-court" },
    { name: "Constitution", href: "/laws/constitution" },
    { name: "Acts & Statutes", href: "/laws/acts" },
    { name: "Legal Notices", href: "/notices" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/ss-logo.png" alt="South Sudan Seal" className="h-15 w-10 rounded-full" />
              <div>
                <h3 className="text-xl font-bold">South Sudan Law Reports</h3>
                <p className="text-sm text-primary-foreground/80">Official Legal Portal</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 mb-6 max-w-md">
              The official online repository for South Sudan's legal system, providing 
              comprehensive access to judgments, laws, legal notices, and judicial resources 
              for legal professionals, researchers, and the public.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-accent" />
                <span>Juba, South Sudan</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-accent" />
                <span>+211 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-accent" />
                <span>info@lawreports.ss</span>
              </div>
            </div>
          </div>

          {/* Legal Sections */}
          <div>
            <h4 className="font-semibold mb-4">Legal Resources</h4>
            <ul className="space-y-2">
              {legalSections.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-primary-foreground/80 mb-4 md:mb-0">
              © {currentYear} Republic of South Sudan. All rights reserved.
            </div>
            <div className="text-sm text-primary-foreground/80">
            
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;