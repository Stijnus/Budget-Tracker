import { Moon, Sun } from "lucide-react";
import { useLanguage } from "../../providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "../../providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hidden md:flex"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t("settings.theme")}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("settings.theme")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
