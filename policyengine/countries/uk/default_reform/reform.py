from openfisca_core.parameters.parameter_scale_bracket import (
    ParameterScaleBracket,
)
from openfisca_tools.model_api import (
    ReformType,
    Variable,
    amount_over,
)
from openfisca_uk import CountryTaxBenefitSystem
from openfisca_uk.tools.general import *
from openfisca_uk.entities import Person, Household
from openfisca_core.model_api import YEAR, Reform
from openfisca_core.parameters import ParameterNode, ParameterScale
import yaml
import pandas as pd
import warnings

warnings.filterwarnings("ignore")


def add_extra_band(parameters: ParameterNode) -> ParameterNode:
    rates = parameters.tax.income_tax.rates
    uk_rates: ParameterScale = rates.uk
    extra_uk_bracket = ParameterScaleBracket(
        data={
            "threshold": {
                "description": "An extra Income Tax band for the UK",
                "values": {"2021-01-01": 1e7},
                "metadata": {
                    "label": "Extra band threshold",
                    "unit": "currency-GBP",
                    "period": "year",
                    "name": "extra_UK_threshold",
                },
            },
            "rate": {
                "values": {"2021-01-01": 0.45},
                "description": "Rate of the extra Income Tax band for the UK",
                "metadata": {
                    "label": "Extra band rate",
                    "unit": "/1",
                    "name": "extra_UK_rate",
                },
            },
        }
    )
    uk_rates.brackets += [extra_uk_bracket]
    scot_rates: ParameterScale = rates.scotland.post_starter_rate
    extra_scot_bracket = ParameterScaleBracket(
        data={
            "threshold": {
                "description": "An extra Income Tax band for Scotland",
                "values": {"2021-01-01": 1e7},
                "metadata": {
                    "label": "Extra band threshold",
                    "unit": "currency-GBP",
                    "period": "year",
                    "name": "extra_scot_threshold",
                },
            },
            "rate": {
                "values": {"2021-01-01": 0.46},
                "description": "Rate of the extra Income Tax band for Scotland",
                "metadata": {
                    "label": "Extra band rate",
                    "unit": "/1",
                    "name": "extra_scot_rate",
                },
            },
        }
    )
    scot_rates.brackets += [extra_scot_bracket]
    rates.uk.brackets[3].rate.name = "tax.income_tax.rates.uk[3].rate"
    rates.uk.brackets[
        3
    ].threshold.name = "tax.income_tax.rates.uk[3].threshold"
    rates.scotland.post_starter_rate.brackets[
        5
    ].rate.name = "tax.income_tax.rates.scotland.post_starter_rate[5].rate"
    rates.scotland.post_starter_rate.brackets[
        5
    ].threshold.name = (
        "tax.income_tax.rates.scotland.post_starter_rate[5].threshold"
    )
    return parameters


folder = Path(__file__).parent


def create_default_reform() -> ReformType:
    baseline_system = CountryTaxBenefitSystem()
    baseline_variables = {
        name: type(variable)
        for name, variable in baseline_system.variables.items()
    }

    class net_financial_wealth(Variable):
        entity = Household
        label = "Net financial wealth"
        documentation = "Total assets minus liabilities"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class net_financial_wealth_tax(Variable):
        entity = Household
        label = "Wealth tax"
        documentation = "Flat tax on net financial wealth"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

        def formula(household, period, parameters):
            rate = parameters(period).reforms.wealth_tax.rate
            return max_(0, household("net_financial_wealth", period)) * rate

    class property_tax(Variable):
        entity = Household
        label = "Property tax"
        documentation = "Flat tax on property values"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

        def formula(household, period, parameters):
            rate = parameters(period).reforms.property_tax.rate
            return household("property_wealth", period) * rate

    class LVT(Variable):
        entity = Household
        label = "Land value tax"
        definition_period = YEAR
        value_type = float
        unit = "currency-GBP"

        def formula(household, period, parameters):
            lvt = parameters(period).reforms.LVT
            full_lvt = lvt.rate * household("land_value", period)
            household_lvt = lvt.household_rate * household(
                "household_land_value", period
            )
            corporate_lvt = lvt.corporate_rate * household(
                "corporate_land_value", period
            )
            return full_lvt + household_lvt + corporate_lvt

    class carbon_tax(Variable):
        entity = Household
        label = "Carbon tax"
        definition_period = YEAR
        value_type = float
        unit = "currency-GBP"

        def formula(household, period, parameters):
            carbon_tax = parameters(period).reforms.carbon_tax
            rate = carbon_tax.rate
            emissions = household("carbon_consumption", period)
            # Household's share of total stocks and other corporate tax exposure.
            shareholding = household("shareholding", period)
            total_emissions = (
                emissions * household("household_weight", period)
            ).sum()
            consumer_incidence = (
                carbon_tax.consumer_incidence * rate * emissions
            )
            corporate_incidence = (
                (1 - carbon_tax.consumer_incidence)
                * rate
                * total_emissions
                * shareholding
            )
            return consumer_incidence + corporate_incidence

    class household_tax(baseline_variables["household_tax"]):
        def formula(household, period, parameters):
            original_tax = baseline_variables["household_tax"].formula(
                household,
                period,
            )
            return (
                original_tax
                + household("LVT", period)
                + household("net_financial_wealth_tax", period)
                + household("property_tax", period)
                + household("carbon_tax", period)
            )

    class UBI(Variable):
        entity = Person
        definition_period = YEAR
        label = "Universal basic income"
        value_type = float
        unit = "currency-GBP"

        def formula(person, period, parameters):
            UBI_params = parameters(period).reforms.UBI
            age = person("age", period)
            is_child = age < UBI_params.WA_adult_UBI_age
            is_SP_age = person("is_SP_age", period)
            is_WA_adult = ~is_child & ~is_SP_age
            basic_income = (
                is_child * UBI_params.child
                + is_WA_adult * UBI_params.adult
                + is_SP_age * UBI_params.senior
            ) * 52
            return basic_income

    class benefits(baseline_variables["benefits"]):
        def formula(person, period, parameters):
            original_benefits = baseline_variables["benefits"].formula(
                person, period, parameters
            )
            return original_benefits + person("UBI", period)

    # Taxable UBI

    class adjusted_net_income(Variable):
        value_type = float
        entity = Person
        label = "Taxable income after tax reliefs and before allowances"
        definition_period = YEAR
        reference = "Income Tax Act 2007 s. 23"

        def formula(person, period, parameters):
            COMPONENTS = [
                "taxable_employment_income",
                "taxable_pension_income",
                "taxable_social_security_income",
                "taxable_self_employment_income",
                "taxable_property_income",
                "taxable_savings_interest_income",
                "taxable_dividend_income",
                "taxable_miscellaneous_income",
            ]
            UBI_params = parameters(period).reforms.UBI
            taxable_UBI = person("UBI", period) * UBI_params.taxable
            return max_(
                0,
                add(person, period, COMPONENTS) + taxable_UBI,
            )

    # UBI in means tests

    class UC_earned_income(Variable):
        value_type = float
        entity = BenUnit
        label = "Universal Credit earned income (after disregards and tax)"
        definition_period = YEAR

        def formula(benunit, period, parameters):
            personal_gross_earned_income = benunit.sum(
                benunit.members("UC_MIF_capped_earned_income", period)
            )
            UBI_params = parameters(period).reforms.UBI
            means_test_UBI = (
                benunit.sum(benunit.members("UBI", period))
                * UBI_params.in_means_tests
            )
            return max_(
                0,
                personal_gross_earned_income
                + means_test_UBI
                - benunit("UC_work_allowance", period)
                - benunit("benunit_tax", period)
                - aggr(benunit, period, ["pension_contributions"]),
            )

    class tax_credits_applicable_income(Variable):
        value_type = float
        entity = BenUnit
        label = "Applicable income for Tax Credits"
        definition_period = YEAR
        reference = "The Tax Credits (Definition and Calculation of Income) Regulations 2002 s. 3"

        def formula(benunit, period, parameters):
            TC = parameters(period).benefit.tax_credits
            STEP_1_COMPONENTS = [
                "pension_income",
                "savings_interest_income",
                "dividend_income",
                "property_income",
            ]
            income = aggr(benunit, period, STEP_1_COMPONENTS)
            income = amount_over(income, TC.means_test.non_earned_disregard)
            STEP_2_COMPONENTS = [
                "employment_income",
                "self_employment_income",
                "social_security_income",
                "miscellaneous_income",
            ]
            UBI_params = parameters(period).reforms.UBI
            means_test_UBI = (
                benunit.sum(benunit.members("UBI", period))
                * UBI_params.in_means_tests
            )
            income += aggr(benunit, period, STEP_2_COMPONENTS)
            income += means_test_UBI
            EXEMPT_BENEFITS = ["income_support", "ESA_income", "JSA_income"]
            on_exempt_benefits = add(benunit, period, EXEMPT_BENEFITS) > 0
            return income * not_(on_exempt_benefits)

    class guarantee_credit_applicable_income(Variable):
        value_type = float
        entity = BenUnit
        label = "Applicable income for Pension Credit"
        definition_period = YEAR

        def formula(benunit, period, parameters):
            INCOME_COMPONENTS = [
                "personal_benefits",
                "pension_income",
                "maintenance_income",
                "employment_income",
                "self_employment_income",
                "property_income",
                "savings_interest_income",
                "dividend_income",
            ]
            income = aggr(benunit, period, INCOME_COMPONENTS)
            UBI_params = parameters(period).reforms.UBI
            means_test_UBI = (
                benunit.sum(benunit.members("UBI", period))
                * UBI_params.in_means_tests
            )
            income += means_test_UBI
            tax = aggr(
                benunit,
                period,
                ["tax"],
            )
            benefits = add(
                benunit,
                period,
                [
                    "child_benefit",
                    "child_tax_credit",
                    "working_tax_credit",
                    "housing_benefit",
                ],
            )
            return amount_over(income + benefits - tax, 0)

    class JSA_income_applicable_income(Variable):
        value_type = float
        entity = BenUnit
        label = "Relevant income for JSA (income-based) means test"
        definition_period = YEAR

        def formula(benunit, period, parameters):
            JSA = parameters(period).benefit.JSA
            INCOME_COMPONENTS = [
                "employment_income",
                "self_employment_income",
                "property_income",
                "pension_income",
            ]
            UBI_params = parameters(period).reforms.UBI
            means_test_UBI = (
                benunit.sum(benunit.members("UBI", period))
                * UBI_params.in_means_tests
            )
            income = aggr(benunit, period, INCOME_COMPONENTS)
            income += means_test_UBI
            tax = aggr(
                benunit,
                period,
                ["income_tax", "national_insurance"],
            )
            income += aggr(benunit, period, ["social_security_income"])
            income -= tax
            income -= aggr(benunit, period, ["pension_contributions"]) * 0.5
            family_type = benunit("family_type", period)
            families = family_type.possible_values
            income = max_(
                0,
                income
                - (family_type == families.SINGLE)
                * JSA.income.income_disregard_single
                * WEEKS_IN_YEAR
                - benunit("is_couple", period)
                * JSA.income.income_disregard_couple
                * WEEKS_IN_YEAR
                - (family_type == families.LONE_PARENT)
                * JSA.income.income_disregard_lone_parent
                * WEEKS_IN_YEAR,
            )
            return income

    class income_support_applicable_income(Variable):
        value_type = float
        entity = BenUnit
        label = "Relevant income for Income Support means test"
        definition_period = YEAR

        def formula(benunit, period, parameters):
            IS = parameters(period).benefit.income_support
            INCOME_COMPONENTS = [
                "employment_income",
                "self_employment_income",
                "property_income",
                "pension_income",
            ]
            income = aggr(benunit, period, INCOME_COMPONENTS)
            UBI_params = parameters(period).reforms.UBI
            means_test_UBI = (
                benunit.sum(benunit.members("UBI", period))
                * UBI_params.in_means_tests
            )
            income += means_test_UBI
            tax = aggr(
                benunit,
                period,
                ["income_tax", "national_insurance"],
            )
            income += aggr(benunit, period, ["social_security_income"])
            income -= tax
            income -= aggr(benunit, period, ["pension_contributions"]) * 0.5
            family_type = benunit("family_type", period)
            families = family_type.possible_values
            income = max_(
                0,
                income
                - (family_type == families.SINGLE)
                * IS.means_test.income_disregard_single
                * WEEKS_IN_YEAR
                - benunit("is_couple", period)
                * IS.means_test.income_disregard_couple
                * WEEKS_IN_YEAR
                - (family_type == families.LONE_PARENT)
                * IS.means_test.income_disregard_lone_parent
                * WEEKS_IN_YEAR,
            )
            return income

    class housing_benefit_applicable_income(Variable):
        value_type = float
        entity = BenUnit
        label = "Relevant income for Housing Benefit means test"
        definition_period = YEAR

        def formula(benunit, period, parameters):
            WTC = parameters(period).benefit.tax_credits.working_tax_credit
            means_test = parameters(period).benefit.housing_benefit.means_test
            BENUNIT_MEANS_TESTED_BENEFITS = [
                "child_benefit",
                "income_support",
                "JSA_income",
                "ESA_income",
            ]
            INCOME_COMPONENTS = [
                "employment_income",
                "self_employment_income",
                "property_income",
                "pension_income",
            ]
            benefits = add(benunit, period, BENUNIT_MEANS_TESTED_BENEFITS)
            UBI_params = parameters(period).reforms.UBI
            means_test_UBI = (
                benunit.sum(benunit.members("UBI", period))
                * UBI_params.in_means_tests
            )
            income = aggr(benunit, period, INCOME_COMPONENTS)
            income += means_test_UBI
            tax = aggr(
                benunit,
                period,
                ["income_tax", "national_insurance"],
            )
            income += aggr(benunit, period, ["personal_benefits"])
            income += add(benunit, period, ["tax_credits"])
            income -= tax
            income -= aggr(benunit, period, ["pension_contributions"]) * 0.5
            income += benefits
            num_children = benunit.nb_persons(BenUnit.CHILD)
            max_childcare_amount = (
                num_children == 1
            ) * WTC.elements.childcare_1 * WEEKS_IN_YEAR + (
                num_children > 1
            ) * WTC.elements.childcare_2 * WEEKS_IN_YEAR
            childcare_element = min_(
                max_childcare_amount,
                benunit.sum(benunit.members("childcare_expenses", period)),
            )
            applicable_income = max_(
                0,
                income
                - benunit("is_single_person", period)
                * means_test.income_disregard_single
                * WEEKS_IN_YEAR
                - benunit("is_couple", period)
                * means_test.income_disregard_couple
                * WEEKS_IN_YEAR
                - benunit("is_lone_parent", period)
                * means_test.income_disregard_lone_parent
                * WEEKS_IN_YEAR
                - (
                    (
                        benunit.sum(benunit.members("weekly_hours", period))
                        > means_test.worker_hours
                    )
                    + (
                        benunit("is_lone_parent", period)
                        * benunit.sum(benunit.members("weekly_hours", period))
                        > WTC.min_hours.lower
                    )
                )
                * means_test.worker_income_disregard
                * WEEKS_IN_YEAR
                - childcare_element,
            )
            return applicable_income

    class meets_marriage_allowance_income_conditions(
        baseline_variables["meets_marriage_allowance_income_conditions"]
    ):
        def formula(person, period, parameters):
            if parameters(
                period
            ).reforms.abolish_marriage_allowance_income_condition:
                # Setting the parameter to true ensures everyone passes
                # the income test
                return True
            return baseline_variables[
                "meets_marriage_allowance_income_conditions"
            ].formula(person, period)

    # Single pensioner supplement

    class single_pensioner_supplement(Variable):
        entity = Household
        definition_period = YEAR
        label = "Single pensioner supplement"
        value_type = float
        unit = "currency-GBP"

        def formula(household, period, parameters):
            sps = parameters(
                period
            ).reforms.green_party.single_pensioner_supplement
            lives_alone = household.nb_persons() == 1
            is_pensioner = (
                household.sum(household.members("is_SP_age", period)) == 1
            )
            imputed_take_up = random(household) < sps.takeup_rate
            specified_take_up = household.any(
                household.members.benunit(
                    "claims_all_entitled_benefits", period
                )
            )
            takes_up = imputed_take_up | specified_take_up
            income = max_(0, household("household_market_income", period))
            income_over_threshold = max_(0, income - sps.reduction_threshold)
            maximum_amount = (
                sps.amount * lives_alone * is_pensioner * WEEKS_IN_YEAR
            )
            means_tested_amount = max_(
                0, maximum_amount - income_over_threshold * sps.reduction_rate
            )
            return means_tested_amount * takes_up

    class household_benefits(baseline_variables["household_benefits"]):
        def formula(household, period, parameters):
            sps = household("single_pensioner_supplement", period)
            return (
                baseline_variables["household_benefits"].formula(
                    household, period, parameters
                )
                + sps
                + household("smf_benefit_cash_payment", period)
                + household("smf_tax_cash_payment", period)
            )

    class smf_benefit_payment_eligible(Variable):
        entity = Household
        definition_period = YEAR
        label = "Eligible for SMF benefit payments"
        value_type = bool

        def formula(household, period):
            PASSPORTED_BENEFITS = [
                "working_tax_credit",
                "child_tax_credit",
                "housing_benefit",
                "ESA_income",
                "JSA_income",
                "income_support",
                "universal_credit",
            ]
            return (
                household.sum(
                    sum(
                        [
                            household.members.benunit(benefit, period)
                            for benefit in PASSPORTED_BENEFITS
                        ]
                    )
                )
                > 0
            )

    class smf_tax_payment_eligible(Variable):
        entity = Household
        definition_period = YEAR
        label = "Eligible for SMF tax-related payments"
        value_type = bool

        def formula(household, period):
            person = household.members
            tax_band = person("tax_band", period)
            bands = tax_band.possible_values
            has_basic_rate_taxpayers = household.any(
                (tax_band == bands.BASIC)
                | (tax_band == bands.STARTER)
                | (tax_band == bands.INTERMEDIATE)
            )
            has_higher_rate_taxpayers = household.any(
                (tax_band == bands.HIGHER) | (tax_band == bands.ADDITIONAL)
            )
            benefit_payment_eligible = household(
                "smf_benefit_payment_eligible", period
            )
            return (
                has_basic_rate_taxpayers
                & ~has_higher_rate_taxpayers
                & ~benefit_payment_eligible
            )

    class smf_benefit_cash_payment(Variable):
        entity = Household
        definition_period = YEAR
        label = "SMF benefit-based cash payment"
        documentation = "The Social Market Foundation's benefit-based cash payment this household receives."
        value_type = float
        unit = "currency-GBP"

        def formula(household, period, parameters):
            rate = parameters(period).reforms.smf_cash_payment.benefit
            return household("smf_benefit_payment_eligible", period) * rate

    class smf_tax_cash_payment(Variable):
        entity = Household
        definition_period = YEAR
        label = "SMF tax bracket-based cash payment"
        documentation = "The Social Market Foundation's tax bracket-based cash payment this household receives."
        value_type = float
        unit = "currency-GBP"

        def formula(household, period, parameters):
            eligible = household("smf_tax_payment_eligible", period)
            rate = parameters(period).reforms.smf_cash_payment.tax
            return eligible * rate

    class default_reform(Reform):
        def apply(self):
            self.update_variable(LVT)
            self.update_variable(carbon_tax)
            self.update_variable(household_tax)
            self.add_variable(UBI)
            self.update_variable(benefits)
            self.modify_parameters(add_extra_band)

            # Taxable and means-tested UBI
            self.update_variable(adjusted_net_income)
            self.update_variable(UC_earned_income)
            self.update_variable(tax_credits_applicable_income)
            self.update_variable(guarantee_credit_applicable_income)
            self.update_variable(JSA_income_applicable_income)
            self.update_variable(income_support_applicable_income)
            self.update_variable(housing_benefit_applicable_income)
            self.add_variables(
                net_financial_wealth_tax,
                property_tax,
                net_financial_wealth,
            )

            self.update_variable(meets_marriage_allowance_income_conditions)

            self.update_variable(single_pensioner_supplement)
            self.update_variable(smf_benefit_payment_eligible)
            self.update_variable(smf_tax_payment_eligible)
            self.update_variable(smf_benefit_cash_payment)
            self.update_variable(smf_tax_cash_payment)
            self.update_variable(household_benefits)

    return default_reform
