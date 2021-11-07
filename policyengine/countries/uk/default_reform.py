from openfisca_tools.model_api import (
    ReformType,
    Variable,
    amount_over,
)
from openfisca_uk import CountryTaxBenefitSystem
from openfisca_uk.entities import Person, Household
from openfisca_core.model_api import YEAR, Reform


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

    class extra_income_tax_band_charge(Variable):
        value_type = float
        entity = Person
        label = "Extra tax bands"
        definition_period = YEAR

        def formula(person, period, parameters):
            extra_band = parameters(period).reforms.extra_band
            income = person("adjusted_net_income", period)
            income_in_band = amount_over(income, extra_band.threshold)
            charge = income_in_band * extra_band.rate
            return charge

    class income_tax(baseline_variables["income_tax"]):
        def formula(person, period, parameters):
            original_income_tax = baseline_variables["income_tax"].formula(
                person, period, parameters
            )
            return original_income_tax + person(
                "extra_income_tax_band_charge", period
            )

    class default_reform(Reform):
        def apply(self):
            self.update_variable(land_value)
            self.update_variable(LVT)
            self.update_variable(tax)
            self.add_variable(UBI)
            self.update_variable(benefits)
            self.update_variable(income_tax)
            self.add_variable(extra_income_tax_band_charge)

    return (default_reform,)
