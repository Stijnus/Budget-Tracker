# Translation Guide for Budget Tracker

This guide explains how to work with translations in the Budget Tracker application.

## Supported Languages

The application currently supports the following languages:

- English (en) - Default/fallback language
- Dutch (nl)
- French (fr)
- German (de)

## Translation Structure

Translations are organized in a hierarchical structure with namespaced keys. For example:

```
common.save = "Save" (English)
common.save = "Opslaan" (Dutch)
```

The main categories include:

- `common` - Common UI elements and actions
- `auth` - Authentication-related text
- `dashboard` - Dashboard-related text
- `transactions` - Transaction-related text
- `budgets` - Budget-related text
- `goals` - Goal-related text
- `bills` - Bills and subscriptions text
- `categories` - Category management text
- `settings` - Settings-related text
- `groups` - Budget groups text
- `nav` - Navigation text
- `errors` - Error messages

## Adding Translations

### 1. Using Translation Keys in Components

When adding new text to a component, always use the translation function:

```tsx
// Using the useTranslation hook from react-i18next
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("page.title")}</h1>
      <p>{t("page.description")}</p>
    </div>
  );
}

// OR using the useLanguage hook from our custom provider
import { useLanguage } from "../../providers/LanguageProvider";

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t("page.title")}</h1>
      <p>{t("page.description")}</p>
    </div>
  );
}
```

### 2. Adding New Translation Keys

When adding new text that needs translation:

1. Choose an appropriate namespace (e.g., `common`, `dashboard`, etc.)
2. Create a descriptive key (e.g., `common.saveChanges`)
3. Add the key and English translation to `src/i18n/translations.ts`
4. Add translations for other supported languages

Example:

```typescript
// In src/i18n/translations.ts
export const translations = {
  en: {
    translation: {
      // ...existing translations
      "feature.newKey": "New feature text",
    }
  },
  nl: {
    translation: {
      // ...existing translations
      "feature.newKey": "Nieuwe functietekst",
    }
  },
  // Add for other languages...
};
```

### 3. Using Variables in Translations

For dynamic content, use variables:

```tsx
// In component
t("common.welcome", { name: user.name })

// In translations
"common.welcome": "Welcome, {{name}}!"
```

### 4. Pluralization

For content that changes based on count:

```tsx
// In component
t("common.itemCount", { count: items.length })

// In translations
"common.itemCount": "{{count}} item",
"common.itemCount_plural": "{{count}} items"
```

## Translation Validation

We have a script to help identify missing or unused translations:

```bash
# Run the validation script
node scripts/validate-translations.js

# Generate placeholders for missing translations
node scripts/validate-translations.js --fix

# Show detailed information
node scripts/validate-translations.js --verbose

# Check only a specific language
node scripts/validate-translations.js --lang=fr
```

## Translation Debugging

The application includes a translation debugger that can be enabled in development mode:

1. Look for the bug icon in the bottom right corner of the application
2. Enable "Debug Mode"
3. Use "Show Translation Keys" to display keys next to translated text
4. Use "Highlight Missing" to highlight potentially missing translations

## Best Practices

1. **Use Descriptive Keys**: Choose clear, descriptive keys that indicate the purpose of the text
2. **Maintain Consistency**: Use consistent naming patterns for related keys
3. **Provide Context**: Add comments in the translation files to provide context for translators
4. **Test All Languages**: Verify that your UI works well with all supported languages
5. **Watch for Text Expansion**: Some languages may require more space than English
6. **Keep Translations Updated**: Run the validation script regularly to catch missing translations

## Future Improvements

We plan to implement the following improvements to our translation system:

1. Split translations into separate files by feature
2. Implement lazy loading of translations
3. Add a visual translation editor
4. Support for additional languages
