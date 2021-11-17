from pathlib import Path
from openfisca_uk import Microsimulation, IndividualSim
from openfisca_uk.entities import *
from openfisca_uk_data import FRS_WAS_Imputation
from rdbl.main import gbp
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry
from policyengine.countries.uk.default_reform import create_default_reform

UK_FOLDER = Path(__file__).parent


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
    earnings_variable: str = "employment_income"
    formatter = gbp
    currency: str = "£"


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
