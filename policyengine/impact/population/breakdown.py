from typing import Callable, List, Tuple
import numpy as np
from openfisca_tools.microsimulation import Microsimulation
from openfisca_tools.model_api import ReformType
import pandas as pd
import plotly.express as px
from policyengine.utils import charts
from matplotlib import cm

from policyengine.utils.general import PolicyEngineResultsConfig


def get_spending(
    sim: Microsimulation,
    baseline: Microsimulation,
    config: PolicyEngineResultsConfig,
) -> float:
    return (
        sim.calc(config.household_net_income_variable).sum()
        - baseline.calc(config.household_net_income_variable).sum()
    )


greys = cm.get_cmap("Greys")
greens = cm.get_cmap("Greens")


def colour_position_to_rgb(position: int, colour_positions: List[int]) -> str:
    if position > 0:
        scale = greens
        furthest = max
    else:
        scale = greys
        furthest = min
    return "rgb" + str(
        tuple(
            map(
                lambda x: int(255 * x),
                scale(position / furthest(colour_positions) * 0.9),
            )
        )
    )


def get_breakdown_and_chart_per_provision(
    reform: ReformType,
    provisions: Tuple[str],
    baseline: Microsimulation,
    reformed: Microsimulation,
    create_reform_sim: Callable,
    config: PolicyEngineResultsConfig,
) -> dict:
    """Generates a breakdown data structure with spending per provision.

    Args:
        reform (ReformType): Reform object, a tuple of reforms.
        provisions (Tuple[str]): Provision names (same length as reform).
        baseline (Microsimulation): The baseline microsimulation.
        create_reform_sim (Callable): Function that creates a microsimulation from a reform.
        config (PolicyEngineResultsConfig): Country configuration.

    Returns:
        dict: The breakdown details.
    """

    cumulative_spending = []

    def formatter(x):
        return round(float(x) / 1e9, 2)

    decile_impacts = pd.DataFrame()

    income = baseline.calc(
        config.household_net_income_variable, map_to="person"
    )
    equiv_income = baseline.calc(
        config.equiv_household_net_income_variable, map_to="person"
    )

    previous_gains = pd.Series([0] * 10, index=list(range(1, 11)))
    colour_positions = [0]
    provision_data = {}

    for step in range(1, len(reform) + 1):
        if step == len(reform):
            reform_sim = reformed
        else:
            reform_sim = create_reform_sim(reform[:step])
        cumulative_spending += [get_spending(reform_sim, baseline, config)]
        gain = (
            reform_sim.calc(
                config.household_net_income_variable, map_to="person"
            )
            - income
        )
        gain_by_decile = gain.groupby(equiv_income.decile_rank()).sum()
        gain_by_decile -= previous_gains
        previous_gains += gain_by_decile
        income_by_decile = income.groupby(equiv_income.decile_rank())
        gain_df = pd.DataFrame(
            {
                "Decile": gain_by_decile.index,
                "Relative change": (gain_by_decile / income_by_decile.sum())
                .round(3)
                .values,
                "Average change": (gain_by_decile / income_by_decile.count())
                .round()
                .values,
                "Provision": provisions[step - 1],
            }
        )
        decile_impacts = pd.concat([decile_impacts, gain_df])
        if gain_by_decile.sum() > 0:
            # Reform has a positive (assumed in all deciles) impact
            pos = max(colour_positions) + 1
        else:
            # Reform has a negative (assumed in all deciles) impact
            pos = min(colour_positions) - 1
        colour_positions += [pos]
        provision_data[provisions[step - 1]] = dict(
            position=pos,
            decile_impact=list(map(float, list(gain_by_decile.values))),
        )

    additional_spending = np.array(
        cumulative_spending[:1]
        + list(
            np.array(cumulative_spending[1:])
            - np.array(cumulative_spending[:-1])
        )
    )

    for provision in provision_data:
        provision_data[provision]["colour"] = colour_position_to_rgb(
            provision_data[provision]["position"], colour_positions
        )

    colour_map = {
        provision: provision_data[provision]["colour"]
        for provision in provision_data
    }

    rel_decile_chart = charts.formatted_fig_json(
        px.bar(
            decile_impacts,
            x="Decile",
            y="Relative change",
            color="Provision",
            title="Change in net income by decile",
            color_discrete_map=colour_map,
        ).update_layout(
            yaxis_tickformat=",.1%",
            xaxis_tickvals=list(range(1, 11)),
        )
    )

    avg_decile_chart = charts.formatted_fig_json(
        px.bar(
            decile_impacts,
            x="Decile",
            y="Average change",
            color="Provision",
            title="Change in net income by decile",
            color_discrete_map=colour_map,
        ).update_layout(
            yaxis_tickprefix=config.currency,
            yaxis_tickformat=",",
            xaxis_tickvals=list(range(1, 11)),
        )
    )

    return dict(
        provisions=provisions,
        spending=list(map(formatter, additional_spending)),
        cumulative_spending=list(map(formatter, cumulative_spending)),
        rel_decile_chart=rel_decile_chart,
        avg_decile_chart=avg_decile_chart,
    )
