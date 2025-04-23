# Translation Management Plan for Budget Tracker

## Current Status

The Budget Tracker application currently supports 4 languages:
- English (en)
- Dutch (nl)
- French (fr)
- German (de)

The translation system uses i18next with react-i18next, with translations stored in a centralized file.

## Issues and Improvements

### Current Issues

1. **Incomplete Translations**: Some components have hardcoded text
2. **Missing Translation Keys**: Some sections lack translation keys
3. **Inconsistent Translation Usage**: Mix of `useTranslation()` and `useLanguage()`
4. **Translation Management**: Single file approach is difficult to maintain
5. **No Translation Validation**: No way to detect missing translations

### Proposed Improvements

1. **Structured Translation Files**: Split translations by feature/section
2. **Translation Validation Tool**: Implement a tool to detect missing translations
3. **Consistent API Usage**: Standardize on a single translation hook
4. **Translation Extraction**: Automate extraction of translation keys
5. **Translation Debugging**: Add visual indicators for untranslated text

## Implementation Plan

### 1. Restructure Translation Files

Split the monolithic translation file into smaller, feature-specific files:

```
src/i18n/
  ├── locales/
  │   ├── en/
  │   │   ├── common.json
  │   │   ├── auth.json
  │   │   ├── dashboard.json
  │   │   ├── transactions.json
  │   │   ├── budgets.json
  │   │   └── ...
  │   ├── nl/
  │   │   ├── common.json
  │   │   ├── auth.json
  │   │   └── ...
  │   ├── fr/
  │   │   └── ...
  │   └── de/
  │       └── ...
  ├── index.ts
  └── config.ts
```

### 2. Implement Translation Validation

Create a script to:
- Scan the codebase for translation keys in use
- Compare with available translations
- Report missing translations
- Identify unused translations

### 3. Standardize Translation API

Choose between `useTranslation()` and `useLanguage()` and standardize usage across the application.

### 4. Add Translation Debugging Mode

Implement a debug mode that visually highlights untranslated text or shows translation keys.

### 5. Create Translation Contribution Guide

Document the process for adding new translations or updating existing ones.

## Migration Strategy

1. Create the new directory structure
2. Split existing translations into the new structure
3. Update the i18next configuration
4. Run validation to identify missing translations
5. Add missing translations
6. Standardize translation hook usage

## Timeline

1. **Week 1**: Restructure translation files and update configuration
2. **Week 2**: Implement validation tool and identify gaps
3. **Week 3**: Fill translation gaps and standardize API usage
4. **Week 4**: Add debugging tools and documentation

## Long-term Considerations

- Consider integrating with a translation management service (Lokalise, Crowdin, etc.)
- Implement lazy-loading of translations for better performance
- Add automated translation suggestions for new content
