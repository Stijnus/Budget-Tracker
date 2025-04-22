import { useState, useEffect } from "react";
import { getCategories } from "../../../api/supabase/categories";
import { useAuth } from "../../../state/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  type: string;
}

export interface TransactionFilters {
  type?: "expense" | "income" | "all";
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
}

export function TransactionFilters({
  filters,
  onFilterChange,
}: TransactionFiltersProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      if (!user) return;

      try {
        const { data, error } = await getCategories();
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }

    fetchCategories();
  }, [user]);

  // Handle filter changes
  const handleTypeChange = (type: "expense" | "income" | "all") => {
    onFilterChange({ ...filters, type });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      categoryId: value === "all" ? undefined : value,
    });
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFilterChange({ ...filters, [field]: e.target.value || undefined });
  };

  const handleAmountChange = (
    field: "minAmount" | "maxAmount",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({ ...filters, [field]: value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value || undefined });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Expand</span>
              </>
            )}
          </Button>
        </div>

        {/* Basic filters (always visible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Transaction Type */}
          <div>
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={() => handleTypeChange("all")}
                variant={
                  filters.type === "all" || !filters.type
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="flex-1"
              >
                All
              </Button>
              <Button
                type="button"
                onClick={() => handleTypeChange("expense")}
                variant={filters.type === "expense" ? "default" : "outline"}
                size="sm"
                className={`flex-1 ${
                  filters.type === "expense"
                    ? "bg-destructive hover:bg-destructive/90"
                    : ""
                }`}
              >
                Expenses
              </Button>
              <Button
                type="button"
                onClick={() => handleTypeChange("income")}
                variant={filters.type === "income" ? "default" : "outline"}
                size="sm"
                className={`flex-1 ${
                  filters.type === "income"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }`}
              >
                Income
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={filters.searchQuery || ""}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {/* Advanced filters (expandable) */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs">
                Category
              </Label>
              <Select
                value={filters.categoryId || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs">
                From Date
              </Label>
              <Input
                type="date"
                id="startDate"
                value={filters.startDate || ""}
                onChange={(e) => handleDateChange("startDate", e)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs">
                To Date
              </Label>
              <Input
                type="date"
                id="endDate"
                value={filters.endDate || ""}
                onChange={(e) => handleDateChange("endDate", e)}
              />
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label htmlFor="minAmount" className="text-xs">
                Min Amount
              </Label>
              <Input
                type="number"
                id="minAmount"
                value={filters.minAmount || ""}
                onChange={(e) => handleAmountChange("minAmount", e)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount" className="text-xs">
                Max Amount
              </Label>
              <Input
                type="number"
                id="maxAmount"
                value={filters.maxAmount || ""}
                onChange={(e) => handleAmountChange("maxAmount", e)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                type="button"
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
