import { useState } from "react";
import { Search, Filter, Download, Eye, Scale, FileText, Calendar, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Laws = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  
  const lawCategories = [
    { id: "constitutional", name: "Constitutional Law", count: 12 },
    { id: "criminal", name: "Criminal Law", count: 45 },
    { id: "civil", name: "Civil Law", count: 38 },
    { id: "commercial", name: "Commercial Law", count: 29 },
    { id: "family", name: "Family Law", count: 22 },
    { id: "land", name: "Land Law", count: 18 },
    { id: "labor", name: "Labor Law", count: 15 },
    { id: "tax", name: "Tax Law", count: 11 }
  ];
  
  const sampleLaws = [
    {
      id: 1,
      title: "The Constitution of South Sudan, 2011",
      type: "Constitution",
      year: "2011",
      category: "Constitutional Law",
      status: "Active",
      chapter: "Constitutional Framework",
      sections: 242,
      lastAmended: "2018",
      description: "The supreme law of South Sudan establishing the framework of government and fundamental rights."
    },
    {
      id: 2,
      title: "The Penal Code Act, 2008",
      type: "Act",
      year: "2008",
      category: "Criminal Law",
      status: "Active",
      chapter: "Criminal Offenses",
      sections: 356,
      lastAmended: "2020",
      description: "Defines criminal offenses and penalties in South Sudan."
    },
    {
      id: 3,
      title: "The Civil Procedure Act, 2007",
      type: "Act",
      year: "2007",
      category: "Civil Law",
      status: "Active",
      chapter: "Court Procedures",
      sections: 189,
      lastAmended: "2019",
      description: "Governs civil court procedures and legal processes."
    },
    {
      id: 4,
      title: "The Companies Act, 2012",
      type: "Act",
      year: "2012",
      category: "Commercial Law",
      status: "Active",
      chapter: "Business Registration",
      sections: 278,
      lastAmended: "2021",
      description: "Regulates company formation, management, and dissolution."
    },
    {
      id: 5,
      title: "The Marriage Act, 2003",
      type: "Act",
      year: "2003",
      category: "Family Law",
      status: "Active",
      chapter: "Marriage and Divorce",
      sections: 145,
      lastAmended: "2017",
      description: "Governs marriage, divorce, and family relations."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Laws of South Sudan</h1>
          <p className="text-muted-foreground">
            Complete collection of South Sudan's Constitution, Acts, and statutory instruments.
          </p>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Laws</TabsTrigger>
            <TabsTrigger value="constitution">Constitution</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="recent">Recent Updates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-6">
            {/* Enhanced Search */}
            <SearchBar 
              placeholder="Search laws by title, citation, or keywords..."
              onSearch={(query, filters) => {
                console.log("Search:", query, filters);
              }}
            />

            {/* Results with Enhanced Details */}
            <div className="space-y-4">
              {sampleLaws.map((law) => (
                <Card key={law.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {law.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary">{law.type}</Badge>
                          <Badge variant="outline">{law.category}</Badge>
                          <Badge variant="outline">{law.year}</Badge>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {law.status}
                          </Badge>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Sections: {law.sections}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Last Amended: {law.lastAmended}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Chapter: {law.chapter}</span>
                      </div>
                    </div>
                    
                    <p className="text-foreground mb-3">{law.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="text-primary">
                        View Details <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="constitution">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Constitution of South Sudan (2011)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  The Constitution of South Sudan is the supreme law of the Republic of South Sudan, 
                  establishing the framework of government, fundamental rights, and the rule of law.
                </p>
                
                <Accordion type="single" collapsible className="mb-6">
                  <AccordionItem value="chapters">
                    <AccordionTrigger>Constitution Chapters</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Chapter I: General Provisions",
                          "Chapter II: Bill of Rights",
                          "Chapter III: Executive",
                          "Chapter IV: Legislature",
                          "Chapter V: Judiciary",
                          "Chapter VI: Constitutional Bodies"
                        ].map((chapter, index) => (
                          <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                            <p className="font-medium">{chapter}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="flex gap-2">
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    Read Full Constitution
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Browse {category.count} laws in this category
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      View Laws <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Updates & Amendments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleLaws.slice(0, 3).map((law) => (
                    <div key={law.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{law.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Last amended: {law.lastAmended}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Changes
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Laws;