"""
Utility functions for writing reforms.
"""
from pathlib import Path
from typing import Callable, Dict, Type
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
from rdbl import gbp

DATE = datetime.now()
YEAR, MONTH, DAY = DATE.year, DATE.month, DATE.day
CURRENT_INSTANT = DATE.strftime("%Y-%m-%d")


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


def get_PE_parameters(system: TaxBenefitSystem) -> Dict[str, dict]:
    """Extracts PolicyEngine parameters from OpenFisca parameter metadata.

    Args:
        system (TaxBenefitSystem): The tax-benefit system to extract from.

    Returns:
        Dict[str, dict]: The parameter metadata.
    """
    parameters = []
    for parameter in system.parameters.get_descendants():
        if isinstance(parameter, Parameter):
            parameters += [parameter]
        elif isinstance(parameter, ParameterScale):
            for bracket in parameter.brackets:
                for attribute in ("rate", "amount", "threshold"):
                    if hasattr(bracket, attribute):
                        parameters += [getattr(bracket, attribute)]
    parameters = list(
        filter(
            lambda param: hasattr(param, "metadata")
            and "policyengine" in param.metadata,
            parameters,
        )
    )
    parameter_metadata = {}
    for p in parameters:
        meta = p.metadata["policyengine"]
        param = dict(
            parameter=p.name,
            title=meta["title"],
            short_name=meta["short_name"],
            description=meta["description"],
            default=p(CURRENT_INSTANT),
            value=p(CURRENT_INSTANT),
            summary=meta["summary"],
        )
        default_values = dict(
            min=0,
            max=0,
            variable=None,
            type=None,
        )
        for key, value in default_values.items():
            if key in meta:
                param[key] = meta[key]
            else:
                param[key] = value
        parameter_metadata[param["short_name"]] = param
    return parameter_metadata


def get_formatter(parameter: dict) -> Callable:
    if parameter["type"] == "rate":
        return lambda value: f"{round(value * 100, 2)}%"
    elif parameter["type"] == "weekly":
        return lambda value: f"{gbp(value)}/week"
    elif parameter["type"] == "yearly":
        return lambda value: f"{gbp(value)}/year"
    elif parameter["type"] == "monthly":
        return lambda value: f"{gbp(value)}/month"
    elif parameter["type"] == "currency":
        return lambda value: f"{gbp(value)}"
    else:
        return lambda value: str(value)


def create_reform(
    parameters: dict,
    policyengine_parameters: dict = {},
    return_names: bool = False,
    return_descriptions: bool = False,
) -> Reform:
    """Translates URL parameters into an OpenFisca reform.

    Args:
        parameters (dict): The URL parameters.
        policyengine_parameters (dict, optional): The exposed OpenFisca parameters. Defaults to {}.
        return_names (bool, optional): Whether to return the names of the parameters. Defaults to False.
        return_descriptions (bool, optional): Whether to return the descriptions of the parameters. Defaults to False.

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
    reforms = []
    names = []
    descriptions = []
    for param, value in params.items():
        if param != "household":
            metadata = policyengine_parameters[param]
            names += [metadata["title"]]
            formatter = get_formatter(metadata)
            descriptions += [
                metadata["summary"].replace("@", formatter(value))
            ]
            if "abolish" in param:
                reforms += [abolish(metadata["variable"])]
            else:
                reforms += [parametric(metadata["parameter"], value)]
    result = [tuple(reforms)]
    if return_names:
        result += [names]
    if return_descriptions:
        result += [descriptions]
    return result if len(result) > 1 else result[0]


def use_current_parameters(date: str = CURRENT_INSTANT) -> Reform:
    """Backdates parameters at a given instant to the start of the year.

    Args:
        date (str, optional): The given instant. Defaults to CURRENT_INSTANT.

    Returns:
        Reform: The reform backdating parameters.
    """

    def modify_parameters(parameters: ParameterNode):
        for child in parameters.get_descendants():
            if isinstance(child, Parameter):
                current_value = child(date)
                child.update(period=f"year:{YEAR-10}:20", value=current_value)
            elif isinstance(child, ParameterScale):
                for bracket in child.brackets:
                    if "rate" in bracket.children:
                        current_rate = bracket.rate(date)
                        bracket.rate.update(
                            period=f"year:{YEAR-10}:20", value=current_rate
                        )
                    if "threshold" in bracket.children:
                        current_threshold = bracket.threshold(date)
                        bracket.threshold.update(
                            period=f"year:{YEAR-10}:20",
                            value=current_threshold,
                        )
        return parameters

    class reform(Reform):
        def apply(self):
            self.modify_parameters(modify_parameters)

    return reform
