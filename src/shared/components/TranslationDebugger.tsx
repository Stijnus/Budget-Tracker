import { useState, useEffect } from "react";
import { useLanguage } from "../../providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bug, X } from "lucide-react";

/**
 * TranslationDebugger Component
 *
 * This component provides a debugging interface for translations.
 * It can highlight untranslated text and show translation keys.
 */
export function TranslationDebugger() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [highlightMissing, setHighlightMissing] = useState(false);
  const [missingCount, setMissingCount] = useState(0);

  // Apply debug styles when debug mode is enabled
  useEffect(() => {
    if (isDebugMode) {
      // Add debug styles to the document
      const style = document.createElement("style");
      style.id = "translation-debugger-styles";
      style.innerHTML = `
        ${
          showKeys
            ? `
          [data-i18n-key]:after {
            content: " [" attr(data-i18n-key) "]";
            font-size: 0.75em;
            color: #6366f1;
            background-color: #e0e7ff;
            padding: 0.125em 0.25em;
            border-radius: 0.25em;
            margin-left: 0.25em;
            white-space: nowrap;
          }
        `
            : ""
        }
        
        ${
          highlightMissing
            ? `
          [data-i18n-missing="true"] {
            background-color: #fee2e2;
            outline: 2px dashed #ef4444;
            padding: 0.125em;
            border-radius: 0.25em;
          }
        `
            : ""
        }
      `;
      document.head.appendChild(style);

      // Find and mark missing translations
      const observer = new MutationObserver((mutations) => {
        scanForMissingTranslations();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // Initial scan
      scanForMissingTranslations();

      // Cleanup
      return () => {
        const styleElement = document.getElementById(
          "translation-debugger-styles"
        );
        if (styleElement) {
          styleElement.remove();
        }
        observer.disconnect();
        clearMissingTranslationMarkers();
      };
    } else {
      // Remove debug styles
      const styleElement = document.getElementById(
        "translation-debugger-styles"
      );
      if (styleElement) {
        styleElement.remove();
      }
      clearMissingTranslationMarkers();
    }
  }, [isDebugMode, showKeys, highlightMissing, language]);

  // Scan for missing translations
  const scanForMissingTranslations = () => {
    // This is a simple heuristic - in a real app, you'd want a more sophisticated approach
    const elements = document.querySelectorAll("[data-i18n-key]");
    let missing = 0;

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n-key");
      const text = element.textContent?.trim();

      // Simple heuristic: if the text starts with the last part of the key, it might be untranslated
      const keyParts = key?.split(".") || [];
      const lastKeyPart = keyParts[keyParts.length - 1];

      const isMissing =
        text === key ||
        (lastKeyPart &&
          text?.toLowerCase().includes(lastKeyPart.toLowerCase())) ||
        (text?.startsWith("[") && text?.endsWith("]"));

      if (isMissing) {
        element.setAttribute("data-i18n-missing", "true");
        missing++;
      } else {
        element.setAttribute("data-i18n-missing", "false");
      }
    });

    setMissingCount(missing);
  };

  // Clear missing translation markers
  const clearMissingTranslationMarkers = () => {
    const elements = document.querySelectorAll("[data-i18n-missing]");
    elements.forEach((element) => {
      element.removeAttribute("data-i18n-missing");
    });
  };

  return (
    <>
      {/* Debug button (only visible in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant={isDebugMode ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsOpen(true)}
            className="rounded-full h-10 w-10 p-0 shadow-lg"
          >
            <Bug size={20} />
          </Button>

          {isDebugMode && missingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {missingCount}
            </span>
          )}
        </div>
      )}

      {/* Debug dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Translation Debugger</DialogTitle>
            <DialogDescription>
              Tools to help identify and fix translation issues
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="debug-mode">Debug Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable translation debugging tools
                </p>
              </div>
              <Switch
                id="debug-mode"
                checked={isDebugMode}
                onCheckedChange={setIsDebugMode}
              />
            </div>

            {isDebugMode && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-keys">Show Translation Keys</Label>
                    <p className="text-sm text-muted-foreground">
                      Display the translation key next to each translated text
                    </p>
                  </div>
                  <Switch
                    id="show-keys"
                    checked={showKeys}
                    onCheckedChange={setShowKeys}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="highlight-missing">Highlight Missing</Label>
                    <p className="text-sm text-muted-foreground">
                      Highlight text that might be missing translations
                    </p>
                  </div>
                  <Switch
                    id="highlight-missing"
                    checked={highlightMissing}
                    onCheckedChange={setHighlightMissing}
                  />
                </div>

                {missingCount > 0 && highlightMissing && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">
                      Found {missingCount} potentially missing translations
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
