import { useState } from "react";
import { Eye, Download, FileText, Calendar, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocalLaws } from "@/hooks/useLocalLaws";

const Laws = () => {
  const [q, setQ] = useState("");
  const [year, setYear] = useState<string>("");
  const [page, setPage] = useState(1);

  const { items, total, size, loading, error, categories } = useLocalLaws({
    q,
    year,
    page,
    size: 10,
  });

  const maxPage = Math.max(1, Math.ceil(total / size));

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
              onSearch={(query) => { setPage(1); setQ(query || ""); }}
            />

            <div className="max-w-sm">
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Year (e.g. 2011)"
                value={year}
                onChange={(e) => { setPage(1); setYear(e.target.value); }}
              />
            </div>

            {loading && <div>Loading…</div>}
            {error && <div className="text-red-600">Failed to load laws.json</div>}

            <div className="space-y-4">
              {items.map((law) => (
                <Card key={law.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">{law.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary">{law.type}</Badge>
                          {law.category && <Badge variant="outline">{law.category}</Badge>}
                          {law.year && <Badge variant="outline">{law.year}</Badge>}
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {law.status ?? "Published"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {law.htmlUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={law.htmlUrl} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </a>
                          </Button>
                        )}
                        {law.pdfUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={law.pdfUrl} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4 mr-1" /> PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {law.summary && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /><span>Sections: {law.sections ?? "—"}</span></div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Last Amended: {law.lastAmended ?? "—"}</span></div>
                        <div className="flex items-center gap-2"><FileText className="h-4 w-4" /><span>FRBR: {law.frbrUri ?? "—"}</span></div>
                      </div>
                    )}

                    <p className="text-foreground mb-3">{law.summary}</p>

                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="text-primary" asChild>
                        <a href={law.pdfUrl || law.htmlUrl || "#"} target="_blank" rel="noreferrer">
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!loading && total === 0 && <div className="text-sm text-slate-600">No laws found.</div>}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
              <span className="text-sm">Page {page} / {maxPage}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => (p < maxPage ? p + 1 : p))} disabled={page >= maxPage || total === 0}>Next</Button>
            </div>
          </TabsContent>

          <TabsContent value="constitution">
            {/* Example: show constitution item if present */}
            {/* You can filter items or search in useLocalLaws for title includes 'Constitution' */}
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((c) => (
                <Card key={c.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <Badge variant="secondary">{c.count}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Browse {c.count} laws in this category
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            {/* Later you can compute recency by lastAmended/year and sort locally */}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Laws;
