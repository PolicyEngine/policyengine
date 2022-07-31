from policyengine.country.us.default_reform import create_default_reform
from policyengine.country.us.results_config import USResultsConfig
from .. import PolicyEngineCountry
import openfisca_us


class US(PolicyEngineCountry):
    openfisca_country_model = openfisca_us
    default_reform = create_default_reform()
    results_config = USResultsConfig