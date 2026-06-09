import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookmarkCheck, Loader2, BookOpen, Gavel, FileText, Trash2, ChevronRight } from 'lucide-react';
import { useGetBookmarks, useToggleBookmark } from '@/hooks/useBookmarks';
import { Bookmark } from '@/types/api';

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; href: (id: string) => string; color: string }> = {
  LAW:      { label: 'Law',      icon: <BookOpen className="h-4 w-4" />, href: id => `/laws/${id}`,      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  JUDGMENT: { label: 'Judgment', icon: <Gavel className="h-4 w-4" />,    href: id => `/judgments/${id}`, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
  NOTICE:   { label: 'Notice',   icon: <FileText className="h-4 w-4" />, href: id => `/notices/${id}`,   color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' },
};

const BookmarkCard = ({ bookmark }: { bookmark: Bookmark }) => {
  const meta = TYPE_META[bookmark.documentType] ?? TYPE_META.LAW;
  const { mutate: toggle, isPending } = useToggleBookmark();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                {meta.icon} {meta.label}
              </span>
              <span className="text-xs text-muted-foreground">
                Saved {new Date(bookmark.createdAt).toLocaleDateString()}
              </span>
            </div>
            <Link to={meta.href(bookmark.documentId)} className="block hover:text-primary transition-colors">
              <h3 className="font-semibold text-foreground leading-snug">{bookmark.title}</h3>
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to={meta.href(bookmark.documentId)}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={isPending}
              onClick={() => toggle({ documentId: bookmark.documentId, documentType: bookmark.documentType, title: bookmark.title })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Library = () => {
  const { data: bookmarks = [], isLoading } = useGetBookmarks();

  const byType = (type: string) => bookmarks.filter(b => b.documentType === type);
  const laws = byType('LAW');
  const judgments = byType('JUDGMENT');
  const notices = byType('NOTICE');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookmarkCheck className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">My Library</h1>
          </div>
          <p className="text-muted-foreground">
            {bookmarks.length > 0
              ? `${bookmarks.length} saved document${bookmarks.length !== 1 ? 's' : ''}`
              : 'Your saved documents appear here.'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookmarks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookmarkCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No bookmarks yet. Open any law, judgment, or notice and click <strong>Bookmark</strong> to save it here.</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link to="/laws"><Button variant="outline">Browse Laws</Button></Link>
                <Link to="/judgments"><Button variant="outline">Browse Judgments</Button></Link>
                <Link to="/notices"><Button variant="outline">Browse Notices</Button></Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {laws.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Laws <Badge variant="secondary">{laws.length}</Badge>
                </h2>
                <div className="space-y-2">{laws.map(b => <BookmarkCard key={b.id} bookmark={b} />)}</div>
              </section>
            )}
            {judgments.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Gavel className="h-4 w-4" /> Judgments <Badge variant="secondary">{judgments.length}</Badge>
                </h2>
                <div className="space-y-2">{judgments.map(b => <BookmarkCard key={b.id} bookmark={b} />)}</div>
              </section>
            )}
            {notices.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Notices <Badge variant="secondary">{notices.length}</Badge>
                </h2>
                <div className="space-y-2">{notices.map(b => <BookmarkCard key={b.id} bookmark={b} />)}</div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Library;
