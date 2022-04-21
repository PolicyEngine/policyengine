"""
Functions generating aggregates and other numerical outputs from microsimulation results.
"""
from typing import Type
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.utils.charts import num
from openfisca_tools import Microsimulation


def pct_change(x: float, y: float) -> float:
    return (y - x) / x


def poverty_rate(
    sim: Microsimulation,
    population: str,
    config: Type[PolicyEngineResultsConfig],
) -> float:
    return sim.calc(config.in_poverty_variable, map_to="person")[
        sim.calc(population) > 0
    ].mean()


def deep_poverty_rate(
    sim: Microsimulation,
    population: str,
    config: Type[PolicyEngineResultsConfig],
) -> float:
    return sim.calc(config.in_deep_poverty_variable, map_to="person")[
        sim.calc(population) > 0
    ].mean()


def headline_metrics(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    """Compute headline society-wide metrics.

    :param baseline: Baseline simulation.
    :type baseline: Microsimulation
    :param reformed: Reform simulation.
    :type reformed: Microsimulation
    :return: Dictionary with net_cost, poverty_change, winner_share,
        loser_share, and gini_change.
    :rtype: dict
    """
    new_income = reformed.calc(
        config.household_net_income_variable, map_to="person"
    )
    old_income = baseline.calc(
        config.household_net_income_variable, map_to="person"
    )
    gain = new_income - old_income
    net_cost = (
        reformed.calc(config.household_net_income_variable).sum()
        - baseline.calc(config.household_net_income_variable).sum()
    )
    poverty_change = pct_change(
        baseline.calc(config.in_poverty_variable, map_to="person").mean(),
        reformed.calc(config.in_poverty_variable, map_to="person").mean(),
    )
    winner_share = (gain > 1).mean()
    loser_share = (gain < -1).mean()
    gini_change = pct_change(old_income.gini(), new_income.gini())
    return dict(
        net_cost=("-" if net_cost < 0 else "")
        + config.currency
        + num(abs(net_cost)),
        net_cost_numeric=float(net_cost),
        poverty_change=float(poverty_change),
        winner_share=float(winner_share),
        loser_share=float(loser_share),
        gini_change=float(gini_change),
    )
