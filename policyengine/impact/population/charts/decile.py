from typing import Tuple, Type
import plotly.express as px
import numpy as np
from openfisca_tools import Microsimulation
import pandas as pd
from policyengine.impact.utils import *
from policyengine.country.results_config import PolicyEngineResultsConfig


def individual_decile_chart(
    df: pd.DataFrame,
    metric: str,
    config: Type[PolicyEngineResultsConfig],
    decile_type: str,
) -> dict:
    """Chart of average or relative net effect of a reform by income decile.

    :param df: DataFrame with columns for Decile, Relative change, and Average change.
    :type df: pd.DataFrame
    :param metric: "Relative change" or "Average change".
    :type metric: str
    :return: Decile chart (relative or absolute) as a JSON representation of a Plotly chart.
    :rtype: dict
    """
    fig = (
        px.bar(df, x="Decile", y=metric)
        .update_layout(
            title=f"Change to net income by {decile_type} decile",
            xaxis_title=f"{'Equivalised disposable income' if decile_type == 'income' else 'Wealth'} decile",
            yaxis_title="Change to household net income",
            yaxis_tickformat=",~%" if metric == "Relative change" else ",",
            yaxis_tickprefix=""
            if metric == "Relative change"
            else config.currency,
            showlegend=False,
            xaxis_tickvals=list(range(1, 11)),
        )
        .update_traces(marker_color=np.where(df[metric] > 0, DARK_GREEN, GRAY))
    )
    add_zero_line(fig)
    return formatted_fig_json(fig)


def decile_chart(
    baseline: Microsimulation,
    reformed: Microsimulation,
    config: Type[PolicyEngineResultsConfig],
    decile_type: str = "income",
) -> Tuple[dict, dict]:
    """Chart of average net effect of a reform by income decile.

    :param baseline: Baseline microsimulation.
    :type baseline: Microsimulation
    :param reformed: Reform microsimulation.
    :type reformed: Microsimulation
    :return: Decile charts (relative and absolute) as JSON representations of Plotly charts.
    :rtype: Tuple[dict, dict]
    """
    baseline_household_net_income = baseline.calc(
        config.household_net_income_variable
    )
    baseline_household_equiv_income = baseline.calc(
        config.equiv_household_net_income_variable
        if decile_type == "income"
        else config.household_wealth_variable
    )
    reform_household_net_income = reformed.calc(
        config.household_net_income_variable
    )
    household_gain = (
        reform_household_net_income - baseline_household_net_income
    )
    household_size = baseline.calc("people", map_to=config.household_entity)
    # Group households in decile such that each decile has the same
    # number of people
    baseline_household_equiv_income.weights *= household_size
    household_decile = baseline_household_equiv_income.decile_rank()
    agg_gain_by_decile = household_gain.groupby(household_decile).sum()
    households_by_decile = baseline_household_net_income.groupby(
        household_decile
    ).count()
    baseline_agg_income_by_decile = baseline_household_net_income.groupby(
        household_decile
    ).sum()
    reform_agg_income_by_decile = reform_household_net_income.groupby(
        household_decile
    ).sum()
    baseline_mean_income_by_decile = (
        baseline_agg_income_by_decile / households_by_decile
    )
    reform_mean_income_by_decile = (
        reform_agg_income_by_decile / households_by_decile
    )
    # Total decile gain / total decile income.
    rel_agg_changes = (
        (agg_gain_by_decile / baseline_agg_income_by_decile)
        .round(3)
        .astype(float)
    )
    # Total gain / number of households by decile.
    mean_gain_by_decile = (agg_gain_by_decile / households_by_decile).round()
    # Write out hovercard.
    decile_number = rel_agg_changes.index
    verb = np.where(
        mean_gain_by_decile > 0,
        "rise",
        np.where(mean_gain_by_decile < 0, "fall", "remain"),
    )
    label_prefix = (
        "<b>Household incomes in the "
        + pd.Series(decile_number)
        .astype(int)
        .reset_index(drop=True)
        .apply(ordinal)
        + " decile <br>"
        + pd.Series(verb).reset_index(drop=True)
        + " by an average of "
    )
    label_value_abs = (
        pd.Series(np.abs(mean_gain_by_decile))
        .apply(lambda x: f"{config.currency}{x:,.0f}")
        .reset_index(drop=True)
    )
    label_value_rel = (
        pd.Series(rel_agg_changes)
        .apply(lambda x: f"{x:.1%}")
        .reset_index(drop=True)
    )
    label_suffix = (
        f"</b><br>from {config.currency}"
        + pd.Series(baseline_mean_income_by_decile)
        .apply(lambda x: f"{x:,.0f}")
        .reset_index(drop=True)
        + f" to {config.currency}"
        + pd.Series(reform_mean_income_by_decile)
        .apply(lambda x: f"{x:,.0f}")
        .reset_index(drop=True)
        + " per year"
    )
    label_rel = label_prefix + label_value_rel + label_suffix
    label_abs = label_prefix + label_value_abs + label_suffix
    """
    Examples:
    - Household incomes in the 1st decile rise by an average of $1, from $1,000 to $1,001 per year
    - Household incomes in the 2nd decile fall by an average of $1, from $1,000 to $999 per year
    - Household incomes in the 3rd decile remain at $1,000 per year
    """
    df = pd.DataFrame(
        {
            "Decile": decile_number,
            "Relative change": rel_agg_changes.values,
            "Average change": mean_gain_by_decile.values,
            "label_rel": label_rel,
            "label_abs": label_abs,
        }
    )
    return (
        individual_decile_chart(df, "Relative change", config, decile_type),
        individual_decile_chart(df, "Average change", config, decile_type),
    )
