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

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Category Management
            </CardTitle>
            <CardDescription>
              Manage your expense and income categories. Categories help you
              organize your transactions and track your spending patterns.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="expense" className="w-full">
              <div className="border-b mb-6">
                <TabsList className="mb-0 w-full justify-start">
                  <TabsTrigger
                    value="expense"
                    className="flex items-center gap-1 px-4 py-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                  >
                    <ArrowDownCircle className="h-4 w-4 text-destructive" />
                    <span>Expense Categories</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="income"
                    className="flex items-center gap-1 px-4 py-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                  >
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    <span>Income Categories</span>
                  </TabsTrigger>
                </TabsList>
              </div>
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
