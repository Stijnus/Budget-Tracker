import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { getCategories, deleteCategory, Category } from '../../../api/supabase';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  onEdit: (category: Category) => void;
  onAdd: () => void;
}

export function CategoryList({ onEdit, onAdd }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
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
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
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

  // Get category type badge
  const getCategoryTypeBadge = (type: string) => {
    switch (type) {
      case 'expense':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Expense</Badge>;
      case 'income':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Income</Badge>;
      case 'both':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Both</Badge>;
      default:
        return null;
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Categories</CardTitle>
          <Button onClick={onAdd} size="sm">
            <Plus size={16} className="mr-1" /> Add Category
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Categories</CardTitle>
          <Button onClick={onAdd} size="sm">
            <Plus size={16} className="mr-1" /> Add Category
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={loadCategories}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Categories</CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus size={16} className="mr-1" /> Add Category
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {categories.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No categories found. Click "Add Category" to create your first category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div className="font-medium">{category.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryTypeBadge(category.type)}
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground text-sm">{category.color}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => onEdit(category)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(category.id)}
                        disabled={deleteInProgress === category.id || category.is_default}
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 text-destructive hover:text-destructive/90 ${
                          category.is_default ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title={category.is_default ? 'Default categories cannot be deleted' : 'Delete category'}
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
    </Card>
  );
}
