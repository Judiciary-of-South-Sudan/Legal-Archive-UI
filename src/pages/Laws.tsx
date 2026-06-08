import { useState } from "react";
import { resolveFileUrl } from "@/lib/apiClient";
import { Eye, Download, FileText, Calendar, BookOpen, ChevronRight, Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGetLaws, useGetLawCategories, useGetLawTypes, useGetLawYears, useGetRecentLaws, useSearchLaws } from "@/hooks/useLaws";
import { Link } from 'react-router-dom';
import { LawFilterParams } from "@/types/api";

const STATUSES = ["Active", "Repealed", "Amended"];

const verificationBadge = (status?: string) => {
  if (!status || status === "PUBLISHED") return null;
  const map: Record<string, string> = { DRAFT: "bg-yellow-100 text-yellow-800", UNDER_REVIEW: "bg-blue-100 text-blue-800" };
  return <Badge className={`text-xs ${map[status] ?? ""}`}>{status.replace("_", " ")}</Badge>;
};

const Laws = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Omit<LawFilterParams, "page" | "size" | "sort">>({});
  const size = 10;

  const hasFilters = Object.values(filters).some(Boolean);

  const listParams: LawFilterParams = { page, size, sort: "year,desc", ...filters };
  const listQuery = useGetLaws(listParams);
  const searchQueryResult = useSearchLaws({ query: searchQuery, page, size, sort: "year,desc" });
  const activeQuery = searchQuery ? searchQueryResult : listQuery;

  const { data: categories } = useGetLawCategories();
  const { data: types } = useGetLawTypes();
  const { data: years } = useGetLawYears();
  const { data: recentLaws } = useGetRecentLaws(10);

  const laws = activeQuery.data?.content || [];
  const totalPages = activeQuery.data?.totalPages || 1;
  const totalElements = activeQuery.data?.totalElements || 0;

  const setFilter = (key: keyof typeof filters, value: string | number | undefined) => {
    setPage(0);
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => {
    setPage(0);
    setFilters({});
  };

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

          <TabsContent value="browse" className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search laws by title, citation, or keywords..."
                  onSearch={(query) => { setPage(0); setSearchQuery(query || ""); }}
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className="mt-1 shrink-0"
                onClick={() => setShowFilters(v => !v)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filters {hasFilters && !searchQuery ? `(${Object.values(filters).filter(Boolean).length})` : ""}
              </Button>
            </div>

            {showFilters && !searchQuery && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Select value={filters.type ?? ""} onValueChange={v => setFilter("type", v)}>
                      <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        {(types ?? ["Act", "Constitution", "Regulation", "Statutory Instrument"]).map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.status ?? ""} onValueChange={v => setFilter("status", v)}>
                      <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.year?.toString() ?? ""}
                      onValueChange={v => setFilter("year", v ? parseInt(v) : undefined)}
                    >
                      <SelectTrigger><SelectValue placeholder="All Years" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Years</SelectItem>
                        {(years ?? []).map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.category ?? ""} onValueChange={v => setFilter("category", v)}>
                      <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {(categories ?? []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={clearFilters}>
                      <X className="h-3 w-3 mr-1" /> Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {activeQuery.error && (
              <Alert variant="destructive">
                <AlertDescription>Failed to load laws. Please check your connection to the backend.</AlertDescription>
              </Alert>
            )}

            {activeQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading laws...</span>
              </div>
            ) : (
              <>
                {totalElements > 0 && (
                  <p className="text-sm text-muted-foreground">{totalElements} law{totalElements !== 1 ? "s" : ""} found</p>
                )}
                <div className="space-y-4">
                  {laws.map((law, idx) => (
                    <Card key={law.id || law.title || idx} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{law.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary">{law.type}</Badge>
                              {law.category && <Badge variant="outline">{law.category}</Badge>}
                              {law.year && <Badge variant="outline">{law.year}</Badge>}
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                {law.status || "Active"}
                              </Badge>
                              {verificationBadge(law.verificationStatus)}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link to={`/laws/${law.id}`}>
                              <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View</Button>
                            </Link>
                            {law.pdfUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={resolveFileUrl(law.pdfUrl)} target="_blank" rel="noreferrer">
                                  <Download className="h-4 w-4 mr-1" /> PDF
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
                        </div>

                        {law.summary && <p className="text-foreground mb-3 line-clamp-3">{law.summary}</p>}

                        {law.tags && law.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {law.tags.map((tag, i) => <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>)}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {law.lastAmended ? `Last amended: ${new Date(law.lastAmended).toLocaleDateString()}` :
                              law.enactmentDate ? `Enacted: ${new Date(law.enactmentDate).toLocaleDateString()}` : ""}
                          </div>
                          <Link to={`/laws/${law.id}`}>
                            <Button variant="ghost" size="sm" className="text-primary">
                              View Details <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!activeQuery.isLoading && laws.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No laws found.</p>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of {totalElements}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page <= 0}>Previous</Button>
                      <span className="text-sm">Page {page + 1} of {totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="constitution">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">View the Constitution and constitutional documents of South Sudan</p>
              {laws.filter(law => law.type === "Constitution").map((law) => (
                <Card key={law.id || law.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{law.title}</h3>
                    <p className="text-muted-foreground mb-4">{law.summary}</p>
                    <div className="flex gap-2">
                      <Link to={`/laws/${law.id}`}>
                        <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View</Button>
                      </Link>
                      {law.pdfUrl && (
                        <Button size="sm" variant="default" asChild>
                          <a href={resolveFileUrl(law.pdfUrl)} target="_blank" rel="noreferrer">
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
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{category}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Browse laws in this category</p>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
                      setFilter("category", category);
                      setShowFilters(true);
                    }}>
                      View Laws <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">Recently added or updated laws in the archive</p>
              {recentLaws?.map((law) => (
                <Card key={law.id || law.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{law.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary">{law.type}</Badge>
                          {law.year && <Badge variant="outline">{law.year}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {law.lastAmended ? `Updated: ${new Date(law.lastAmended).toLocaleDateString()}` :
                            law.enactmentDate ? `Enacted: ${new Date(law.enactmentDate).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link to={`/laws/${law.id}`}>
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View</Button>
                        </Link>
                        {law.pdfUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resolveFileUrl(law.pdfUrl)} target="_blank" rel="noreferrer">
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
