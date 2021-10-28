from typing import Callable, Type
from openfisca_uk import IndividualSim
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.utils import charts
import plotly.express as px
import pandas as pd

COLOR_MAP = {
    "Baseline": charts.GRAY,
    "Reform": charts.BLUE,
}

LABELS = dict(
    variable="Policy",
    employment_income="Employment income",
)


def budget_chart(
    baseline: IndividualSim,
    reformed: IndividualSim,
    config: Type[PolicyEngineResultsConfig],
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
    for explaining_variable in (
        "total_income",
        "tax",
        "benefits",
    ):
        variable_values[explaining_variable + "_baseline"] = baseline.calc(
            explaining_variable
        ).sum(axis=0)
        variable_values[explaining_variable + "_reform"] = reformed.calc(
            explaining_variable
        ).sum(axis=0)
    df = pd.DataFrame(
        {
            "employment_income": baseline.calc(config.earnings_variable).sum(
                axis=0
            ),
            "Baseline": baseline.calc(config.net_income_variable).sum(axis=0),
            "Reform": reformed.calc(config.net_income_variable).sum(axis=0),
            **variable_values,
        }
    )
    df["hover"] = df.apply(
        lambda x: budget_hover_label(
            x.employment_income,
            x.Baseline,
            x.Reform,
            x.total_income_baseline,
            x.total_income_reform,
            x.tax_baseline,
            x.tax_reform,
            x.benefits_baseline,
            x.benefits_reform,
        ),
        axis=1,
    )
    fig = px.line(
        df.round(0),
        x=config.earnings_variable,
        y=["Baseline", "Reform"],
        labels=dict(LABELS, value="Net income"),
        color_discrete_map=COLOR_MAP,
        custom_data=["hover"],
    )
    charts.add_custom_hovercard(fig)
    fig.update_layout(
        title="Net income by employment income",
        xaxis_title="Employment income",
        yaxis_title="Household net income",
        yaxis_tickprefix="£",
        xaxis_tickprefix="£",
        legend_title=None,
    )
    return charts.formatted_fig_json(fig)


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
) -> str:
    def formatter(x):
        return f"£{round(x):,}"

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
    return f"<b>At {earnings_str} employment income:<br>Your net income {budget_change} </b><br><br>Total income {total_income_change}<br>Tax {tax_change}<br>Benefits {benefits_change}"


def mtr_hover_label(
    earnings: float,
    baseline_mtr: float,
    reform_mtr: float,
    tax_baseline,
    tax_reform,
    benefits_baseline,
    benefits_reform,
) -> str:
    earnings_str = f"£{round(earnings):,}"

    def pct_formatter(x):
        return str(round(x * 100)) + "%"

    def pp_formatter(x):
        return str(round(x * 100)) + "pp"

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


def mtr_chart(
    baseline: IndividualSim,
    reformed: IndividualSim,
    config: Type[PolicyEngineResultsConfig],
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
    earnings = baseline.calc(config.earnings_variable).sum(axis=0)
    baseline_net = baseline.calc(config.net_income_variable).sum(axis=0)
    reform_net = reformed.calc(config.net_income_variable).sum(axis=0)

    def get_mtr(x, y):
        return 1 - ((y[1:] - y[:-1]) / (x[1:] - x[:-1]))

    baseline_mtr = get_mtr(earnings, baseline_net)
    reform_mtr = get_mtr(earnings, reform_net)
    variable_mtrs = {}
    for explaining_variable, inverted in zip(
        (
            "tax",
            "benefits",
        ),
        (False, True),
    ):
        baseline_values = baseline.calc(explaining_variable).sum(axis=0)
        reform_values = reformed.calc(explaining_variable).sum(axis=0)
        multiplier = 1 if inverted else -1
        addition = -1 if inverted else 1
        variable_mtrs[explaining_variable + "_baseline"] = (
            get_mtr(earnings, baseline_values) * multiplier + addition
        )
        variable_mtrs[explaining_variable + "_reform"] = (
            get_mtr(earnings, reform_values) * multiplier + addition
        )
    df = pd.DataFrame(
        {
            "employment_income": earnings[:-1].round(0),
            "Baseline": baseline_mtr,
            "Reform": reform_mtr,
            **variable_mtrs,
        }
    )
    df["hover"] = df.apply(
        lambda x: mtr_hover_label(
            x.employment_income,
            x.Baseline,
            x.Reform,
            x.tax_baseline,
            x.tax_reform,
            x.benefits_baseline,
            x.benefits_reform,
        ),
        axis=1,
    )
    fig = px.line(
        df,
        x="employment_income",
        y=["Baseline", "Reform"],
        labels=dict(LABELS, value="Marginal tax rate"),
        color_discrete_map=COLOR_MAP,
        line_shape="hv",
        custom_data=["hover"],
    )
    charts.add_custom_hovercard(fig)
    fig.update_layout(
        title="Marginal tax rate by employment income",
        xaxis_title="Employment income",
        xaxis_tickprefix="£",
        yaxis_tickformat=",.0%",
        yaxis_title="Marginal tax rate",
        legend_title=None,
    )
    return charts.formatted_fig_json(fig)


def household_waterfall_chart(
    baseline: IndividualSim,
    reformed: IndividualSim,
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    return charts.waterfall_chart(baseline, reformed, config)
