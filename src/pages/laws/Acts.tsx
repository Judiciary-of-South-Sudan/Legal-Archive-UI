import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Acts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 text-slate-800">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Acts of Parliament</h1>

        <p className="mb-6 text-muted-foreground">
          Explore key legislation enacted by the National Legislative Assembly of South Sudan. These
          Acts form the foundation of criminal, civil, and administrative law within the Republic.
        </p>

        {/* Penal Code Act Example */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-700">
              Penal Code Act, 2008
            </h2>
            <p className="mb-4">
              The Penal Code Act defines criminal offenses, penalties, and general principles of
              criminal responsibility. It governs how crimes are prosecuted and establishes the
              rights of the accused under South Sudanese law.
            </p>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for additional Acts */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Other Acts</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Land Act</li>
              <li>Child Act</li>
              <li>Local Government Act</li>
              <li>Public Health Act</li>
              <li>National Security Act</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Acts;
