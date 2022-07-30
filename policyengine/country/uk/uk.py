from policyengine.country.uk.default_reform import create_default_reform
from .. import PolicyEngineCountry
import openfisca_uk


class UK(PolicyEngineCountry):
    openfisca_country_model = openfisca_uk
    default_reform = create_default_reform()
