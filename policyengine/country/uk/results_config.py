from policyengine.country.results_config import PolicyEngineResultsConfig


class UKResultsConfig(PolicyEngineResultsConfig):
    in_poverty_variable = "in_poverty_bhc"
    in_deep_poverty_variable = "in_deep_poverty_bhc"

    household_net_income_variable = "household_net_income"
    household_wealth_variable = "total_wealth"
    equiv_household_net_income_variable = "equiv_household_net_income"

    child_variable = "is_child"
    working_age_variable = "is_WA_adult"
    senior_variable = "is_SP_age"
    person_variable = "people"

    tax_variable = "household_tax"
    benefit_variable = "household_benefits"
    employment_income_variable = "employment_income"
    self_employment_income_variable = "self_employment_income"
    total_income_variable = "total_income"

    currency = "£"
    household_entity = "household"
    region_variable = "region"
