import { useState, useEffect } from "react";
import {
  AlertCircle,
  Tag,
  ArrowUpDown,
  Palette,
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
  Check,
} from "lucide-react";
import { useAuth } from "../../../state/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import {
  createCategory,
  updateCategory,
  Category,
  CategoryInsert,
} from "../../../api/supabase";
// Import directly from the file path to avoid TypeScript issues
import { CategoryColorPicker } from "../../../features/categories/components/CategoryColorPicker";

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: "expense" | "income" | "both";
  inPage?: boolean;
}

// Sidebar modal for Add/Edit Category
export function CategorySidebarModal({ isOpen, onClose, category, onSuccess, defaultType }: Omit<CategoryFormProps, 'inPage'> & { isOpen: boolean }) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>
            {category ? 'Edit Category' : 'Add Category'}
          </SheetTitle>
          <SheetClose className="absolute top-4 right-4" />
        </SheetHeader>
        <div className="px-6 pb-6">
          <CategoryForm
            category={category}
            onClose={onClose}
            onSuccess={onSuccess}
            defaultType={defaultType}
            inPage={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Icon map for the icon picker
const ICON_MAP: Record<
  string,
  React.ReactNode & { iconNode?: React.ReactNode }
> = {
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

export function CategoryForm({
  category,
  onClose,
  onSuccess,
  defaultType,
  inPage = false,
}: CategoryFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income" | "both">(
    defaultType || "expense"
  );
  const [color, setColor] = useState("#3B82F6"); // Default blue color
  const [icon, setIcon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type as "expense" | "income" | "both");
      setColor(category.color);
      setIcon(category.icon || "");
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate form
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (category) {
        // Update existing category
        const { error } = await updateCategory(category.id, {
          name,
          type,
          color,
          icon: icon || null,
        });

        if (error) throw error;
      } else {
        // Create new category
        const newCategory: CategoryInsert = {
          user_id: user.id,
          name,
          type,
          color,
          icon: icon || null,
          is_default: false,
        };

        const { error } = await createCategory(newCategory);
        if (error) throw error;
      }

      // Call success callback
      onSuccess();

      // Close the form
      onClose();
    } catch (err) {
      console.error("Error saving category:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save category. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render the form content
  const formContent = (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-1">
            <Tag size={14} />
            <span>Category Name</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Groceries, Rent, Salary"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="flex items-center gap-1">
            <ArrowUpDown size={14} />
            <span>Category Type</span>
          </Label>
          <Select
            value={type}
            onValueChange={(value) =>
              setType(value as "expense" | "income" | "both")
            }
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Palette size={14} />
            <span>Category Color</span>
          </Label>
          <CategoryColorPicker color={color} onChange={setColor} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon" className="flex items-center gap-1">
            <Tag size={14} />
            <span>Icon</span>
          </Label>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(ICON_MAP).map(([iconName, iconComponent]) => (
                <Button
                  key={iconName}
                  type="button"
                  variant={icon === iconName ? "default" : "outline"}
                  className="h-12 w-12 p-0 relative"
                  onClick={() => setIcon(iconName)}
                >
                  <div className="flex items-center justify-center">
                    {iconComponent}
                  </div>
                  {icon === iconName && (
                    <div className="absolute bottom-0 right-0 bg-primary rounded-full p-0.5">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-center border rounded-md bg-muted/20 h-16 w-full">
              {icon && ICON_MAP[icon] ? (
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="text-primary">{ICON_MAP[icon]}</div>
                  <span className="text-xs text-muted-foreground">{icon}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Icon Preview
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Select an icon that represents this category.
          </p>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : category
              ? "Update Category"
              : "Add Category"}
          </Button>
        </div>
      </form>
    </>
  );

  // Render as a dialog or as a page content
  return inPage ? (
    <div>{formContent}</div>
  ) : (
    formContent
  );
}
