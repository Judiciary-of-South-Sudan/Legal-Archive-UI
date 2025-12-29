import { useState } from "react";
import { Eye, Download, FileText, Calendar, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGetLaws, useGetLawCategories, useGetRecentLaws } from "@/hooks/useLaws";

const Laws = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  // Fetch laws with pagination
  const { data: lawsData, isLoading, error } = useGetLaws({ page, size, sort: 'year,desc' });

  // Fetch categories
  const { data: categories } = useGetLawCategories();

  // Fetch recent laws
  const { data: recentLaws } = useGetRecentLaws(10);

  const laws = lawsData?.content || [];
  const totalPages = lawsData?.totalPages || 1;
  const totalElements = lawsData?.totalElements || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Laws of South Sudan</h1>
          <p className="text-muted-foreground">Complete collection of the Constitution, Acts, and statutory instruments.</p>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Laws</TabsTrigger>
            <TabsTrigger value="constitution">Constitution</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="recent">Recent Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <SearchBar
              placeholder="Search laws by title, citation, or keywords..."
              onSearch={(query) => {
                setPage(0);
                setSearchQuery(query || "");
              }}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load laws. Please check your connection to the backend.
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading laws...</span>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {laws.map((law) => (
                    <Card key={law.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{law.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary">{law.type}</Badge>
                              {law.category && <Badge variant="outline">{law.category}</Badge>}
                              {law.year && <Badge variant="outline">{law.year}</Badge>}
                              {law.lawNumber && <Badge variant="outline">{law.lawNumber}</Badge>}
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                {law.status || "Active"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" /> View ({law.viewCount || 0})
                            </Button>
                            {law.pdfUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={law.pdfUrl} target="_blank" rel="noreferrer">
                                  <Download className="h-4 w-4 mr-1" /> PDF ({law.downloadCount || 0})
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
                          {law.enactmentDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Enacted: {new Date(law.enactmentDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {law.jurisdiction && (
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span>Jurisdiction: {law.jurisdiction}</span>
                            </div>
                          )}
                          {law.issuingAuthority && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{law.issuingAuthority}</span>
                            </div>
                          )}
                        </div>

                        {law.summary && (
                          <p className="text-foreground mb-3 line-clamp-3">{law.summary}</p>
                        )}

                        {law.keywords && law.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {law.keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Last updated: {new Date(law.updatedAt).toLocaleDateString()}
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary">
                            View Details <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!isLoading && laws.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No laws found.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} laws
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
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
                        onClick={() => setPage(p => p + 1)}
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

          <TabsContent value="constitution">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                View the Constitution and constitutional documents of South Sudan
              </p>
              {laws.filter(law => law.type === 'Constitution').map((law) => (
                <Card key={law.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{law.title}</h3>
                    <p className="text-muted-foreground mb-4">{law.summary}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      {law.pdfUrl && (
                        <Button size="sm" variant="default" asChild>
                          <a href={law.pdfUrl} target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4 mr-1" /> Download PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category) => (
                <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <Badge variant="secondary">{category}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Browse laws in this category
                    </p>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View Laws <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Recently added or updated laws in the archive
              </p>
              {recentLaws?.map((law) => (
                <Card key={law.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{law.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary">{law.type}</Badge>
                          {law.year && <Badge variant="outline">{law.year}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Updated: {new Date(law.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        {law.pdfUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={law.pdfUrl} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4 mr-1" /> PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
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

export default Laws;
