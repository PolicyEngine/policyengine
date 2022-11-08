from policyengine_core.parameters.parameter_scale_bracket import (
    ParameterScaleBracket,
)
from openfisca_tools.model_api import (
    ReformType,
    Variable,
)
from policyengine_uk import CountryTaxBenefitSystem
from policyengine_uk.tools.general import *
from policyengine_uk.entities import Household
from policyengine_core.model_api import YEAR, Reform
from policyengine_core.parameters import ParameterNode, ParameterScale
import warnings
from policyengine_core.model_api import Reform

from policyengine.country.openfisca.reforms import (
    add_parameter_file,
    use_current_parameters,
)


warnings.filterwarnings("ignore")
baseline_parameters = CountryTaxBenefitSystem().parameters


def add_extra_band(parameters: ParameterNode) -> ParameterNode:
    rates = parameters.gov.hmrc.income_tax.rates
    uk_rates: ParameterScale = rates.uk
    extra_uk_bracket = ParameterScaleBracket(
        data={
            "threshold": {
                "description": "An extra Income Tax band for the UK",
                "values": {"2010-01-01": 1e7},
                "metadata": {
                    "label": "Extra band threshold",
                    "unit": "currency-GBP",
                    "period": "year",
                    "name": "extra_UK_threshold",
                },
            },
            "rate": {
                "values": {"2010-01-01": 0.45},
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
                "values": {"2010-01-01": 1e7},
                "metadata": {
                    "label": "Extra band threshold",
                    "unit": "currency-GBP",
                    "period": "year",
                    "name": "extra_scot_threshold",
                },
            },
            "rate": {
                "values": {"2010-01-01": 0.46},
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
                + household("carbon_tax", period)
            )

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

    class personal_allowance(baseline_variables["personal_allowance"]):
        def formula(person, period, parameters):
            default_pa = baseline_variables["personal_allowance"].formula(
                person, period, parameters
            )
            is_sp_age = person("is_SP_age", period)
            baseline_pa = baseline_variables["personal_allowance"].formula(
                person, period, baseline_parameters
            )
            if parameters(period).reforms.misc.exempt_seniors_from_PA_changes:
                return where(is_sp_age, baseline_pa, default_pa)
            return default_pa

    class energy_price_cap_subsidy(
        baseline_variables["energy_price_cap_subsidy"]
    ):
        def formula(household, period, parameters):
            # PolicyEngine simulates each month, rather than each quarter in OpenFisca UK. This
            # is because PolicyEngine simulations are of "the year from now", rather than a specific
            # year.
            energy_consumption = household(
                "domestic_energy_consumption", period
            )
            country = household("country", period)
            outside_ni = country != country.possible_values.NORTHERN_IRELAND
            energy_consumption = max_(0, energy_consumption)
            # For each of the four quarters in the next year, calculate the
            # relative change to the price cap against the baseline price cap,
            # and multiply by quarterly energy consumption.
            total_subsidy = 0
            # Manually use the next four quarters (from now) in place of the first four quarters of the current year.
            now = datetime.now()
            m1_baseline_price_cap = parameters(
                period
            ).baseline.gov.ofgem.price_cap._children[f"{now.year}_q1"]
            for month_from_now in range(1, 13):
                into_next_year = now.month + month_from_now > 12
                month = (now.month + month_from_now) % 12
                year = now.year + into_next_year * 1
                quarter = month // 3 + 1
                current_quarter = f"{year}_q{quarter}"
                price_cap = parameters(period).gov.ofgem.price_cap._children[
                    current_quarter
                ]
                baseline_price_cap = parameters(
                    period
                ).baseline.gov.ofgem.price_cap._children[current_quarter]
                relative_change_in_cap = (
                    price_cap - baseline_price_cap
                ) / baseline_price_cap
                relative_change_in_energy_consumption = (
                    baseline_price_cap / m1_baseline_price_cap
                )
                total_subsidy += (
                    -relative_change_in_cap
                    * relative_change_in_energy_consumption
                    * energy_consumption
                    / 12
                )
            return total_subsidy * outside_ni

    class default_reform(Reform):
        def apply(self):
            self.update_variable(LVT)
            self.update_variable(carbon_tax)
            self.update_variable(household_tax)
            self.modify_parameters(add_extra_band)

            self.update_variable(meets_marriage_allowance_income_conditions)

            self.update_variable(single_pensioner_supplement)
            self.update_variable(smf_benefit_payment_eligible)
            self.update_variable(smf_tax_payment_eligible)
            self.update_variable(smf_benefit_cash_payment)
            self.update_variable(smf_tax_cash_payment)
            self.update_variable(household_benefits)
            self.update_variable(personal_allowance)
            add_parameter_file(
                Path(__file__).parent / "additional_parameters.yaml"
            ).apply(self)
            self.update_variable(energy_price_cap_subsidy)

    return default_reform, use_current_parameters()
