import { useState } from "react";
import { Search, Filter, Download, Eye, Calendar, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Judgments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const sampleJudgments = [
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
      title: "ABC Corporation v. XYZ Limited",
      court: "High Court",
      date: "2024-01-10",
      judge: "Hon. Justice Peter Johnson",
      category: "Commercial Law",
      citation: "[2024] SSHC 005",
      summary: "Contract dispute regarding breach of commercial agreement and damages."
    },
    {
      id: 3,
      title: "State v. Jane Smith",
      court: "Court of Appeal",
      date: "2024-01-08",
      judge: "Hon. Justice David Wilson",
      category: "Criminal Law",
      citation: "[2024] SSCA 002",
      summary: "Appeal against conviction for fraud and sentencing guidelines."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Judgments & Case Law</h1>
          <p className="text-muted-foreground">
            Access the complete repository of South Sudan court judgments and case law.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Judgments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by case name, citation, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courts</SelectItem>
                  <SelectItem value="supreme">Supreme Court</SelectItem>
                  <SelectItem value="appeal">Court of Appeal</SelectItem>
                  <SelectItem value="high">High Court</SelectItem>
                  <SelectItem value="county">County Courts</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="criminal">Criminal Law</SelectItem>
                  <SelectItem value="commercial">Commercial Law</SelectItem>
                  <SelectItem value="family">Family Law</SelectItem>
                  <SelectItem value="constitutional">Constitutional Law</SelectItem>
                  <SelectItem value="civil">Civil Law</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {sampleJudgments.map((judgment) => (
            <Card key={judgment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {judgment.title}
                    </h3>
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
                
                <p className="text-foreground">{judgment.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="outline" className="bg-primary text-primary-foreground">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Judgments;