from typing import Tuple, Type
import plotly.express as px
import numpy as np
from openfisca_tools import Microsimulation
import pandas as pd
from policyengine.impact.utils import *
from policyengine.country.results_config import PolicyEngineResultsConfig


def inequality_chart(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    equiv_income = baseline.calc(
        config.equiv_household_net_income_variable, map_to="person"
    )
    reform_equiv_income = reformed.calc(
        config.equiv_household_net_income_variable, map_to="person"
    )
    baseline_gini = equiv_income.gini()
    reform_gini = reform_equiv_income.gini()
    gini_change = reform_gini / baseline_gini - 1
    baseline_top_ten_pct_share = (
        equiv_income[equiv_income.decile_rank() == 10].sum()
        / equiv_income.sum()
    )
    reform_top_ten_pct_share = (
        reform_equiv_income[reform_equiv_income.decile_rank() == 10].sum()
        / reform_equiv_income.sum()
    )
    top_ten_pct_share_change = (
        reform_top_ten_pct_share / baseline_top_ten_pct_share - 1
    )
    baseline_top_one_pct_share = (
        equiv_income[equiv_income.percentile_rank() == 100].sum()
        / equiv_income.sum()
    )
    reform_top_one_pct_share = (
        reform_equiv_income[reform_equiv_income.percentile_rank() == 100].sum()
        / reform_equiv_income.sum()
    )
    top_one_pct_share_change = (
        reform_top_one_pct_share / baseline_top_one_pct_share - 1
    )
    df = pd.DataFrame(
        {
            "Metric": ["Gini index", f"Top 10% share", f"Top 1% share"],
            "Percent change": [
                gini_change,
                top_ten_pct_share_change,
                top_one_pct_share_change,
            ],
            "Baseline": [
                baseline_gini,
                baseline_top_ten_pct_share,
                baseline_top_one_pct_share,
            ],
            "Reform": [
                reform_gini,
                reform_top_ten_pct_share,
                reform_top_one_pct_share,
            ],
        }
    )
    df["pct_change_str"] = df["Percent change"].abs().map("{:.1%}".format)
    df["label"] = (
        "<b>"
        + df.Metric
        + " "
        + np.where(
            df.pct_change_str == "0.0%",
            "does not change",
            (
                np.where(df["Percent change"] < 0, "falls ", "rises ")
                + df.pct_change_str.astype(str)
            ),
        )
        + "</b><br> from "
        + np.where(
            df.Metric == "Gini index",
            df.Baseline.map("{:.3}".format).astype(str),
            df.Baseline.map("{:.1%}".format).astype(str),
        )
        + " to "
        + np.where(
            df.Metric == "Gini index",
            df.Reform.map("{:.3}".format).astype(str),
            df.Reform.map("{:.1%}".format).astype(str),
        )
    )
    fig = (
        px.bar(df, x="Metric", y="Percent change", custom_data=["label"])
        .update_layout(
            title="Income inequality impact",
            xaxis_title=None,
            yaxis_title="Percent change",
            yaxis_tickformat="~%",
        )
        .update_traces(
            marker_color=np.where(df["Percent change"] < 0, DARK_GREEN, GRAY)
        )
    )
    add_zero_line(fig)
    add_custom_hovercard(fig)
    return formatted_fig_json(fig)
