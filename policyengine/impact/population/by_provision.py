from matplotlib import cm
from policyengine.country.results_config import PolicyEngineResultsConfig
import pandas as pd
import plotly.express as px
from policyengine.impact.population.metrics import spending
from policyengine.impact.utils.text import format_summary_of_parameter_value
from ..utils import *
import numpy as np
from openfisca_tools import ReformType, Microsimulation
from typing import List, Tuple, Callable

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
    country,
    parameters: dict,
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: PolicyEngineResultsConfig,
) -> dict:
    """Generates a breakdown data structure with spending per provision.

    Args:
        country (PolicyEngineCountry): Country object.
        parameters (dict): Parameters for the reform.
        baseline (Microsimulation): The baseline microsimulation.
        reformed (Microsimulation): The reformed microsimulation.
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
    parameter_keys = [
        key
        for key in parameters.keys()
        if "baseline_" not in key
        and f"{config.region_variable}_specific" not in key
    ]
    provisions = []
    for parameter_key in parameter_keys:
        provisions.append(
            format_summary_of_parameter_value(
                country.parameter_data[parameter_key],
                parameters[parameter_key],
            )
        )

    for step in range(1, len(provisions) + 1):
        step_parameters = {
            key: parameters[key] for key in parameter_keys[:step]
        }
        if step == len(provisions):
            reform_sim = reformed
        else:
            _, reform_sim = country.create_microsimulations(step_parameters)
        cumulative_spending += [spending(reform_sim, baseline, config)]
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

    rel_decile_chart = formatted_fig_json(
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

    avg_decile_chart = formatted_fig_json(
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
