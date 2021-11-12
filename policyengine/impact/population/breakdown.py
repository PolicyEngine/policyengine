from typing import Callable, Tuple
import numpy as np
from openfisca_tools.microsimulation import Microsimulation
from openfisca_tools.model_api import ReformType
import pandas as pd
import plotly.express as px
from policyengine.utils import charts


def get_spending(sim: Microsimulation, baseline: Microsimulation) -> float:
    return sim.calc("net_income").sum() - baseline.calc("net_income").sum()


def get_breakdown_and_chart_per_provision(
    reform: ReformType,
    provisions: Tuple[str],
    baseline: Microsimulation,
    create_reform_sim: Callable,
) -> dict:
    """Generates a breakdown data structure with spending per provision.

    Args:
        reform (ReformType): Reform object, a tuple of reforms.
        provisions (Tuple[str]): Provision names (same length as reform).
        baseline (Microsimulation): The baseline microsimulation.
        create_reform_sim (Callable): Function that creates a microsimulation from a reform.

    Returns:
        dict: The breakdown details.
    """

    cumulative_spending = []

    for step in range(1, len(reform) + 1):
        reform_sim = create_reform_sim(reform[:step])
        cumulative_spending += [get_spending(reform_sim, baseline)]

    additional_spending = np.array(
        cumulative_spending[:1]
        + list(
            np.array(cumulative_spending[1:])
            - np.array(cumulative_spending[:-1])
        )
    )

    def formatter(x):
        return round(float(x) / 1e9, 2)

    decile_impacts = pd.DataFrame()

    income = baseline.calc("household_net_income", map_to="person")
    equiv_income = baseline.calc("equiv_household_net_income", map_to="person")

    previous_gains = pd.Series([0] * 10, index=list(range(1, 11)))

    for i in range(1, len(reform) + 1):
        reform_sim = create_reform_sim(reform[:i])
        gain = (
            reform_sim.calc("household_net_income", map_to="person") - income
        )
        gain_by_decile = gain.groupby(equiv_income.decile_rank()).sum()
        gain_by_decile -= previous_gains
        previous_gains += gain_by_decile
        gain_df = pd.DataFrame(
            {
                "Decile": gain_by_decile.index,
                "Relative change": (
                    gain_by_decile
                    / income.groupby(equiv_income.decile_rank()).sum()
                )
                .round(3)
                .values,
                "Average change": (
                    gain_by_decile
                    / income.groupby(equiv_income.decile_rank()).count()
                )
                .round()
                .values,
                "Provision": provisions[i - 1],
            }
        )
        decile_impacts = pd.concat([decile_impacts, gain_df])

    rel_decile_chart = charts.formatted_fig_json(
        px.bar(
            decile_impacts,
            x="Decile",
            y="Relative change",
            color="Provision",
            title="Change in net income by decile",
        ).update_layout(
            yaxis_tickformat="%",
        )
    )

    avg_decile_chart = charts.formatted_fig_json(
        px.bar(
            decile_impacts,
            x="Decile",
            y="Average change",
            color="Provision",
            title="Change in net income by decile",
        ).update_layout(
            yaxis_tickprefix="£",
        )
    )

    return dict(
        provisions=provisions,
        spending=list(map(formatter, additional_spending)),
        cumulative_spending=list(map(formatter, cumulative_spending)),
        rel_decile_chart=rel_decile_chart,
        avg_decile_chart=avg_decile_chart,
    )
