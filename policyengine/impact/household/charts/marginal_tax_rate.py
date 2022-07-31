from typing import Callable, Type
import numpy as np
from openfisca_tools import IndividualSim
from policyengine.country.results_config import PolicyEngineResultsConfig
from policyengine.impact.utils import *
import plotly.express as px
import pandas as pd
import plotly.graph_objects as go
from .budget import shade_cliffs, LABELS, COLOR_MAP, add_you_are_here

DEBUG_MODE = False

DEBUG_VARIABLES = [
    "ssi",
]


def mtr_hover_label(
    earnings: float,
    baseline_mtr: float,
    reform_mtr: float,
    tax_baseline,
    tax_reform,
    benefits_baseline,
    benefits_reform,
    config: Type[PolicyEngineResultsConfig],
) -> str:
    earnings_str = f"{config.currency}{round(earnings):,}"

    def pct_formatter(x):
        return str(round(x * 1000) / 10) + "%"

    def pp_formatter(x):
        return str(round(x * 1000) / 10) + "pp"

    mtr_change = describe_change(
        baseline_mtr, reform_mtr, pct_formatter, pp_formatter
    )
    tax_change = describe_change(
        tax_baseline, tax_reform, pct_formatter, pp_formatter
    )
    benefits_change = describe_change(
        benefits_baseline, benefits_reform, pct_formatter, pp_formatter
    )
    return f"<b>At {earnings_str} employment income:<br>Your MTR {mtr_change}</b><br><br>Tax MTR {tax_change}<br>Benefits MTR {benefits_change}"


def get_mtr(x, y):
    return 1 - ((y[1:] - y[:-1]) / (x[1:] - x[:-1]))


def mtr_chart(
    baseline: IndividualSim,
    reformed: IndividualSim,
    show_difference: bool,
    config: Type[PolicyEngineResultsConfig],
    has_reform: bool = True,
    original_total_income: float = None,
) -> str:
    """Produces line chart with employment income on the x axis and marginal
    tax rate on the y axis, for baseline and reform simulations.
    :param baseline: Baseline simulation.
    :type baseline: IndividualSim
    :param reformed: Reform simulation.
    :type reformed: IndividualSim
    :return: Representation of the marginal tax rate plotly chart as a JSON
        string.
    :rtype: str
    """
    earnings = baseline.calc(config.total_income_variable).sum(axis=0)
    baseline_net = baseline.calc(config.household_net_income_variable).sum(
        axis=0
    )
    if has_reform:
        reform_net = reformed.calc(config.household_net_income_variable).sum(
            axis=0
        )

    total_income = baseline.calc(config.total_income_variable).sum(axis=0)
    # Find the x-point on the chart which is the current situation
    i = (total_income < original_total_income).sum()

    if has_reform:
        baseline_mtr = get_mtr(earnings, baseline_net)
        reform_mtr = get_mtr(earnings, reform_net)
    else:
        baseline_mtr = [get_mtr(earnings, baseline_net)[i]] * (
            len(baseline_net) - 1
        )
        reform_mtr = get_mtr(earnings, baseline_net)
    variable_mtrs = {}

    for explaining_variable, inverted, name in zip(
        (
            config.tax_variable,
            config.benefit_variable,
        ),
        (False, True, False),
        (
            "tax",
            "benefits",
        ),
    ):
        baseline_values = baseline.calc(explaining_variable).sum(axis=0)
        reform_values = (
            reformed.calc(explaining_variable).sum(axis=0)
            if has_reform
            else baseline_values
        )
        multiplier = 1 if inverted else -1
        addition = -1 if inverted else 1
        if has_reform:
            variable_mtrs[name + "_baseline"] = (
                get_mtr(earnings, baseline_values) * multiplier + addition
            )
        else:
            variable_mtrs[name + "_baseline"] = [
                (get_mtr(earnings, baseline_values) * multiplier + addition)[i]
            ] * (len(total_income) - 1)
        variable_mtrs[name + "_reform"] = (
            get_mtr(earnings, reform_values) * multiplier + addition
        )
    inverted = False
    if DEBUG_MODE:
        explainer_names = []
        for variable in DEBUG_VARIABLES:
            baseline_values = baseline.calc(variable).sum(axis=0)
            multiplier = 1 if inverted else -1
            addition = -1 if inverted else 1
            name = (
                baseline.simulation.tax_benefit_system.variables[
                    variable
                ].label
                or variable
            )
            explainer_names += [name]
            variable_mtrs[name] = (
                get_mtr(earnings, baseline_values) * multiplier + addition
            )
    df = pd.DataFrame(
        {
            "Earnings": earnings[:-1].round(0),
            "Baseline": baseline_mtr,
            "Reform": reform_mtr,
            **variable_mtrs,
        }
    )
    if not has_reform:
        df["Marginal tax rate"] = df["Baseline"]
    df["hover"] = df.apply(
        lambda x: mtr_hover_label(
            x.Earnings,
            x.Baseline,
            x.Reform,
            x.tax_baseline,
            x.tax_reform,
            x.benefits_baseline,
            x.benefits_reform,
            config,
        ),
        axis=1,
    )
    if not has_reform:
        df["Marginal tax rate"] = df["Reform"]
    df["Difference"] = df["Reform"] - df["Baseline"]
    if show_difference:
        y_fig = "Difference"
        d_title = "Difference in marginal tax rate by employment income"
        y_title = "Difference in marginal tax rate"
    else:
        y_fig = (
            ["Baseline", "Reform"]
            if has_reform
            else ["Marginal tax rate"]
            + (explainer_names if DEBUG_MODE else [])
        )
        d_title = "Marginal tax rate by employment income"
        y_title = "Marginal tax rate"
    line_chart = px.line(
        df,
        x="Earnings",
        y=y_fig,
        labels=dict(LABELS, value="Marginal tax rate"),
        color_discrete_map=COLOR_MAP,
        custom_data=["hover"],
        line_shape="hv",
    )
    # Shade baseline and reformed net income cliffs.
    ymax = df[y_fig].max() * 1.05  # Add a buffer.
    fig = go.Figure()
    shade_cliffs(baseline, config, fig, GRAY, ymax)
    if has_reform:
        shade_cliffs(reformed, config, fig, BLUE, ymax)
    fig.add_traces(list(line_chart.select_traces()))
    add_you_are_here(fig, df.Earnings[i])
    add_zero_line(fig)
    add_custom_hovercard(fig)
    fig.update_layout(
        title=d_title,
        xaxis_title="Employment income",
        xaxis_tickprefix=config.currency,
        yaxis_tickformat=",.0%",
        yaxis_title=y_title,
        yaxis_range=(min(0, np.floor(df["Reform"].min() * 10) / 10), 1),
        xaxis_showgrid=False,
        yaxis_showgrid=False,
        legend_title=None,
    )
    if show_difference:
        fig.update_layout(
            yaxis_range=(min(0, np.floor(df[y_fig].min() * 10) / 10), 1),
        )
        fig.update_traces(line_color=BLUE)
    # Hide legend if there's no reform.
    if not has_reform and not DEBUG_MODE:
        fig.update_layout(showlegend=False)
    return formatted_fig_json(fig)
