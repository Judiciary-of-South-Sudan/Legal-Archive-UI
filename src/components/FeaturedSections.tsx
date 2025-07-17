import { Calendar, FileText, AlertCircle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FeaturedSections = () => {
  const recentJudgments = [
    {
      title: "Republic v. John Doe & Others",
      court: "Supreme Court",
      date: "2024-01-15",
      citation: "SSSC 001/2024",
      subject: "Constitutional Law",
    },
    {
      title: "Commercial Bank Ltd v. Ministry of Finance",
      court: "Court of Appeal",
      date: "2024-01-10", 
      citation: "SSCA 045/2023",
      subject: "Commercial Law",
    },
    {
      title: "State v. Mary Jane",
      court: "High Court",
      date: "2024-01-08",
      citation: "SSHC 234/2023",
      subject: "Criminal Law",
    },
  ];

  const legalUpdates = [
    {
      title: "Amendment to the Investment Promotion Act",
      type: "Legislative Update",
      date: "2024-01-12",
      status: "Enacted",
    },
    {
      title: "New Practice Direction on E-Filing",
      type: "Practice Direction",
      date: "2024-01-10",
      status: "Effective",
    },
    {
      title: "Appointment of High Court Judges",
      type: "Judicial Appointment",
      date: "2024-01-08",
      status: "Gazette",
    },
  ];

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Judgments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Judgments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJudgments.map((judgment, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground hover:text-primary cursor-pointer">
                        {judgment.title}
                      </h4>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {judgment.subject}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{judgment.court} • {judgment.citation}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(judgment.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Judgments
              </Button>
            </CardContent>
          </Card>

          {/* Legal Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                Legal Updates & Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {legalUpdates.map((update, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground hover:text-primary cursor-pointer">
                        {update.title}
                      </h4>
                      <Badge 
                        variant={update.status === "Enacted" ? "default" : "secondary"}
                        className="ml-2 text-xs"
                      >
                        {update.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{update.type}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(update.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Updates
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Featured Legal Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Download className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Court Forms</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Download official court forms and templates
                </p>
                <Button variant="outline" size="sm">
                  Access Forms
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Law Reports Archive</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Historical legal decisions and precedents
                </p>
                <Button variant="outline" size="sm">
                  Browse Archive
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Legal Aid Information</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Pro bono services and legal assistance
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSections;