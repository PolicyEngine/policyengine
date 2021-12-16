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

        def formula(household, period, parameters):
            rate = parameters(period).reforms.LVT.rate
            return rate * household("land_value", period)

    class carbon_tax(Variable):
        entity = Household
        label = "Carbon tax"
        definition_period = YEAR
        value_type = float

        def formula(household, period, parameters):
            rate = parameters(period).reforms.carbon_tax.rate
            return rate * household("carbon_consumption", period)

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
        label = u"Taxable income after tax reliefs and before allowances"
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
        label = u"Universal Credit earned income (after disregards and tax)"
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
        label = u"Applicable income for Tax Credits"
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
        label = u"Applicable income for Pension Credit"
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
        label = u"Relevant income for JSA (income-based) means test"
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
        label = u"Relevant income for Income Support means test"
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
        label = u"Relevant income for Housing Benefit means test"
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

    return (default_reform,)
