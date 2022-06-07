"""
Utility functions for formatting charts.
"""
from math import floor, log10
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import json
from openfisca_tools import (
    Microsimulation,
    IndividualSim,
)
from typing import Type, Union

from policyengine.utils.general import PolicyEngineResultsConfig
from io import StringIO


def plotly_json_to_fig(json):
    """Converts a JSON dict to a plotly figure.

    :param json: JSON dict.
    :type json: dict
    :return: Plotly figure.
    :rtype: go.Figure
    """
    return go.Figure(data=json["data"], layout=json["layout"])


def num(x: float) -> str:
    """Converts a number to a human-readable string, using the k/m/bn/tr suffixes after rounding to 2 significant figures."""

    if x < 0:
        return "-" + num(-x)
    if x < 1e3:
        return f"{x:.2f}"
    if x < 1e6:
        return f"{x / 1e3:.0f}k"
    if x < 1e9:
        return f"{x / 1e6:.0f}m"
    if x < 1e10:
        return f"{x / 1e9:.2f}bn"
    if x < 1e12:
        return f"{x / 1e9:.1f}bn"
    return f"{x / 1e12:.2f}tr"


WHITE = "#FFF"
BLUE = "#5091cc"
GRAY = "#BDBDBD"
DARK_GRAY = "#616161"
LIGHT_GRAY = "#F5F5F5"
LIGHT_GREEN = "#C5E1A5"
DARK_GREEN = "#558B2F"


def formatted_fig_json(fig: go.Figure) -> dict:
    """Formats figure with styling and returns as JSON.

    :param fig: Plotly figure.
    :type fig: go.Figure
    :return: Formatted plotly figure as a JSON dict.
    :rtype: dict
    """
    fig.update_xaxes(
        title_font=dict(size=16, color="black"), tickfont={"size": 14}
    )
    fig.update_yaxes(
        title_font=dict(size=16, color="black"), tickfont={"size": 14}
    )
    fig.update_layout(
        hoverlabel_align="right",
        font_family="Ubuntu",
        font_color="Black",
        title_font_size=20,
        plot_bgcolor="white",
        paper_bgcolor="white",
        hoverlabel=dict(font_family="Ubuntu"),
    )
    return json.loads(fig.to_json())


def bar_data(start: float, amount: float, label: str) -> pd.DataFrame:
    """Generates a pair of data points for a waterfall bar.

    :param start: Starting value of bar.
    :type start: float
    :param amount: Amount of bar.
    :type amount: float
    :return: DataFrame with two rows:
        - In the case of start and end (start + amount) being on the same side
        of zero, it will be one for the hidden white bar and one for the
        true value.
        - In the case of start and end being on opposite sides of zero, it will
        be one for the positive value and one for the negative value.
        Each row contains columns for value and color (which are specific to
        the row), and label and amount (which are the same for both rows).
    :rtype: pd.DataFrame
    """
    end = amount + start
    res = pd.DataFrame(index=[0, 1], columns=["value", "color"])
    amount_color = "positive" if amount > 0 else "negative"
    if start > 0:
        if end > 0:
            # Empty white space then a bar from start to end.
            res.iloc[0] = min(start, end), "blank"
            res.iloc[1] = abs(start - end), amount_color
        else:
            # Two bars for positive and negative sections.
            res.iloc[0] = start, amount_color
            res.iloc[1] = end, amount_color
    else:
        if end < 0:
            # Empty white space then a bar from start to end.
            res.iloc[0] = -abs(start - end), amount_color
            res.iloc[1] = max(start, end), "blank"
        else:
            # Two bars for positive and negative sections.
            res.iloc[0] = start, amount_color
            res.iloc[1] = end, amount_color
    res["label"] = label
    res["amount"] = amount
    return res


def waterfall_data(amounts: list, labels: list) -> pd.DataFrame:
    """Generates data for waterfall charts.

    :param amounts: List of amounts.
    :type amounts: list
    :param labels: List of labels corresponding to each amount.
    :type labels: list
    :return: DataFrame with two rows for each amount plus the total.
    :rtype: pd.DataFrame
    """
    l = []
    components = pd.DataFrame(dict(amount=amounts), index=labels)
    components.loc["total"] = dict(amount=components.amount.sum())
    components["start"] = [0] + components.amount.cumsum()[:-2].tolist() + [0]
    # Create two rows per component to include difference from zero.
    for index, row in components.iterrows():
        l.append(bar_data(row.start, row.amount, index))
    return pd.concat(l)


POP_LABELS = dict(
    tax_variable="Tax revenues",
    benefit_variable="Benefit outlays",
    total="Net impact",
)
HH_LABELS = dict(
    tax_variable="Your taxes",
    benefit_variable="Your benefits",
    total="Your net income",
)


def tax_benefit_waterfall_data(
    baseline: Union[Microsimulation, IndividualSim],
    reformed: Union[Microsimulation, IndividualSim],
    config: Type[PolicyEngineResultsConfig],
) -> pd.DataFrame:
    """Generates data for tax benefit waterfall charts.

    :param baseline: Baseline microsimulation.
    :type baseline: Union[Microsimulation, IndividualSim]
    :param reformed: Reformed microsimulation.
    :type reformed: Union[Microsimulation, IndividualSim]
    :return: DataFrame with two rows for each component plus the total.
    :rtype: pd.DataFrame
    """
    GROUPS = [config.tax_variable, config.benefit_variable]
    is_pop = isinstance(baseline, Microsimulation)
    multipliers = [1, -1] if is_pop else [-1, 1]
    effects = [
        float(
            (reformed.calc(var).sum() - baseline.calc(var).sum()) * multiplier
        )
        for var, multiplier in zip(GROUPS, multipliers)
    ]
    res = waterfall_data(effects, ["tax_variable", "benefit_variable"])
    if is_pop:
        res.label = res.label.map(POP_LABELS)
    else:
        res.label = res.label.map(HH_LABELS)
    return res


def hover_label(
    component: str,
    amount: float,
    is_pop: bool,
    config: Type[PolicyEngineResultsConfig],
) -> str:
    """Create a label for an individual point in a waterfall hovercard.

    :param component: Name of the component, e.g. "Tax revenues".
    :type component: str
    :param amount: Name of the component, e.g. "Tax revenues".
    :type amount: float
    :param is_pop: Whether the component is population- vs. household-level.
    :type is_pop: bool
    :return: Label for hovercard.
    :rtype: str
    """
    # Reset household net income label to match the headline.
    if component == "Your net income":
        component = "Your annual net income"
    # Net impact bars should match the title.
    res = component
    # Flip the amount for labeling population benefits and household taxes.
    if component in ["Benefit outlays", "Your taxes"]:
        amount *= -1
    # Round population estimates, not individual.
    abs_amount = round(abs(amount))
    abs_amount_display = (
        config.currency + num(abs_amount)
        if is_pop
        else f"{config.currency}{abs_amount:,}"
    )
    # Branch logic, starting with no change.
    # More special handling of the net impact to match the title.
    if amount == 0:
        if component == "Net impact":
            return "Reform has no budgetary impact"
        return res + " would not change"
    if amount > 0:
        if component == "Net impact":  # Population.
            return "Reform produces " + abs_amount_display + " net surplus"
        return res + " would rise by " + abs_amount_display
    if amount < 0:
        if component == "Net impact":  # Population.
            return "Reform produces " + abs_amount_display + " net cost"
        return res + " would fall by " + abs_amount_display


def waterfall_chart(
    baseline: Union[Microsimulation, IndividualSim],
    reformed: Union[Microsimulation, IndividualSim],
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    """Create a waterfall chart for tax and benefit changes.

    :param baseline: Baseline simulation.
    :type baseline: Union[Microsimulation, IndividualSim]
    :param reformed: Reform simulation.
    :type reformed: Union[Microsimulation, IndividualSim]
    :return: Waterfall chart as a JSON dict.
    :rtype: dict
    """
    is_pop = isinstance(baseline, Microsimulation)
    data = tax_benefit_waterfall_data(baseline, reformed, config)
    data["hover"] = data.apply(
        lambda x: hover_label(x.label, x.amount, is_pop, config), axis=1
    )
    fig = px.bar(
        data,
        "label",
        "value",
        "color",
        custom_data=["hover"],
        color_discrete_map=dict(
            blank=WHITE, negative=GRAY, positive=DARK_GREEN
        ),
        barmode="relative",
        category_orders={
            "label": list(POP_LABELS.values())
            if is_pop
            else list(HH_LABELS.values()),
            "color": ["blank", "negative", "positive"],
        },
    )
    add_custom_hovercard(fig)
    add_zero_line(fig)
    fig.update_layout(
        title="Budget breakdown",
        yaxis_title="Yearly amount",
        yaxis_tickprefix=config.currency,
        showlegend=False,
        xaxis_title=None,
    )
    return formatted_fig_json(fig)


def ordinal(n: int) -> str:
    """Create an ordinal number (1st, 2nd, etc.) from an integer.

    Source: https://stackoverflow.com/a/20007730/1840471

    :param n: Number.
    :type n: int
    :return: Ordinal number (1st, 2nd, etc.).
    :rtype: str
    """
    return "%d%s" % (
        n,
        "tsnrhtdd"[(n // 10 % 10 != 1) * (n % 10 < 4) * n % 10 :: 4],
    )


def add_custom_hovercard(fig: go.Figure) -> None:
    """Add a custom hovercard to the figure based on the first element of
    customdata, without the title to the right.

    :param fig: Plotly figure.
    :type fig: go.Figure
    """
    # Per https://stackoverflow.com/a/69430974/1840471.
    fig.update_traces(hovertemplate="%{customdata[0]}<extra></extra>")


def add_zero_line(fig: go.Figure) -> None:
    """Add a solid line across y=0.

    :param fig: Plotly figure.
    :type fig: go.Figure
    """
    fig.add_shape(
        type="line",
        xref="paper",
        yref="y",
        x0=0,
        y0=0,
        x1=1,
        y1=0,
        line=dict(color="grey", width=1),
    )
