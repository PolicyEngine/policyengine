from openfisca_us import CountryTaxBenefitSystem
from openfisca_us.entities import *
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry
from openfisca_us import IndividualSim


class US(PolicyEngineCountry):
    name = "us"
    system = CountryTaxBenefitSystem
    calculate_only = True
    household_page_only = True
    IndividualSim = IndividualSim
