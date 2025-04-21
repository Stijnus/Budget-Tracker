import { useState, useEffect } from "react";
import { 
  getTags, 
  deleteTag,
  Tag 
} from "../../../api/supabase/tags";
import { TagModal } from "./TagModal";
import { Edit, Trash2, Plus, Tag as TagIcon } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>;
  }

  return (
    <div className={`${className}`}>
      {/* Search and Add Button */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <TagIcon size={16} />
          </div>
        </div>
        
        {showAddButton && (
          <button
            onClick={handleAddTag}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Tag
          </button>
        )}
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTags.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery ? (
              <>No tags found matching "{searchQuery}"</>
            ) : (
              <>
                No tags found. {showAddButton && (
                  <button 
                    onClick={handleAddTag}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Create your first tag
                  </button>
                )} to organize your transactions!
              </>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTags.map((tag) => (
              <li 
                key={tag.id} 
                className={`p-4 hover:bg-gray-50 flex items-center justify-between ${
                  onTagSelect ? 'cursor-pointer' : ''
                } ${
                  selectedTags.includes(tag.id) ? 'bg-blue-50' : ''
                }`}
                onClick={onTagSelect ? () => handleTagClick(tag) : undefined}
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <span className="font-medium text-gray-700">{tag.name}</span>
                </div>
                
                {!onTagSelect && (
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTag(tag);
                      }}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(tag.id);
                      }}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tag Modal */}
      <TagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tag={selectedTag}
        onSuccess={handleTagSuccess}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this tag? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
