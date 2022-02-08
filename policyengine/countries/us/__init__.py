from openfisca_us import CountryTaxBenefitSystem
from openfisca_us.entities import *
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry
from openfisca_us import IndividualSim


class USResultsConfig(PolicyEngineResultsConfig):
    household_net_income_variable: str = "spm_unit_net_income"
    tax_variable: str = "spm_unit_taxes"
    benefit_variable: str = "spm_unit_benefits"
    employment_income_variable: str = "employment_income"
    self_employment_income_variable: str = "self_employment_income"
    total_income_variable: str = "spm_unit_market_income"


class US(PolicyEngineCountry):
    name = "us"
    system = CountryTaxBenefitSystem
    calculate_only = True
    household_page_only = True
    IndividualSim = IndividualSim
    results_config = USResultsConfig
