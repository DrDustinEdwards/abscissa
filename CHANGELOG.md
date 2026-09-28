# Changelog

All notable changes to Abscissa are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/). Before 1.0.0, a minor version may
change the public API; every such change is listed here.

## [Unreleased]

## [0.1.0-alpha.2] - 2026-09-28

### Fixed

- The package builds itself when installed from git (`prepare` replaces
  `prepack`, and still runs before `npm pack` and `npm publish`).

## [0.1.0-alpha.1] - 2026-09-28

### Added

- `abscissa/enhance`: the enhancement layer. `enhance()` adds hover and focus
  details, keyboard navigation (arrow keys by column and through a stack,
  Home, End, Enter, Space, Escape), click-to-filter from marks and legend
  entries (`abscissa:select` events), a range brush on continuous axes
  (`abscissa:brush`), animated `update()`, an entrance animation and a live
  region for screen readers. Motion is off under `prefers-reduced-motion`.
- The gallery (`npm run gallery`) and browser tests of the enhancement layer.

### Changed

- Bar chart value axes are labelled along the axis; count axes use whole
  numbers.

## [0.1.0-alpha.0] - 2026-09-28

First release, published to reserve the package name while the first version
is built. In active development: the API will change.

### Added

- `barChart`: server-rendered bar chart, single series or stacked or grouped
  series, vertical or horizontal, counting rows when no value field is given.
- `sparkline`: word-sized line chart with a generated text alternative.
- Themes: the `Theme` type, `defineTheme`, `stylesheet`, `defaultTheme` and
  `dustinedwardsTheme`.
- `checkTheme`: WCAG contrast and color-vision-deficiency checks for a theme.

[Unreleased]: https://github.com/DrDustinEdwards/abscissa/compare/v0.1.0-alpha.2...HEAD
[0.1.0-alpha.2]: https://github.com/DrDustinEdwards/abscissa/compare/v0.1.0-alpha.1...v0.1.0-alpha.2
[0.1.0-alpha.1]: https://github.com/DrDustinEdwards/abscissa/compare/v0.1.0-alpha.0...v0.1.0-alpha.1
[0.1.0-alpha.0]: https://github.com/DrDustinEdwards/abscissa/releases/tag/v0.1.0-alpha.0
