import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LegalNotices = () => {
  const notices = [
    {
      id: 1,
      title: "Notice on Amendment of Judicial Procedures",
      date: "2024-02-14",
      type: "Judicial",
      summary:
        "This notice outlines changes to filing deadlines and electronic submissions to courts under the Ministry of Justice.",
    },
    {
      id: 2,
      title: "Gazette: Official Appointment of High Court Judges",
      date: "2024-01-20",
      type: "Government Gazette",
      summary:
        "A formal notice of new judicial appointments as approved by the National Legislative Assembly.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-800">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Legal Notices</h1>
        <p className="text-muted-foreground mb-6">
          Access official legal notices issued by South Sudan's judicial and legislative bodies,
          including gazettes, appointments, regulatory updates, and circulars.
        </p>

        <div className="space-y-6">
          {notices.map((notice) => (
            <Card key={notice.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 text-blue-700">{notice.title}</h2>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{notice.date}</span>
                      <Badge variant="outline">{notice.type}</Badge>
                    </div>
                    <p>{notice.summary}</p>
                  </div>
                  <div className="ml-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalNotices;
