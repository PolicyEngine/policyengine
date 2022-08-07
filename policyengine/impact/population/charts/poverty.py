from typing import Tuple, Type
import plotly.express as px
import numpy as np
from openfisca_tools import Microsimulation
import pandas as pd
from policyengine.impact.utils import *
from policyengine.impact.population.metrics import (
    deep_poverty_rate,
    poverty_rate,
)
from policyengine.country.results_config import PolicyEngineResultsConfig


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


def deep_pov_chg(
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
        deep_poverty_rate(baseline, criterion, config),
        deep_poverty_rate(reformed, criterion, config),
    )


def poverty_chart(
    baseline: Microsimulation,
    reformed: Microsimulation,
    is_deep: bool,
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
    if is_deep:
        f_pov_chg = deep_pov_chg
        f_poverty_rate = deep_poverty_rate
        metric_name = "Deep poverty"
    else:
        f_pov_chg = pov_chg
        f_poverty_rate = poverty_rate
        metric_name = "Poverty"
    df = pd.DataFrame(
        {
            "group": ["Child", "Working-age", "Senior", "All"],
            "pov_chg": [
                f_pov_chg(baseline, reformed, i, config)
                for i in [
                    config.child_variable,
                    config.working_age_variable,
                    config.senior_variable,
                    config.person_variable,
                ]
            ],
            "baseline": [
                f_poverty_rate(baseline, i, config)
                for i in [
                    config.child_variable,
                    config.working_age_variable,
                    config.senior_variable,
                    config.person_variable,
                ]
            ],
            "reformed": [
                f_poverty_rate(reformed, i, config)
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
        "<b>"
        + np.where(df.group == "All", "Total", df.group)
        + " "
        + metric_name.lower()
        + " "
        + np.where(
            df.abs_chg_str == "0.0%",
            "does not change",
            (
                np.where(df.pov_chg < 0, "falls ", "rises ")
                + df.abs_chg_str
                + "</b><br> from "
                + df.baseline.map("{:.1%}".format)
                + " to "
                + df.reformed.map("{:.1%}".format)
            ),
        )
    )
    fig = px.bar(
        df,
        x="group",
        y="pov_chg",
        custom_data=["label"],
        labels={"group": "Group", "pov_chg": metric_name + " rate change"},
    )
    fig.update_layout(
        title=metric_name + " impact by age group",
        xaxis_title=None,
        yaxis=dict(title="Percent change", tickformat=",~%"),
    )
    fig.update_traces(marker_color=np.where(df.pov_chg < 0, DARK_GREEN, GRAY))
    add_custom_hovercard(fig)
    add_zero_line(fig)
    return formatted_fig_json(fig)
