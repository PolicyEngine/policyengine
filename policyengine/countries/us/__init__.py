from openfisca_us import CountryTaxBenefitSystem
from openfisca_us.entities import *
from policyengine.countries.us.default_reform import create_default_reform
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry
from openfisca_us import IndividualSim, Microsimulation, CPS


class USResultsConfig(PolicyEngineResultsConfig):
    household_net_income_variable: str = "spm_unit_net_income"
    tax_variable: str = "spm_unit_taxes"
    benefit_variable: str = "spm_unit_benefits"
    employment_income_variable: str = "employment_income"
    self_employment_income_variable: str = "self_employment_income"
    total_income_variable: str = "spm_unit_market_income"
    in_poverty_variable = "spm_unit_is_in_spm_poverty"
    in_deep_poverty_variable = "spm_unit_is_in_deep_spm_poverty"
    household_wealth_variable = "spm_unit_net_income"  # Placeholder
    equiv_household_net_income_variable = "spm_unit_oecd_equiv_net_income"
    child_variable = "is_child"
    working_age_variable = "is_wa_adult"
    senior_variable = "is_senior"
    person_variable = "people"
    earnings_variable = "employment_income"
    household_entity = "spm_unit"
    currency = "$"


class US(PolicyEngineCountry):
    name = "us"
    system = CountryTaxBenefitSystem
    IndividualSim = IndividualSim
    results_config = USResultsConfig
    Microsimulation = Microsimulation
    default_dataset = CPS
    default_dataset_year = 2020
    microsimulation_default_reform = create_default_reform()

    def __init__(self):
        if not self.default_dataset_year in self.default_dataset.years:
            self.default_dataset.download(self.default_dataset_year)
        super().__init__()
