from openfisca_us import CountryTaxBenefitSystem
from openfisca_uk.entities import *
from openfisca_uk_data import FRS_WAS_Imputation
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry


class US(PolicyEngineCountry):
    name = "us"
    system = CountryTaxBenefitSystem
    calculate_only = True
    household_page_only = True
