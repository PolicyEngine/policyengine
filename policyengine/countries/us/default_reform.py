from openfisca_us.variables.household.income.spm_unit.spm_unit_net_income import (
    spm_unit_net_income as original_spm_unit_net_income,
)
from openfisca_us.model_api import *


def create_default_reform():
    class us_default_reform(Reform):
        def apply(self):
            self.neutralize_variable("spm_unit_net_income_reported")

    return us_default_reform
