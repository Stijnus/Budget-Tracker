import React from "react";
import { useTranslation } from "@/i18n/translations-loader";

interface TranslationLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const TranslationLoader: React.FC<TranslationLoaderProps> = ({
  children,
  fallback = (
    <div className="flex items-center justify-center p-4">
      Loading translations...
    </div>
  ),
}) => {
  const { isLoading } = useTranslation();

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default TranslationLoader;
