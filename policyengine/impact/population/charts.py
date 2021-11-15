from typing import Tuple, Type
from microdf import MicroSeries
from policyengine.impact.population.metrics import poverty_rate, pct_change
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np
from openfisca_tools import Microsimulation
import pandas as pd
from policyengine.utils import charts
from policyengine.utils.general import PolicyEngineResultsConfig


def decile_chart(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
) -> Tuple[dict, dict]:
    """Chart of average net effect of a reform by income decile.

    :param baseline: Baseline microsimulation.
    :type baseline: Microsimulation
    :param reformed: Reform microsimulation.
    :type reformed: Microsimulation
    :return: Decile charts (relative and absolute) as JSON representations of Plotly charts.
    :rtype: Tuple[dict, dict]
    """
    income = baseline.calc(
        config.household_net_income_variable, map_to="person"
    )
    equiv_income = baseline.calc(
        config.equiv_household_net_income_variable, map_to="person"
    )
    gain = (
        reformed.calc(config.household_net_income_variable, map_to="person")
        - income
    )
    rel_agg_changes = (
        (
            gain.groupby(equiv_income.decile_rank()).sum()
            / income.groupby(equiv_income.decile_rank()).sum()
        )
        .round(3)
        .astype(float)
    )
    mean_abs_changes = (
        gain.groupby(equiv_income.decile_rank()).sum()
        / income.groupby(equiv_income.decile_rank()).count()
    ).round()
    df = pd.DataFrame(
        {
            "Decile": rel_agg_changes.index,
            "Relative change": rel_agg_changes.values,
            "Average change": mean_abs_changes.values,
        }
    )
    rel_fig = (
        px.bar(df, x="Decile", y="Relative change")
        .update_layout(
            title="Change to net income by decile",
            xaxis_title="Equivalised disposable income decile",
            yaxis_title="Percentage change",
            yaxis_tickformat=",.1%",
            showlegend=False,
            xaxis_tickvals=list(range(1, 11)),
        )
        .update_traces(marker_color=charts.BLUE)
    )
    abs_fig = (
        px.bar(df, x="Decile", y="Average change")
        .update_layout(
            title="Change to net income by decile",
            xaxis_title="Equivalised disposable income decile",
            yaxis_title="Average change",
            yaxis_tickprefix="£",
            yaxis_tickformat=",",
            showlegend=False,
            xaxis_tickvals=list(range(1, 11)),
        )
        .update_traces(marker_color=charts.BLUE)
    )
    charts.add_zero_line(rel_fig)
    charts.add_zero_line(abs_fig)
    return charts.formatted_fig_json(rel_fig), charts.formatted_fig_json(
        abs_fig
    )


def pov_chg(
    baseline: Microsimulation,
    reformed: Microsimulation,
    criterion: str,
    config: Type[PolicyEngineResultsConfig],
) -> float:
    """Calculate change in poverty rates.

    :param baseline: Baseline simulation.
    :type baseline: Microsimulation
    :param reform: Reform simulation.
    :type reform: Microsimulation
    :param criterion: Filter for each simulation.
    :type criterion: str
    :return: Percentage (not percentage point) difference in poverty rates.
    :rtype: float
    """
    return pct_change(
        poverty_rate(baseline, criterion, config),
        poverty_rate(reformed, criterion, config),
    )


def poverty_chart(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    """Chart of poverty impact by age group and overall.

    :param baseline: Baseline microsimulation.
    :type baseline: Microsimulation
    :param reformed: Reform microsimulation.
    :type reformed: Microsimulation
    :return: JSON representation of Plotly chart with poverty impact for:
        - Children (under 18)
        - Working age adults (18 to State Pension age)
        - Pensioners (State Pension age and above)
        - Overall
    :rtype: dict
    """
    df = pd.DataFrame(
        {
            "group": ["Child", "Working-age", "Senior", "All"],
            "pov_chg": [
                pov_chg(baseline, reformed, i, config)
                for i in [
                    config.child_variable,
                    config.working_age_variable,
                    config.senior_variable,
                    config.person_variable,
                ]
            ],
        }
    )
    df["abs_chg_str"] = df.pov_chg.abs().map("{:.1%}".format)
    df["label"] = (
        np.where(df.group == "All", "Total", df.group)
        + " poverty "
        + np.where(
            df.abs_chg_str == "0.0%",
            "does not change",
            (np.where(df.pov_chg < 0, "falls ", "rises ") + df.abs_chg_str),
        )
    )
    fig = px.bar(
        df,
        x="group",
        y="pov_chg",
        custom_data=["label"],
        labels={"group": "Group", "pov_chg": "Poverty rate change"},
    )
    fig.update_layout(
        title="Poverty impact by age",
        xaxis_title=None,
        yaxis=dict(title="Percent change", tickformat=",.1%"),
    )
    fig.update_traces(marker_color=charts.BLUE)
    charts.add_custom_hovercard(fig)
    charts.add_zero_line(fig)
    return charts.formatted_fig_json(fig)


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
        reformed.calc(config.net_income_variable).sum()
        - baseline.calc(config.net_income_variable).sum()
    )


def population_waterfall_chart(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    """Waterfall chart showing a reform's budgetary impact.

    :param baseline: Baseline simulation.
    :type baseline: Microsimulation
    :param reformed: Reform simulation.
    :type reformed: Microsimulation
    :return: JSON representation of Plotly chart with waterfall chart.
    :rtype: dict
    """
    return charts.waterfall_chart(baseline, reformed, config)


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
        config.equiv_household_net_income_variable, map_to="person"
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
    charts.DARK_GRAY,
    charts.GRAY,
    charts.LIGHT_GRAY,
    charts.LIGHT_GREEN,
    charts.DARK_GREEN,
)[::-1]


def intra_decile_label(fraction: float, decile: str, outcome: str) -> str:
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
        res += "people in the " + charts.ordinal(int(decile)) + " decile "
    if outcome == "No change":
        return res + "experience no change"
    else:
        return res + outcome.lower()


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
    charts.add_custom_hovercard(fig)
    return fig


def intra_decile_chart(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    """Full intra-decile chart, including a top bar for overall.

    :param baseline: Baseline simulation.
    :type baseline: Microsimulation
    :param reformed: Reform simulation.
    :type reformed: Microsimulation
    :return: JSON representation of Plotly intra-decile chart.
    :rtype: dict
    """
    df = intra_decile_graph_data(baseline, reformed, config)
    df["hover"] = df.apply(
        lambda x: intra_decile_label(x.fraction, x.decile, x.outcome), axis=1
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
        y_title="Income decile",
    )
    fig.update_xaxes(showgrid=False, tickformat=",.0%")
    fig.add_traces(total_fig.data, 1, 1)
    fig.add_traces(decile_fig.data, 2, 1)
    fig.update_layout(
        barmode="stack",
        title="Distribution of gains and losses",
    )
    for i in range(5):
        fig.data[i].showlegend = False
    return charts.formatted_fig_json(fig)
