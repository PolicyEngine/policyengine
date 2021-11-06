from pathlib import Path
from openfisca_us import Microsimulation, IndividualSim
from openfisca_us.entities import *
from openfisca_us_data import CPS
from rdbl.main import usd
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry
from policyengine.countries.us.default_reform import create_default_reform

US_FOLDER = Path(__file__).parent


class USResultsConfig(PolicyEngineResultsConfig):
    net_income_variable: str = "net_income"
    in_poverty_variable: str = "in_poverty"
    household_net_income_variable: str = "spm_unit_net_income"
    equiv_household_net_income_variable: str = "spm_unit_net_income"
    child_variable: str = "is_child"
    working_age_variable: str = "is_wa_adult"
    senior_variable: str = "is_senior"
    person_variable: str = "people"
    tax_variable: str = "people"
    benefit_variable: str = "people"
    earnings_variable: str = "e00200"
    formatter = usd


class US(PolicyEngineCountry):
    name = "us"
    Microsimulation = Microsimulation
    IndividualSim = IndividualSim
    default_dataset = CPS
    default_reform = create_default_reform()
    parameter_file = US_FOLDER / "reform_parameters.yaml"
    default_household_file = US_FOLDER / "default_household.yaml"
    entity_hierarchy_file = US_FOLDER / "entities.yaml"
    version = "0.2.0"
    results_config = USResultsConfig
