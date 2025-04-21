import { useState } from 'react';
import { AppLayout } from '../shared/components/layout';
import { CategoryList, CategoryForm } from '../features/categories/components';
import { Category } from '../api/supabase';

export function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Manage your expense and income categories. Categories help you organize your transactions and track your spending patterns.
          </p>
        </div>

        <CategoryList onEdit={handleEditCategory} onAdd={handleAddCategory} />

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
