import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Palette,
  ArrowUpDown,
  Tag,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Coffee,
  CreditCard,
  Gift,
  Briefcase,
  Banknote,
  Building,
  Landmark,
  Wallet,
  Heart,
  Plane,
  Smartphone,
  Wifi,
  Droplet,
  Zap,
  Shirt,
  Scissors,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Music,
  Film,
  PiggyBank,
  BarChart,
  Percent,
  BadgeDollarSign,
  CircleDollarSign,
  DollarSign,
} from "lucide-react";
import { getCategories, deleteCategory, Category } from "../../../api/supabase";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CategoryListProps {
  type?: "expense" | "income" | "both";
  onAdd?: (() => void) | (() => Promise<void>);
  onEdit?: (category: Category) => void;
}

import { CategorySidebarModal } from "./CategoryForm";

export function CategoryList({ type = "expense", onAdd, onEdit }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Load categories
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await getCategories();

      // Filter categories by type if specified
      const filteredData = type
        ? data?.filter((cat) => cat.type === type || cat.type === "both")
        : data;

      if (error) {
        throw error;
      }

      setCategories(filteredData || []);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle delete click
  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setDeleteInProgress(categoryToDelete);

    try {
      const { error } = await deleteCategory(categoryToDelete);

      if (error) {
        throw error;
      }

      // Reload categories after deletion
      await loadCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category. Please try again.");
    } finally {
      setDeleteInProgress(null);
      setIsDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  };

  // Icon map for rendering category icons
  const ICON_MAP: Record<string, React.ReactNode> = {
    ShoppingBag: <ShoppingBag size={20} />,
    Home: <Home size={20} />,
    Car: <Car size={20} />,
    Utensils: <Utensils size={20} />,
    Coffee: <Coffee size={20} />,
    CreditCard: <CreditCard size={20} />,
    Gift: <Gift size={20} />,
    Briefcase: <Briefcase size={20} />,
    Banknote: <Banknote size={20} />,
    Building: <Building size={20} />,
    Landmark: <Landmark size={20} />,
    Wallet: <Wallet size={20} />,
    Heart: <Heart size={20} />,
    Plane: <Plane size={20} />,
    Smartphone: <Smartphone size={20} />,
    Wifi: <Wifi size={20} />,
    Droplet: <Droplet size={20} />,
    Zap: <Zap size={20} />,
    Shirt: <Shirt size={20} />,
    Scissors: <Scissors size={20} />,
    Dumbbell: <Dumbbell size={20} />,
    BookOpen: <BookOpen size={20} />,
    Gamepad2: <Gamepad2 size={20} />,
    Music: <Music size={20} />,
    Film: <Film size={20} />,
    PiggyBank: <PiggyBank size={20} />,
    BarChart: <BarChart size={20} />,
    Percent: <Percent size={20} />,
    BadgeDollarSign: <BadgeDollarSign size={20} />,
    CircleDollarSign: <CircleDollarSign size={20} />,
    DollarSign: <DollarSign size={20} />,
  };

  // Render category icon
  const renderCategoryIcon = (category: Category) => {
    if (category.icon && ICON_MAP[category.icon]) {
      return (
        <div className="text-primary" style={{ color: category.color }}>
          {ICON_MAP[category.icon]}
        </div>
      );
    }
    return <Tag size={20} className="text-muted-foreground" />;
  };

  // Get category type badge
  const getCategoryTypeBadge = (type: string) => {
    switch (type) {
      case "expense":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Expense
          </Badge>
        );
      case "income":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Income
          </Badge>
        );
      case "both":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            Both
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="rounded-md border">
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={loadCategories}>
            Try Again
          </Button>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <CardContent className="pt-6">
        {categories.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No categories found. Click "Add Category" to create your first
            category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>Icon</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[30%]">
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>Name</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[15%]">
                    <div className="flex items-center gap-1">
                      <ArrowUpDown size={14} />
                      <span>Type</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[15%]">
                    <div className="flex items-center gap-1">
                      <Palette size={14} />
                      <span>Color</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right w-[15%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {renderCategoryIcon(category)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div className="font-medium">{category.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryTypeBadge(category.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-md"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-muted-foreground text-sm">
                          {category.color}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => {
                          if (onEdit) {
                            onEdit(category);
                          } else {
                            setSelectedCategory(category);
                            setIsSidebarOpen(true);
                          }
                        }}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(category.id)}
                        disabled={
                          deleteInProgress === category.id ||
                          category.is_default
                        }
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 text-destructive hover:text-destructive/90 ${
                          category.is_default
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title={
                          category.is_default
                            ? "Default categories cannot be deleted"
                            : "Delete category"
                        }
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Button
          variant="default"
          onClick={() => {
            if (onAdd) {
              onAdd();
            } else {
              setIsSidebarOpen(false);
              setTimeout(() => {
                setSelectedCategory(null);
                setIsSidebarOpen(true);
              }, 0);
            }
          }}
          className="mt-4"
        >
          Add Category
        </Button>
        <CategorySidebarModal
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSuccess={() => {
            setIsSidebarOpen(false);
            setSelectedCategory(null);
            loadCategories();
          }}
          category={selectedCategory ?? undefined}
          defaultType={type}
        />
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={(open) => !open && handleDeleteCancel()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this category? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </div>
  );
}
