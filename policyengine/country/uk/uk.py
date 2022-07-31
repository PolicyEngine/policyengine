from policyengine.country.uk.default_reform import create_default_reform
from policyengine.country.uk.results_config import UKResultsConfig
from .. import PolicyEngineCountry
import openfisca_uk


class UK(PolicyEngineCountry):
    openfisca_country_model = openfisca_uk
    default_reform = create_default_reform()
    results_config = UKResultsConfig
