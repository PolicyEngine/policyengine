from pathlib import Path
from openfisca_uk import Microsimulation
from openfisca_uk.entities import *
from openfisca_uk_data import FRS_WAS_Imputation
from policyengine.api.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry
from policyengine.countries.uk.default_reform import create_default_reform
from policyengine.countries.uk.default_situation import DEFAULT_SITUATION


class UKResultsConfig(PolicyEngineResultsConfig):
    net_income_variable: str = "net_income"
    in_poverty_variable: str = "in_poverty_bhc"
    household_net_income_variable: str = "household_net_income"
    equiv_household_net_income_variable: str = "equiv_household_net_income"
    child_variable: str = "is_child"
    working_age_variable: str = "is_WA_adult"
    senior_variable: str = "is_SP_age"
    person_variable: str = "people"
    tax_variable: str = "tax"
    benefit_variable: str = "benefits"

class UK(PolicyEngineCountry):
    name = "uk"
    Microsimulation = Microsimulation
    default_dataset = FRS_WAS_Imputation
    default_reform = create_default_reform()
    parameter_file = Path(__file__).parent / "reform_parameters.yaml"
    version = "0.2.0"
    results_config = UKResultsConfig

