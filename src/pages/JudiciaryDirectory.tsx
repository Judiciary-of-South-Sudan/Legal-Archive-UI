import { useState } from "react";
import { Search, MapPin, Phone, Mail, Gavel, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const JudiciaryDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const courts = [
    {
      id: 1,
      name: "Supreme Court of South Sudan",
      level: "Supreme Court",
      location: "Juba",
      address: "Supreme Court Building, Juba, Central Equatoria State",
      phone: "+211-123-456-789",
      email: "info@supremecourt.ss",
      chiefJudge: "Hon. Chief Justice John Wuol Makec",
      judges: ["Hon. Justice Mary Ayen", "Hon. Justice Peter Sule", "Hon. Justice Rebecca Kwaje"]
    },
    {
      id: 2,
      name: "High Court - Central Equatoria",
      level: "High Court",
      location: "Juba",
      address: "High Court Complex, Juba, Central Equatoria State",
      phone: "+211-123-456-790",
      email: "info@highcourt-ce.ss",
      chiefJudge: "Hon. Justice Michael Brown",
      judges: ["Hon. Justice Sarah Ahmed", "Hon. Justice David Wilson", "Hon. Justice Grace Kiden"]
    },
    {
      id: 3,
      name: "High Court - Upper Nile",
      level: "High Court", 
      location: "Malakal",
      address: "High Court Building, Malakal, Upper Nile State",
      phone: "+211-123-456-791",
      email: "info@highcourt-un.ss",
      chiefJudge: "Hon. Justice James Garang",
      judges: ["Hon. Justice Susan Nyong", "Hon. Justice Peter Deng"]
    }
  ];

  const counties = [
    {
      id: 1,
      name: "Juba County Court",
      state: "Central Equatoria",
      location: "Juba",
      address: "County Court Building, Juba Town",
      phone: "+211-123-456-800",
      magistrate: "Hon. Magistrate Alice Kuel",
      jurisdiction: "Civil and Criminal matters up to 5 years imprisonment"
    },
    {
      id: 2,
      name: "Yei County Court",
      state: "Central Equatoria",
      location: "Yei",
      address: "County Court Complex, Yei Town",
      phone: "+211-123-456-801",
      magistrate: "Hon. Magistrate Joseph Wani",
      jurisdiction: "Civil and Criminal matters up to 5 years imprisonment"
    },
    {
      id: 3,
      name: "Bentiu County Court",
      state: "Unity State",
      location: "Bentiu",
      address: "County Court Building, Bentiu",
      phone: "+211-123-456-802",
      magistrate: "Hon. Magistrate Mary Nyaruai",
      jurisdiction: "Civil and Criminal matters up to 5 years imprisonment"
    }
  ];

  const judiciaryOfficials = [
    {
      id: 1,
      name: "Hon. Chief Justice John Wuol Makec",
      position: "Chief Justice",
      court: "Supreme Court",
      appointed: "2015",
      bio: "Former Attorney General and practicing lawyer with over 25 years of experience."
    },
    {
      id: 2,
      name: "Hon. Justice Mary Ayen",
      position: "Justice",
      court: "Supreme Court",
      appointed: "2018",
      bio: "Former High Court Judge with expertise in constitutional and commercial law."
    },
    {
      id: 3,
      name: "Hon. Justice Michael Brown",
      position: "Chief Judge",
      court: "High Court - Central Equatoria",
      appointed: "2020",
      bio: "Experienced judge with background in criminal and family law."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Judiciary Directory</h1>
          <p className="text-muted-foreground">
            Complete directory of South Sudan courts, judges, and judicial officials.
          </p>
        </div>

        <Tabs defaultValue="courts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courts">Courts</TabsTrigger>
            <TabsTrigger value="counties">County Courts</TabsTrigger>
            <TabsTrigger value="officials">Judicial Officials</TabsTrigger>
          </TabsList>

          <TabsContent value="courts">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Courts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Search by court name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Court Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="supreme">Supreme Court</SelectItem>
                      <SelectItem value="appeal">Court of Appeal</SelectItem>
                      <SelectItem value="high">High Court</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      <SelectItem value="ce">Central Equatoria</SelectItem>
                      <SelectItem value="ee">Eastern Equatoria</SelectItem>
                      <SelectItem value="we">Western Equatoria</SelectItem>
                      <SelectItem value="un">Upper Nile</SelectItem>
                      <SelectItem value="unity">Unity</SelectItem>
                      <SelectItem value="jonglei">Jonglei</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {courts.map((court) => (
                <Card key={court.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {court.name}
                        </h3>
                        <Badge variant="secondary" className="mb-3">{court.level}</Badge>
                      </div>
                      <Button variant="outline" size="sm">Contact</Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-muted-foreground">{court.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{court.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{court.email}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">Chief Judge</span>
                        </div>
                        <p className="text-sm mb-3">{court.chiefJudge}</p>
                        
                        <div className="mb-2">
                          <span className="font-medium text-sm">Other Judges:</span>
                        </div>
                        <div className="space-y-1">
                          {court.judges.map((judge, index) => (
                            <p key={index} className="text-sm text-muted-foreground">{judge}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="counties">
            <div className="space-y-4">
              {counties.map((county) => (
                <Card key={county.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {county.name}
                        </h3>
                        <Badge variant="secondary" className="mb-3">{county.state}</Badge>
                      </div>
                      <Button variant="outline" size="sm">Contact</Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-muted-foreground">{county.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{county.phone}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">Magistrate</span>
                        </div>
                        <p className="text-sm mb-3">{county.magistrate}</p>
                        
                        <div className="mb-2">
                          <span className="font-medium text-sm">Jurisdiction:</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{county.jurisdiction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="officials">
            <div className="space-y-4">
              {judiciaryOfficials.map((official) => (
                <Card key={official.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {official.name}
                        </h3>
                        <div className="flex gap-2 mb-3">
                          <Badge variant="secondary">{official.position}</Badge>
                          <Badge variant="outline">{official.court}</Badge>
                          <Badge variant="outline">Appointed: {official.appointed}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </div>
                    
                    <p className="text-foreground">{official.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default JudiciaryDirectory;