from openfisca_us.variables.income.spm_unit.spm_unit_net_income import (
    spm_unit_net_income as original_spm_unit_net_income,
)
from openfisca_us.model_api import *


def create_default_reform():
    class spm_unit_net_income(original_spm_unit_net_income):
        def formula(spm_unit, period, parameters):
            original_net_income = original_spm_unit_net_income.formula(
                spm_unit, period, parameters
            )
            basic_income = add(spm_unit, period, ["basic_income"])
            return original_net_income + basic_income

    class us_default_reform(Reform):
        def apply(self):
            self.update_variable(spm_unit_net_income)

    return us_default_reform
