import { Search, Menu, Scale, User, LogOut, Moon, Sun, BookmarkCheck, Languages, Settings, LayoutDashboard, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const { isAuthenticated, user, logout, isAdmin, isEditor } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    Promise.allSettled([
      apiClient.get('/laws?size=4&sort=createdAt,desc'),
      apiClient.get('/judgments?size=4&sort=createdAt,desc'),
      apiClient.get('/legal-notices?size=4&sort=createdAt,desc'),
    ]).then(([lawsRes, judgmentsRes, noticesRes]) => {
      const items: { label: string; createdAt: string }[] = [];

      const laws = lawsRes.status === 'fulfilled' ? (lawsRes.value.data?.data?.content ?? []) : [];
      const judgments = judgmentsRes.status === 'fulfilled' ? (judgmentsRes.value.data?.data?.content ?? []) : [];
      const notices = noticesRes.status === 'fulfilled' ? (noticesRes.value.data?.data?.content ?? []) : [];

      laws.forEach((d: any) => items.push({ label: `${d.type || 'Law'}: ${d.title}`, createdAt: d.createdAt ?? '' }));
      judgments.forEach((d: any) => items.push({ label: `Judgment: ${d.caseName}`, createdAt: d.createdAt ?? '' }));
      notices.forEach((d: any) => items.push({ label: `Notice: ${d.title}`, createdAt: d.createdAt ?? '' }));

      // Sort all by newest first, take top 8
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const labels = items.slice(0, 8).map(i => i.label);
      if (labels.length > 0) setTickerItems(labels);
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleLanguage = () => {
    const newLang = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = (searchInputRef.current?.value || mobileSearchRef.current?.value || "").trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: t('nav.judgments'), href: "/judgments" },
    { name: t('nav.laws'), href: "/laws" },
    { name: t('nav.notices'), href: "/notices" },
    { name: t('nav.opinions'), href: "/opinions" },
    { name: t('nav.directory'), href: "/directory" },
    { name: t('nav.guide'), href: "/resources" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* South Sudan flag stripe */}
      <div className="flag-stripe-bar" />
      {/* Top Bar with News Ticker */}
      {tickerItems.length > 0 && (
        <div className="bg-primary text-primary-foreground py-1 overflow-hidden">
          <div className="news-ticker whitespace-nowrap text-sm">
            {tickerItems.join('  •  ')}
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:shadow-md transition-shadow">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight tracking-tight">
                South Sudan
              </h1>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                Law Reports
              </p>
              <p className="text-xs text-muted-foreground leading-none">Legal Portal</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={t('header.search_placeholder')}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="default" size="sm">{t('header.search')}</Button>
          </form>

          {/* Dark mode + Language toggle + Auth */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="gap-1 text-xs font-medium"
            >
              <Languages className="h-4 w-4" />
              {isArabic ? 'EN' : 'عربي'}
            </Button>

            {/* Dark mode toggle */}
            <Button variant="ghost" size="sm" onClick={() => setDark(d => !d)} aria-label="Toggle dark mode">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/library" className="cursor-pointer">
                      <BookmarkCheck className="mr-2 h-4 w-4" />
                      {t('header.my_library')}
                    </Link>
                  </DropdownMenuItem>
                  {(isEditor() || isAdmin()) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          {isAdmin() ? t('header.admin_dashboard') : 'Dashboard'}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('header.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">{t('header.login')}</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/register">{t('header.register')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile: language + dark + menu */}
          <div className="md:hidden flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} aria-label="Toggle language" className="text-xs">
              {isArabic ? 'EN' : 'ع'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDark(d => !d)} aria-label="Toggle dark mode">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block pb-4 md:pb-0`}>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-foreground hover:text-primary hover:bg-secondary'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={mobileSearchRef}
              placeholder={t('header.search_placeholder')}
              className="pl-10"
            />
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
