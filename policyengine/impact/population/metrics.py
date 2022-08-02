"""
Functions generating aggregates and other numerical outputs from microsimulation results.
"""
from typing import Type
from policyengine.country.results_config import PolicyEngineResultsConfig
from openfisca_tools import Microsimulation
from policyengine.impact.utils import *


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
    winner_share = (gain > 0).mean()
    loser_share = (gain < 0).mean()
    return dict(
        budgetary_impact_str=f'{"-" if net_cost < 0 else ""}{config.currency}{num(abs(net_cost))}',
        budgetary_impact=float(net_cost),
        poverty_change=float(poverty_change),
        winner_share=float(winner_share),
        loser_share=float(loser_share),
    )


def spending(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
) -> float:
    """Budgetary impact of a reform (difference in net income).

    :param baseline: Baseline microsimulation.
    :type baseline: Microsimulation
    :param reformed: Reform microsimulation.
    :type reformed: Microsimulation
    :return: Reform net income minus baseline net income.
    :rtype: float
    """
    return (
        reformed.calc(config.household_net_income_variable).sum()
        - baseline.calc(config.household_net_income_variable).sum()
    )
