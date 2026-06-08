import { useState } from "react";
import { resolveFileUrl } from "@/lib/apiClient";
import { Download, Eye, Calendar, FileText, Bell, Archive, Star, Loader2, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useGetNotices, useSearchNotices } from "@/hooks/useNotices";
import { NoticeFilterParams } from "@/types/api";

const NOTICE_TYPES = [
  "Appointment", "Amendment", "Regulation", "Proclamation", "Gazette", "Court Order", "Public Notice"
];
const STATUSES = ["Active", "Expired", "Withdrawn"];

const verificationBadge = (status?: string) => {
  if (!status || status === "PUBLISHED") return null;
  const map: Record<string, string> = { DRAFT: "bg-yellow-100 text-yellow-800", UNDER_REVIEW: "bg-blue-100 text-blue-800" };
  return <Badge className={`text-xs ${map[status] ?? ""}`}>{status.replace("_", " ")}</Badge>;
};

const LegalNotices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Omit<NoticeFilterParams, "page" | "size" | "sort">>({});
  const size = 10;

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== "");

  const listParams: NoticeFilterParams = { page, size, sort: "publicationDate,desc", ...filters };
  const listQuery = useGetNotices(listParams);
  const searchQueryResult = useSearchNotices({ query: searchQuery, page, size, sort: "publicationDate,desc" });

  const activeQuery = searchQuery ? searchQueryResult : listQuery;
  const noticesData = activeQuery.data;
  const notices = noticesData?.content || [];
  const totalPages = noticesData?.totalPages || 1;
  const totalElements = noticesData?.totalElements || 0;

  const setFilter = (key: keyof typeof filters, value: string | undefined) => {
    setPage(0);
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => { setPage(0); setFilters({}); };

  const noticeTypeStats = [
    { id: "appointments", name: "Judicial Appointments", icon: Bell, typeFilter: "Appointment" },
    { id: "amendments", name: "Legal Amendments", icon: FileText, typeFilter: "Amendment" },
    { id: "regulations", name: "Court Regulations", icon: Archive, typeFilter: "Regulation" },
    { id: "proclamations", name: "Presidential Proclamations", icon: Star, typeFilter: "Proclamation" },
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

          <TabsContent value="notices" className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search legal notices by title, gazette number, or authority..."
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Select value={filters.type ?? ""} onValueChange={v => setFilter("type", v)}>
                      <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        {NOTICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={filters.status ?? ""} onValueChange={v => setFilter("status", v)}>
                      <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                {totalElements > 0 && (
                  <p className="text-sm text-muted-foreground">{totalElements} notice{totalElements !== 1 ? "s" : ""} found</p>
                )}
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <Card key={notice.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{notice.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary">{notice.type}</Badge>
                              {notice.gazetteIssue && <Badge variant="outline">{notice.gazetteIssue}</Badge>}
                              {notice.issuingAuthority && <Badge variant="outline">{notice.issuingAuthority}</Badge>}
                              {notice.status && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  {notice.status}
                                </Badge>
                              )}
                              {verificationBadge(notice.verificationStatus)}
                            </div>

                            {notice.tags && notice.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {notice.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link to={`/notices/${notice.id}`}>
                              <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" />View</Button>
                            </Link>
                            {notice.pdfUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={resolveFileUrl(notice.pdfUrl)} target="_blank" rel="noreferrer">
                                  <Download className="h-4 w-4 mr-1" />PDF
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

          <TabsContent value="types">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {noticeTypeStats.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card key={type.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-4 group-hover:text-primary transition-colors">{type.name}</h3>
                      <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
                        setFilter("type", type.typeFilter);
                        setShowFilters(true);
                      }}>
                        View Notices <ChevronRight className="h-4 w-4 ml-1" />
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
                          {notice.type}{notice.publicationDate ? ` - ${new Date(notice.publicationDate).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <Link to={`/notices/${notice.id}`}>
                        <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button>
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
