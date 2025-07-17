import { useState } from "react";
import { Search, Filter, Download, Eye, Calendar, FileText, Bell, Archive, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LegalNotices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  
  const noticeTypes = [
    { id: "appointments", name: "Judicial Appointments", count: 24, icon: Bell },
    { id: "amendments", name: "Legal Amendments", count: 18, icon: FileText },
    { id: "regulations", name: "Court Regulations", count: 15, icon: Archive },
    { id: "proclamations", name: "Presidential Proclamations", count: 12, icon: Star }
  ];
  
  const sampleNotices = [
    {
      id: 1,
      title: "Appointment of High Court Judge",
      type: "Judicial Appointment",
      date: "2024-01-15",
      gazetteNumber: "SS/GOV/2024/001",
      authority: "Ministry of Justice",
      status: "Active",
      priority: "High",
      description: "Official appointment of Hon. Justice Sarah Wilson to the High Court of South Sudan, effective immediately."
    },
    {
      id: 2,
      title: "Amendment to Criminal Procedure Rules",
      type: "Legal Amendment",
      date: "2024-01-10",
      gazetteNumber: "SS/GOV/2024/002",
      authority: "Chief Justice",
      status: "Active",
      priority: "Medium",
      description: "Updates to criminal procedure rules regarding evidence handling and case management."
    },
    {
      id: 3,
      title: "New Commercial Court Regulations",
      type: "Court Rules",
      date: "2024-01-08",
      gazetteNumber: "SS/GOV/2024/003",
      authority: "Judiciary",
      status: "Active",
      priority: "Medium",
      description: "Establishment of new commercial court procedures and filing requirements for business disputes."
    },
    {
      id: 4,
      title: "Presidential Decree on Land Rights",
      type: "Presidential Proclamation",
      date: "2024-01-05",
      gazetteNumber: "SS/GOV/2024/004",
      authority: "Office of the President",
      status: "Active",
      priority: "High",
      description: "New regulations governing land ownership and transfer procedures in urban areas."
    },
    {
      id: 5,
      title: "Court Fee Schedule Update",
      type: "Court Rules",
      date: "2024-01-03",
      gazetteNumber: "SS/GOV/2024/005",
      authority: "Judiciary",
      status: "Active",
      priority: "Low",
      description: "Revised court filing fees and service charges effective from February 1, 2024."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Legal Notices & Gazette</h1>
          <p className="text-muted-foreground">
            Official legal notices, appointments, and gazette publications from South Sudan authorities.
          </p>
        </div>

        <Tabs defaultValue="notices" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notices">All Notices</TabsTrigger>
            <TabsTrigger value="types">By Type</TabsTrigger>
            <TabsTrigger value="gazette">Gazette Archive</TabsTrigger>
            <TabsTrigger value="recent">Recent Updates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notices" className="space-y-6">
            {/* Enhanced Search */}
            <SearchBar 
              placeholder="Search legal notices by title, gazette number, or authority..."
              onSearch={(query, filters) => {
                console.log("Search:", query, filters);
              }}
            />

            {/* Enhanced Results */}
            <div className="space-y-4">
              {sampleNotices.map((notice) => (
                <Card key={notice.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {notice.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary">{notice.type}</Badge>
                          <Badge variant="outline">{notice.gazetteNumber}</Badge>
                          <Badge variant="outline">{notice.authority}</Badge>
                          <Badge 
                            className={
                              notice.priority === "High" 
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                : notice.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            }
                          >
                            {notice.priority} Priority
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Published: {notice.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Authority: {notice.authority}</span>
                      </div>
                    </div>
                    
                    <p className="text-foreground">{notice.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="types">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {noticeTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card key={type.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {type.name}
                      </h3>
                      <Badge variant="secondary" className="mb-4">{type.count} Notices</Badge>
                      <Button variant="outline" size="sm" className="w-full">
                        View All
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="gazette">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  South Sudan Gazette Archive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Access historical gazette publications and official government notices.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["2024", "2023", "2022", "2021", "2020", "2019"].map((year) => (
                    <Card key={year} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold text-lg">{year}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {Math.floor(Math.random() * 50) + 20} Publications
                        </p>
                        <Button variant="outline" size="sm">View Year</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleNotices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{notice.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notice.type} • {notice.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
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

export default LegalNotices;