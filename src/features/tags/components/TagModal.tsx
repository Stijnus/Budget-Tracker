import { Tag } from "../../../api/supabase/tags";
import { TagForm } from "./TagForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: Tag;
  onSuccess: () => void;
}

export function TagModal({ isOpen, onClose, tag, onSuccess }: TagModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <TagForm tag={tag} onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
