import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { getCategories, deleteCategory, Category } from '../../../api/supabase';

interface CategoryListProps {
  onEdit: (category: Category) => void;
  onAdd: () => void;
}

export function CategoryList({ onEdit, onAdd }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  // Load categories
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await getCategories();
      
      if (error) {
        throw error;
      }
      
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Handle category deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      setDeleteInProgress(id);
      
      try {
        const { error } = await deleteCategory(id);
        
        if (error) {
          throw error;
        }
        
        // Reload categories after deletion
        await loadCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category. Please try again.');
      } finally {
        setDeleteInProgress(null);
      }
    }
  };

  // Get category type badge
  const getCategoryTypeBadge = (type: string) => {
    switch (type) {
      case 'expense':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Expense</span>;
      case 'income':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Income</span>;
      case 'both':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Both</span>;
      default:
        return null;
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
          <button
            onClick={onAdd}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            <Plus size={16} className="mr-1" /> Add Category
          </button>
        </div>
        <div className="py-8 text-center text-gray-500">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
          <button
            onClick={onAdd}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            <Plus size={16} className="mr-1" /> Add Category
          </button>
        </div>
        <div className="p-4 bg-red-50 text-red-600 rounded-md mb-4">{error}</div>
        <button
          onClick={loadCategories}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
        <button
          onClick={onAdd}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          <Plus size={16} className="mr-1" /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No categories found. Click "Add Category" to create your first category.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryTypeBadge(category.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.color}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(category)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={deleteInProgress === category.id || category.is_default}
                      className={`text-red-600 hover:text-red-900 ${
                        category.is_default ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={category.is_default ? 'Default categories cannot be deleted' : 'Delete category'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
