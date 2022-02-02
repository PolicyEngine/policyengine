# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This repo consists of two packages - the React client and the Python server. A change to either repo should trigger an update in the versions for both to ensure a consistent changelog in this repo.

## [1.11.0] - 2022-02-02

### Added

* Federal tax output variable in the net income panel.
* Beta label on PolicyEngine US.

## [1.10.6] - 2022-01-29

### Changed

* Change color scheme to gray/green for negative/positive changes.

## [1.10.5] - 2022-01-29

### Fixed

* Decile changes are now all household-weighted, except for decile placement.

## [1.10.4] - 2022-01-29

### Fixed

* The SMF tax-based payment now excludes households with higher and additional rate payers.

## [1.10.3] - 2022-01-28

### Fixed

* A bug which caused boolean parameters to display "false -> false" when unchecked.
* The SMF tax-based payment now is paid to basic/intermediate/starter rate payers, rather than just not higher and additional rate payers.

## [1.10.2] - 2022-01-26

### Changed

* Miscellaneous cash payments now have the Social Market Foundation branding.

## [1.10.1] - 2022-01-26

### Fixed

* Copy links from the population impact and household pages are now valid.
* The accounting table is now responsive.

### Added

* The household page now has a primary navigation button, pointing to the results tab.
* Descriptive error messages when variables fail to load.

### Changed

* The dividers on the household page link to their first descendent when clicked.

## [1.10.0] - 2022-01-26

### Added

* Miscellaneous: cash payments to benefit recipients or taxpayers.

## [1.9.0] - 2022-01-25

### Added

* School meal subsidies and net income to US app.

## [1.8.5] - 2022-01-24

### Changed

* Green Party Manifesto link increases child UBI from £70/week to £75/week.

## [1.8.4] - 2022-01-22

### Added

* Universal Credit parameters for specific elements.
* Green Party url for the 2019 manifesto (/green-party/manifesto-2019).

### Fixed

* Named policy redirects now work for all pages, not just population impact.

## [1.8.3] - 2022-01-21

### Changed

* Your policy, UK impact and Share policy headers removed.
* Spacing and auto-collapsed status added to the UK impact disclaimer.

## [1.8.2] - 2022-01-20

### Fixed

* Changing the number of adults previously didn't update the variation charts.
* Variation charts wouldn't load for multi-person households.

## [1.8.1] - 2022-01-20

### Fixed

* SPS takeup now applies to survey data runs and is exempted from household simulations.
* Earnings variation charts now use household net income rather than personal net income.

## [1.8.0] - 2022-01-19

### Added

* UK flag icons for Tax and Benefit sections.
* The single pensioner supplement - a hypothetical means-tested payment to single pensioners proposed by the Green Party.

### Fixed

* Inequality measures all use equivalised income.

## [1.7.2] - 2022-01-18

### Fixed

* A bug which caused the UK household impact to be blank and the US to not show the household structure panel.

## [1.7.1] - 2022-01-18

### Fixed

* Gini index is calculated from disposable (not equivalised) household income.

### Changed

* UK household input structure simplified.

## [1.7.0] - 2022-01-17

### Added

* More inputs for calculating US SNAP benefits.

## [1.6.1] - 2022-01-17

### Fixed

* OpenFisca-Tools dependency updated after patch to fix PolicyEngine deployment failure.

## [1.6.0] - 2022-01-17

### Added

* Inequality chart showing relative change to the Gini coefficient and top-10% and top-1% income shares.

## [1.5.5] - 2022-01-16

### Changed

* Command-line flag added for using synthetic UK data for debugging.
* OpenFisca-UK version updated to 0.10.5.
* OpenFisca-US version updated to 0.23.1.

## [1.5.4] - 2022-01-13

### Changed

* OpenFisca-UK dependency updated to version 1.5.4.
* OpenFisca-UK dependency updated to version 0.20.2.

## [1.5.3] - 2022-01-13

### Changed

* OpenFisca-UK dependency updated to version 1.5.3.

## [1.5.2] - 2022-01-13

### Added

* About page.

## [1.5.1] - 2022-01-12

### Changed

* Consolidated markdown files handling, with code documented to add more static pages.

## [1.5.0] - 2022-01-12

### Added

* The Property, Trading and Dividend Allowances.

### Fixed

* A bug causing the taxable UBI option to break the results.

## [1.4.3] - 2022-01-12

### Fixed

* Removed the clear buton from date pickers.
* Clicking the top-left icon preserves the policy.
* Renames Wealth to Assets.

## [1.4.2] - 2022-01-12

### Added

* An option to use the policyengine.org server when debugging, rather than inferring from the URL.

## [1.4.1] - 2022-01-09

### Fixed

* "Edit policy" button previously incorrectly pointed to the household page.
* Share policy URLS missed a slash between policyengine.org and the country name.
