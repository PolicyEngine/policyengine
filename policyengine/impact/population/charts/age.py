from typing import Type
import plotly.express as px
import numpy as np
from openfisca_tools import Microsimulation
import pandas as pd
from policyengine.impact.utils import *
from policyengine.country.results_config import PolicyEngineResultsConfig


def age_chart(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    """Generates a bar chart showing the impact of a reform by age.

    Args:
        baseline (Microsimulation): The baseline simulation.
        reformed (Microsimulation): The reformed simulation.
        config (Type[PolicyEngineResultsConfig]): The country metadata.

    Returns:
        dict: The Plotly JSON.
    """

    baseline_household_net_income = baseline.calc(
        config.household_net_income_variable,
        map_to="person",
    )
    reform_household_net_income = reformed.calc(
        config.household_net_income_variable,
        map_to="person",
    )
    age = baseline.calc("age")
    gain = reform_household_net_income - baseline_household_net_income
    gain_by_age = gain.groupby(age).sum() / gain.groupby(age).count()
    df = pd.DataFrame(
        {
            "Age": gain_by_age.index,
            "Average increase": gain_by_age.values,
        }
    )
    hover_labels = []
    for age, gain in zip(df.Age, df["Average increase"]):
        hover_labels += [
            f"<b>{int(age)}-year olds</b> see their household's net income <br>{'rise' if gain >= 0 else 'fall '} by <b>{config.currency}{abs(gain):,.0f}</b> on average."
        ]
    df["Label"] = hover_labels
    fig = (
        px.bar(
            df,
            x="Age",
            y="Average increase",
            custom_data=["Label"],
        )
        .update_layout(
            title="Average net income increase by age",
            yaxis_tickformat=f",.0f",
            yaxis_tickprefix=config.currency,
            xaxis_tickvals=list(range(0, 100, 10)),
        )
        .update_traces(
            marker_color=np.where(
                df["Average increase"] > 0, DARK_GREEN, GRAY
            ),
            hovertemplate="%{customdata[0]}",
        )
    )
    add_zero_line(fig)
    return formatted_fig_json(fig)
