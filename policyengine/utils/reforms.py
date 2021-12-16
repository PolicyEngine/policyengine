"""
Utility functions for writing reforms.
"""
from pathlib import Path
from typing import Any, Callable, Dict, Tuple, Type
from openfisca_core.parameters.helpers import load_parameter_file
from openfisca_core.parameters.parameter import Parameter
from openfisca_core.parameters.parameter_scale import ParameterScale
from openfisca_core.reforms.reform import Reform
from openfisca_core.tracers.tracing_parameter_node_at_instant import (
    ParameterNode,
)
from openfisca_core.variables import Variable
from datetime import datetime
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_tools.model_api import ReformType
from rdbl import gbp


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


def abolish(variable: str) -> Reform:
    return type(
        f"abolish_{variable}",
        (Reform,),
        dict(apply=lambda self: self.neutralize_variable(variable)),
    )


def parametric(
    parameter: str, value: float, period: str = "year:2015:10"
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


def get_PE_parameters(system: TaxBenefitSystem) -> Dict[str, dict]:
    """Extracts PolicyEngine parameters from OpenFisca parameter metadata.

    Args:
        system (TaxBenefitSystem): The tax-benefit system to extract from.

    Returns:
        Dict[str, dict]: The parameter metadata.
    """

    now = datetime.now().strftime("%Y-%m-%d")
    parameters = []
    for parameter in system.parameters.get_descendants():
        if isinstance(parameter, Parameter):
            parameters += [parameter]
        elif isinstance(parameter, ParameterScale):
            for bracket in parameter.brackets:
                for attribute in ("rate", "amount", "threshold"):
                    if hasattr(bracket, attribute):
                        parameters += [getattr(bracket, attribute)]
    parameter_metadata = {}
    for parameter in parameters:
        try:
            if "name" in parameter.metadata:
                name = parameter.metadata["name"]
            else:
                name = parameter.name.split(".")[-1]
            parameter_metadata[name] = dict(
                name=name,
                parameter=parameter.name,
                description=parameter.description,
                label=parameter.metadata["label"],
                value=parameter(now),
                valueType=parameter.metadata["type"]
                if "type" in parameter.metadata
                else parameter(now).__class__.__name__,
                unit=None,
                period=None,
                variable=None,
                max=None,
                min=None,
            )
            OPTIONAL_ATTRIBUTES = ("period", "variable", "max", "min", "unit")
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
    if isinstance(reform, tuple):
        for subreform in reform:
            system = apply_reform(subreform, system)
    else:
        system = reform(system)
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
    for param, value in params.items():
        if param == "policy_date":
            str_value = str(value)
            baseline_reform_passed = True
            policy_date_reform = use_current_parameters(
                f"{str_value[:4]}-{str_value[4:6]}-{str_value[6:8]}"
            )
        elif param != "household":
            metadata = policyengine_parameters[param]
            name = metadata["label"]
            description = get_summary(metadata, value)
            if "abolish" in param:
                if metadata["variable"] is not None:
                    reform = abolish(metadata["variable"])
                else:
                    reform = parametric(metadata["parameter"], value)
            else:
                reform = parametric(metadata["parameter"], value)
            if "baseline" in param:
                result["baseline"]["reform"] += [reform]
                result["baseline"]["names"] += [name]
                result["baseline"]["descriptions"] += [description]
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
