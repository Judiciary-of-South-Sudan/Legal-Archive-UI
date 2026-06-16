import { Scale, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: t("footer.about"), href: "/about" },
    { name: t("footer.contact"), href: "/contact" },
    { name: t("footer.privacy"), href: "/privacy" },
    { name: t("footer.terms"), href: "/terms" },
    { name: t("footer.sitemap"), href: "/sitemap" },
  ];

  const legalSections = [
    { name: t("footer.supreme_court"), href: "/judgments/supreme-court" },
    { name: t("footer.court_of_appeal"), href: "/judgments/court-of-appeal" },
    { name: t("footer.high_court"), href: "/judgments/high-court" },
    { name: t("footer.county_court"), href: "/judgments" },
    { name: t("footer.constitution"), href: "/laws/constitution" },
    { name: t("footer.acts"), href: "/laws/acts" },
    { name: t("footer.decrees"), href: "/decrees" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="h-8 w-8 text-accent" />
              <div>
                <h3 className="text-xl font-bold">{t("header.title")}</h3>
                <p className="text-sm text-primary-foreground/80">{t("header.subtitle")}</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 mb-6 max-w-md">
              {t("footer.description")}
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
            <h4 className="font-semibold mb-4">{t("footer.citizens_guide")}</h4>
            <ul className="space-y-2">
              {legalSections.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.quick_links")}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-primary-foreground/80 mb-4 md:mb-0">
              {t("footer.copyright", { year: currentYear })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
