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

with open(folder / "land_formula.yaml") as f:
    land_formula = yaml.safe_load(f)

carbon_intensity = pd.read_csv(folder / "carbon_intensity.csv", index_col=0)


def create_default_reform() -> ReformType:
    baseline_system = CountryTaxBenefitSystem()
    baseline_variables = {
        name: type(variable)
        for name, variable in baseline_system.variables.items()
    }

    class owned_land_value(Variable):
        entity = Household
        label = "Owned land value"
        documentation = "Total value of land owned by the household"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class property_wealth(Variable):
        entity = Household
        label = "Property wealth"
        documentation = "Total property wealth of the household"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class corporate_wealth(Variable):
        entity = Household
        label = "Corporate wealth"
        documentation = "Total corporate wealth of the household"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class net_financial_wealth(Variable):
        entity = Household
        label = "Net financial wealth"
        documentation = "Total assets minus liabilities"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class owned_land(Variable):
        entity = Household
        label = "Owned land"
        documentation = (
            "Total value of all land-only plots owned by the household"
        )
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

    class land_value(Variable):
        entity = Household
        label = "Land value"
        documentation = "Estimated total land value exposure (your property's land value, and any share of corporate land value)"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

        def formula(household, period, parameters):
            property_wealth = household("property_wealth", period)
            corporate_wealth = household("corporate_wealth", period)
            total_property_wealth = (
                property_wealth * household("household_weight", period)
            ).sum()
            total_corporate_wealth = (
                corporate_wealth * household("household_weight", period)
            ).sum()
            land_value = parameters(period).reforms.land_value
            property_wealth_intensity = (
                land_value.aggregate_household_land_value
                / total_property_wealth
            )
            property_wealth_intensity = where(
                total_property_wealth > 0, property_wealth_intensity, 0
            )
            corporate_wealth_intensity = (
                land_value.aggregate_corporate_land_value
                / total_corporate_wealth
            )
            corporate_wealth_intensity = where(
                total_corporate_wealth > 0, corporate_wealth_intensity, 0
            )
            return (
                property_wealth * property_wealth_intensity
                + corporate_wealth * corporate_wealth_intensity
                + household("owned_land_value", period)
            )

    class LVT(Variable):
        entity = Household
        label = "Land value tax"
        definition_period = YEAR
        value_type = float

        def formula(household, period, parameters):
            rate = parameters(period).reforms.LVT.rate
            return rate * household("land_value", period)

    class food_and_non_alcoholic_beverages_consumption(Variable):
        entity = Household
        label = "Food and alcoholic beverages"
        documentation = (
            "Total yearly expenditure on food and alcoholic beverages"
        )
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class alcohol_and_tobacco_consumption(Variable):
        entity = Household
        label = "Alcohol and tobacco"
        documentation = "Total yearly expenditure on alcohol and tobacco"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class clothing_and_footwear_consumption(Variable):
        entity = Household
        label = "Clothing and footwear"
        documentation = "Total yearly expenditure on clothing and footwear"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class housing_water_and_electricity_consumption(Variable):
        entity = Household
        label = "Housing, water and electricity"
        documentation = (
            "Total yearly expenditure on housing, water and electricity"
        )
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class household_furnishings_consumption(Variable):
        entity = Household
        label = "Household furnishings"
        documentation = "Total yearly expenditure on household furnishings"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class health_consumption(Variable):
        entity = Household
        label = "Health"
        documentation = "Total yearly expenditure on health"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class transport_consumption(Variable):
        entity = Household
        label = "Transport"
        documentation = "Total yearly expenditure on transport"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class communication_consumption(Variable):
        entity = Household
        label = "Communication"
        documentation = "Total yearly expenditure on communication"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class recreation_consumption(Variable):
        entity = Household
        label = "Recreation"
        documentation = "Total yearly expenditure on recreation"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class education_consumption(Variable):
        entity = Household
        label = "Education"
        documentation = "Total yearly expenditure on education"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class restaurants_and_hotels_consumption(Variable):
        entity = Household
        label = "Restaurants and hotels"
        documentation = "Total yearly expenditure on restaurants and hotels"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    class miscellaneous_consumption(Variable):
        entity = Household
        label = "Miscellaneous"
        documentation = "Total yearly expenditure on miscellaneous goods"
        unit = "currency-GBP"
        definition_period = YEAR
        value_type = float

    CONSUMPTION_VARIABLES = [
        "food_and_non_alcoholic_beverages_consumption",
        "alcohol_and_tobacco_consumption",
        "clothing_and_footwear_consumption",
        "housing_water_and_electricity_consumption",
        "household_furnishings_consumption",
        "health_consumption",
        "transport_consumption",
        "communication_consumption",
        "recreation_consumption",
        "education_consumption",
        "restaurants_and_hotels_consumption",
        "miscellaneous_consumption",
    ]

    class carbon_consumption(Variable):
        entity = Household
        label = "Carbon consumption"
        documentation = "Estimated total carbon footprint of the household"
        unit = "tonne CO2"
        definition_period = YEAR
        value_type = float

        def formula(household, period, parameters):
            spending_by_sector = list(
                map(lambda var: household(var, period), CONSUMPTION_VARIABLES)
            )
            household_weight = household("household_weight", period)
            aggregate_spending_by_sector = list(
                map(
                    lambda values: (values * household_weight).sum(),
                    spending_by_sector,
                )
            )
            carbon_emissions = parameters(
                period
            ).reforms.carbon.aggregate_carbon_emissions
            aggregate_emissions_by_sector = [
                carbon_emissions[category.replace("_consumption", "")]
                for category in CONSUMPTION_VARIABLES
            ]
            carbon_intensity_by_sector = [
                emissions / spending if spending > 0 else 0
                for emissions, spending in zip(
                    aggregate_emissions_by_sector, aggregate_spending_by_sector
                )
            ]
            return sum(
                [
                    spending * carbon_intensity
                    for spending, carbon_intensity in zip(
                        spending_by_sector, carbon_intensity_by_sector
                    )
                ]
            )

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
            personal_tax = household.sum(household.members("tax", period))
            return (
                personal_tax
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
            self.update_variable(land_value)
            self.update_variable(LVT)
            self.update_variable(carbon_consumption)
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
                owned_land_value,
                property_wealth,
                corporate_wealth,
                food_and_non_alcoholic_beverages_consumption,
                alcohol_and_tobacco_consumption,
                clothing_and_footwear_consumption,
                housing_water_and_electricity_consumption,
                household_furnishings_consumption,
                health_consumption,
                transport_consumption,
                communication_consumption,
                recreation_consumption,
                education_consumption,
                restaurants_and_hotels_consumption,
                miscellaneous_consumption,
                net_financial_wealth_tax,
                property_tax,
                net_financial_wealth,
            )

    return (default_reform,)
