import { useState } from "react";
import { resolveFileUrl } from "@/lib/apiClient";
import { Search, Filter, Download, Eye, Calendar, Gavel, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGetJudgments, useGetJudgmentsByCaseType, useGetJudgmentsByCourtLevel, useSearchJudgments } from "@/hooks/useJudgments";
import { Link } from 'react-router-dom';

const Judgments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [courtLevel, setCourtLevel] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(0);
  const size = 10;

  const allQuery = useGetJudgments({ page, size, sort: 'judgmentDate,desc' });
  const courtQuery = useGetJudgmentsByCourtLevel(courtLevel === 'all' ? '' : courtLevel, { page, size, sort: 'judgmentDate,desc' });
  const categoryQuery = useGetJudgmentsByCaseType(category === 'all' ? '' : category, { page, size, sort: 'judgmentDate,desc' });
  const searchQuery = useSearchJudgments({ query: submittedSearch, page, size, sort: 'judgmentDate,desc' });

  const activeQuery = submittedSearch
    ? searchQuery
    : category !== 'all'
    ? categoryQuery
    : courtLevel === 'all'
    ? allQuery
    : courtQuery;

  const judgments = activeQuery.data?.content || [];
  const totalPages = activeQuery.data?.totalPages || 1;
  const totalElements = activeQuery.data?.totalElements || 0;

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
              <Select value={courtLevel} onValueChange={(value) => {
                setPage(0);
                setSubmittedSearch("");
                setCourtLevel(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courts</SelectItem>
                  <SelectItem value="Supreme Court">Supreme Court</SelectItem>
                  <SelectItem value="Court of Appeal">Court of Appeal</SelectItem>
                  <SelectItem value="High Court">High Court</SelectItem>
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={(value) => {
                setPage(0);
                setSubmittedSearch("");
                setCategory(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                  <SelectItem value="Commercial Law">Commercial Law</SelectItem>
                  <SelectItem value="Family Law">Family Law</SelectItem>
                  <SelectItem value="Constitutional Law">Constitutional Law</SelectItem>
                  <SelectItem value="Civil Law">Civil Law</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => {
                setPage(0);
                setSubmittedSearch(searchTerm.trim());
              }}>
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
        {activeQuery.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Failed to load judgments. Please check your connection to the backend.
            </AlertDescription>
          </Alert>
        )}

        {activeQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading judgments...</span>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {judgments.map((judgment, idx) => (
                <Card key={judgment.id || idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {judgment.caseName}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary">{judgment.courtLevel}</Badge>
                          {judgment.caseType && <Badge variant="outline">{judgment.caseType}</Badge>}
                          {judgment.caseNumber && <Badge variant="outline">{judgment.caseNumber}</Badge>}
                          {judgment.status && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              {judgment.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {judgment.pdfUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resolveFileUrl(judgment.pdfUrl)} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
                      {judgment.judgmentDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Date: {new Date(judgment.judgmentDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {judgment.judges && judgment.judges.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Gavel className="h-4 w-4" />
                          <span>Judges: {judgment.judges.join(', ')}</span>
                        </div>
                      )}
                      {judgment.courtName && (
                        <div className="flex items-center gap-2">
                          <span>Court: {judgment.courtName}</span>
                        </div>
                      )}
                    </div>

                    {judgment.parties && (
                      <p className="text-sm font-medium mb-2">Parties: {judgment.parties}</p>
                    )}

                    {judgment.summary && (
                      <p className="text-foreground mb-3 line-clamp-3">{judgment.summary}</p>
                    )}

                    {judgment.verdict && (
                      <p className="text-sm font-medium text-primary mb-2">Verdict: {judgment.verdict}</p>
                    )}

                    {judgment.tags && judgment.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {judgment.tags.map((tag, idx2) => (
                          <Badge key={idx2} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-muted-foreground">
                        {judgment.jurisdiction ? `Jurisdiction: ${judgment.jurisdiction}` : (judgment.language ? `Language: ${judgment.language}` : '')}
                      </div>
                      <Link to={`/judgments/${judgment.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary">
                          View Full Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {judgments.length === 0 && (
                <div className="text-center py-12">
                  <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No judgments found.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">
                  Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} judgments
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page <= 0}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
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
      </main>

      <Footer />
    </div>
  );
};

export default Judgments;
