import { useState } from "react";
// Language provider import removed
import {
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Target,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

export function QuickAddMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  // Language hooks removed

  const handleItemClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <Plus size={18} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quick Add</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Add</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleItemClick("/expenses?new=true")}
          className="cursor-pointer"
        >
          <ArrowDownCircle className="mr-2 h-4 w-4 text-red-500" />
          <span>New Expense</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleItemClick("/income?new=true")}
          className="cursor-pointer"
        >
          <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" />
          <span>New Income</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleItemClick("/budgets?new=true")}
          className="cursor-pointer"
        >
          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
          <span>New Budget</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleItemClick("/goals?new=true")}
          className="cursor-pointer"
        >
          <Target className="mr-2 h-4 w-4 text-purple-500" />
          <span>New Goal</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleItemClick("/tags?new=true")}
          className="cursor-pointer"
        >
          <Tag className="mr-2 h-4 w-4 text-yellow-500" />
          <span>New Tag</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
