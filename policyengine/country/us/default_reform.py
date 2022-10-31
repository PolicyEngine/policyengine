from openfisca_us.variables.household.income.spm_unit.spm_unit_net_income import (
    spm_unit_net_income as original_spm_unit_net_income,
)
from openfisca_us.variables.household.income.spm_unit.spm_unit_benefits import (
    spm_unit_benefits as original_spm_unit_benefits,
)
from openfisca_us.model_api import *
from ..openfisca.reforms import add_parameter_file, use_current_parameters


def create_default_reform():
    class spm_unit_benefits(original_spm_unit_benefits):
        def formula(spm_unit, period, parameters):
            original_income = original_spm_unit_benefits.formula(
                spm_unit, period, parameters
            )
            if parameters(period).reforms.abolition.exempt_ptc_from_flat_tax:
                ptc = add(spm_unit, period, ["premium_tax_credit"])
                return original_income + ptc
            else:
                return original_income

    class us_default_reform(Reform):
        def apply(self):
            self.neutralize_variable("spm_unit_net_income_reported")
            add_parameter_file(
                Path(__file__).parent / "additional_parameters.yaml"
            ).apply(self)
            self.update_variable(spm_unit_benefits)

    return us_default_reform, use_current_parameters()
