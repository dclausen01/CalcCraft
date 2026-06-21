# Changelog

All notable changes to CalcCraft will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Test harness**: Vitest with characterization tests for the formula engine
  (`npm test`). Establishes a safety net before further feature work.
- Minimal formula safety guard (`assertSafeFormula`) that rejects forbidden
  identifiers and overly long formulas, wired into the actual evaluation path.

### Fixed
- **Locale parsing**: the grouping (thousands) separator is now actually
  stripped when parsing input. A double-escaped regex previously left it in
  place, so e.g. `1.234` (grouping `.`) parsed as `1.234` instead of `1234`.

### Changed
- Removed dead, never-called sanitizer methods (one of which was actively wrong)
  in favour of the single guard above.
- Per-cell evaluation errors are no longer dumped to the console; they remain
  recorded in the per-cell error map as before.
- Internal: typed the evaluator's settings (`EvaluatorSettings`) and removed a
  stray debug `console.log` from label rendering.

## [2.2.9] - 2026-02-16

### Added
- Configurable decimal separator (e.g., '.' or ',')
- Configurable grouping separator (e.g., ',', '.', or ' ')
- CHANGELOG.md

## [2.3.1] - 2026-02-16

### Added
- **Escape character for literal equals signs**: Use `'=` prefix to display text starting with `=` without triggering formula evaluation. The apostrophe will be hidden in the display but preserved when editing.
  - Example: `'=value` displays as `=value` but is not treated as a formula

## [2.3.3] - 2026-02-16

### Changed
- **Label Display**: Refactored table labels to use CSS pseudo-elements instead of adding physical rows and columns to the DOM
    - Labels now displayed via `::before` and `::after` CSS pseudo-elements to avoid row/column switch when selecting a row or a column
- **BUG fix**: removing the "'" from the beginning of formula was not returning the cell to a formula


## [2.3.4] - 2026-02-16

### Fixed
- **Cell sizing in Live Preview**: Cells to adapt their size to the computed value display instead of the underlying formula text. Fixes issue where long formulas like =2^64 that would not fit in the cell, or long formulas that compute to short values unnecessarily wide when the result was just "42".

## [2.3.5] - 2026-02-16
- isNumeric() fixed

## [2.3.6] - 2026-02-16

### Fixed
- Display trailing zeros when value exceeds display precision ( e.g. for a precision of 3: 3.00005 -> 3.000 but 3.0000 -> 3)
- format() takex precedence over the options (e.g. precision is set to 3 in options, but we have =format(1/3,5) -> 0.33333

## [2.3.7] - 2026-02-16

### Added
- scientific(value, precision) for exponential notation (e.g. 1.23e+9)
### Fixed
- sum() now filters empty cells to work with units (e.g. sum(1 cm, 3 cm, empty))