from openfisca_core.parameters.parameter_scale_bracket import (
    ParameterScaleBracket,
)
from openfisca_tools.model_api import (
    ReformType,
    Variable,
    amount_over,
)
from openfisca_uk import CountryTaxBenefitSystem
from openfisca_uk.entities import Person, Household
from openfisca_core.model_api import YEAR, Reform
from openfisca_core.parameters import ParameterNode, ParameterScale


def add_extra_band(parameters: ParameterNode) -> ParameterNode:
    rates = parameters.tax.income_tax.rates
    uk_rates: ParameterScale = rates.uk
    extra_uk_bracket = ParameterScaleBracket(
        data={
            "threshold": {
                "values": {"2021-01-01": 1e7},
                "metadata": {
                    "policyengine": {
                        "short_name": "extra_UK_threshold",
                        "title": "Extra band threshold",
                        "description": "An extra income tax band for the UK.",
                        "max": 1e6,
                        "type": "yearly",
                        "summary": "Add an extra income tax band at @ for the UK",
                    }
                },
            },
            "rate": {
                "values": {"2021-01-01": 0.45},
                "metadata": {
                    "policyengine": {
                        "short_name": "extra_UK_rate",
                        "title": "Extra band rate",
                        "description": "Rate of the extra income tax band for the UK.",
                        "max": 1,
                        "type": "rate",
                        "summary": "Set the extra income tax band to @ for the UK",
                    }
                },
            },
        }
    )
    uk_rates.brackets += [extra_uk_bracket]
    scot_rates: ParameterScale = rates.scotland.post_starter_rate
    extra_scot_bracket = ParameterScaleBracket(
        data={
            "threshold": {
                "values": {"2021-01-01": 1e7},
                "metadata": {
                    "policyengine": {
                        "short_name": "extra_scot_threshold",
                        "title": "Extra band threshold",
                        "description": "An extra income tax band for Scotland.",
                        "max": 1e6,
                        "type": "yearly",
                        "summary": "Add an extra income tax band at @ for Scotland",
                    }
                },
            },
            "rate": {
                "values": {"2021-01-01": 0.46},
                "metadata": {
                    "policyengine": {
                        "short_name": "extra_scot_rate",
                        "title": "Extra band rate",
                        "description": "Rate of the extra income tax band for Scotland.",
                        "max": 1,
                        "type": "rate",
                        "summary": "Set the extra income tax band to @ for Scotland",
                    }
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


def create_default_reform() -> ReformType:
    baseline_system = CountryTaxBenefitSystem()
    baseline_variables = {
        name: type(variable)
        for name, variable in baseline_system.variables.items()
    }

    class land_value(Variable):
        entity = Household
        label = "Land value"
        definition_period = YEAR
        value_type = float

    class LVT(Variable):
        entity = Household
        label = "Land value tax"
        definition_period = YEAR
        value_type = float

        def formula(household, period, parameters):
            rate = parameters(period).reforms.LVT.rate
            return rate * household("land_value", period)

    class tax(baseline_variables["tax"]):
        def formula(person, period, parameters):
            LVT_charge = person.household("LVT", period) * person(
                "is_household_head", period
            )
            original_tax = baseline_variables["tax"].formula(
                person, period, parameters
            )
            return original_tax + LVT_charge

    class UBI(Variable):
        entity = Person
        definition_period = YEAR
        label = "UBI"
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

    class default_reform(Reform):
        def apply(self):
            self.update_variable(land_value)
            self.update_variable(LVT)
            self.update_variable(tax)
            self.add_variable(UBI)
            self.update_variable(benefits)
            self.modify_parameters(add_extra_band)

    return (default_reform,)
