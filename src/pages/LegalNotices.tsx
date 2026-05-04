import { useState } from "react";
import { Download, Eye, Calendar, FileText, Bell, Archive, Star, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useGetNotices, useSearchNotices } from "@/hooks/useNotices";

const LegalNotices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  const listQuery = useGetNotices({ page, size, sort: "publicationDate,desc" });
  const searchQueryResult = useSearchNotices({ query: searchQuery, page, size, sort: "publicationDate,desc" });

  const activeQuery = searchQuery ? searchQueryResult : listQuery;
  const noticesData = activeQuery.data;
  const notices = noticesData?.content || [];
  const totalPages = noticesData?.totalPages || 1;
  const totalElements = noticesData?.totalElements || 0;

  const noticeTypes = [
    { id: "appointments", name: "Judicial Appointments", count: notices.filter((notice) => notice.type?.includes("Appointment")).length, icon: Bell },
    { id: "amendments", name: "Legal Amendments", count: notices.filter((notice) => notice.type?.includes("Amendment")).length, icon: FileText },
    { id: "regulations", name: "Court Regulations", count: notices.filter((notice) => notice.type?.includes("Regulation") || notice.type?.includes("Rule")).length, icon: Archive },
    { id: "proclamations", name: "Presidential Proclamations", count: notices.filter((notice) => notice.type?.includes("Proclamation")).length, icon: Star },
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
            <SearchBar
              placeholder="Search legal notices by title, gazette number, or authority..."
              onSearch={(query) => {
                setPage(0);
                setSearchQuery(query || "");
              }}
            />

            {activeQuery.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load legal notices. Please check your connection to the backend.
                </AlertDescription>
              </Alert>
            )}

            {activeQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading notices...</span>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <Card key={notice.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              {notice.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary">{notice.type}</Badge>
                              {notice.gazetteIssue && <Badge variant="outline">{notice.gazetteIssue}</Badge>}
                              {notice.issuingAuthority && <Badge variant="outline">{notice.issuingAuthority}</Badge>}
                              {notice.status && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  {notice.status}
                                </Badge>
                              )}
                            </div>

                            {notice.tags && notice.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {notice.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link to={`/notices/${notice.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            {notice.pdfUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={notice.pdfUrl} target="_blank" rel="noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  PDF
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                          {notice.publicationDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Published: {new Date(notice.publicationDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Authority: {notice.issuingAuthority}</span>
                          </div>
                        </div>

                        {notice.summary && <p className="text-foreground mb-4 line-clamp-3">{notice.summary}</p>}

                        <div className="flex justify-end">
                          <Link to={`/notices/${notice.id}`}>
                            <Button variant="ghost" size="sm" className="text-primary">
                              View Details <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {notices.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No legal notices found.</p>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} notices
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
                        disabled={page <= 0}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {page + 1} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((currentPage) => currentPage + 1)}
                        disabled={page >= totalPages - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="types">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {noticeTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card key={type.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{type.name}</h3>
                      <Badge variant="secondary" className="mb-4">{type.count} Notices</Badge>
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
                <p className="text-muted-foreground">
                  Gazette entries are loaded from the same legal notice API and can be found using search or the all notices list.
                </p>
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
                  {notices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{notice.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notice.type} {notice.publicationDate ? `- ${new Date(notice.publicationDate).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <Link to={`/notices/${notice.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {notices.length === 0 && <p className="text-sm text-muted-foreground">No recent notices found.</p>}
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
