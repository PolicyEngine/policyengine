from openfisca_tools.model_api import ReformType
from openfisca_us import CountryTaxBenefitSystem
from openfisca_us.entities import Person, Household
from openfisca_core.model_api import Variable, YEAR, Reform


def create_default_reform() -> ReformType:
    baseline_system = CountryTaxBenefitSystem()
    baseline_variables = {
        name: type(variable)
        for name, variable in baseline_system.variables.items()
    }

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
            self.add_variable(UBI)
            self.update_variable(benefits)

    return (default_reform,)
