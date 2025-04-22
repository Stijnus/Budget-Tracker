/**
 * Get user settings from localStorage
 */
function getUserSettings() {
  try {
    const settings = localStorage.getItem("userSettings");
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error("Error parsing user settings:", error);
    return null;
  }
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  options?: { currency?: string; compact?: boolean; locale?: string }
): string {
  // Try to get user settings
  const userSettings = getUserSettings();

  // Use provided options, user settings, or defaults
  const currency = options?.currency || userSettings?.currency || "USD";
  const locale = options?.locale || userSettings?.language || "en-US";
  const compact = options?.compact || false;

  // Map language codes to locales
  const localeMap: Record<string, string> = {
    en: "en-US",
    nl: "nl-NL",
    fr: "fr-FR",
    de: "de-DE",
  };

  // Get the appropriate locale
  const formatterLocale = localeMap[locale] || locale;

  return new Intl.NumberFormat(formatterLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: 2,
    notation: compact ? "compact" : "standard",
    compactDisplay: "short",
  }).format(amount);
}

/**
 * Format a date as a string
 */
export function formatDate(
  date: string | Date,
  format: "short" | "medium" | "long" = "medium"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Try to get user settings
  const userSettings = getUserSettings();

  // Use user settings or default locale
  const locale = userSettings?.language || undefined;

  // Map language codes to locales
  const localeMap: Record<string, string> = {
    en: "en-US",
    nl: "nl-NL",
    fr: "fr-FR",
    de: "de-DE",
  };

  // Get the appropriate locale
  const formatterLocale = locale ? localeMap[locale] || locale : undefined;

  if (format === "short") {
    return dateObj.toLocaleDateString(formatterLocale);
  } else if (format === "long") {
    return dateObj.toLocaleDateString(formatterLocale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else {
    return dateObj.toLocaleDateString(formatterLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
