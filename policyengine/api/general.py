from typing import Tuple, Union
from openfisca_core.model_api import *

ReformType = Union[Reform, Tuple[Reform]]


class PolicyEngineResultsConfig:
    net_income_variable: str
    in_poverty_variable: str
    household_net_income_variable: str
    equiv_household_net_income_variable: str
    child_variable: str
    working_age_variable: str
    senior_variable: str
    person_variable: str
    earnings_variable: str
