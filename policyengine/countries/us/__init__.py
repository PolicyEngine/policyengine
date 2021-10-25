from pathlib import Path
from openfisca_us import Microsimulation, IndividualSim
from openfisca_us.entities import *
from openfisca_us_data import CPS
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry
from policyengine.countries.uk.default_reform import create_default_reform

UK_FOLDER = Path(__file__).parent


class USResultsConfig(PolicyEngineResultsConfig):
    net_income_variable: str = "SPM_unit_net_income"
    in_poverty_variable: str = "in_poverty"
    household_net_income_variable: str = "SPM_unit_net_income"
    equiv_household_net_income_variable: str = "equiv_household_net_income"
    child_variable: str = "is_child"
    working_age_variable: str = "is_WA_adult"
    senior_variable: str = "is_SP_age"
    person_variable: str = "people"
    tax_variable: str = "tax"
    benefit_variable: str = "benefits"
    earnings_variable: str = "employment_income"


class UK(PolicyEngineCountry):
    name = "uk"
    Microsimulation = Microsimulation
    IndividualSim = IndividualSim
    default_dataset = FRS_WAS_Imputation
    default_reform = create_default_reform()
    parameter_file = UK_FOLDER / "reform_parameters.yaml"
    default_household_file = UK_FOLDER / "default_household.yaml"
    entity_hierarchy_file = UK_FOLDER / "entities.yaml"
    version = "0.2.0"
    results_config = UKResultsConfig
