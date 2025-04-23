import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Facebook, Instagram, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t py-4 px-6 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {t("footer.copyright", { year: currentYear })}
        </div>

        {/* Links */}
        <div className="mt-2 md:mt-0 flex items-center space-x-4">
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground p-0 h-auto"
          >
            {t("footer.privacyPolicy")}
          </Button>
          <Separator orientation="vertical" className="h-4 hidden md:block" />
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground p-0 h-auto"
          >
            {t("footer.termsOfService")}
          </Button>
          <Separator orientation="vertical" className="h-4 hidden md:block" />
          <Button
            variant="link"
            size="sm"
            className="text-muted-foreground p-0 h-auto"
          >
            {t("footer.contact")}
          </Button>
        </div>
      </div>

      {/* Social Media Icons */}
      <div className="flex justify-center mt-4 space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Github size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("footer.github")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Twitter size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("footer.twitter")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Facebook size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("footer.facebook")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Instagram size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("footer.instagram")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <HelpCircle size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("footer.helpSupport")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}
