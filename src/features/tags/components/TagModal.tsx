import { Tag } from "../../../api/supabase/tags";
import { TagForm } from "./TagForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: Tag;
  onSuccess: () => void;
}

export function TagModal({ isOpen, onClose, tag, onSuccess }: TagModalProps) {
  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>{tag ? 'Edit Tag' : 'Add Tag'}</SheetTitle>
          <SheetClose className="absolute top-4 right-4" />
        </SheetHeader>
        <div className="px-6 pb-6">
          <TagForm tag={tag} onClose={onClose} onSuccess={onSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
