"""
Utility functions for writing reforms.
"""
from collections import OrderedDict, Sequence
from pathlib import Path
from typing import Any, Callable, Dict, List, Tuple, Type
import numpy as np
from openfisca_core.parameters.helpers import load_parameter_file
from openfisca_core.parameters import Parameter, ParameterNode
from openfisca_core.parameters.parameter_scale import ParameterScale
from openfisca_core.reforms.reform import Reform
from openfisca_core.tracers.tracing_parameter_node_at_instant import (
    ParameterNode,
)
from openfisca_core.variables import Variable
from datetime import datetime
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_tools.model_api import ReformType
from openfisca_core.model_api import Enum


def structural(variable: Type[Variable]) -> Reform:
    """Generates a structural reform.

    Args:
        variable (Type[Variable]): The class definition of a variable to replace.

    Returns:
        Reform: The reform object.
    """
    return type(
        variable.__name__,
        (Reform,),
        dict(apply=lambda self: self.update_variable(variable)),
    )


def reinstate_variable(system, variable):
    clone = system.variables[variable].clone()
    clone.is_neutralized = False
    system.variables[variable] = clone


def abolish(variable: str, neutralize: bool = True) -> Reform:
    if neutralize:
        return type(
            f"abolish_{variable}",
            (Reform,),
            dict(apply=lambda self: self.neutralize_variable(variable)),
        )
    else:
        return type(
            f"reinstate_{variable}",
            (Reform,),
            dict(apply=lambda self: reinstate_variable(self, variable)),
        )


def parametric(
    parameter: str, value: float, period: str = "year:2015:20"
) -> Reform:
    """Generates a parametric reform.

    Args:
        parameter (str): The name of the parameter, e.g. tax.income_tax.rate.
        value (float): The value to set as the parameter value.
        period (str): The time period to set it for. Defaults to a ten-year period from 2015 to 2025.

    Returns:
        Reform: The reform object.
    """

    def modifier_fn(parameters: ParameterNode):
        node = parameters
        for name in parameter.split("."):
            try:
                if "[" not in name:
                    node = node.children[name]
                else:
                    try:
                        name, index = name.split("[")
                        index = int(index[:-1])
                        node = node.children[name].brackets[index]
                    except:
                        raise ValueError(
                            "Invalid bracket syntax (should be e.g. tax.brackets[3].rate"
                        )
            except:
                raise ValueError(
                    f"Could not find the parameter (failed at {name})."
                )
        node.update(period=period, value=value)
        return parameters

    return type(
        parameter,
        (Reform,),
        dict(apply=lambda self: self.modify_parameters(modifier_fn)),
    )


def add_parameter_file(path: str) -> Reform:
    """Generates a reform adding a parameter file to the tree.

    Args:
        path (str): The path to the parameter YAML file.

    Returns:
        Reform: The Reform adding the parameters.
    """

    def modify_parameters(parameters: ParameterNode):
        file_path = Path(path)
        reform_parameters_subtree = load_parameter_file(file_path)
        parameters.add_child("reforms", reform_parameters_subtree.reforms)
        return parameters

    class reform(Reform):
        def apply(self):
            self.modify_parameters(modify_parameters)

    return reform


def summary_from_metadata(metadata: dict) -> str:
    """Generates a summary from parameter metadata.

    Args:
        metadata (dict): The parameter metadata.

    Returns:
        str: The summary.
    """
    if metadata["type"] == "abolish":
        return f"Abolish {metadata['title']}"
    else:
        return f"Change the {metadata['title']} to @"


def get_enum_map_from_variable_name(
    variable: str, variables: Dict[str, Variable]
) -> Dict[str, str]:
    if not isinstance(variable, str) or variable not in variables:
        return {}
    enum: Type[Enum] = variables[variable].possible_values
    return {key: enum.value for key, enum in enum._member_map_.items()}


def flow_breakdown_parameter_metadata_down(
    parameters: ParameterNode, variables: List[Variable]
) -> ParameterNode:
    for parameter in parameters.get_descendants():
        parameter_name = parameter.metadata.get(
            "name", parameter.name.replace(".", "_")
        )
        if parameter.metadata.get("breakdown"):
            enum_maps = [
                get_enum_map_from_variable_name(variable, variables)
                for variable in parameter.metadata["breakdown"]
            ]
            for descendant in parameter.get_descendants():
                if not isinstance(descendant, Parameter):
                    continue
                descendant_path = descendant.name.replace(parameter.name, "")[
                    1:
                ]
                descendant.metadata.update(
                    {
                        x: y
                        for x, y in parameter.metadata.items()
                        if x != "breakdown"
                    }
                )
                descendant.metadata["name"] = (
                    parameter_name + "_" + "_".join(descendant_path.split("."))
                )
                step_labels = [
                    (key, enum_maps[i].get(key, key))
                    for i, key in enumerate(descendant_path.split("."))
                ]
                step_label = f"({', '.join([x[1] for x in step_labels])})"
                descendant.metadata["label"] = (
                    parameter.metadata.get("label", parameter.name)
                    + " "
                    + step_label
                )
                descendant.metadata["breakdown_parts"] = step_labels

    return parameters


EXCLUDED_PARAMETERS = [
    "gov_hhs_medicaid_geography",
]  # Temporary fix: skip parameters with very large subtrees.


def get_PE_parameters(
    system: TaxBenefitSystem, date: str = None
) -> Dict[str, dict]:
    """Extracts PolicyEngine parameters from OpenFisca parameter metadata.

    Args:
        system (TaxBenefitSystem): The tax-benefit system to extract from.
        date (str): The date to extract parameters for. Defaults to the current date.

    Returns:
        Dict[str, dict]: The parameter metadata.
    """

    now = datetime.now().strftime("%Y-%m-%d")
    if date is not None:
        now = datetime.strptime(date, "%Y-%m-%d").strftime("%Y-%m-%d")
    parameters = []
    system.parameters = flow_breakdown_parameter_metadata_down(
        system.parameters, system.variables
    )
    for parameter in system.parameters.get_descendants():
        if isinstance(parameter, Parameter):
            parameters += [parameter]
        elif isinstance(parameter, ParameterScale):
            for bracket in parameter.brackets:
                for attribute in ("rate", "amount", "threshold"):
                    if hasattr(bracket, attribute):
                        parameters += [getattr(bracket, attribute)]
        else:
            parameters += [parameter]
    parameter_metadata = OrderedDict()
    for parameter in parameters:
        try:
            if "name" in parameter.metadata:
                name = parameter.metadata["name"]
            else:
                name = parameter.name.replace(".", "_")
            if any(
                [
                    excluded_parameter in name
                    for excluded_parameter in EXCLUDED_PARAMETERS
                ]
            ):
                continue
            if isinstance(parameter, Parameter):
                value_type = parameter.metadata.get(
                    "value_type", parameter(now).__class__.__name__
                )
            else:
                value_type = "parameter_node"
            assert value_type not in ("list",)
            if value_type == "Enum":
                value = parameter(now)[0]
            else:
                value = parameter(now)
            try:
                if parameter.metadata.get("reference") is not None:
                    reference = parameter.metadata["reference"]
                    if isinstance(reference, dict):
                        reference = [reference]
                    for item in reference:
                        if isinstance(item, str):
                            item = dict(title=item, href=item)
                        if "name" in item:
                            item["title"] = item["name"]
                    reference = {
                        item["title"]: item["href"] for item in reference
                    }
                else:
                    reference = {}
            except:
                reference = {}
            parameter_metadata[name] = dict(
                name=name,
                parameter=parameter.name,
                description=parameter.description,
                label=parameter.metadata.get("label", parameter.name),
                value=value if isinstance(parameter, Parameter) else None,
                valueType=value_type,
                unit=None,
                period=None,
                variable=None,
                max=None,
                min=None,
                possibleValues=parameter.metadata.get("possible_values"),
                reference=reference,
            )
            if parameter(now) == np.inf:
                parameter_metadata[name]["value"] = "inf"
            if parameter(now) == -np.inf:
                parameter_metadata[name]["value"] = "-inf"
            OPTIONAL_ATTRIBUTES = (
                "period",
                "variable",
                "max",
                "min",
                "unit",
                "breakdown_parts",
            )
            for attribute in OPTIONAL_ATTRIBUTES:
                if attribute in parameter.metadata:
                    parameter_metadata[name][attribute] = parameter.metadata[
                        attribute
                    ]
        except Exception as e:
            pass
    return parameter_metadata


CURRENCY_SYMBOLS = {
    "currency-GBP": "£",
    "USD": "$",
}


def apply_reform(reform: tuple, system: TaxBenefitSystem) -> TaxBenefitSystem:
    if not hasattr(system, "modify_parameters"):

        def modify_parameters(self, modifier):
            self.parameters = modifier(self.parameters)

        system.modify_parameters = modify_parameters.__get__(system)
    if isinstance(reform, tuple):
        for subreform in reform:
            system = apply_reform(subreform, system)
    else:
        reform.apply(system)
    return system


def get_formatter(parameter: dict) -> Callable:
    if parameter["unit"] == "/1":
        return (
            lambda value: f"{f'{round(value * 100, 2):,}'.rstrip('0').rstrip('.')}%"
        )
    for currency_type in CURRENCY_SYMBOLS:
        if parameter["unit"] == currency_type:
            return (
                lambda value: f"{CURRENCY_SYMBOLS[currency_type]}{value}/{parameter['period']}"
            )
    return lambda value: str(value)


def get_summary(parameter: dict, value: Any) -> str:
    formatter = get_formatter(parameter)
    if parameter["valueType"] in ("float", "int"):
        change_label = "Increase" if value > parameter["value"] else "Decrease"
        return f"{change_label} {parameter['label']} from {formatter(parameter['value'])} to {formatter(value)}"
    if parameter["valueType"] == "bool":
        if parameter["unit"] == "abolition":
            return parameter["label"]
    return parameter["label"]


def create_reform(
    parameters: dict,
    policyengine_parameters: dict = {},
    default_reform: ReformType = (),
) -> Tuple[Reform, Reform]:
    """Translates URL parameters into an OpenFisca reform.

    Args:
        parameters (dict): The URL parameters.
        policyengine_parameters (dict, optional): The exposed OpenFisca parameters. Defaults to {}.
        default_reform (ReformType, optional): The default reform to apply. Defaults to ().

    Returns:
        Reform: The OpenFisca reform.
    """
    params = {}
    for key, value in parameters.items():
        components = key.split("_")
        name = "_".join(components)
        if isinstance(value, list):
            value = value[0]
        try:
            params[name] = float(value)
        except:
            params[name] = value
    result = dict(
        baseline=dict(
            reform=[],
            names=[],
            descriptions=[],
        ),
        reform=dict(
            reform=[],
            names=[],
            descriptions=[],
        ),
    )
    baseline_reform_passed = False
    policy_date_reform = None
    pairs = sorted(
        list(params.items()),
        key=lambda pair: 0 if "baseline_" in pair[0] else 1,
    )
    for param, value in pairs:
        if param == "policy_date":
            str_value = str(value)
            baseline_reform_passed = True
            policy_date_reform = use_current_parameters(
                f"{str_value[:4]}-{str_value[4:6]}-{str_value[6:8]}"
            )
        elif param in [
            "country_specific",
            "baseline_country_specific",
            "state_specific",
            "baseline_state_specific",
        ]:
            pass  # Do not attempt to apply the country specifier as a reform
        elif param != "household":
            if (
                (param in ("reform", "baseline_reform"))
                and isinstance(value, type)
                or isinstance(value, tuple)
            ):
                name = "Structural reform"
                reform = value
                description = "Custom-defined structural reform"
            else:
                metadata = policyengine_parameters[
                    param.replace("baseline_", "")
                ]
                name = metadata["label"]
                description = get_summary(metadata, value)
                if metadata["valueType"] == "bool":
                    # Extra safety checks
                    value = {
                        "true": True,
                        "false": False,
                        1: True,
                        0: False,
                        True: True,
                        False: False,
                    }[value]
                if metadata["unit"] == "abolition":
                    if metadata["variable"] is not None:
                        if isinstance(metadata["variable"], list):
                            reform = tuple(
                                [
                                    abolish(variable, value)
                                    for variable in metadata["variable"]
                                ]
                            )
                        else:
                            reform = abolish(metadata["variable"], value)
                    else:
                        reform = parametric(metadata["parameter"], value)
                else:
                    reform = parametric(metadata["parameter"], value)
            if "baseline" in param:
                result["baseline"]["reform"] += [reform]
                result["baseline"]["names"] += [name]
                result["baseline"]["descriptions"] += [description]
                result["reform"]["reform"] += [reform]
                result["reform"]["names"] += [name]
                result["reform"]["descriptions"] += [description]
                baseline_reform_passed = True
            else:
                result["reform"]["reform"] += [reform]
                result["reform"]["names"] += [name]
                result["reform"]["descriptions"] += [description]
    if policy_date_reform is None:
        policy_date_reform = use_current_parameters()
    default_reform = (*default_reform, policy_date_reform)
    for sim in ("baseline", "reform"):
        result[sim]["reform"] = [default_reform] + result[sim]["reform"]
        result[sim]["names"] = ["Default reform"] + result[sim]["names"]
        result[sim]["descriptions"] = ["Default reform"] + result[sim][
            "descriptions"
        ]
        result[sim]["reform"] = tuple(result[sim]["reform"])
    result["baseline"]["has_changed"] = baseline_reform_passed
    return result


def use_current_parameters(date: str = None) -> Reform:
    """Backdates parameters at a given instant to the start of the year.

    Args:
        date (str, optional): The given instant. Defaults to now.

    Returns:
        Reform: The reform backdating parameters.
    """
    if date is None:
        date = datetime.now()
    else:
        date = datetime.strptime(date, "%Y-%m-%d")

    year = date.year
    date = datetime.strftime(date, "%Y-%m-%d")

    def modify_parameters(parameters: ParameterNode):
        for child in parameters.get_descendants():
            if isinstance(child, Parameter):
                current_value = child(date)
                child.update(period=f"year:{year-10}:20", value=current_value)
            elif isinstance(child, ParameterScale):
                for bracket in child.brackets:
                    if "rate" in bracket.children:
                        current_rate = bracket.rate(date)
                        bracket.rate.update(
                            period=f"year:{year-10}:20", value=current_rate
                        )
                    if "threshold" in bracket.children:
                        current_threshold = bracket.threshold(date)
                        bracket.threshold.update(
                            period=f"year:{year-10}:20",
                            value=current_threshold,
                        )
        try:
            parameters.reforms.policy_date.update(
                value=int(datetime.now().strftime("%Y%m%d")),
                period=f"year:{year-10}:20",
            )
        except:
            pass
        return parameters

    class reform(Reform):
        def apply(self):
            self.modify_parameters(modify_parameters)

    return reform
