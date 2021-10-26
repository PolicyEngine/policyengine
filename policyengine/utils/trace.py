from typing import Callable, Union
import numpy as np
from openfisca_core.indexed_enums.enum_array import EnumArray
from openfisca_tools import Microsimulation, IndividualSim
from openfisca_core.tracers import TraceNode
from rdbl import gbp, num


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
    metadata = baseline.simulation.tax_benefit_system.variables
    for variable in structure:
        structure[variable].update(variable_changes[variable])
        structure[variable]["label"] = (
            metadata[variable].label
            if hasattr(metadata[variable], "label")
            else variable
        )
    return structure


def safe_number(result, formatter: Callable = gbp) -> Union[float, None]:
    if isinstance(result, float):
        if np.isnan(result) or np.isinf(result):
            return None
        return formatter(result)
    if isinstance(result, bool):
        return result
    return None


def get_changes(
    variable: str,
    baseline: Union[Microsimulation, IndividualSim],
    reformed: Union[Microsimulation, IndividualSim],
) -> float:
    if isinstance(baseline, IndividualSim):
        baseline_values = baseline.calc(variable)
        if isinstance(baseline_values, EnumArray):
            baseline_values = baseline_values.decode_to_str()
        reformed_values = reformed.calc(variable)
        if isinstance(reformed_values, EnumArray):
            reformed_values = reformed_values.decode_to_str()
        return dict(
            baseline=", ".join(map(str, baseline_values)),
            reformed=", ".join(map(str, reformed_values)),
        )
    try:
        return dict(
            baseline=safe_number(
                baseline.calc(variable).sum(),
                gbp,
            ),
            reformed=safe_number(
                reformed.calc(variable).sum(),
                gbp,
            ),
        )
    except:
        return dict(
            baseline_aggregate=None,
            reformed_aggregate=None,
            baseline_count=None,
            reformed_count=None,
        )


def get_dependent_variables(
    node: TraceNode, data: dict = None
) -> Union[str, list]:
    if data is None:
        data = {}
    immediate_children = [child.name for child in node.children]
    if node.name in data:
        data[node.name]["children"] = list(
            set(data[node.name]["children"] + immediate_children)
        )
    else:
        data[node.name] = dict(children=immediate_children)
    for child in node.children:
        get_dependent_variables(child, data)
    return data


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
