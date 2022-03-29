# FAQ

## General

### What is PolicyEngine?

PolicyEngine is a web app that calculates taxes and benefits for society and households under current policy and customisable policy reforms.
With PolicyEngine, you can design simple or complex tax and benefit reforms, and see how they affect the UK budget, poverty, and inequality, as well as how they affect your own finances.

### How do I use PolicyEngine?

See the help button in the bottom-left for a demo.

### When will PolicyEngine be available in my country?

Currently, PolicyEngine is only available in the UK, but we're working on bringing it to the US.
Want to see PolicyEngine in your country?
[Let us know!](https://zej8fnylwn9.typeform.com/to/XFFu15Xq)

### Where can I learn more about how PolicyEngine works?

The code for [PolicyEngine](http://github.com/PolicyEngine/policyengine) and for [OpenFisca-UK](https://github.com/PolicyEngine/openfisca-uk), the microsimulation model that underlies it, is publicly available on GitHub.
We've also answered some common questions below.

### How can I help?

Using and sharing PolicyEngine is already a great help to us!
If you'd like to support our work and computing fees, please consider [making a donation](https://opencollective.com/psl) through our fiscal sponsor, the PSL Foundation (tax-deductible in the US).
We're also entirely open source, and welcome contributions from developers on [GitHub](http://github.com/PolicyEngine/policyengine).

## Policy page

### Do you only simulate policies listed on this page?

No, we simulate essentially the entire tax and benefit system, except for [capital gains tax](https://github.com/PolicyEngine/openfisca-uk/issues/40) and [council tax benefit](https://github.com/PolicyEngine/openfisca-uk/issues/150).
For example, while we don't yet expose parameters on Income Support, we do simulate it for those who are eligible.

### Will you be adding more policy parameters?

Yes, we're planning to add more tax and benefit parameter options.
What would you like to simulate?
[Let us know!](https://zej8fnylwn9.typeform.com/to/XFFu15Xq)

### How can I reset a policy parameter to its current value?

For now, you'll have to change it back using the slider or text box, or reload the page to reset all policy parameters.
We're working on a [better way](https://github.com/PolicyEngine/policyengine/issues/107).

### As of what date are policy parameters set?

We use policy parameters from today's date, and backdate them to the start of the year.
You can adjust the snapshot date with the **Snapshot** menu item from the Policy screen.

### How is this model validated?

PolicyEngine uses the OpenFisca UK microsimulation model of the UK tax and benefit system.
We cite legislation or government sites for all policy parameters, and validate against various gov.uk sites, reports from other microsimulation models, and external benefits calculators.
See the [OpenFisca UK validation page](https://PolicyEngine.github.io/openfisca-uk/validation.html) for more information.

### Does abolishing legacy benefits move claimants to Universal Credit, and vice versa?

No; PolicyEngine treats Universal Credit enrolment as fixed, so claimants are not moved between it and legacy benefits.
We suggest abolishing Universal Credit and legacy benefits together if abolishing either.

## UK impact page

### What data do you use to estimate UK-wide impacts?

We use the most recent Family Resources Survey (FRS), which covers the 2019-2020 fiscal year.
The FRS is the UK's standard survey for estimating the distribution of income.
We then extrapolate the FRS to 2022 using growth factors published by the Office of National Statistics and Office for Budget Responsibility.
We also [adjust FRS weights](https://policyengine.github.io/openfisca-uk/model/reweighting) to minimize discrepancies against over 1,500 aggregates published by the UK government.

### What behavioural or macroeconomic assumptions do you make?

None; PolicyEngine is a "static model" only.
For example, it assumes that changing marginal tax rates will not affect labour supply.

### How does PolicyEngine define poverty?

PolicyEngine reports the change to the absolute poverty rate before housing costs.
Because we adjust data to more closely match administrative statistics, our baseline poverty estimate may differ from the government's.

_[Learn more about poverty measurement in the UK.](https://osr.statisticsauthority.gov.uk/the-trouble-with-measuring-poverty/)_

### How are the age groups in the poverty chart defined?

Child poverty refers to poverty among people aged 0 to 17.
Working age adults are people at least 18 years of age but younger than State Pension age.
Retired people are people State Pension age or older.

## Your household page

### Do you store data about my household?

No, we don't track any household-level information provided by users.

## Household impact page

### What are marginal tax rates and how are they calculated?

Marginal tax rates are the share of an additional pound of income that the state takes, either through reduced benefit payments or through taxes.
The baseline tax system has only three marginal rates—the 20% Basic Rate, the 40% Higher Rate, and the 45% Additional Rate—but due to the withdrawal of Universal Credit, the Child Benefit's High Income Tax Charge, the withdrawal of the Personal Allowance, and other features, marginal tax rate schedules are not strictly monotonic.
PolicyEngine calculates marginal tax rates with respect to the employment income of the household head ("You" in the _Your household_ page).
