import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, BookOpen, Users, Mail, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl space-y-10">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Scale className="h-14 w-14 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">South Sudan Law Reports</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An open-access digital repository of the Republic of South Sudan's legal corpus — court judgments,
            legislation, and official legal notices, freely available to all.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary">Open Access</Badge>
            <Badge variant="secondary">Non-Commercial</Badge>
            <Badge variant="secondary">Republic of South Sudan</Badge>
          </div>
        </div>

        {/* Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <p>
              The South Sudan Law Reports portal exists to make South Sudan's legal system accessible, transparent, and
              searchable. We believe that open access to the law is foundational to justice, civic participation, and
              the rule of law.
            </p>
            <p>
              Our platform serves legal professionals, scholars, journalists, civil society organisations, and citizens
              who need reliable, organised, and up-to-date legal materials — without barriers.
            </p>
            <p>
              We index and publish court judgments from the Supreme Court, Court of Appeal, High Courts, and Magistrate
              Courts; all Acts, constitutional instruments, and statutory instruments; and official legal notices and
              gazette publications.
            </p>
          </CardContent>
        </Card>

        {/* What we offer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-2">
              <Scale className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Judgments & Case Law</h3>
              <p className="text-sm text-muted-foreground">
                Full-text judgments from all court levels, searchable by court, parties, citation, and date.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-2">
              <BookOpen className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Laws & Legislation</h3>
              <p className="text-sm text-muted-foreground">
                The Transitional Constitution, Acts of Parliament, and statutory instruments with amendment history.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-2">
              <Globe className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Legal Notices & Gazette</h3>
              <p className="text-sm text-muted-foreground">
                Official gazette publications, judicial appointments, proclamations, and court regulations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Legal Disclaimer */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Shield className="h-5 w-5" /> Legal Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
            <p>
              The materials published on this portal are provided for general informational and educational purposes
              only. They do not constitute legal advice and should not be relied upon as such.
            </p>
            <p>
              While we make every effort to ensure accuracy and currency of the documents published, we make no
              warranty — express or implied — as to the completeness, accuracy, or fitness for a particular purpose
              of any material on this site. Official gazettes and primary sources should always be consulted for
              legally binding text.
            </p>
            <p>
              This portal is an independent initiative and is not an official publication of the Government of the
              Republic of South Sudan or any of its judicial or legislative institutions.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Contact & Contributions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We welcome contributions of documents, corrections, and feedback from legal practitioners,
              government institutions, and civil society.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" asChild>
                <Link to="/contact">
                  <Mail className="h-4 w-4 mr-2" /> Contact Us
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/register">
                  <Users className="h-4 w-4 mr-2" /> Create an Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  );
};

export default About;
