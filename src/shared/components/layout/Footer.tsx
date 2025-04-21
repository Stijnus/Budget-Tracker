import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground">
          &copy; {currentYear} Budget Tracker. All rights reserved.
        </div>
        <div className="mt-2 md:mt-0 flex items-center space-x-4">
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground p-0 h-auto"
          >
            Privacy Policy
          </Button>
          <Separator orientation="vertical" className="h-4 hidden md:block" />
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground p-0 h-auto"
          >
            Terms of Service
          </Button>
          <Separator orientation="vertical" className="h-4 hidden md:block" />
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground p-0 h-auto"
          >
            Contact
          </Button>
        </div>
      </div>
    </footer>
  );
}
