"""
Functions generating aggregates and other numerical outputs from microsimulation results.
"""
from policyengine_core.api.microsimulation import Microsimulation


def gbp(x: float) -> str:
    return f"£{round(x / 1e+9, 1)}bn"


def pct_change(x: float, y: float) -> float:
    return (y - x) / x


def poverty_rate(sim: Microsimulation, population_var: str) -> float:
    return sim.calc("in_poverty_bhc", map_to="person", period=2021)[
        sim.calc(population_var) > 0
    ].mean()


def headline_metrics(
    baseline: Microsimulation, reformed: Microsimulation
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
    new_income = reformed.calc("equiv_household_net_income", map_to="person")
    old_income = baseline.calc("equiv_household_net_income", map_to="person")
    gain = new_income - old_income
    net_cost = (
        reformed.calc("net_income").sum() - baseline.calc("net_income").sum()
    )
    poverty_change = pct_change(
        baseline.calc("in_poverty_bhc", map_to="person").mean(),
        reformed.calc("in_poverty_bhc", map_to="person").mean(),
    )
    winner_share = (gain > 0).mean()
    loser_share = (gain < 0).mean()
    gini_change = pct_change(old_income.gini(), new_income.gini())
    return dict(
        net_cost=gbp(net_cost),
        poverty_change=float(poverty_change),
        winner_share=float(winner_share),
        loser_share=float(loser_share),
        gini_change=float(gini_change),
    )
