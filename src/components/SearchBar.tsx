import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  showAdvanced?: boolean;
}

interface SearchFilters {
  category?: string;
  year?: string;
  court?: string;
  type?: string;
}

const SearchBar = ({ onSearch, placeholder = "Search...", showAdvanced = true }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = () => {
    onSearch?.(query, filters);
  };

  const addFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const filterLabel = `${key}: ${value}`;
    if (!activeFilters.includes(filterLabel)) {
      setActiveFilters([...activeFilters, filterLabel]);
    }
  };

  const removeFilter = (filterToRemove: string) => {
    const [key] = filterToRemove.split(": ");
    const newFilters = { ...filters };
    delete newFilters[key as keyof SearchFilters];
    setFilters(newFilters);
    setActiveFilters(activeFilters.filter(filter => filter !== filterToRemove));
  };

  const clearAllFilters = () => {
    setFilters({});
    setActiveFilters([]);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              Search
            </Button>
            {showAdvanced && (
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <Select onValueChange={(value) => addFilter("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criminal">Criminal Law</SelectItem>
                  <SelectItem value="civil">Civil Law</SelectItem>
                  <SelectItem value="commercial">Commercial Law</SelectItem>
                  <SelectItem value="constitutional">Constitutional Law</SelectItem>
                  <SelectItem value="family">Family Law</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => addFilter("year", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => addFilter("court", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supreme">Supreme Court</SelectItem>
                  <SelectItem value="appeal">Court of Appeal</SelectItem>
                  <SelectItem value="high">High Court</SelectItem>
                  <SelectItem value="county">County Courts</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => addFilter("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="judgment">Judgment</SelectItem>
                  <SelectItem value="ruling">Ruling</SelectItem>
                  <SelectItem value="order">Court Order</SelectItem>
                  <SelectItem value="notice">Legal Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchBar;