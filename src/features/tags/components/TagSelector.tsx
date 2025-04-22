import { useState, useEffect } from "react";
import { 
  getTags, 
  getTagsForTransaction,
  addTagToTransaction,
  removeTagFromTransaction,
  Tag 
} from "../../../api/supabase/tags";
import { TagModal } from "./TagModal";
import { Plus, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  const [isOpen, setIsOpen] = useState(false);

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
      <Popover open={isOpen && !readOnly} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between h-auto min-h-10 py-2",
              readOnly && "cursor-default hover:bg-background"
            )}
            onClick={() => !readOnly && setIsOpen(!isOpen)}
          >
            <div className="flex flex-wrap gap-1 mr-2">
              {selectedTags.length === 0 ? (
                <span className="text-muted-foreground">
                  {readOnly ? "No tags" : "Select tags..."}
                </span>
              ) : (
                selectedTags.map(tag => (
                  <Badge 
                    key={tag.id}
                    variant="outline"
                    className="flex items-center gap-1 px-2 py-1"
                    style={{ backgroundColor: `${tag.color}20` }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <span>{tag.name}</span>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagSelect(tag.id);
                        }}
                      >
                        <X size={10} />
                      </Button>
                    )}
                  </Badge>
                ))
              )}
            </div>
            {!readOnly && <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          {isLoading ? (
            <div className="p-2 text-center text-muted-foreground">Loading tags...</div>
          ) : error ? (
            <div className="p-2 text-center text-destructive">{error}</div>
          ) : (
            <>
              <div className="max-h-60 overflow-y-auto">
                {tags.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">No tags found</div>
                ) : (
                  <div className="py-1">
                    {tags.map(tag => (
                      <Button
                        key={tag.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start px-3 py-2 text-left font-normal",
                          selectedTagIds.includes(tag.id) && "bg-accent"
                        )}
                        onClick={() => handleTagSelect(tag.id)}
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span>{tag.name}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-primary"
                onClick={() => {
                  setIsModalOpen(true);
                  setIsOpen(false);
                }}
              >
                <Plus size={14} className="mr-2" />
                Create new tag
              </Button>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* Tag Creation Modal */}
      <TagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTagSuccess}
      />
    </div>
  );
}
