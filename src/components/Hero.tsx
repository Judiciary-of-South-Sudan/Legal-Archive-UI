import { useState } from "react";
import { FileText, Scale, Book, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";

const Hero = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

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

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search laws, judgments, legal notices..."
                className="pl-10 h-12 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:bg-white/20"
              />
            </div>
            <Button type="submit" size="lg" variant="secondary" className="text-primary h-12 px-8">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-white/70">
            <span>Try:</span>
            {["constitution", "land rights", "criminal code", "investment"].map((term) => (
              <button
                key={term}
                type="button"
                className="underline underline-offset-2 hover:text-white transition-colors"
                onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {quickLinks.map((link, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6">
                <div className="text-accent mb-4">{link.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-white">{link.title}</h3>
                <p className="text-white/80 text-sm mb-4">{link.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-accent hover:text-accent-foreground hover:bg-accent/20 p-0"
                  asChild
                >
                  <Link to={link.href}>Access Now →</Link>
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
