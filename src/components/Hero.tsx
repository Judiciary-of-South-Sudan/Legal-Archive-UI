import { FileText, Scale, Book, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Hero = () => {
  const quickLinks = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Recent Judgments",
      description: "Latest court decisions and rulings",
      href: "/judgments",
    },
    {
      icon: <Book className="h-6 w-6" />,
      title: "Constitution & Laws",
      description: "Complete legal framework of South Sudan",
      href: "/laws",
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Legal Notices",
      description: "Official gazette and proclamations",
      href: "/notices",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Judiciary Directory",
      description: "Courts, judges, and contact information",
      href: "/directory",
    },
  ];

  return (
    <section className="gradient-hero text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            South Sudan Law Reports
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Your comprehensive digital gateway to South Sudan's legal system. 
            Access judgments, laws, legal notices, and judicial resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-primary">
              Search Legal Database
            </Button>
            <Button size="lg" className="bg-transparent border border-white text-white hover:bg-white hover:text-primary hover:shadow-md transition-all">
              Browse Latest Judgments
            </Button>

          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {quickLinks.map((link, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6">
                <div className="text-accent mb-4">
                  {link.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {link.title}
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  {link.description}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-accent hover:text-accent-foreground hover:bg-accent/20 p-0"
                  asChild
                >
                  <a href={link.href}>
                    Access Now →
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;