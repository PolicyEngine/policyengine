# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This repo consists of two packages - the React client and the Python server. A change to either repo should trigger an update in the versions for both to ensure a consistent changelog in this repo.

## [1.5.2] - 2022-01-12

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
