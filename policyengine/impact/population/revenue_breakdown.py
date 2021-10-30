from typing import Callable, Tuple
import numpy as np
from openfisca_tools.microsimulation import Microsimulation
from openfisca_tools.model_api import ReformType


def get_spending(sim: Microsimulation, baseline: Microsimulation) -> float:
    return sim.calc("net_income").sum() - baseline.calc("net_income").sum()


def get_breakdown_per_provision(
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

    return dict(
        provisions=provisions,
        spending=list(map(formatter, additional_spending)),
        cumulative_spending=list(map(formatter, cumulative_spending)),
    )
