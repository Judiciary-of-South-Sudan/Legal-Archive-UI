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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const { isAuthenticated, user, logout, isAdmin, isEditor } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    Promise.allSettled([
      apiClient.get("/laws?size=4&sort=createdAt,desc"),
      apiClient.get("/judgments?size=4&sort=createdAt,desc"),
      apiClient.get("/legal-notices?size=4&sort=createdAt,desc"),
    ]).then(([lawsRes, judgmentsRes, noticesRes]) => {
      const items: { label: string; createdAt: string }[] = [];
      const laws = lawsRes.status === "fulfilled" ? (lawsRes.value.data?.data?.content ?? []) : [];
      const judgments = judgmentsRes.status === "fulfilled" ? (judgmentsRes.value.data?.data?.content ?? []) : [];
      const notices = noticesRes.status === "fulfilled" ? (noticesRes.value.data?.data?.content ?? []) : [];

      laws.forEach((d: Record<string, string>) => items.push({ label: `${d.type || "Law"}: ${d.title}`, createdAt: d.createdAt ?? "" }));
      judgments.forEach((d: Record<string, string>) => items.push({ label: `Judgment: ${d.caseName}`, createdAt: d.createdAt ?? "" }));
      notices.forEach((d: Record<string, string>) => items.push({ label: `Notice: ${d.title}`, createdAt: d.createdAt ?? "" }));

      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const labels = items.slice(0, 6).map((i) => i.label);
      if (labels.length > 0) setTickerItems(labels);
    });
  }, []);

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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={t("header.search_placeholder")}
                className="h-10 rounded-md border-border bg-background pl-10"
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
                    <Link to="/profile"><Settings className="mr-2 h-4 w-4" /> {t('header.my_profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/library"><BookmarkCheck className="mr-2 h-4 w-4" /> {t("header.my_library")}</Link>
                  </DropdownMenuItem>
                  {(isEditor() || isAdmin()) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          {isAdmin() ? t("header.admin_dashboard") : t("header.dashboard")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
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
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-foreground hover:bg-secondary hover:text-primary"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>

        <form onSubmit={handleSearch} className={`${isMenuOpen ? "block" : "hidden"} pb-4 lg:hidden`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={mobileSearchRef}
              placeholder={t("header.search_placeholder")}
              className="h-10 rounded-md bg-background pl-10"
            />
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
