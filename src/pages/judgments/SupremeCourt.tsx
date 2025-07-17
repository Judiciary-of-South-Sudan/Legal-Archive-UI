import { useState } from "react";
import { Search, Filter, Download, Eye, Calendar, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SupremeCourt = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const allJudgments = [
    {
      id: 1,
      title: "Republic v. John Doe",
      court: "Supreme Court",
      date: "2024-01-15",
      judge: "Hon. Justice Mary Smith",
      category: "Criminal Law",
      citation: "[2024] SSSC 001",
      summary: "Case involving constitutional interpretation of due process rights in criminal proceedings."
    },
    {
      id: 2,
      title: "State v. National Electoral Body",
      court: "Supreme Court",
      date: "2023-10-22",
      judge: "Hon. Justice Alex Garang",
      category: "Constitutional Law",
      citation: "[2023] SSSC 015",
      summary: "Ruling on the legality of electoral law amendment."
    },
    {
      id: 3,
      title: "ABC Corp v. XYZ Ltd",
      court: "High Court",
      date: "2024-01-10",
      judge: "Hon. Justice Peter Johnson",
      category: "Commercial Law",
      citation: "[2024] SSHC 005",
      summary: "Contract dispute regarding breach of commercial agreement and damages."
    }
  ];

  const supremeJudgments = allJudgments.filter(j => j.court === "Supreme Court");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Supreme Court Judgments</h1>
          <p className="text-muted-foreground">
            View landmark decisions and recent rulings from the Supreme Court of South Sudan.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Supreme Court Judgments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Input
                  placeholder="Search by case name, citation, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {supremeJudgments
            .filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(judgment => (
              <Card key={judgment.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{judgment.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{judgment.court}</Badge>
                        <Badge variant="outline">{judgment.category}</Badge>
                        <Badge variant="outline">{judgment.citation}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date: {judgment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      <span>Judge: {judgment.judge}</span>
                    </div>
                  </div>

                  <p>{judgment.summary}</p>
                </CardContent>
              </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SupremeCourt;
