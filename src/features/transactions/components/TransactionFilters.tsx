import { useState, useEffect } from "react";
import { getCategories } from "../../../api/supabase/categories";
import { useAuth } from "../../../state/useAuth";

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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, categoryId: e.target.value || undefined });
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
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Basic filters (always visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Transaction Type */}
        <div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleTypeChange("all")}
              className={`flex-1 py-2 px-3 text-xs rounded-md ${
                filters.type === "all" || !filters.type
                  ? "bg-gray-200 text-gray-800 font-medium"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex-1 py-2 px-3 text-xs rounded-md ${
                filters.type === "expense"
                  ? "bg-red-100 text-red-700 font-medium"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex-1 py-2 px-3 text-xs rounded-md ${
                filters.type === "income"
                  ? "bg-green-100 text-green-700 font-medium"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.searchQuery || ""}
            onChange={handleSearchChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Advanced filters (expandable) */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={filters.categoryId || ""}
              onChange={handleCategoryChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              From Date
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate || ""}
              onChange={(e) => handleDateChange("startDate", e)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              To Date
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate || ""}
              onChange={(e) => handleDateChange("endDate", e)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
            />
          </div>

          {/* Amount Range */}
          <div>
            <label
              htmlFor="minAmount"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Min Amount
            </label>
            <input
              type="number"
              id="minAmount"
              value={filters.minAmount || ""}
              onChange={(e) => handleAmountChange("minAmount", e)}
              min="0"
              step="0.01"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
            />
          </div>

          <div>
            <label
              htmlFor="maxAmount"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Max Amount
            </label>
            <input
              type="number"
              id="maxAmount"
              value={filters.maxAmount || ""}
              onChange={(e) => handleAmountChange("maxAmount", e)}
              min="0"
              step="0.01"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
