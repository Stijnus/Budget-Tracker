import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, PieChartIcon } from "lucide-react";
import { AppLayout } from "../shared/components/layout";
import { CategoryForm } from "../features/categories/components";
import { getCategory } from "../api/supabase/categories";
import { Category } from "../api/supabase";
import { Button } from "@/components/ui/button";

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(!!categoryId);
  const [error, setError] = useState<string | null>(null);
  
  // Determine if we're adding a category for a specific type
  const searchParams = new URLSearchParams(location.search);
  const defaultType = searchParams.get("type") as "expense" | "income" | "both" || undefined;

  // Fetch category if editing
  useEffect(() => {
    async function fetchCategory() {
      if (!categoryId) return;

      try {
        setIsLoading(true);
        const { data, error } = await getCategory(categoryId);
        
        if (error) throw error;
        if (!data) throw new Error("Category not found");
        
        setCategory(data);
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategory();
  }, [categoryId]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate("/categories");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-4 text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="mr-2"
          >
            <ChevronLeft size={20} />
          </Button>
          <PieChartIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">
            {categoryId ? "Edit Category" : "Add Category"}
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <CategoryForm
            category={category || undefined}
            onClose={handleClose}
            onSuccess={handleSuccess}
            defaultType={defaultType}
            inPage={true}
          />
        </div>
      </div>
    </AppLayout>
  );
}
