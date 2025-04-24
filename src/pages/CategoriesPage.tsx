// Categories page component
import { useState } from "react";
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

import { PieChartIcon, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { CategorySidebarModal } from "../features/categories/components/CategoryForm";

export function CategoriesPage() {
  // --- Sidebar state for add/edit ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [defaultType, setDefaultType] = useState<"expense" | "income" | "both">("expense");

  // Open sidebar for add
  const openAddSidebar = (type?: "expense" | "income" | "both") => {
    setSelectedCategory(null);
    setDefaultType(type || "expense");
    setIsSidebarOpen(true);
  };

  // Open sidebar for edit
  const openEditSidebar = (category: Category) => {
    setSelectedCategory(category);
    setIsSidebarOpen(true);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Categories</h1>
          </div>

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
                  onEdit={openEditSidebar}
                  onAdd={() => openAddSidebar("expense")}
                  type="expense"
                />
              </TabsContent>
              <TabsContent value="income">
                <CategoryList
                  onEdit={openEditSidebar}
                  onAdd={() => openAddSidebar("income")}
                  type="income"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Sidebar for Add/Edit Category */}
        <CategorySidebarModal
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSuccess={() => {
            setIsSidebarOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory ?? undefined}
          defaultType={defaultType}
        />
      </div>
    </AppLayout>
  );
}
