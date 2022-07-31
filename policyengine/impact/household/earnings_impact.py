from openfisca_tools import IndividualSim
from policyengine.country.results_config import PolicyEngineResultsConfig
from policyengine.impact.household.charts.budget import budget_chart
from policyengine.impact.household.charts.marginal_tax_rate import mtr_chart


def earnings_impact(
    baseline: IndividualSim,
    reformed: IndividualSim,
    config: PolicyEngineResultsConfig,
) -> dict:
    """Calculates the impact of a reform on household earnings.

    Args:
        baseline (IndividualSim): The baseline simulation.
        reformed (IndividualSim): The reformed simulation.
        config (PolicyEngineResultsConfig): The results configuration.
    """
    employment_income = baseline.calc(config.employment_income_variable).sum()
    self_employment_income = baseline.calc(
        config.self_employment_income_variable
    ).sum()
    earnings_variable = (
        config.employment_income_variable
        if employment_income >= self_employment_income
        else config.self_employment_income_variable
    )
    earnings = max(employment_income, self_employment_income)
    total_income = baseline.calc(config.total_income_variable).sum()
    benefits = baseline.calc(config.benefit_variable).sum()
    tax = baseline.calc(config.tax_variable).sum()
    vary_max = max(200_000, earnings * 1.5)
    baseline.vary(
        earnings_variable,
        step=100,
        max=vary_max,
    )
    if reformed is not None:
        reformed.vary(
            earnings_variable,
            step=100,
            max=vary_max,
        )
    budget = budget_chart(
        baseline,
        reformed,
        False,
        config,
        reformed is not None,
        total_income,
        tax,
        benefits,
    )
    budget_difference = budget_chart(
        baseline,
        reformed,
        True,
        config,
        reformed is not None,
        total_income,
        tax,
        benefits,
    )
    mtr = mtr_chart(
        baseline,
        reformed,
        False,
        config,
        reformed is not None,
        total_income,
    )
    mtr_difference = mtr_chart(
        baseline,
        reformed,
        True,
        config,
        reformed is not None,
        total_income,
    )
    return dict(
        budget_chart=budget,
        budget_difference_chart=budget_difference,
        mtr_chart=mtr,
        mtr_difference_chart=mtr_difference,
    )
