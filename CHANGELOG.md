# Changelog

## [Unreleased]
### Added
- Diagnostic script (`diagnose-ts-import.cjs`) to help debug TypeScript import/module resolution issues.

### Changed
- Transaction add/edit form for group dashboard now uses a sidebar (Sheet) instead of a modal dialog for a modern, consistent UI.
- Updated all imports for `GroupBudget` to use the canonical type from the API and path alias (`@/api/supabase/groupBudgets`) for reliability.

### Fixed
- Fixed TypeScript import errors and path issues related to `GroupBudget` and related types in group dashboard and related files.
- Removed unused imports and resolved all reported TypeScript/IDE lint warnings in `GroupPage.tsx` and `GroupTransactions.tsx`.

### Removed
- Old/unused modal dialog code for transaction form in favor of sidebar implementation.

---

## [Earlier]
- See previous commit history for older changes.
