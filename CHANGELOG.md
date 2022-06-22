# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This repo consists of two packages - the React client and the Python server. A change to either repo should trigger an update in the versions for both to ensure a consistent changelog in this repo.

## [1.60.0] - 2022-06-20 04:40:27

### Added

- MA income tax breakdown.

### Fixed

- Bugs causing the household impact page to crash when removing people.

## [1.59.0] - 2022-06-17 14:42:52

### Added

- Abolish switches for main taxes and benefits in the US.
- Basic income parameters and flat taxes for the US.
- More icons and organization to the policy parameter menus.

## [1.58.0] - 2022-06-13 10:44:10

### Added

- All country reform endpoints now support the "reform" parameter, which takes an OpenFisca Python reform.

## [1.57.1] - 2022-06-10 14:33:04

### Fixed

- Fixed bugs causing the US and UK packages to not handle structural reforms.

## [1.57.0] - 2022-06-09 17:08:58

## [1.56.0] - 2022-06-09 14:30:58

### Added

- US population impact page now fully visible.
- US state selector includes US and MA.

## [1.55.1] - 2022-06-08 10:52:07

### Changed

- OpenFisca-US bumped to 0.72.3

## [1.55.0] - 2022-06-08 10:44:44

### Changed

- OpenFisca-US bumped to 0.72.2.
- Breakdown parameters are now borderless.

## [1.54.0] - 2022-06-08 06:51:11

### Added

- Massachusetts State income tax policy parameters.

## [1.53.0] - 2022-06-06 08:42:24

### Changed

- More references shown in parameters for country models.

## [1.52.2] - 2022-06-03 18:55:05

### Fixed

- Bug causing the app to break when selecting a UK region.

## [1.52.1] - 2022-06-01 22:31:54

### Changed

- Large speed increase by removing unused policy parameters.

## [1.52.0] - 2022-06-01 14:09:11

### Added

- US Supplemental Security Income amount and parameters.

## [1.51.0] - 2022-05-26 20:33:09

### Fixed

- A rounding bug causing the net cost headline figure to incorrectly show a round (.0) number where there should be a fraction.

## [1.50.0] - 2022-05-26 16:40:31

### Changed

- Bump OpenFisca-UK.

## [1.49.0] - 2022-05-26 14:17:01

### Changed

- Bump OpenFisca-UK.

## [1.48.0] - 2022-05-26 13:26:35

### Changed

- Bump OpenFisca-UK to add government cost-of-living support policy.

## [1.47.0] - 2022-05-26 11:24:33

### Changed

- Bump OpenFisca-UK.

## [1.46.0] - 2022-05-26 11:00:20

### Added

- UK payment to households on means tests.

## [1.45.0] - 2022-05-25 15:45:38

### Added

- Hover label for cliff rectangles.

## [1.44.4] - 2022-05-22 21:13:34

### Changed

- Bumped openfisca-uk to 0.23.3.

## [1.44.3] - 2022-05-22 16:04:01

### Changed

- Bumped openfisca-uk to 0.23.2.

## [1.44.2] - 2022-05-19 17:51:44

### Fixed

- Fixed NI thresholds in the UK.

## [1.44.1] - 2022-05-12 01:48:22

### Fixed

- Fixed a bug causing deployments to fail.

## [1.44.0] - 2022-05-11 18:25:03

### Changed

- Allow selecting any US state.
- Add US state income tax.
- Add controls for Affordable Connectivity Program amount.

## [1.43.0] - 2022-05-11 16:09:42

### Changed

- Bumped OpenFisca-US version to 0.61.0.

### Fixed

- Bug in which some baseline-editing policies would have no net impact.

## [1.42.0] - 2022-05-11 11:28:42

### Changed

- Size logo image to actual aspect ratio.

## [1.41.0] - 2022-05-10 22:39:32

### Changed

- Converted some icons (green-party, simulation, uk, misc) to webp format.

## [1.40.1] - 2022-05-04 18:41:39

### Fixed

- Fixed a bug which prevented the country specifier from applying.

## [1.40.0] - 2022-05-02 06:25:53

### Added

- Shadings to net income and MTR charts with cliffs.

## [1.39.3] - 2022-04-30 21:30:06

### Fixed

- Fixed a bug causing simulations with country selections to not load URLs correctly.

## [1.39.2] - 2022-04-29 19:12:18

### Added

- Computation tree, leaf nodes and dependencies endpoints.

### Changed

- UK country selector for country-specific analysis now in the baseline rather than reform. than reform.

## [1.39.1] - 2022-04-29 15:09:42

### Fixed

- Fixed a bug causing incorrect descriptions for variables without descriptions.

## [1.39.0] - 2022-04-29 12:46:58

### Added

- API explorer improvements.

## [1.38.0] - 2022-04-29 10:07:07

### Added

- UK country selector for country-specific analysis.

## [1.37.0] - 2022-04-28 14:51:46

### Changed

- Legislation explorer renamed to API explorer (with redirects)

## [1.36.0] - 2022-04-27 12:49:13

### Added

- References to the legislation explorer

## [1.35.0] - 2022-04-26 11:23:09

### Added

- Legislation explorer.

## [1.34.1] - 2022-04-24 22:10:24

### Fixed

- Set decimals on y axis of poverty and decile graphs dynamically.

## [1.34.0] - 2022-04-22 17:56:09

### Added

- Debugging tools allowing decomposition of the net income charts when a reform is applied.

### Changed

- OpenFisca-US bumped.
- Federal tax expandable on the US household page.

## [1.33.3] - 2022-04-22 15:26:59

### Fixed

- Memory allocation reduced back to 6GB (unnecessary given previous PR).

## [1.33.2] - 2022-04-22 13:47:44

### Fixed

- Download instead of generate the CPS dataset for the US microsimulation.

## [1.33.1] - 2022-04-22 12:17:10

### Changed

- Increase memory allocation on the server to 8GB (needed for US population impacts).

## [1.33.0] - 2022-04-22 09:49:12

### Added

- US population simulations for basic income parameters.

## [1.32.11] - 2022-04-19 13:22:51

### Fixed

- Blog posts now show on the homepage.

## [1.32.10] - 2022-04-17 19:33:33

### Fixed

- Remove decimal from MTR chart y-axis label.

## [1.32.9] - 2022-04-17 06:11:37

### Fixed

- Use country-specific tax and benefit variable to fix broken "How earnings affect you" chart in the US.

## [1.32.8] - 2022-04-17 00:02:39

### Fixed

- Blog API failure doesn't crash the site.

## [1.32.7] - 2022-04-16 17:10:04

### Changed

- Update budget hovercard for when there is no reform.

## [1.32.6] - 2022-04-14 13:39:25

### Changed

- Bump OpenFisca-US to capture CTC bug fix.
- Fit navigation buttons to width.

## [1.32.5] - 2022-04-08 20:05:37

## [1.32.4] - 2022-04-08 15:25:05

### Changed

- Bump OpenFisca US.
- Add payroll and self-employment tax parameters.
- Adjust landing page spacing.
- Bump OpenFisca US.
- Add payroll and self-employment tax parameters.
- Adjust landing page spacing.

## [1.32.3] - 2022-04-07 17:49:10

### Changed

- Center-aligns homepage.
- Replaces side-by-side flags to enter the app with primary and secondary buttons stacked.
- Links API documentation from homepage.
- Changes some text colors.

## [1.32.2] - 2022-04-07 13:56:07

### Fixed

- Counterfactual works for abolition variables.

## [1.32.1] - 2022-04-06 21:24:33

### Fixed

- Set default US policy selected to IRS income tax rates.
- Corrected decile chart axes when using wealth deciles.

## [1.32.0] - 2022-04-06 15:54:38

### Fixed

- Hover cards now have the same font (Ubuntu) as the app itself.

## [1.31.0] - 2022-04-05 15:40:36

### Added

- Option to see UK-wide effects by wealth decile.

## [1.30.0] - 2022-04-03 20:15:37

### Changed

- OpenFisca-UK bumped to 0.18.0

## [1.29.0] - 2022-03-30 19:43:38

### Added

- Country-specific social preview cards.
- US tax parameters.

## [1.28.0] - 2022-03-30 11:59:14

### Added

- CDCC parameters.

## [1.27.2] - 2022-03-30 10:13:57

### Fixed

- Population impact breakdown correctly handles baseline-editing simulations.

## [1.27.1] - 2022-03-30 09:44:07

### Changed

- Bump OpenFisca US to update SNAP logic.

## [1.27.0] - 2022-03-29 10:35:30

### Fixed

- 50-70% speed increase in simulations.
- Broken IFrame removed from FAQ pages.
- Blog subtitle removed.

## [1.26.0] - 2022-03-28 14:55:14

### Added

- Options to see the household earnings charts as difference only.

## [1.25.1] - 2022-03-28 13:15:19

### Fixed

- Deployment timeout increased.

## [1.25.0] - 2022-03-28 10:17:04

### Added

- Snapshot and reset buttons to the US app.

### Changed

- Baseline policy is now editable.

### Fixed

- HTTPS redirect sped up using HTML meta tags.

## [1.24.2] - 2022-03-24 21:40:50

### Fixed

- Ensures the docker instance upgrades pip before installing packages.

## [1.24.1] - 2022-03-24 20:43:07

### Changed

- HTTP redirects to HTTPS.
- Commentary on landing page changed to Blog.
- Make header spacing more responsive.
- Remove Home tab in the top menu.
- Fix typo on landing page.
- Set card title to PolicyEngine.
- Link to GitHub on the landing page.
- Add spacing in landing page and fix card ordering.

## [1.24.0] - 2022-03-23 22:20:50

### Added

- Landing page.
- Help icon which launches a walkthrough.

## [1.23.5] - 2022-03-22 14:38:23

### Fixed

- US pages use the USD currency in charts and hover labels.

## [1.23.4] - 2022-03-21 14:04:55

### Changed

- Bump OpenFisca-Tools to 0.7.0.

## [1.23.3] - 2022-03-17 12:14:12

### Changed

- Bump OpenFisca-US to 0.3.7.

## [1.23.2] - 2022-03-16 22:47:57

### Added

- Debugging tools for household charts.

## [1.23.1] - 2022-03-15 19:07:08

### Fixed

- A bug in which adding a spouse would not correctly add their age.

## [1.23.0] - 2022-03-14 16:11:04

### Added

- Earnings variation charts for the US.

## [1.22.7] - 2022-03-14 13:06:55

### Changed

- Fix policy summary to 50% vertical height.

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



[1.60.0]: https://github.com/PolicyEngine/policyengine/compare/1.59.0...1.60.0
[1.59.0]: https://github.com/PolicyEngine/policyengine/compare/1.58.0...1.59.0
[1.58.0]: https://github.com/PolicyEngine/policyengine/compare/1.57.1...1.58.0
[1.57.1]: https://github.com/PolicyEngine/policyengine/compare/1.57.0...1.57.1
[1.57.0]: https://github.com/PolicyEngine/policyengine/compare/1.56.0...1.57.0
[1.56.0]: https://github.com/PolicyEngine/policyengine/compare/1.55.1...1.56.0
[1.55.1]: https://github.com/PolicyEngine/policyengine/compare/1.55.0...1.55.1
[1.55.0]: https://github.com/PolicyEngine/policyengine/compare/1.54.0...1.55.0
[1.54.0]: https://github.com/PolicyEngine/policyengine/compare/1.53.0...1.54.0
[1.53.0]: https://github.com/PolicyEngine/policyengine/compare/1.52.2...1.53.0
[1.52.2]: https://github.com/PolicyEngine/policyengine/compare/1.52.1...1.52.2
[1.52.1]: https://github.com/PolicyEngine/policyengine/compare/1.52.0...1.52.1
[1.52.0]: https://github.com/PolicyEngine/policyengine/compare/1.51.0...1.52.0
[1.51.0]: https://github.com/PolicyEngine/policyengine/compare/1.50.0...1.51.0
[1.50.0]: https://github.com/PolicyEngine/policyengine/compare/1.49.0...1.50.0
[1.49.0]: https://github.com/PolicyEngine/policyengine/compare/1.48.0...1.49.0
[1.48.0]: https://github.com/PolicyEngine/policyengine/compare/1.47.0...1.48.0
[1.47.0]: https://github.com/PolicyEngine/policyengine/compare/1.46.0...1.47.0
[1.46.0]: https://github.com/PolicyEngine/policyengine/compare/1.45.0...1.46.0
[1.45.0]: https://github.com/PolicyEngine/policyengine/compare/1.44.4...1.45.0
[1.44.4]: https://github.com/PolicyEngine/policyengine/compare/1.44.3...1.44.4
[1.44.3]: https://github.com/PolicyEngine/policyengine/compare/1.44.2...1.44.3
[1.44.2]: https://github.com/PolicyEngine/policyengine/compare/1.44.1...1.44.2
[1.44.1]: https://github.com/PolicyEngine/policyengine/compare/1.44.0...1.44.1
[1.44.0]: https://github.com/PolicyEngine/policyengine/compare/1.43.0...1.44.0
[1.43.0]: https://github.com/PolicyEngine/policyengine/compare/1.42.0...1.43.0
[1.42.0]: https://github.com/PolicyEngine/policyengine/compare/1.41.0...1.42.0
[1.41.0]: https://github.com/PolicyEngine/policyengine/compare/1.40.1...1.41.0
[1.40.1]: https://github.com/PolicyEngine/policyengine/compare/1.40.0...1.40.1
[1.40.0]: https://github.com/PolicyEngine/policyengine/compare/1.39.3...1.40.0
[1.39.3]: https://github.com/PolicyEngine/policyengine/compare/1.39.2...1.39.3
[1.39.2]: https://github.com/PolicyEngine/policyengine/compare/1.39.1...1.39.2
[1.39.1]: https://github.com/PolicyEngine/policyengine/compare/1.39.0...1.39.1
[1.39.0]: https://github.com/PolicyEngine/policyengine/compare/1.38.0...1.39.0
[1.38.0]: https://github.com/PolicyEngine/policyengine/compare/1.37.0...1.38.0
[1.37.0]: https://github.com/PolicyEngine/policyengine/compare/1.36.0...1.37.0
[1.36.0]: https://github.com/PolicyEngine/policyengine/compare/1.35.0...1.36.0
[1.35.0]: https://github.com/PolicyEngine/policyengine/compare/1.34.1...1.35.0
[1.34.1]: https://github.com/PolicyEngine/policyengine/compare/1.34.0...1.34.1
[1.34.0]: https://github.com/PolicyEngine/policyengine/compare/1.33.3...1.34.0
[1.33.3]: https://github.com/PolicyEngine/policyengine/compare/1.33.2...1.33.3
[1.33.2]: https://github.com/PolicyEngine/policyengine/compare/1.33.1...1.33.2
[1.33.1]: https://github.com/PolicyEngine/policyengine/compare/1.33.0...1.33.1
[1.33.0]: https://github.com/PolicyEngine/policyengine/compare/1.32.11...1.33.0
[1.32.11]: https://github.com/PolicyEngine/policyengine/compare/1.32.10...1.32.11
[1.32.10]: https://github.com/PolicyEngine/policyengine/compare/1.32.9...1.32.10
[1.32.9]: https://github.com/PolicyEngine/policyengine/compare/1.32.8...1.32.9
[1.32.8]: https://github.com/PolicyEngine/policyengine/compare/1.32.7...1.32.8
[1.32.7]: https://github.com/PolicyEngine/policyengine/compare/1.32.6...1.32.7
[1.32.6]: https://github.com/PolicyEngine/policyengine/compare/1.32.5...1.32.6
[1.32.5]: https://github.com/PolicyEngine/policyengine/compare/1.32.4...1.32.5
[1.32.4]: https://github.com/PolicyEngine/policyengine/compare/1.32.3...1.32.4
[1.32.3]: https://github.com/PolicyEngine/policyengine/compare/1.32.2...1.32.3
[1.32.2]: https://github.com/PolicyEngine/policyengine/compare/1.32.1...1.32.2
[1.32.1]: https://github.com/PolicyEngine/policyengine/compare/1.32.0...1.32.1
[1.32.0]: https://github.com/PolicyEngine/policyengine/compare/1.31.0...1.32.0
[1.31.0]: https://github.com/PolicyEngine/policyengine/compare/1.30.0...1.31.0
[1.30.0]: https://github.com/PolicyEngine/policyengine/compare/1.29.0...1.30.0
[1.29.0]: https://github.com/PolicyEngine/policyengine/compare/1.28.0...1.29.0
[1.28.0]: https://github.com/PolicyEngine/policyengine/compare/1.27.2...1.28.0
[1.27.2]: https://github.com/PolicyEngine/policyengine/compare/1.27.1...1.27.2
[1.27.1]: https://github.com/PolicyEngine/policyengine/compare/1.27.0...1.27.1
[1.27.0]: https://github.com/PolicyEngine/policyengine/compare/1.26.0...1.27.0
[1.26.0]: https://github.com/PolicyEngine/policyengine/compare/1.25.1...1.26.0
[1.25.1]: https://github.com/PolicyEngine/policyengine/compare/1.25.0...1.25.1
[1.25.0]: https://github.com/PolicyEngine/policyengine/compare/1.24.2...1.25.0
[1.24.2]: https://github.com/PolicyEngine/policyengine/compare/1.24.1...1.24.2
[1.24.1]: https://github.com/PolicyEngine/policyengine/compare/1.24.0...1.24.1
[1.24.0]: https://github.com/PolicyEngine/policyengine/compare/1.23.5...1.24.0
[1.23.5]: https://github.com/PolicyEngine/policyengine/compare/1.23.4...1.23.5
[1.23.4]: https://github.com/PolicyEngine/policyengine/compare/1.23.3...1.23.4
[1.23.3]: https://github.com/PolicyEngine/policyengine/compare/1.23.2...1.23.3
[1.23.2]: https://github.com/PolicyEngine/policyengine/compare/1.23.1...1.23.2
[1.23.1]: https://github.com/PolicyEngine/policyengine/compare/1.23.0...1.23.1
[1.23.0]: https://github.com/PolicyEngine/policyengine/compare/1.22.7...1.23.0
[1.22.7]: https://github.com/PolicyEngine/policyengine/compare/1.22.6...1.22.7
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
