# FAQ

## General


### What is PolicyEngine?

PolicyEngine is a tool to democratise tax and benefit analysis.
With PolicyEngine, anyone can design a reform to the UK tax and benefit system, and explore the impact of that reform both on society and one's own household.

### How do I use PolicyEngine?

See our demo video below for a tour of the interface. 
<div class="row">
    <div class="col d-flex justify-content-center" style="margin-top: 10px; margin-bottom: 20px;">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/nTIzJ-mzkno" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
</div>


### Who created PolicyEngine?

**Max Ghenis** is the co-founder and CEO of PolicyEngine.
He is also the founder and president of the UBI Center, a think tank researching universal basic income policies, and was previously a data scientist at Google.
Max has a master's degree in Data, Economics, and Development Policy from MIT and a bachelor's degree in operations research from UC Berkeley.

**Nikhil Woodruff** is the co-founder and CTO of PolicyEngine.
He is also a tech lead at the UBI Center, a think tank researching universal basic income policies, and was previously a data scientist at Caspian, where he worked in improving anti-money laundering investigations.
Nikhil is currently on leave from Durham University's Computer Science program.


### When will PolicyEngine be available in my country?

Currently, PolicyEngine is only available in the UK, but we're working on bringing it to the US.
Want to see PolicyEngine in your country?
[Let us know!](https://zej8fnylwn9.typeform.com/to/XFFu15Xq)


### Where can I learn more about how PolicyEngine works?

The code for [PolicyEngine](http://github.com/PolicyEngine/policyengine-uk) and for [OpenFisca-UK](https://github.com/PolicyEngine/openfisca-uk), the microsimulation model that underlies it, is publicly available on GitHub.
We've also answered some common questions below.


### How can I help?

Using and sharing PolicyEngine is already a great help to us!
If you'd like to support our work and computing fees, please consider [making a donation](https://opencollective.com/psl) through our fiscal sponsor, the PSL Foundation (tax-deductible in the US).
We're also entirely open source, and welcome contributions from developers on [GitHub](http://github.com/PolicyEngine/policyengine-uk).


## Policy page


### Do you only simulate policies listed on this page?

No, we simulate essentially the entire tax and benefit system, except for [capital gains tax](https://github.com/PolicyEngine/openfisca-uk/issues/40) and [council tax benefit](https://github.com/PolicyEngine/openfisca-uk/issues/150).
For example, while we don't yet expose parameters on Income Support, we do simulate it for those who are eligible.


### Will you be adding more policy parameters?

Yes, we're planning to add more tax and benefit parameter options, and other taxes like [land value taxes](https://github.com/PolicyEngine/policyengine-uk/issues/105) and [carbon taxes](https://github.com/PolicyEngine/policyengine-uk/issues/104).
What would you like to simulate?
[Let us know!](https://zej8fnylwn9.typeform.com/to/XFFu15Xq)


### How can I reset a policy parameter to its current value?

For now, you'll have to change it back using the slider or text box, or reload the page to reset all policy parameters.
We're working on a [better way](https://github.com/PolicyEngine/policyengine-uk/issues/23).


### As of what date are policy parameters set?

We use policy parameters from today's date, and backdate them to the start of the year.

### How is this model validated?

PolicyEngine uses the OpenFisca-UK microsimulation model, which we constructed by programming rules and parameters specified primarily in the [country report](https://www.iser.essex.ac.uk/research/publications/working-papers/cempa/cempa7-20.pdf) created by [UKMOD](https://www.iser.essex.ac.uk/research/projects/ukmod), a microsimulation model developed by the University of Essex.
We also validated against legislation, various gov.uk sites, reports from other microsimulation models, and external benefits calculators.
See the [OpenFisca-UK validation page](https://PolicyEngine.github.io/openfisca-uk/validation.html) for more information.

### Does abolishing legacy benefits move claimants to Universal Credit, and vice versa?

No; PolicyEngine treats Universal Credit enrolment as fixed (based on the published rollout rate), so claimants are not moved between it and legacy benefits.
We suggest abolishing Universal Credit and legacy benefits together if abolishing either.


## UK impact page


### What data do you use to estimate UK-wide impacts?

We use the most recent Family Resources Survey (FRS), which covers the 2019-2020 fiscal year.
The FRS is the UK's standard survey for estimating the distribution of income.
We then extrapolate the FRS to 2021 using growth factors published by the Office of National Statistics and Office for Budget Responsibility.
We also adjust benefit receipt to reflect trends like the Universal Credit rollout.

The FRS underestimates high incomes, so PolicyEngine accordingly will as well; for example, we'll underestimate the revenue from a reform that raises the Additional Rate.
We're working on improving the data quality by [adjusting top incomes](https://github.com/PolicyEngine/openfisca-uk/issues/103) to better match datasets that accurately capture that population segment.


### What behavioral or macroeconomic assumptions do you make?

None; PolicyEngine is a "static model" only.
For example, it assumes that changing marginal tax rates will not affect labour supply.


### How are the reform provisions sequenced for the budgetary impact chart?

Since policy reforms can interact, we do not model them independently.
Instead, we start with programs that produce budgetary costs (like new spending programs or tax cuts), ordered from largest to smallest, then do the same with programs that produce budgetary surpluses.
This sequence does not follow the order the reforms were specified.


### How is poverty defined?

PolicyEngine reports the change to the absolute poverty rate before housing costs.

_[Learn more about poverty measurement in the UK.](https://osr.statisticsauthority.gov.uk/the-trouble-with-measuring-poverty/)_


### How are the age groups in the poverty chart defined?

Child poverty refers to poverty among people aged 0 to 17.
Working age adults are people at least 18 years of age but younger than State Pension age.
Retired people are people State Pension age or older.


## Your household page


### How can I remove a household member I've added?

Sorry, but for now you have to reload the page and re-enter your household information.
We're working on a [better way](https://github.com/PolicyEngine/policyengine-uk/issues/101).


### Do you store data about my household?

No, we don't track any household-level information provided by users.


## Household impact page


### What are marginal tax rates and how are they calculated?

Marginal tax rates are the share of an additional pound of income that the state takes, either through reduced benefit payments or through taxes.
The baseline tax system has only three marginal rates—the 20% Basic Rate, the 40% Higher Rate, and the 45% Additional Rate—but due to the withdrawal of Universal Credit, the Child Benefit's High Income Tax Charge, the withdrawal of the Personal Allowance, and other features, marginal tax rate schedules are not strictly monotonic.
PolicyEngine calculates marginal tax rates with respect to the employment income of the household head ("You" in the _Your household _page).
