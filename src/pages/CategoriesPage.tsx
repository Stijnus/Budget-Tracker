// Categories page component
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../shared/components/layout";
import { CategoryList } from "../features/categories/components";
import { Category } from "../api/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  PieChartIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
} from "lucide-react";

export function CategoriesPage() {
  const navigate = useNavigate();

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    navigate(`/categories/${category.id}`);
  };

  // Handle add category
  const handleAddCategory = (type?: "expense" | "income" | "both") => {
    if (type) {
      navigate(`/categories/new?type=${type}`);
    } else {
      navigate("/categories/new");
    }
  };

  // No longer need form handlers as we're using page-based navigation

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Categories</h1>
          </div>
          <Button
            onClick={() => handleAddCategory()}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Category Management</CardTitle>
            <CardDescription>
              Manage your expense and income categories. Categories help you
              organize your transactions and track your spending patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="expense" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger
                  value="expense"
                  className="flex items-center gap-1"
                >
                  <ArrowDownCircle className="h-4 w-4 text-destructive" />
                  <span>Expense Categories</span>
                </TabsTrigger>
                <TabsTrigger value="income" className="flex items-center gap-1">
                  <ArrowUpCircle className="h-4 w-4 text-green-600" />
                  <span>Income Categories</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="expense">
                <CategoryList
                  onEdit={handleEditCategory}
                  onAdd={() => handleAddCategory("expense")}
                  type="expense"
                />
              </TabsContent>
              <TabsContent value="income">
                <CategoryList
                  onEdit={handleEditCategory}
                  onAdd={() => handleAddCategory("income")}
                  type="income"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Form is now handled in a separate page */}
      </div>
    </AppLayout>
  );
}
