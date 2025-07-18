import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Gavel, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const JudicialOpinions = () => {
  const opinions = [
    {
      id: 1,
      title: "Opinion on Land Tenure Reform",
      date: "2023-11-10",
      author: "Hon. Chief Justice Makuei Deng",
      summary: "A judicial interpretation regarding the customary vs. statutory land tenure framework in rural areas."
    },
    {
      id: 2,
      title: "Judicial Review of Bail Conditions",
      date: "2024-01-05",
      author: "Hon. Justice Sarah Oryem",
      summary: "Opinion on the overuse of stringent bail requirements in minor criminal offenses."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-slate-800">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Judicial Opinions</h1>
        <p className="text-muted-foreground mb-6">
          Explore advisory opinions and formal legal interpretations issued by the judiciary on emerging legal matters.
        </p>

        <div className="space-y-6">
          {opinions.map((opinion) => (
            <Card key={opinion.id}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-blue-700">{opinion.title}</h2>
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {opinion.date}
                  <Gavel className="h-4 w-4 ml-4" />
                  {opinion.author}
                </div>
                <p>{opinion.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JudicialOpinions;
