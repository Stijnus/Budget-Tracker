import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { CategoryList, CategoryForm } from "../features/categories/components";
import { Category } from "../api/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChartIcon, TagsIcon } from "lucide-react";

export function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  // Handle add category
  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCategory(undefined);
  };

  // Handle form success
  const handleFormSuccess = () => {
    // The CategoryList component will reload the categories
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Categories</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Category Management</span>
            </CardTitle>
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
                  <TagsIcon className="h-4 w-4" />
                  <span>Expense Categories</span>
                </TabsTrigger>
                <TabsTrigger value="income" className="flex items-center gap-1">
                  <TagsIcon className="h-4 w-4" />
                  <span>Income Categories</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="expense">
                <CategoryList
                  onEdit={handleEditCategory}
                  onAdd={handleAddCategory}
                  type="expense"
                />
              </TabsContent>
              <TabsContent value="income">
                <CategoryList
                  onEdit={handleEditCategory}
                  onAdd={handleAddCategory}
                  type="income"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {isFormOpen && (
          <CategoryForm
            category={selectedCategory}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </AppLayout>
  );
}
