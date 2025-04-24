import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, PieChartIcon, AlertCircle } from "lucide-react";
import { AppLayout } from "../shared/components/layout";
import { CategoryForm } from "../features/categories/components";
import { getCategory } from "../api/supabase/categories";
import { Category } from "../api/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(!!categoryId);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're adding a category for a specific type
  const searchParams = new URLSearchParams(location.search);
  const defaultType =
    (searchParams.get("Type") as "expense" | "income" | "both") || undefined;

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

  // Render loading state
  const renderLoading = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  // Render error state
  const renderError = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

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
          <Card>
            <CardHeader>
              <CardTitle>
                {categoryId ? "Edit Category" : "Create New Category"}
              </CardTitle>
              <CardDescription>
                {categoryId
                  ? "Update your category details below"
                  : "Categories help you organize your transactions and track your spending patterns"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoading()
              ) : error ? (
                renderError()
              ) : (
                <CategoryForm
                  category={category || undefined}
                  onClose={handleClose}
                  onSuccess={handleSuccess}
                  defaultType={defaultType}
                  inPage={true}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
