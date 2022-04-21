from openfisca_us.tools.baseline_variables import baseline_variables
from openfisca_us.model_api import *


def create_default_reform():
    class spm_unit_net_income(baseline_variables["spm_unit_net_income"]):
        def formula(spm_unit, period, parameters):
            original_net_income = baseline_variables["spm_unit_net_income"].formula(spm_unit, period, parameters)
            basic_income = add(spm_unit, period, ["basic_income"])
            return original_net_income + basic_income

    class us_default_reform(Reform):
        def apply(self):
            self.update_variable(spm_unit_net_income)

    return us_default_reform
