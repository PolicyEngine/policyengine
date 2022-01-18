# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This repo consists of two packages - the React client and the Python server. A change to either repo should trigger an update in the versions for both to ensure a consistent changelog in this repo.

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
