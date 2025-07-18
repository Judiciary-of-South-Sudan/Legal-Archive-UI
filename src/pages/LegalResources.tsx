import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const LegalResources = () => {
  const resources = [
    {
      title: "Transitional Constitution of South Sudan (2011)",
      link: "/laws/constitution",
      description: "The supreme law governing South Sudan. View the structure of government, legal rights, and principles of governance."
    },
    {
      title: "Penal Code Act (2008)",
      link: "/laws/acts",
      description: "Defines criminal offenses, penalties, and general legal principles in South Sudan's justice system."
    },
    {
      title: "Legal Notices",
      link: "/notices",
      description: "Gazettes, appointments, and official legal directives issued by government or judiciary."
    },
    {
      title: "Supreme Court Judgments",
      link: "/judgments/supreme-court",
      description: "Access high-level decisions from South Sudan’s Supreme Court."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-slate-800">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Legal Resources</h1>
        <p className="text-muted-foreground mb-6">
          Browse a curated list of foundational legal documents and references relevant to law, governance, and civic awareness in South Sudan.
        </p>

        <div className="space-y-6">
          {resources.map((resource, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <a href={resource.link} className="text-xl font-semibold text-blue-700 hover:underline flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {resource.title}
                </a>
                <p className="mt-2 text-slate-700">{resource.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalResources;
