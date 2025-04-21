import { useState, useEffect } from "react";
import { 
  getTags, 
  getTagsForTransaction,
  addTagToTransaction,
  removeTagFromTransaction,
  Tag 
} from "../../../api/supabase/tags";
import { TagModal } from "./TagModal";
import { Plus, X } from "lucide-react";

interface TagSelectorProps {
  transactionId?: string;
  onTagsChange?: (tagIds: string[]) => void;
  selectedTagIds?: string[];
  readOnly?: boolean;
}

export function TagSelector({ 
  transactionId,
  onTagsChange,
  selectedTagIds: externalSelectedTagIds,
  readOnly = false
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(externalSelectedTagIds || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch all available tags
  useEffect(() => {
    async function fetchTags() {
      try {
        setIsLoading(true);
        
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

  // Fetch tags for this transaction if transactionId is provided
  useEffect(() => {
    if (!transactionId) return;

    async function fetchTransactionTags() {
      try {
        setIsLoading(true);
        
        const { data, error } = await getTagsForTransaction(transactionId);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const tagIds = data.map(item => item.tag_id);
          setSelectedTagIds(tagIds);
          
          // Call the onTagsChange callback if provided
          if (onTagsChange) {
            onTagsChange(tagIds);
          }
        }
      } catch (err) {
        console.error("Error fetching transaction tags:", err);
        setError("Failed to load transaction tags");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactionTags();
  }, [transactionId, onTagsChange]);

  // Update selected tags when external selectedTagIds changes
  useEffect(() => {
    if (externalSelectedTagIds) {
      setSelectedTagIds(externalSelectedTagIds);
    }
  }, [externalSelectedTagIds]);

  // Handle tag selection
  const handleTagSelect = async (tagId: string) => {
    if (readOnly) return;
    
    try {
      let newSelectedTagIds;
      
      if (selectedTagIds.includes(tagId)) {
        // Remove tag
        newSelectedTagIds = selectedTagIds.filter(id => id !== tagId);
        
        if (transactionId) {
          const { error } = await removeTagFromTransaction(transactionId, tagId);
          if (error) throw error;
        }
      } else {
        // Add tag
        newSelectedTagIds = [...selectedTagIds, tagId];
        
        if (transactionId) {
          const { error } = await addTagToTransaction(transactionId, tagId);
          if (error) throw error;
        }
      }
      
      setSelectedTagIds(newSelectedTagIds);
      
      // Call the onTagsChange callback if provided
      if (onTagsChange) {
        onTagsChange(newSelectedTagIds);
      }
      
      // Close dropdown after selection
      setIsDropdownOpen(false);
    } catch (err) {
      console.error("Error updating tags:", err);
      setError("Failed to update tags");
    }
  };

  // Handle tag creation success
  const handleTagSuccess = async () => {
    // Refetch tags
    try {
      const { data, error } = await getTags();
      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  // Get selected tags objects
  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  return (
    <div className="relative">
      {/* Selected Tags Display */}
      <div 
        className="min-h-[38px] p-1.5 border border-gray-300 rounded-md flex flex-wrap gap-1 cursor-pointer"
        onClick={() => !readOnly && setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedTags.length === 0 ? (
          <span className="text-gray-500 text-sm px-1.5">
            {readOnly ? "No tags" : "Select tags..."}
          </span>
        ) : (
          <>
            {selectedTags.map(tag => (
              <div 
                key={tag.id}
                className="inline-flex items-center bg-gray-100 rounded-md px-2 py-1"
              >
                <div 
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: tag.color }}
                ></div>
                <span className="text-xs font-medium text-gray-700">{tag.name}</span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTagSelect(tag.id);
                    }}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Dropdown for selecting tags */}
      {isDropdownOpen && !readOnly && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-gray-500">Loading tags...</div>
          ) : error ? (
            <div className="p-2 text-center text-red-500">{error}</div>
          ) : (
            <>
              <ul className="py-1">
                {tags.map(tag => (
                  <li 
                    key={tag.id}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                      selectedTagIds.includes(tag.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleTagSelect(tag.id)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <span className="text-sm">{tag.name}</span>
                  </li>
                ))}
              </ul>
              
              {/* Create new tag button */}
              <div className="border-t border-gray-200 p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="w-full text-left text-sm text-blue-600 hover:text-blue-800 flex items-center px-2 py-1"
                >
                  <Plus size={14} className="mr-1" />
                  Create new tag
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tag Creation Modal */}
      <TagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTagSuccess}
      />
    </div>
  );
}
