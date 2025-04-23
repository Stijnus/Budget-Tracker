import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useBankAccounts } from "@/features/bankAccounts/hooks/useBankAccounts";

export type TransactionType = "EXPENSE" | "INCOME" | "TRANSFER" | "all";

interface Category {
  id: string;
  name: string;
}

interface BankAccount {
  id: string;
  name: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  bankAccountId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface TransactionFiltersProps extends TransactionFilters {
  onChange?: (filters: TransactionFilters) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  type,
  categoryId,
  bankAccountId,
  startDate,
  endDate,
  minAmount,
  maxAmount,
  searchQuery,
  onChange,
}) => {
  const { data: categories } = useCategories();
  const { data: bankAccounts } = useBankAccounts();

  const handleTypeChange = (value: string) => {
    if (onChange) {
      onChange({
        type: value as TransactionType,
        categoryId,
        bankAccountId,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        searchQuery,
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    if (onChange) {
      onChange({
        type,
        categoryId: value === "all" ? undefined : value,
        bankAccountId,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        searchQuery,
      });
    }
  };

  const handleBankAccountChange = (value: string) => {
    if (onChange) {
      onChange({
        type,
        categoryId,
        bankAccountId: value === "all" ? undefined : value,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        searchQuery,
      });
    }
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (onChange) {
      onChange({
        type,
        categoryId,
        bankAccountId,
        startDate: field === "startDate" ? e.target.value : startDate,
        endDate: field === "endDate" ? e.target.value : endDate,
        minAmount,
        maxAmount,
        searchQuery,
      });
    }
  };

  const handleAmountChange = (
    field: "minAmount" | "maxAmount",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    if (onChange) {
      onChange({
        type,
        categoryId,
        bankAccountId,
        startDate,
        endDate,
        minAmount: field === "minAmount" ? value : minAmount,
        maxAmount: field === "maxAmount" ? value : maxAmount,
        searchQuery,
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange({
        type,
        categoryId,
        bankAccountId,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        searchQuery: e.target.value,
      });
    }
  };

  const clearFilters = () => {
    if (onChange) {
      onChange({});
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 lg:flex">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Apply filters to your transactions
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs">Type</Label>
            <Select value={type || "all"} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Category</Label>
            <Select
              value={categoryId || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Account</Label>
            <Select
              value={bankAccountId || "all"}
              onValueChange={handleBankAccountChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {bankAccounts?.map((account: BankAccount) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Date</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDate || ""}
                onChange={(e) => handleDateChange("startDate", e)}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={endDate || ""}
                onChange={(e) => handleDateChange("endDate", e)}
                placeholder="End date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Amount</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={minAmount || ""}
                onChange={(e) => handleAmountChange("minAmount", e)}
                placeholder="Min amount"
              />
              <Input
                type="number"
                value={maxAmount || ""}
                onChange={(e) => handleAmountChange("maxAmount", e)}
                placeholder="Max amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery || ""}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
          </div>

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
      </SheetContent>
    </Sheet>
  );
};
