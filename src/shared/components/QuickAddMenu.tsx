import { useState } from "react";
import { useLanguage } from "../../providers/LanguageProvider";
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
  const { t } = useLanguage();

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
            <p>{t("common.quickAdd")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("common.quickAdd")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleItemClick("/expenses?new=true")}
          className="cursor-pointer"
        >
          <ArrowDownCircle className="mr-2 h-4 w-4 text-red-500" />
          <span>{t("common.newExpense")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleItemClick("/income?new=true")}
          className="cursor-pointer"
        >
          <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" />
          <span>{t("common.newIncome")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleItemClick("/budgets?new=true")}
          className="cursor-pointer"
        >
          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
          <span>{t("common.newBudget")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleItemClick("/goals?new=true")}
          className="cursor-pointer"
        >
          <Target className="mr-2 h-4 w-4 text-purple-500" />
          <span>{t("common.newGoal")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleItemClick("/tags?new=true")}
          className="cursor-pointer"
        >
          <Tag className="mr-2 h-4 w-4 text-yellow-500" />
          <span>{t("common.newTag")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
