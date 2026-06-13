import { useState } from "react";
import { ArrowRight, BookOpen, FileText, Gavel, Landmark, ScrollText, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const suffix = scope === "all" ? "" : `&type=${encodeURIComponent(scope)}`;
    navigate(`/search?q=${encodeURIComponent(trimmed)}${suffix}`);
  };

  const scopes = [
    { label: t("hero.scope_all"), value: "all" },
    { label: t("hero.scope_laws"), value: "laws" },
    { label: t("hero.scope_judgments"), value: "judgments" },
    { label: t("hero.scope_notices"), value: "notices" },
    { label: t("hero.scope_agreements"), value: "agreements" },
  ];

  const archiveEntrances = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t("hero.entrance_laws_title"),
      description: t("hero.entrance_laws_desc"),
      href: "/laws",
    },
    {
      icon: <Gavel className="h-5 w-5" />,
      title: t("hero.entrance_judgments_title"),
      description: t("hero.entrance_judgments_desc"),
      href: "/judgments",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: t("hero.entrance_notices_title"),
      description: t("hero.entrance_notices_desc"),
      href: "/notices",
    },
    {
      icon: <Landmark className="h-5 w-5" />,
      title: t("hero.entrance_agreements_title"),
      description: t("hero.entrance_agreements_desc"),
      href: "/search?q=peace%20agreement",
    },
    {
      icon: <ScrollText className="h-5 w-5" />,
      title: t("hero.entrance_decrees_title"),
      description: t("hero.entrance_decrees_desc"),
      href: "/decrees",
    },
  ];

  const featuredMaterials = [
    { label: "Transitional Constitution", href: "/laws/constitution" },
    { label: "R-ARCSS 2018", href: "/search?q=R-ARCSS%202018" },
    { label: "CPA 2005", href: "/search?q=CPA%202005" },
    { label: "Core Acts", href: "/laws/acts" },
  ];

  const quickSearchTerms = [
    { label: t("hero.qs_constitution"), value: "constitution" },
    { label: t("hero.qs_land_rights"), value: "land rights" },
    { label: t("hero.qs_criminal_code"), value: "criminal code" },
    { label: t("hero.qs_investment"), value: "investment" },
  ];

  return (
    <section className="archive-shell border-b border-border">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="archive-section-label">{t("hero.national_repository")}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">{t("hero.public_access")}</span>
            </div>

            <h2 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-foreground md:text-5xl">
              {t("hero.main_title")}
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              {t("hero.main_desc")}
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-4xl rounded-md border border-border bg-card p-3 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("hero.search_placeholder")}
                    className="h-12 rounded-md border-border bg-background ps-12 text-base"
                    type="search"
                    enterKeyHint="search"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-6">
                  {t("hero.search_btn")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {scopes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setScope(item.value)}
                    className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                      scope === item.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{t("hero.quick_searches")}</span>
              {quickSearchTerms.map((term) => (
                <button
                  key={term.value}
                  type="button"
                  className="rounded-sm px-2 py-2 text-primary underline-offset-4 hover:underline"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(term.value)}`)}
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>

          <aside className="archive-card rounded-md p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-green-50 p-2 text-green-700 dark:bg-green-950 dark:text-green-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("hero.trust_title")}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t("hero.trust_desc")}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("hero.trust_row1_label")}</span>
                <span className="font-medium text-foreground">{t("hero.trust_row1_value")}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("hero.trust_row2_label")}</span>
                <span className="font-medium text-foreground">{t("hero.trust_row2_value")}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{t("hero.trust_row3_label")}</span>
                <span className="font-medium text-foreground">{t("hero.trust_row3_value")}</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {archiveEntrances.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="archive-card group rounded-md p-5 transition-colors hover:border-primary"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                {link.icon}
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary">{link.title}</h3>
              <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">{link.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {t("hero.open_section")} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center">
          <span className="archive-section-label shrink-0">{t("hero.featured_materials")}</span>
          <div className="flex flex-wrap gap-2">
            {featuredMaterials.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
