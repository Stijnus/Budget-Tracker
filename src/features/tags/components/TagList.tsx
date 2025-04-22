import { useState, useEffect } from "react";
import { 
  getTags, 
  deleteTag,
  Tag 
} from "../../../api/supabase/tags";
import { TagModal } from "./TagModal";
import { Edit, Trash2, Plus, Tag as TagIcon, Loader2, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface TagListProps {
  showAddButton?: boolean;
  onTagSelect?: (tag: Tag) => void;
  selectedTags?: string[];
  className?: string;
}

export function TagList({ 
  showAddButton = false,
  onTagSelect,
  selectedTags = [],
  className = "" 
}: TagListProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch tags
  useEffect(() => {
    async function fetchTags() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await getTags();
        
        if (error) {
          throw error;
        }
        
        setTags(data || []);
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError("Failed to load tags");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTags();
  }, []);

  // Filter tags based on search query
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle opening the add/edit modal
  const handleAddTag = () => {
    setSelectedTag(undefined);
    setIsModalOpen(true);
  };

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  // Handle tag deletion
  const handleDeleteClick = (id: string) => {
    setTagToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    try {
      const { error } = await deleteTag(tagToDelete);
      if (error) throw error;

      // Remove from local state
      setTags(tags.filter(t => t.id !== tagToDelete));
      setIsDeleteConfirmOpen(false);
      setTagToDelete(null);
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError('Failed to delete tag');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    setTagToDelete(null);
  };

  // Handle tag refresh after add/edit
  const handleTagSuccess = () => {
    // Refetch tags
    async function fetchTags() {
      try {
        const { data, error } = await getTags();
        if (error) throw error;
        setTags(data || []);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    }

    fetchTags();
  };

  // Handle tag selection
  const handleTagClick = (tag: Tag) => {
    if (onTagSelect) {
      onTagSelect(tag);
    }
  };

  if (isLoading && tags.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Tags</CardTitle>
          {showAddButton && (
            <Button onClick={handleAddTag} size="sm">
              <Plus size={16} className="mr-1" /> Add Tag
            </Button>
          )}
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
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Tags</CardTitle>
          {showAddButton && (
            <Button onClick={handleAddTag} size="sm">
              <Plus size={16} className="mr-1" /> Add Tag
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={handleTagSuccess}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Tags</CardTitle>
        {showAddButton && (
          <Button onClick={handleAddTag} size="sm">
            <Plus size={16} className="mr-1" /> Add Tag
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {/* Search */}
        <div className="mb-4 relative">
          <Input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Tags List */}
        {filteredTags.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            {searchQuery ? (
              <>No tags found matching "{searchQuery}"</>
            ) : (
              <>
                No tags found. {showAddButton && (
                  <Button 
                    onClick={handleAddTag}
                    variant="link"
                    className="px-1 py-0 h-auto"
                  >
                    Create your first tag
                  </Button>
                )} to organize your transactions!
              </>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredTags.map((tag) => (
              <li 
                key={tag.id} 
                className={`p-4 hover:bg-muted/50 rounded-md flex items-center justify-between ${
                  onTagSelect ? 'cursor-pointer' : ''
                } ${
                  selectedTags.includes(tag.id) ? 'bg-accent' : ''
                }`}
                onClick={onTagSelect ? () => handleTagClick(tag) : undefined}
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <span className="font-medium">{tag.name}</span>
                </div>
                
                {!onTagSelect && (
                  <div className="flex space-x-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTag(tag);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(tag.id);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        
        {/* Tag Modal */}
        <TagModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tag={selectedTag}
          onSuccess={handleTagSuccess}
        />

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={(open) => !open && handleDeleteCancel()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this tag? This action cannot be undone.
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
