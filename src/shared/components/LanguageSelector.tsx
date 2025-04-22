import { Globe } from "lucide-react";
import { useLanguage, LANGUAGES } from "../../providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LanguageSelector() {
  const { language, changeLanguage, t } = useLanguage();

  // Convert LANGUAGES object to array for easier mapping
  const languageOptions = Object.entries(LANGUAGES).map(([code, details]) => ({
    code,
    name: code.toUpperCase(),
    flag: details.flag,
    nativeName: details.nativeName,
  }));

  // We don't need to find the current language here as we're using it directly in the map function

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <Globe size={18} />
                <span className="sr-only">{t("settings.language")}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("settings.language")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end">
        {languageOptions.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer ${
              lang.code === language ? "bg-accent" : ""
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
