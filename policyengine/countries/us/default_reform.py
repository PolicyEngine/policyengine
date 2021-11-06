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

    class ubi(Variable):
        entity = Person
        definition_period = YEAR
        label = "UBI"
        value_type = float

        def formula(person, period, parameters):
            UBI_params = parameters(period).reforms.ubi
            age = person("age", period)
            is_child = age < UBI_params.wa_adult_ubi_age
            is_senior = person("is_senior", period)
            is_WA_adult = ~is_child & ~is_senior
            basic_income = (
                is_child * UBI_params.child
                + is_WA_adult * UBI_params.adult
                + is_senior * UBI_params.senior
            ) * 52
            return basic_income

    class spm_unit_net_income(baseline_variables["spm_unit_net_income"]):
        def formula(spm_unit, period, parameters):
            original_net_income = baseline_variables[
                "spm_unit_net_income"
            ].formula(spm_unit, period, parameters)
            return original_net_income + spm_unit.sum(
                spm_unit.members("ubi", period)
            )

    class default_reform(Reform):
        def apply(self):
            self.update_variable(ubi)
            self.update_variable(spm_unit_net_income)

    return (default_reform,)
