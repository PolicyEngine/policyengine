from datetime import datetime
from pathlib import Path
from typing import Type
from openfisca_core.parameters.helpers import load_parameter_file
from openfisca_core.parameters import ParameterNode, Parameter, ParameterScale
from openfisca_core.reforms.reform import Reform
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_core.variables import Variable
from openfisca_core.tracers.tracing_parameter_node_at_instant import (
    ParameterNode,
)
from openfisca_tools.model_api import use_current_parameters


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
                    f"Could not find the parameter (failed at {name}). The full parameter is {parameter}."
                )
        node.update(period=period, value=value)
        return parameters

    return type(
        parameter,
        (Reform,),
        dict(apply=lambda self: self.modify_parameters(modifier_fn)),
    )


def apply_reform(reform: tuple, system: TaxBenefitSystem) -> TaxBenefitSystem:
    """Applies a reform to a system.

    Args:
        reform (tuple): The reform to apply.
        system (TaxBenefitSystem): The system to apply it to.

    Returns:
        TaxBenefitSystem: The system with the reform applied.
    """
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


IGNORED_POLICY_PARAMETERS = [
    "household",
    "baseline_country_specific",
    "country_specific",
    "baseline_state_specific",
    "state_specific",
]


class PolicyReform:
    """A PolicyReform is a complete specification of two policies: a baseline and a reformed policy."""

    def __init__(
        self,
        parameters: dict,
        policyengine_parameters: dict,
        default_reform: Reform = None,
    ):
        self.parameters = {
            key: value
            for key, value in parameters.items()
            if key not in IGNORED_POLICY_PARAMETERS
        }
        self.policyengine_parameters = policyengine_parameters
        self.default_reform = default_reform
        self._sanitise_parameters()

    def _sanitise_parameters(self):
        """Sanitises the parameters to ensure they are in the correct format."""
        for key in self.parameters:
            if isinstance(self.parameters[key], list):
                self.parameters[key] = self.parameters[key][0]
            metadata = self.policyengine_parameters.get(
                key.replace("baseline_", "")
            )
            if metadata is None:
                continue
            if metadata["valueType"] == "bool":
                # Extra safety checks
                self.parameters[key] = {
                    "true": True,
                    "false": False,
                    1: True,
                    0: False,
                    "1": True,
                    "0": False,
                    True: True,
                    False: False,
                }[self.parameters[key]]
            try:
                self.parameters[key] = float(self.parameters[key])
            except:
                pass

    @property
    def edits_baseline(self) -> bool:
        """Returns whether the reform edits the baseline policy."""
        return any(["baseline_" in key for key in self.parameters])

    @property
    def baseline(self) -> Reform:
        """Returns the baseline policy."""
        if not self.edits_baseline:
            return Policy(
                {},
                self.policyengine_parameters,
                default_reform=self.default_reform,
            )
        relevant_parameters = {
            key.replace("baseline_", ""): value
            for key, value in self.parameters.items()
            if "baseline_" in key
        }
        return Policy(
            relevant_parameters,
            self.policyengine_parameters,
            default_reform=self.default_reform,
        )

    @property
    def reform(self) -> Reform:
        """Returns the reform policy."""
        relevant_parameters = self.baseline.parameters.copy()
        relevant_parameters.update(
            {
                key: value
                for key, value in self.parameters.items()
                if "baseline_" not in key
            }
        )
        return Policy(
            relevant_parameters,
            self.policyengine_parameters,
            default_reform=self.default_reform,
        )


class Policy:
    def __init__(
        self,
        parameters: dict,
        policyengine_parameters: dict,
        default_reform: Reform = None,
    ):
        self.parameters = parameters
        self.policyengine_parameters = policyengine_parameters
        self.default_reform = default_reform

    def __repr__(self):
        items = list(self.parameters.items())
        if len(items) == 0:
            return "<Policy (empty)>"
        return f"<Policy {' '.join([f'{key}={value}' for key, value in items[:4]])}{f' ...+{len(items)-4}' if len(items) > 4 else ''}>"

    def apply(self, system: TaxBenefitSystem) -> TaxBenefitSystem:
        """Applies the policy to a system. This essentially does the same as any `Reform.apply` method.

        Args:
            system (TaxBenefitSystem): The system to apply it to.
        """
        if self.default_reform is not None:
            if "policy_date" in self.parameters:
                date = str(self.parameters.get("policy_date"))
                date_str = f"{date[:4]}-{date[4:6]}-{date[6:]}"
                system = apply_reform(
                    (
                        self.default_reform[:-1],
                        use_current_parameters(date_str),
                    ),
                    system,
                )
            else:
                system = apply_reform(self.default_reform, system)
        for key, value in self.parameters.items():
            if key == "policy_date":
                continue
            metadata = self.policyengine_parameters[key]
            if metadata["unit"] == "abolition":
                variables_to_neutralise = metadata["variable"]
                if not isinstance(variables_to_neutralise, list):
                    variables_to_neutralise = [variables_to_neutralise]
                for variable in variables_to_neutralise:
                    if system.variables[variable].is_neutralized:
                        reinstate_variable(system, variable)
                    else:
                        system.neutralize_variable(variable)
            else:
                parametric(metadata["parameter"], value).apply(system)
