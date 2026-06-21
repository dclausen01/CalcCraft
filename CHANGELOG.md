# Changelog

All notable changes to CalcCraft will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Fill down**: the *CalcCraft: Fill formula down* command (also in the editor
  right-click menu) copies the formula in the current cell down its column to
  the end of the table, adjusting `a1`-style references per row while keeping
  `$`-anchored and `c`/`r` relative references intact. The result is written to
  the markdown so the formulas persist.
- **Hide columns**: a `=hide(c, d, e)` directive (ranges like `c:e` allowed) in
  any cell hides those columns in reading/live-preview mode while keeping the
  formulas working. The directive cell renders empty; the markdown is unchanged.
- **Absolute reference anchors**: `$a$1`, `$a1`, `a$1` and `$` in ranges/matrices
  (`$a$2:$b$17`, `[$a$2:$b$17]`) are now parsed and evaluated. The anchor is
  ignored during evaluation and will drive fill-down behaviour.
- **Excel-style functions**: `IF`, `IFERROR`, `AND`, `OR`, `NOT`, `VLOOKUP`,
  `AVERAGE` and `ROUND`. `IF`/`IFERROR` evaluate their branches lazily, so
  `IFERROR` can catch errors (and NaN) from the protected expression. Cell
  references stay in CalcCraft's lowercase `a1` notation.
- **Percent literals**: write `60%` in a cell (parsed as `0.6`) or inside a
  formula (`=a1*60%` -> `a1*(60/100)`). Locale-aware (`12,5%` -> `0.125`).
- **Test harness**: Vitest with characterization tests for the formula engine
  (`npm test`). Establishes a safety net before further feature work.
- Minimal formula safety guard (`assertSafeFormula`) that rejects forbidden
  identifiers and overly long formulas, wired into the actual evaluation path.

### Fixed
- **`$` anchors and Obsidian math**: Obsidian parses `$...$` as LaTeX inline
  math. Cell extraction now rebuilds the original `$...$` from rendered math
  spans, so single anchored cells (`=a2*$b$2`) work. An anchored *bounded matrix*
  (`[$j$2:$k$6]`) still confuses Obsidian's math parser (the opening `$` closes
  at the next range endpoint); use a column range `[j:k]` for fixed lookup
  tables instead — documented in the README.
- **VLOOKUP** approximate match now skips trailing blank rows and any
  non-ascending tail, so a whole-column lookup table like `[j:k]` is robust.
- **Multiplication asterisks no longer eaten by markdown**: a formula such as
  `=round(c2*40%+f2*60%,1)` (two `*`) was rendered as italic by Obsidian, which
  stripped the asterisks and produced an "Undefined function" error. Cell text is
  now reconstructed from the rendered DOM, turning `<em>`/`<strong>` back into
  `*`/`**`, so multiplication works regardless of how many `*` a formula has.
- **Hidden columns**: the `.calc-hidden-col` rule now uses `!important` and a
  `td/th` selector so themes cannot override it (make sure to copy the updated
  `styles.css` into your vault).
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