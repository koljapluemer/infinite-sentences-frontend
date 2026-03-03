# Language Management Overview

This document describes how language selection and language metadata currently work in the frontend.

## Scope

- Language metadata (display names, symbols)
- Language selection flow (native -> target)
- Persisted language preferences
- How language choices drive practice data loading

## Sources of Truth

### 1) Selected languages (runtime + persisted)

- Store: `useLanguagePreferencesStore`
- File: `src/entities/language-preferences/languagePreferencesStore.ts`
- Fields:
  - `nativeIso: string | null`
  - `targetIso: string | null`
- This is persisted (`persist: true`) and is the app's runtime source of truth for the active language pair.

### 2) Language metadata (names/symbols)

- Source file: `public/languages.json`
- Loader: `getLanguageInfo()` in `src/entities/language.ts`
- Cached in-memory after first fetch (`languageDataCache`)
- Fallback behavior: if metadata load fails, returns `displayName = iso` and empty symbols.

### 3) Which native languages are available for learning

- Current fetch call: `/infinite-sentences-data/native_languages.json`
- Caller: `src/pages/select-native-language/SelectNativeLanguagePage.vue`
- Intended meaning: list of native ISO codes users can start from.

### 4) Which targets are available for one native language

- Current fetch call: `/infinite-sentences-data/${nativeIso}/target_languages.json`
- Caller: `src/pages/select-target-language/SelectTargetLanguagePage.vue`
- Intended meaning: list of target ISO codes allowed for that native ISO.

### 5) Practice content for a selected pair

- Base path in practice page:
  - `/infinite-sentences-data/out/${nativeIso}/${targetIso}`
- Caller: `src/pages/situation-practice/SituationPracticePage.vue`
- Loaded via:
  - `index.txt` (max sentence index)
  - `${index}.json` (sentence data)
- Repository functions: `src/entities/sentences/repository.ts`

## Selection Flow

1. User opens `/learn`.
2. Native language page fetches available native ISOs and enriches them via `getLanguageInfo()`.
3. User picks native language:
   - `clearLanguages()` is called (target reset).
   - route changes to `/learn/:nativeIso`.
4. Target language page fetches available target ISOs for that native and enriches them via `getLanguageInfo()`.
5. User picks target language:
   - `setLanguages(nativeIso, targetIso)` is called.
   - route changes to `/learn/:nativeIso/:targetIso`.
6. Practice page uses route params to load sentence data for that pair.

## Router Guards and Navigation Behavior

- Router guard (`src/app/router.ts`):
  - If languages are already set and user opens `/learn`, redirect to `/learn/:nativeIso/:targetIso`.
  - If user tries to open practice without languages set, redirect to `/learn`.
- Footer (`src/dumb/AppFooter.vue`) allows:
  - Changing native language (`clearLanguages()` + `/learn`)
  - Changing target language (`targetIso = null` + `/learn/:nativeIso`)

## Data Shape and Language Coupling

- `SentenceData` includes:
  - full sentence
  - sentence translations
  - `parts` (each part has `content`, `translations`, optional `usageExamples`)
- In the current practice implementation, tasks are built directly from sentence part data, not from a separate gloss repository.
- Keys used for progress:
  - sentence key: `${nativeIso}:${targetIso}:${index}`
  - part/gloss key: `${targetIso}::${content}`

## Important Current Inconsistency

On disk, language list files are under `public/infinite-sentences-data/out/...`, but current selection pages fetch without `/out`:

- native languages fetch: `/infinite-sentences-data/native_languages.json`
- target languages fetch: `/infinite-sentences-data/${nativeIso}/target_languages.json`

Practice data fetches with `/out`:

- `/infinite-sentences-data/out/${nativeIso}/${targetIso}/...`

So selection and practice currently disagree on base path conventions.

## Practical Mental Model

- Persisted store (`languagePreferencesStore`) is the canonical "currently selected language pair".
- `languages.json` is the canonical metadata dictionary (human-readable labels/symbols).
- `infinite-sentences-data` files define what combinations/content actually exist.
- Router + footer enforce and manipulate language state transitions.
