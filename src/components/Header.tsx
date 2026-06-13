import {
  BookmarkCheck,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Scale,
  Search,
  Settings,
  Sun,
  User,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBandwidth } from "@/contexts/BandwidthContext";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const { isAuthenticated, user, logout, isAdmin, isEditor } = useAuth();
  const { lowBandwidth, toggle: toggleBandwidth } = useBandwidth();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const { data: recentLawsData } = useQuery({
    queryKey: ['ticker', 'laws'],
    queryFn: () => apiClient.get('/laws?size=4&sort=createdAt,desc'),
    staleTime: 30 * 60 * 1000,
  });
  const { data: recentJudgmentsData } = useQuery({
    queryKey: ['ticker', 'judgments'],
    queryFn: () => apiClient.get('/judgments?size=4&sort=createdAt,desc'),
    staleTime: 30 * 60 * 1000,
  });
  const { data: recentNoticesData } = useQuery({
    queryKey: ['ticker', 'notices'],
    queryFn: () => apiClient.get('/legal-notices?size=4&sort=createdAt,desc'),
    staleTime: 30 * 60 * 1000,
  });

  const tickerItems = useMemo(() => {
    const laws: Record<string, string>[] = recentLawsData?.data?.data?.content ?? [];
    const judgments: Record<string, string>[] = recentJudgmentsData?.data?.data?.content ?? [];
    const notices: Record<string, string>[] = recentNoticesData?.data?.data?.content ?? [];
    const items: { label: string; createdAt: string }[] = [];
    laws.forEach((d) => items.push({ label: `${d.type || "Law"}: ${d.title}`, createdAt: d.createdAt ?? "" }));
    judgments.forEach((d) => items.push({ label: `Judgment: ${d.caseName}`, createdAt: d.createdAt ?? "" }));
    notices.forEach((d) => items.push({ label: `Notice: ${d.title}`, createdAt: d.createdAt ?? "" }));
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return items.slice(0, 6).map((i) => i.label);
  }, [recentLawsData, recentJudgmentsData, recentNoticesData]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleLanguage = () => {
    const newLang = isArabic ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = (searchInputRef.current?.value || mobileSearchRef.current?.value || "").trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { name: t("nav.laws"), href: "/laws" },
    { name: t("nav.judgments"), href: "/judgments" },
    { name: t("nav.notices"), href: "/notices" },
    { name: t("nav.decrees"), href: "/decrees" },
    { name: t("nav.peace_agreements"), href: "/search?q=peace%20agreement" },
    { name: t("nav.guide"), href: "/resources" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm backdrop-blur">
      <div className="flag-stripe-bar" />

      {tickerItems.length > 0 && (
        <div className="hidden border-b border-border bg-secondary/70 text-xs text-muted-foreground lg:block">
          <div className="container mx-auto flex h-8 items-center gap-3 px-4">
            <span className="shrink-0 font-semibold text-primary">{t('header.ticker_latest')}</span>
            <div className="truncate">{tickerItems.join("  |  ")}</div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Scale className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Republic of South Sudan
              </p>
              <h1 className="truncate text-lg font-bold leading-tight text-foreground md:text-xl">
                South Sudan Law Archive
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Laws, judgments, notices and public legal records
              </p>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden w-full max-w-md items-center gap-2 lg:flex">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={t("header.search_placeholder")}
                className="h-10 rounded-md border-border bg-background ps-10"
              />
            </div>
            <Button type="submit" size="sm">{t("header.search")}</Button>
          </form>

          <div className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} aria-label="Toggle language" className="gap-1">
              <Languages className="h-4 w-4" />
              {isArabic ? "EN" : "AR"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleBandwidth} aria-label="Toggle bandwidth mode" title={lowBandwidth ? 'Low bandwidth mode on' : 'Low bandwidth mode off'}>
              {lowBandwidth ? <WifiOff className="h-4 w-4 text-amber-500" /> : <Wifi className="h-4 w-4" />}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="max-w-40">
                    <User className="h-4 w-4" />
                    <span className="truncate">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{user?.username}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile"><Settings className="me-2 h-4 w-4" /> {t('header.my_profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/library"><BookmarkCheck className="me-2 h-4 w-4" /> {t("header.my_library")}</Link>
                  </DropdownMenuItem>
                  {(isEditor() || isAdmin()) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard">
                          <LayoutDashboard className="me-2 h-4 w-4" />
                          {isAdmin() ? t("header.admin_dashboard") : t("header.dashboard")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="me-2 h-4 w-4" />
                    {t("header.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">{t("header.login")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">{t("header.register")}</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle language">
              <Languages className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleBandwidth} aria-label="Toggle bandwidth mode">
              {lowBandwidth ? <WifiOff className="h-4 w-4 text-amber-500" /> : <Wifi className="h-4 w-4" />}
            </Button>
            {!isAuthenticated && (
              <Button variant="outline" size="sm" className="h-9 px-3" asChild>
                <Link to="/login">{t("header.login")}</Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen((open) => !open)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <nav className={`${isMenuOpen ? "block" : "hidden"} border-t border-border py-3 md:block`}>
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-foreground hover:bg-secondary hover:text-primary"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            {/* Auth links — mobile only */}
            <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2 md:hidden">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary"
                  >
                    <User className="h-4 w-4" /> {t("header.my_profile")}
                  </Link>
                  <Link
                    to="/library"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary"
                  >
                    <BookmarkCheck className="h-4 w-4" /> {t("header.my_library")}
                  </Link>
                  {(isEditor() || isAdmin()) && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {isAdmin() ? t("header.admin_dashboard") : t("header.dashboard")}
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-start text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary"
                  >
                    <LogOut className="h-4 w-4" /> {t("header.logout")}
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-1 pt-1">
                  <Button variant="outline" className="flex-1 h-11" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>{t("header.login")}</Link>
                  </Button>
                  <Button className="flex-1 h-11" asChild>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>{t("header.register")}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <form onSubmit={handleSearch} className={`${isMenuOpen ? "block" : "hidden"} pb-4 lg:hidden`}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={mobileSearchRef}
                type="search"
                enterKeyHint="search"
                placeholder={t("header.search_placeholder")}
                className="h-10 rounded-md bg-background ps-10"
              />
            </div>
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
