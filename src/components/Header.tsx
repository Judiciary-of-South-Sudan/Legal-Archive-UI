import { Search, Menu, Scale, User, LogOut, Moon, Sun, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

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
    { name: "Judgments", href: "/judgments" },
    { name: "Laws of South Sudan", href: "/laws" },
    { name: "Legal Notices", href: "/notices" },
    { name: "Judicial Opinions", href: "/opinions" },
    { name: "Judiciary Directory", href: "/directory" },
    { name: "Citizen's Guide", href: "/resources" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Top Bar with News Ticker */}
      <div className="bg-primary text-primary-foreground py-1 overflow-hidden">
        <div className="news-ticker whitespace-nowrap text-sm">
          Latest: New Supreme Court judgment on constitutional law published • 
          South Sudan Gazette Issue 15/2024 now available • 
          Practice Direction on e-filing systems updated
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                South Sudan Law Reports
              </h1>
              <p className="text-xs text-muted-foreground">Official Legal Portal</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search laws, cases, judgments..."
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="default" size="sm">Search</Button>
          </form>

          {/* Dark mode toggle + Auth */}
          <div className="hidden md:flex items-center space-x-2">
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
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span className="text-sm text-muted-foreground">
                      {user?.email}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="text-sm">
                      Role: {user?.roles?.join(', ') || 'User'}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/library" className="cursor-pointer">
                      <BookmarkCheck className="mr-2 h-4 w-4" />
                      My Library
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user?.roles?.includes('ROLE_ADMIN') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="cursor-pointer">
                          <span className="mr-2">🎛️</span>
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
          {/* Mobile dark mode toggle */}
          <Button variant="ghost" size="sm" className="md:hidden mr-1" onClick={() => setDark(d => !d)} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block pb-4 md:pb-0`}>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 py-2 px-3 rounded-md hover:bg-secondary text-sm font-medium"
              >
                {item.name}
              </a>
            ))}
          </div>
        </nav>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={mobileSearchRef}
              placeholder="Search laws, cases, judgments..."
              className="pl-10"
            />
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
