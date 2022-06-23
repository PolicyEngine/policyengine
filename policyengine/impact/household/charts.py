from typing import Callable, Type
import numpy as np
from openfisca_uk import IndividualSim
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.utils import charts
import plotly.express as px
import pandas as pd
import plotly.graph_objects as go


COLOR_MAP = {
    "Baseline": charts.GRAY,
    "Reform": charts.BLUE,
    "Marginal tax rate": charts.BLUE,
    "Net income": charts.BLUE,
}


LABELS = dict(
    variable="Policy",
    employment_income="Employment income",
)

DEBUG_MODE = False

DEBUG_VARIABLES = [
    "ssi",
]


def cliff_gaps(
    sim: IndividualSim, config: Type[PolicyEngineResultsConfig]
) -> list:
    """Identifies the employment income boundaries of net income cliffs.

    :param sim: Simulation.
    :type baseline: IndividualSim
    :param config: Configuration.
    :type config: Type[PolicyEngineResultsConfig]
    :return: List of lists with each containing the start and end of a cliff.
    :rtype: list
    """
    employment_income = sim.calc(config.total_income_variable)[0]
    net_income = sim.calc(config.household_net_income_variable)[0]
    diffs = np.diff(net_income, append=np.inf)
    cliffs = np.where(diffs < 0)[0]
    start = []
    end = []
    for cliff in cliffs:
        employment_income_before_cliff = employment_income[cliff]
        # Skip if embedded in a larger cliff.
        if len(end) > 0:
            if employment_income_before_cliff < end[-1]:
                continue
        net_income_before_cliff = net_income[cliff]
        ix_first_exceed_cliff = np.argmax(net_income > net_income_before_cliff)
        employment_income_after_cliff = employment_income[
            ix_first_exceed_cliff
        ]
        start.append(employment_income_before_cliff)
        end.append(employment_income_after_cliff)
    return list(zip(start, end))


def shade_cliffs(
    sim: IndividualSim,
    config: Type[PolicyEngineResultsConfig],
    fig: go.Figure,
    fillcolor: str,
    ymax: float,
) -> None:
    """Shades the cliffs in a net income or MTR chart.

    :param sim: Simulation.
    :type baseline: IndividualSim
    :param config: Configuration.
    :type config: Type[PolicyEngineResultsConfig]
    :param fig: Plotly figure.
    :type fig: go.Figure
    :param fillcolor: Fill color.
    :type fillcolor: str
    :param ymax: Maximum y value.
    :type ymax: float
    :return: None
    :rtype: None
    """
    for cliff in cliff_gaps(sim, config):
        start = cliff[0]
        end = cliff[1]
        text = (
            "This household is worse off earning between "
            + config.currency
            + "{:,}".format(int(start))
            + " and "
            + config.currency
            + "{:,}".format(int(end))
        )
        fig.add_trace(
            go.Scatter(
                x=[start, start, end, end, start],
                y=[0, ymax, ymax, 0, 0],
                fill="toself",
                mode="lines",
                fillcolor=fillcolor,
                name="",
                text=text,
                opacity=0.1,
                line_width=0,
                showlegend=False,
            )
        )


def budget_chart(
    baseline: IndividualSim,
    reformed: IndividualSim,
    show_difference: bool,
    config: Type[PolicyEngineResultsConfig],
    has_reform: bool = True,
    original_total_income: float = None,
) -> str:
    """Produces line chart with employment income on the x axis and net income
    on the y axis, for baseline and reform simulations.
    :param baseline: Baseline simulation.
    :type baseline: IndividualSim
    :param reformed: Reform simulation.
    :type reformed: IndividualSim
    :return: Representation of the budget plotly chart as a JSON string.
    :rtype: str
    """
    variable_values = {}
    total_income = baseline.calc(config.total_income_variable).sum(axis=0)
    # Find the x-point on the chart which is the current situation
    i = (total_income < original_total_income).sum()
    for explaining_variable in (
        config.total_income_variable,
        config.tax_variable,
        config.benefit_variable,
    ):
        if has_reform:
            variable_values[explaining_variable + "_baseline"] = baseline.calc(
                explaining_variable
            ).sum(axis=0)
        else:
            variable_values[explaining_variable + "_baseline"] = [
                baseline.calc(explaining_variable).sum(axis=0)[i]
            ] * len(total_income)
        variable_values[explaining_variable + "_reform"] = reformed.calc(
            explaining_variable
        ).sum(axis=0)
    explainer_names = []
    if DEBUG_MODE:
        for variable in DEBUG_VARIABLES:
            baseline_values = baseline.calc(variable).sum(axis=0)
            name = (
                baseline.simulation.tax_benefit_system.variables[
                    variable
                ].label
                or variable
            )
            explainer_names += [name]
            variable_values[name] = baseline_values
            if has_reform:
                reform_values = reformed.calc(variable).sum(axis=0)
                explainer_names[-1] += " (baseline)"
                variable_values[name + " (baseline)"] = baseline_values
                del variable_values[name]
                explainer_names.append(f"{name} (reform)")
                variable_values[name + " (reform)"] = reform_values
    df = pd.DataFrame(
        {
            "Total income": baseline.calc(config.total_income_variable).sum(
                axis=0
            ),
            "Baseline": baseline.calc(
                config.household_net_income_variable
            ).sum(axis=0),
            "Reform": reformed.calc(config.household_net_income_variable).sum(
                axis=0
            ),
            **variable_values,
        }
    )
    original_net_income = (
        original_total_income
        + df[config.benefit_variable + "_baseline"][i]
        - df[config.tax_variable + "_baseline"][i]
    )
    df["hover"] = df.apply(
        lambda x: budget_hover_label(
            x["Total income"],
            x.Baseline if has_reform else original_net_income,
            x.Reform,
            x["Total income"] if has_reform else original_total_income,
            x["Total income"],
            x[config.tax_variable + "_baseline"],
            x[config.tax_variable + "_reform"],
            x[config.benefit_variable + "_baseline"],
            x[config.benefit_variable + "_reform"],
            config,
        ),
        axis=1,
    )
    if not has_reform:
        df["Net income"] = df["Baseline"]
    df["Difference"] = df["Reform"] - df["Baseline"]
    if show_difference:
        y_fig = "Difference"
        d_title = "Difference in net income by employment income"
        y_title = "Household net income difference"
    else:
        y_fig = (
            ["Baseline", "Reform"] + (explainer_names)
            if has_reform
            else ["Net income"] + (explainer_names)
        )
        d_title = "Net income by employment income"
        y_title = "Household net income"
    fig = go.Figure()
    # Shade baseline and reformed net income cliffs.
    ymax = df[y_fig].max().max() * 1.05  # Add a buffer.
    shade_cliffs(baseline, config, fig, charts.GRAY, ymax)
    shade_cliffs(reformed, config, fig, charts.BLUE, ymax)
    charts.add_zero_line(fig)
    add_you_are_here(fig, df["Total income"][i])
    line_chart = px.line(
        df.round(0),
        x="Total income",
        y=y_fig,
        labels=dict(LABELS, value="Net income"),
        color_discrete_map=COLOR_MAP,
        custom_data=["hover"],
    )
    fig.add_traces(list(line_chart.select_traces()))
    charts.add_custom_hovercard(fig)
    fig.update_layout(
        title=d_title,
        xaxis_title="Employment income",
        yaxis_title=y_title,
        xaxis_showgrid=False,
        yaxis_showgrid=False,
        yaxis_tickprefix=config.currency,
        xaxis_tickprefix=config.currency,
        yaxis_rangemode="tozero",
        legend_title=None,
    )
    if show_difference:
        fig.update_traces(line_color=charts.BLUE)
    # Hide legend if there's no reform.
    if not has_reform and not DEBUG_MODE:
        fig.update_layout(showlegend=False)
    return charts.formatted_fig_json(fig)


def add_you_are_here(fig: go.Figure, x):
    fig.add_shape(
        type="line",
        xref="x",
        yref="paper",
        x0=x,
        y0=0,
        x1=x,
        y1=1,
        line=dict(color="grey", width=1, dash="dash"),
    )


def describe_change(
    x: float,
    y: float,
    formatter: Callable = lambda x: x,
    change_formatter=lambda x: x,
    plural: bool = False,
) -> str:
    s = "" if plural else "s"
    if y > x:
        return f"rise{s} from {formatter(x)} to {formatter(y)} (+{change_formatter(y - x)})"
    elif y == x:
        return f"remain{s} at {formatter(x)}"
    else:
        return f"fall{s} from {formatter(x)} to {formatter(y)} (-{change_formatter(x - y)})"


def budget_hover_label(
    earnings: float,
    baseline_budget: float,
    reform_budget: float,
    total_income_baseline: float,
    total_income_reform: float,
    tax_baseline: float,
    tax_reform,
    benefits_baseline,
    benefits_reform,
    config: Type[PolicyEngineResultsConfig],
) -> str:
    def formatter(x):
        return f"{config.currency}{round(x):,}"

    earnings_str = formatter(earnings)
    budget_change = describe_change(
        baseline_budget, reform_budget, formatter, formatter
    )
    total_income_change = describe_change(
        total_income_baseline, total_income_reform, formatter, formatter
    )
    tax_change = describe_change(
        tax_baseline, tax_reform, formatter, formatter
    )
    benefits_change = describe_change(
        benefits_baseline, benefits_reform, formatter, formatter, plural=True
    )
    return f"<b>At {earnings_str} employment income:<br>Your net income {budget_change} </b><br><br>Market income {total_income_change}<br>Tax {tax_change}<br>Benefits {benefits_change}"


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
    reform_net = reformed.calc(config.household_net_income_variable).sum(
        axis=0
    )

    total_income = baseline.calc(config.total_income_variable).sum(axis=0)
    # Find the x-point on the chart which is the current situation
    i = (total_income < original_total_income).sum()

    if has_reform:
        baseline_mtr = get_mtr(earnings, baseline_net)
    else:
        baseline_mtr = [get_mtr(earnings, baseline_net)[i]] * (
            len(baseline_net) - 1
        )
    reform_mtr = get_mtr(earnings, reform_net)
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
        reform_values = reformed.calc(explaining_variable).sum(axis=0)
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
    shade_cliffs(baseline, config, fig, charts.GRAY, ymax)
    shade_cliffs(reformed, config, fig, charts.BLUE, ymax)
    fig.add_traces(list(line_chart.select_traces()))
    add_you_are_here(fig, df.Earnings[i])
    charts.add_zero_line(fig)
    charts.add_custom_hovercard(fig)
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
        fig.update_traces(line_color=charts.BLUE)
    # Hide legend if there's no reform.
    if not has_reform and not DEBUG_MODE:
        fig.update_layout(showlegend=False)
    return charts.formatted_fig_json(fig)


def household_waterfall_chart(
    baseline: IndividualSim,
    reformed: IndividualSim,
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    return charts.waterfall_chart(baseline, reformed, config)
