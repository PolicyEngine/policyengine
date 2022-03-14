# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This repo consists of two packages - the React client and the Python server. A change to either repo should trigger an update in the versions for both to ensure a consistent changelog in this repo.

## [1.22.6] - 2022-03-13 20:46:24

### Fixed

- Font issues when users don't have the fonts installed.

## [1.22.5] - 2022-03-13 02:57:09

### Fixed

- Update inequality chart's hover cards to include baseline and reform values

## [1.22.4] - 2022-03-11 15:19:49

### Fixed

- PR action now previews changelog updates.

## [1.22.3] - 2022-03-11 13:35:34

### Fixed

- Bugs relating to changelog features.

## [1.22.2] - 2022-03-11 13:14:28

### Added

- YAML-based changelog.

## [1.22.1] - 2022-03-10 00:00:00

### Fixed

- US policy page broke when selecting IRS parameters.

## [1.22.0] - 2022-03-09 00:00:02

### Changed

- Household entry page now opts for "Single"/"Married" instead of the number of adults.

## [1.21.0] - 2022-03-09 00:00:01

### Added

- US income tax rates and thresholds.

## [1.20.4] - 2022-03-09 00:00:00

### Fixed

- US state code switch disabled and a tooltip added.
- Updates 2021 references to 2022.

## [1.20.3] - 2022-03-08 00:00:00

### Added

- UK income tax rate reform pensioner exemption switch.

### Fixed

- AutoUBI now calculates correct UBI amounts.

## [1.20.2] - 2022-03-07 00:00:00

### Added

- US FAQ.

### Changed

- Update OpenFisca UK to use new weights.
- Update OpenFisca US to capture Social Security taxability.
- Update UK FAQ.

## [1.20.1] - 2022-03-04 00:00:01

### Changed

- Update OpenFisca US for variable label changes.

## [1.20.0] - 2022-03-04 00:00:00

### Added

- Social Security inputs to US app.

### Changed

- Moved personal benefits into their own section.
- Moved SSI from household to personal.

## [1.19.0] - 2022-03-03 00:00:00

### Added

- Baseline and reformed values to hovercards.

## [1.18.2] - 2022-03-01 00:00:00

### Changed

- OpenFisca-UK bumped to 0.13.0.
- Numeric parameters now round to the nearest 0.01 (previously 1).

### Fixed

- A bug preventing AutoUBI from functioning.
- A bug causing boolean parameter switches to not revert properly.
- A bug causing the MTR chart to always say "MTR remains at ...".

## [1.18.1] - 2022-02-28 00:00:01

### Changed

- Hides legend from household charts when user has not provided a reform.
- Edits y axis title on decile chart and refactors decile chart.

## [1.18.0] - 2022-02-28 00:00:00

### Added

- Deep poverty.

## [1.17.2] - 2022-02-27 00:00:00

### Changed

- Reorganized PolicyEngine US input variable hierarchy.

## [1.17.1] - 2022-02-23 00:00:00

### Added

- Disclaimer to the household impact page.

### Changed

- US household entry page: split up household inputs into benefits/expenses and geography.
- Shortened UK impact button text.

## [1.17.0] - 2022-02-21 00:00:00

### Added

- Affordable Connectivity Program and Emergency Broadband Benefit to US household calculator.
- Rural flag to calculate Lifeline's rural Tribal supplement.

### Changed

- Split out free and reduced price school meals.

## [1.16.2] - 2022-02-18 00:00:00

### Changed

- Household MTR chart y-axis now defaults to (0, 100%) instead of (-100%, 100%).
- Current-policy accounting table numbers are closer to their labels.
- Deployment code quality fixes.
- UK policy "General" section renamed to "Snapshot" and clock icon added.
- UK policy section "Miscellaneous" icon added.

## [1.16.1] - 2022-02-16 00:00:01

### Fixed

- Bumped OpenFisca-Tools to 0.4.1, fixing a mistaken import that caused GCP machine failure.

## [1.16.0] - 2022-02-16 00:00:00

### Added

- Breakdown parameter control for parameters broken down by successive categories.
- SNAP maximum allotment parameter.

## [1.15.4] - 2022-02-10 00:00:02

### Added

- Basic income phase-outs and Child Benefit withdrawal switch added.

### Changed

- UBI Center UBI parameters renamed to basic income.

## [1.15.3] - 2022-02-10 00:00:01

### Fixed

- Accounting table did not correctly apply negative sign.

## [1.15.2] - 2022-02-10 00:00:00

### Fixed

- UK household breakdown did not calculate the energy bills rebate in the accounting table.
- Removed test run from merge action (this is run on GCP as well).

## [1.15.1] - 2022-02-09 00:00:01

### Added

- US SNAP normal and emergency allotment breakdown.

### Fixed

- Styling and indentation inconsistencies in the household accounting table.

## [1.15.0] - 2022-02-09 00:00:00

### Added

- US WIC program and its inputs.
- US guaranteed income / cash assistance input.

## [1.14.1] - 2022-02-08 00:00:01

### Changed

- Right policy overview sidebar is now fixed and applies pagination.

### Fixed

- US Lifeline and CA CVRP calculate correctly in the household page.

## [1.14.0] - 2022-02-08 00:00:00

### Added

- US inputs for guaranteed income, phone expenses, and broadband expenses.
- Lifeline and CVRP US benefits.
- Separation of normal and emergency SNAP allotments.
- Parameters for Lifeline amount and income limit (% of FPL).

## [1.13.1] - 2022-02-07 00:00:00

## [1.13.0] - 2022-02-06 00:00:01

### Added

- Energy Bills Rebate parameters and household variables.

## [1.12.0] - 2022-02-06 00:00:00

### Added

- UK miscellaneous reform - exempt seniors from personal allowance changes.

## [1.11.1] - 2022-02-04 00:00:00

### Changed

- UK Green Party manifesto policy extends the higher rate threshold to £50,000.
- OpenFisca-UK updated with re-weighting routine.

## [1.11.0] - 2022-02-02 00:00:00

### Added

- Federal tax output variable in the net income panel.
- Beta label on PolicyEngine US.

## [1.10.6] - 2022-01-29 00:00:02

### Changed

- Change color scheme to gray/green for negative/positive changes.

## [1.10.5] - 2022-01-29 00:00:01

### Fixed

- Decile changes are now all household-weighted, except for decile placement.

## [1.10.4] - 2022-01-29 00:00:00

### Fixed

- The SMF tax-based payment now excludes households with higher and additional rate payers.

## [1.10.3] - 2022-01-28 00:00:00

### Fixed

- A bug which caused boolean parameters to display "false -> false" when unchecked.
- The SMF tax-based payment now is paid to basic/intermediate/starter rate payers, rather than just not higher and additional rate payers.

## [1.10.2] - 2022-01-26 00:00:02

### Changed

- Miscellaneous cash payments now have the Social Market Foundation branding.

## [1.10.1] - 2022-01-26 00:00:01

### Added

- The household page now has a primary navigation button, pointing to the results tab.
- Descriptive error messages when variables fail to load.

### Changed

- The dividers on the household page link to their first descendent when clicked.

### Fixed

- Copy links from the population impact and household pages are now valid.
- The accounting table is now responsive.

## [1.10.0] - 2022-01-26 00:00:00

### Added

- Miscellaneous: cash payments to benefit recipients or taxpayers.

## [1.9.0] - 2022-01-25 00:00:00

### Added

- School meal subsidies and net income to US app.

## [1.8.5] - 2022-01-24 00:00:00

### Changed

- Green Party Manifesto link increases child UBI from £70/week to £75/week.

## [1.8.4] - 2022-01-22 00:00:00

### Added

- Universal Credit parameters for specific elements.
- Green Party url for the 2019 manifesto (/green-party/manifesto-2019).

### Fixed

- Named policy redirects now work for all pages, not just population impact.

## [1.8.3] - 2022-01-21 00:00:00

### Changed

- Your policy, UK impact and Share policy headers removed.
- Spacing and auto-collapsed status added to the UK impact disclaimer.

## [1.8.2] - 2022-01-20 00:00:01

### Fixed

- Changing the number of adults previously didn't update the variation charts.
- Variation charts wouldn't load for multi-person households.

## [1.8.1] - 2022-01-20 00:00:00

### Fixed

- SPS takeup now applies to survey data runs and is exempted from household simulations.
- Earnings variation charts now use household net income rather than personal net income.

## [1.8.0] - 2022-01-19 00:00:00

### Added

- UK flag icons for Tax and Benefit sections.
- The single pensioner supplement - a hypothetical means-tested payment to single pensioners proposed by the Green Party.

### Fixed

- Inequality measures all use equivalised income.

## [1.7.2] - 2022-01-18 00:00:01

### Fixed

- A bug which caused the UK household impact to be blank and the US to not show the household structure panel.

## [1.7.1] - 2022-01-18 00:00:00

### Changed

- UK household input structure simplified.

### Fixed

- Gini index is calculated from disposable (not equivalised) household income.

## [1.7.0] - 2022-01-17 00:00:02

### Added

- More inputs for calculating US SNAP benefits.

## [1.6.1] - 2022-01-17 00:00:01

### Fixed

- OpenFisca-Tools dependency updated after patch to fix PolicyEngine deployment failure.

## [1.6.0] - 2022-01-17 00:00:00

### Added

- Inequality chart showing relative change to the Gini coefficient and top-10% and top-1% income shares.

## [1.5.5] - 2022-01-16 00:00:00

### Changed

- Command-line flag added for using synthetic UK data for debugging.
- OpenFisca-UK version updated to 0.10.5.
- OpenFisca-US version updated to 0.23.1.

## [1.5.4] - 2022-01-13 00:00:02

### Changed

- OpenFisca-UK dependency updated to version 1.5.4.
- OpenFisca-UK dependency updated to version 0.20.2.

## [1.5.3] - 2022-01-13 00:00:01

### Changed

- OpenFisca-UK dependency updated to version 1.5.3.

## [1.5.2] - 2022-01-13 00:00:00

### Added

- About page.

## [1.5.1] - 2022-01-12 00:00:03

### Changed

- Consolidated markdown files handling, with code documented to add more static pages.

## [1.5.0] - 2022-01-12 00:00:02

### Added

- The Property, Trading and Dividend Allowances.

### Fixed

- A bug causing the taxable UBI option to break the results.

## [1.4.3] - 2022-01-12 00:00:01

### Fixed

- Removed the clear buton from date pickers.
- Clicking the top-left icon preserves the policy.
- Renames Wealth to Assets.

## [1.4.2] - 2022-01-12 00:00:00

### Added

- An option to use the policyengine.org server when debugging, rather than inferring from the URL.

## [1.4.1] - 2022-01-09 00:00:00

### Fixed

- "Edit policy" button previously incorrectly pointed to the household page.
- Share policy URLS missed a slash between policyengine.org and the country name.



[1.22.6]: https://github.com/PolicyEngine/policyengine/compare/1.22.5...1.22.6
[1.22.5]: https://github.com/PolicyEngine/policyengine/compare/1.22.4...1.22.5
[1.22.4]: https://github.com/PolicyEngine/policyengine/compare/1.22.3...1.22.4
[1.22.3]: https://github.com/PolicyEngine/policyengine/compare/1.22.2...1.22.3
[1.22.2]: https://github.com/PolicyEngine/policyengine/compare/1.22.1...1.22.2
[1.22.1]: https://github.com/PolicyEngine/policyengine/compare/1.22.0...1.22.1
[1.22.0]: https://github.com/PolicyEngine/policyengine/compare/1.21.0...1.22.0
[1.21.0]: https://github.com/PolicyEngine/policyengine/compare/1.20.4...1.21.0
[1.20.4]: https://github.com/PolicyEngine/policyengine/compare/1.20.3...1.20.4
[1.20.3]: https://github.com/PolicyEngine/policyengine/compare/1.20.2...1.20.3
[1.20.2]: https://github.com/PolicyEngine/policyengine/compare/1.20.1...1.20.2
[1.20.1]: https://github.com/PolicyEngine/policyengine/compare/1.20.0...1.20.1
[1.20.0]: https://github.com/PolicyEngine/policyengine/compare/1.19.0...1.20.0
[1.19.0]: https://github.com/PolicyEngine/policyengine/compare/1.18.2...1.19.0
[1.18.2]: https://github.com/PolicyEngine/policyengine/compare/1.18.1...1.18.2
[1.18.1]: https://github.com/PolicyEngine/policyengine/compare/1.18.0...1.18.1
[1.18.0]: https://github.com/PolicyEngine/policyengine/compare/1.17.2...1.18.0
[1.17.2]: https://github.com/PolicyEngine/policyengine/compare/1.17.1...1.17.2
[1.17.1]: https://github.com/PolicyEngine/policyengine/compare/1.17.0...1.17.1
[1.17.0]: https://github.com/PolicyEngine/policyengine/compare/1.16.2...1.17.0
[1.16.2]: https://github.com/PolicyEngine/policyengine/compare/1.16.1...1.16.2
[1.16.1]: https://github.com/PolicyEngine/policyengine/compare/1.16.0...1.16.1
[1.16.0]: https://github.com/PolicyEngine/policyengine/compare/1.15.4...1.16.0
[1.15.4]: https://github.com/PolicyEngine/policyengine/compare/1.15.3...1.15.4
[1.15.3]: https://github.com/PolicyEngine/policyengine/compare/1.15.2...1.15.3
[1.15.2]: https://github.com/PolicyEngine/policyengine/compare/1.15.1...1.15.2
[1.15.1]: https://github.com/PolicyEngine/policyengine/compare/1.15.0...1.15.1
[1.15.0]: https://github.com/PolicyEngine/policyengine/compare/1.14.1...1.15.0
[1.14.1]: https://github.com/PolicyEngine/policyengine/compare/1.14.0...1.14.1
[1.14.0]: https://github.com/PolicyEngine/policyengine/compare/1.13.1...1.14.0
[1.13.1]: https://github.com/PolicyEngine/policyengine/compare/1.13.0...1.13.1
[1.13.0]: https://github.com/PolicyEngine/policyengine/compare/1.12.0...1.13.0
[1.12.0]: https://github.com/PolicyEngine/policyengine/compare/1.11.1...1.12.0
[1.11.1]: https://github.com/PolicyEngine/policyengine/compare/1.11.0...1.11.1
[1.11.0]: https://github.com/PolicyEngine/policyengine/compare/1.10.6...1.11.0
[1.10.6]: https://github.com/PolicyEngine/policyengine/compare/1.10.5...1.10.6
[1.10.5]: https://github.com/PolicyEngine/policyengine/compare/1.10.4...1.10.5
[1.10.4]: https://github.com/PolicyEngine/policyengine/compare/1.10.3...1.10.4
[1.10.3]: https://github.com/PolicyEngine/policyengine/compare/1.10.2...1.10.3
[1.10.2]: https://github.com/PolicyEngine/policyengine/compare/1.10.1...1.10.2
[1.10.1]: https://github.com/PolicyEngine/policyengine/compare/1.10.0...1.10.1
[1.10.0]: https://github.com/PolicyEngine/policyengine/compare/1.9.0...1.10.0
[1.9.0]: https://github.com/PolicyEngine/policyengine/compare/1.8.5...1.9.0
[1.8.5]: https://github.com/PolicyEngine/policyengine/compare/1.8.4...1.8.5
[1.8.4]: https://github.com/PolicyEngine/policyengine/compare/1.8.3...1.8.4
[1.8.3]: https://github.com/PolicyEngine/policyengine/compare/1.8.2...1.8.3
[1.8.2]: https://github.com/PolicyEngine/policyengine/compare/1.8.1...1.8.2
[1.8.1]: https://github.com/PolicyEngine/policyengine/compare/1.8.0...1.8.1
[1.8.0]: https://github.com/PolicyEngine/policyengine/compare/1.7.2...1.8.0
[1.7.2]: https://github.com/PolicyEngine/policyengine/compare/1.7.1...1.7.2
[1.7.1]: https://github.com/PolicyEngine/policyengine/compare/1.7.0...1.7.1
[1.7.0]: https://github.com/PolicyEngine/policyengine/compare/1.6.1...1.7.0
[1.6.1]: https://github.com/PolicyEngine/policyengine/compare/1.6.0...1.6.1
[1.6.0]: https://github.com/PolicyEngine/policyengine/compare/1.5.5...1.6.0
[1.5.5]: https://github.com/PolicyEngine/policyengine/compare/1.5.4...1.5.5
[1.5.4]: https://github.com/PolicyEngine/policyengine/compare/1.5.3...1.5.4
[1.5.3]: https://github.com/PolicyEngine/policyengine/compare/1.5.2...1.5.3
[1.5.2]: https://github.com/PolicyEngine/policyengine/compare/1.5.1...1.5.2
[1.5.1]: https://github.com/PolicyEngine/policyengine/compare/1.5.0...1.5.1
[1.5.0]: https://github.com/PolicyEngine/policyengine/compare/1.4.3...1.5.0
[1.4.3]: https://github.com/PolicyEngine/policyengine/compare/1.4.2...1.4.3
[1.4.2]: https://github.com/PolicyEngine/policyengine/compare/1.4.1...1.4.2
