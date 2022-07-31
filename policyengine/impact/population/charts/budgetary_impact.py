from typing import Tuple, Type, Union
import plotly.express as px
import numpy as np
from openfisca_tools import Microsimulation
import pandas as pd
from policyengine.impact.utils import *
from policyengine.country.results_config import PolicyEngineResultsConfig


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


def tax_benefit_waterfall_data(
    baseline: Microsimulation,
    reformed: Microsimulation,
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
    multipliers = [1, -1]
    effects = [
        float(
            (reformed.calc(var).sum() - baseline.calc(var).sum()) * multiplier
        )
        for var, multiplier in zip(GROUPS, multipliers)
    ]
    res = waterfall_data(effects, ["tax_variable", "benefit_variable"])
    res.label = res.label.map(POP_LABELS)
    return res


def hover_label(
    component: str,
    amount: float,
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
    # Net impact bars should match the title.
    res = component
    # Flip the amount for labeling population benefits and household taxes.
    if component == "Benefit outlays":
        amount *= -1
    # Round population estimates, not individual.
    abs_amount = round(abs(amount))
    abs_amount_display = config.currency + num(abs_amount)
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
    baseline: Microsimulation,
    reformed: Microsimulation,
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
    data = tax_benefit_waterfall_data(baseline, reformed, config)
    data["hover"] = data.apply(
        lambda x: hover_label(x.label, x.amount, config), axis=1
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
            "label": list(POP_LABELS.values()),
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
