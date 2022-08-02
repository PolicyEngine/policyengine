class PolicyEngineResultsConfig:
    """Configuration class for calculating and displaying policy impacts using an OpenFisca country model."""

    in_poverty_variable: str
    in_deep_poverty_variable: str

    household_net_income_variable: str
    household_wealth_variable: str
    equiv_household_net_income_variable: str

    child_variable: str
    working_age_variable: str
    senior_variable: str
    person_variable: str

    tax_variable: str
    benefit_variable: str
    employment_income_variable: str
    self_employment_income_variable: str
    total_income_variable: str

    currency: str
    household_entity: str
    region_variable: str
