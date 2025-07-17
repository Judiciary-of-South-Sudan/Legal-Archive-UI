import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Constitution = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 text-slate-800">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">
          Transitional Constitution of South Sudan (2011)
        </h1>

        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="mb-4">
              The Transitional Constitution of the Republic of South Sudan (2011) serves as the
              supreme law of the land. It outlines the government structure, legal foundations,
              rights and freedoms of citizens, and the principles of governance following the
              country’s independence.
            </p>
            <p className="mb-6">
              It is binding on all persons, institutions, and levels of government, and provides
              the framework for rule of law, human rights, and separation of powers.
            </p>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Key Topics Covered
          </h2>
          <ul className="list-disc list-inside text-slate-700">
            <li>Fundamental rights and freedoms</li>
            <li>Structure of the Executive, Legislature, and Judiciary</li>
            <li>Decentralized system of governance</li>
            <li>Public finance and accountability</li>
            <li>National defense and security provisions</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Constitution;
