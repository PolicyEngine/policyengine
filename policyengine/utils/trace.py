from typing import Union
from openfisca_tools import Microsimulation, IndividualSim
from openfisca_core.tracers import TraceNode
import yaml


def get_budget_trace(
    baseline: Union[Microsimulation, IndividualSim],
    reformed: Union[Microsimulation, IndividualSim],
) -> dict:
    """Finds the structure and variables in the computation trace for a simulation.

    Args:
        baseline (Union[Microsimulation, IndividualSim]): The baseline simulation.
        reformed (Union[Microsimulation, IndividualSim]): The reformed simulation.

    Returns:
        dict: A dictionary containing the children and change details of each variable.
    """
    root_node = baseline.simulation.tracer.trees[0]
    structure = get_dependent_variables(root_node)
    variables = ["net_income"] + get_all_variables(root_node)
    variable_changes = {
        variable: get_changes(variable, baseline, reformed)
        for variable in variables
    }
    for variable in structure:
        structure[variable].update(variable_changes[variable])
    return structure


def get_changes(
    variable: str, baseline: Microsimulation, reformed: Microsimulation
) -> float:
    try:
        return dict(
            aggregate=round(
                float(
                    reformed.calc(variable).sum()
                    - baseline.calc(variable).sum()
                )
                / 1e9,
                1,
            ),
            count=round(
                float(
                    (reformed.calc(variable) > 0).sum()
                    - (baseline.calc(variable) > 0).sum()
                )
                / 1e6,
                1,
            ),
        )
    except:
        return dict(aggregate=None, count=None)


def get_dependent_variables(node: TraceNode) -> Union[str, list]:
    children = (
        {node.name: dict(children=[child.name for child in node.children])}
        if len(node.children) > 0
        else {}
    )
    for child in node.children:
        children.update(get_dependent_variables(child))
    return children


def get_all_variables(node: TraceNode) -> list:
    if len(node.children) == 0:
        return [node.name]
    else:
        return list(
            set(
                [node.name]
                + sum(
                    [get_all_variables(child) for child in node.children], []
                )
            )
        )
