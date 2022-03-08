# FAQ

## General

### What is PolicyEngine?

PolicyEngine is a web app that calculates taxes and benefits under current policy and customizable policy reforms.

### When will PolicyEngine be available in my state?

Currently, PolicyEngine is only available in California, but we're working on bringing it to other states.
Want to see PolicyEngine in your state?
[Let us know!](https://zej8fnylwn9.typeform.com/to/XFFu15Xq)

### Where can I learn more about how PolicyEngine works?

The code for [PolicyEngine](http://github.com/PolicyEngine/policyengine) and for [OpenFisca US](https://github.com/PolicyEngine/openfisca-us), the microsimulation model that underlies it, is publicly available on GitHub.
We've also answered some common questions below.

### How can I help?

Using and sharing PolicyEngine is already a great help to us!
If you'd like to support our work and computing fees, please consider [making a donation](https://opencollective.com/psl) through our fiscal sponsor, the PSL Foundation (tax-deductible in the US).
We're also entirely open source, and welcome contributions from developers on [GitHub](http://github.com/PolicyEngine/policyengine).

## Policy page

### Do you only simulate policies listed on this page?

No, we simulate essentially the entire tax system and many benefits.
For example, while we don't yet expose parameters on the Child Tax Credit, we do simulate it.

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

PolicyEngine uses the OpenFisca US microsimulation model of the UK tax and benefit system.
We cite legislation or government sites for all policy parameters, and validate against government websites, reports from other microsimulation models, and external benefits calculators.

We are still in beta and will validate against more sources before fully launching.

## Your household page

### Do you store data about my household?

No, we don't track any household-level information provided by users.
