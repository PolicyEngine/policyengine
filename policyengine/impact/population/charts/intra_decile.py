from typing import Type
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import numpy as np
from openfisca_tools import Microsimulation
import pandas as pd
from policyengine.impact.utils import *
from policyengine.country.results_config import PolicyEngineResultsConfig


NAMES = (
    "Gain more than 5%",
    "Gain less than 5%",
    "No change",
    "Lose less than 5%",
    "Lose more than 5%",
)


def intra_decile_graph_data(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
    decile_type: str = "income",
) -> pd.DataFrame:
    """Data for the distribution of net income changes by decile and overall.

    :param baseline: Baseline simulation.
    :type baseline: Microsimulation
    :param reformed: Reform simulation.
    :type reformed: Microsimulation
    :return: DataFrame with share of each decile experiencing each outcome.
    :rtype: pd.DataFrame
    """
    l = []
    income = baseline.calc(
        config.equiv_household_net_income_variable
        if decile_type == "income"
        else config.household_wealth_variable,
        map_to="person",
    )
    decile = income.decile_rank()
    baseline_hh_net_income = baseline.calc(
        config.household_net_income_variable, map_to="person"
    )
    reformed_hh_net_income = reformed.calc(
        config.household_net_income_variable, map_to="person"
    )
    gain = reformed_hh_net_income - baseline_hh_net_income
    rel_gain = gain / np.maximum(baseline_hh_net_income, 1)
    BANDS = (None, 0.05, 1e-3, -1e-3, -0.05, None)
    for upper, lower, name in zip(BANDS[:-1], BANDS[1:], NAMES):
        fractions = []
        for j in range(1, 11):
            subset = rel_gain[decile == j]
            if lower is not None:
                subset = subset[rel_gain > lower]
            if upper is not None:
                subset = subset[rel_gain <= upper]
            fractions += [subset.count() / rel_gain[decile == j].count()]
        tmp = pd.DataFrame(
            {
                "fraction": fractions,
                "decile": list(map(str, range(1, 11))),
                "outcome": name,
            }
        )
        l.append(tmp)
        subset = rel_gain
        if lower is not None:
            subset = subset[rel_gain > lower]
        if upper is not None:
            subset = subset[rel_gain <= upper]
        all_row = pd.DataFrame(
            {
                "fraction": [subset.count() / rel_gain.count()],
                "decile": "All",
                "outcome": name,
            }
        )
        l.append(all_row)
    return pd.concat(l).reset_index()


INTRA_DECILE_COLORS = (
    DARK_GRAY,
    GRAY,
    LIGHT_GRAY,
    LIGHT_GREEN,
    DARK_GREEN,
)[::-1]


def intra_decile_label(
    fraction: float, decile: str, outcome: str, decile_type: str
) -> str:
    """Label for a data point in the intra-decile chart for hovercards.

    :param fraction: Share of the decile experiencing the outcome.
    :type fraction: float
    :param decile: Decile number as a string, or "All".
    :type decile: str
    :param outcome: Outcome, e.g. "Gain more than 5%".
    :type outcome: str
    :return: String representation of the hovercard label.
    :rtype: str
    """
    res = "{:.0%}".format(fraction) + " of "  # x% of
    if decile == "All":
        res += "all people "
    else:
        res += (
            "people in the " + ordinal(int(decile)) + f" {decile_type} decile "
        )
    if outcome == "No change":
        return res + "experience no change"
    else:
        return res + outcome.lower() + " of their income"


def single_intra_decile_graph(df: pd.DataFrame) -> go.Figure:
    """Single intra-decile graph, for either by-decile or overall.

    :param df: DataFrame with intra-decile or intra-overall data.
    :type df: pd.DataFrame
    :return: Plotly bar chart.
    :rtype: go.Figure
    """
    fig = px.bar(
        df,
        x="fraction",
        y="decile",
        color="outcome",
        custom_data=["hover"],
        color_discrete_sequence=INTRA_DECILE_COLORS,
        orientation="h",
    )
    add_custom_hovercard(fig)
    return fig


def intra_decile_chart(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
    decile_type: str = "income",
) -> dict:
    """Full intra-decile chart, including a top bar for overall.

    :param baseline: Baseline simulation.
    :type baseline: Microsimulation
    :param reformed: Reform simulation.
    :type reformed: Microsimulation
    :return: JSON representation of Plotly intra-decile chart.
    :rtype: dict
    """
    df = intra_decile_graph_data(
        baseline, reformed, config, decile_type=decile_type
    )
    df["hover"] = df.apply(
        lambda x: intra_decile_label(
            x.fraction, x.decile, x.outcome, decile_type
        ),
        axis=1,
    )
    # Create the decile figure first, then the total to go above it.
    decile_fig = single_intra_decile_graph(df[df.decile != "All"])
    total_fig = single_intra_decile_graph(df[df.decile == "All"])
    fig = make_subplots(
        rows=2,
        cols=1,
        shared_xaxes=True,
        row_heights=[1, 10],
        vertical_spacing=0.05,
        x_title="Population share",
        y_title=f"{'Income' if decile_type == 'income' else 'Wealth'} decile",
    )
    fig.update_xaxes(showgrid=False, tickformat=",.0%")
    fig.add_traces(total_fig.data, 1, 1)
    fig.add_traces(decile_fig.data, 2, 1)
    fig.update_layout(
        barmode="stack",
        title=f"Distribution of gains and losses by {decile_type} decile",
    )
    for i in range(5):
        fig.data[i].showlegend = False
    return formatted_fig_json(fig)
