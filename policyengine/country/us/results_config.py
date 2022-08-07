from policyengine.country.results_config import PolicyEngineResultsConfig


class USResultsConfig(PolicyEngineResultsConfig):
    in_poverty_variable = "spm_unit_is_in_spm_poverty"
    in_deep_poverty_variable = "spm_unit_is_in_deep_spm_poverty"

    household_net_income_variable = "spm_unit_net_income"
    # Placeholder until we implement wealth data in OpenFisca US.
    household_wealth_variable = "spm_unit_net_income"
    equiv_household_net_income_variable = "spm_unit_oecd_equiv_net_income"

    child_variable = "is_child"
    working_age_variable = "is_wa_adult"
    senior_variable = "is_senior"
    person_variable = "people"

    tax_variable = "spm_unit_taxes"
    benefit_variable = "spm_unit_benefits"
    employment_income_variable = "employment_income"
    self_employment_income_variable = "self_employment_income"
    total_income_variable = "spm_unit_market_income"

    currency = "$"
    household_entity = "spm_unit"
    region_variable = "state"
