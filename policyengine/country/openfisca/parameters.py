from datetime import datetime
from collections import Sequence, OrderedDict
from typing import Dict, List, Type
import numpy as np
from openfisca_core.parameters import ParameterNode, Parameter, ParameterScale
from openfisca_core.variables import Variable
from openfisca_core.model_api import Enum
from openfisca_core.taxbenefitsystems import TaxBenefitSystem

NOW = datetime.now().strftime("%Y-%m-%d")


class PolicyEngineParameter:
    PROPERTIES = [
        "name",
        "parameter",
        "description",
        "label",
        "reference",
        "unit",
        "valueType",
        "variable",
        "period",
        "value",
        "breakdownParts",
        "possibleValues",
    ]

    def __init__(self, openfisca_parameter: Parameter, date: str = NOW):
        self.openfisca_parameter = openfisca_parameter
        self.date = date

    def __getattr__(self, key: str):
        return self.openfisca_parameter.metadata.get(
            key, self.openfisca_parameter.__dict__.get(key)
        )

    @property
    def value(self):
        if not isinstance(self.openfisca_parameter, Parameter):
            return None
        current_value = self.openfisca_parameter(self.date)
        value_type = self.openfisca_parameter.metadata.get(
            "value_type", type(current_value).__name__
        )
        if value_type == "Enum":
            return current_value[0]
        if current_value == np.inf:
            return "inf"
        elif current_value == -np.inf:
            return "-inf"
        return current_value

    @property
    def name(self):
        name = self.openfisca_parameter.metadata.get(
            "name", self.openfisca_parameter.name.replace(".", "_")
        )
        assert name != "__pycache__", "Parameter name cannot be __pycache__."
        return name

    @property
    def parameter(self):
        return self.openfisca_parameter.name

    @property
    def breakdownParts(self):
        return self.openfisca_parameter.metadata.get("breakdown_parts")

    @property
    def possibleValues(self):
        return self.openfisca_parameter.metadata.get("possible_values")

    @property
    def reference(self):
        try:
            if self.openfisca_parameter.metadata.get("reference") is not None:
                reference = self.openfisca_parameter.metadata["reference"]
                if isinstance(reference, dict):
                    reference = [reference]
                for item in reference:
                    if isinstance(item, str):
                        item = dict(title=item, href=item)
                    if "name" in item:
                        item["title"] = item["name"]
                return {item["title"]: item["href"] for item in reference}
            else:
                return {}
        except:
            return {}

    @property
    def valueType(self):
        if isinstance(self.openfisca_parameter, ParameterNode):
            return "parameter_node"
        return self.openfisca_parameter.metadata.get(
            "value_type",
            self.value.__class__.__name__,
        )

    def to_dict(self) -> dict:
        """Return a dictionary representation of the parameter.

        Raises:
            ValueError: If a required property is not found. This will likely be due to a change in the OpenFisca API.

        Returns:
            dict: The parameter metadata.
        """
        data = {}
        for prop in self.PROPERTIES:
            try:
                if hasattr(self, prop):
                    data[prop] = getattr(self, prop)
                else:
                    raise ValueError(f"Property {prop} not found.")
            except Exception as e:
                # Replace with the parameter name you want to debug here.
                PARAMETER_TO_DEBUG = "state_specific"
                if PARAMETER_TO_DEBUG in self.openfisca_parameter.name:
                    raise e
                # In the case of an exception, abandon the entire variable.
                return None
        return data


class PolicyEngineScaleParameter(PolicyEngineParameter):
    PROPERTIES = PolicyEngineParameter.PROPERTIES + [
        "brackets",
        "scaleType",
    ]

    @property
    def brackets(self):
        return len(self.openfisca_parameter.brackets)

    @property
    def scaleType(self):
        return self.openfisca_parameter.metadata.get("type")

    @property
    def valueType(self):
        return "parameter_scale"


class PolicyEngineScaleComponentParameter(PolicyEngineParameter):
    def __init__(
        self,
        openfisca_parameter: Parameter,
        parent: ParameterScale,
        is_threshold: bool,
        value_type: str,
        index: int,
        date: str = NOW,
    ):
        super().__init__(openfisca_parameter, date)
        self.parent = parent
        self.is_threshold = is_threshold
        self.type = "threshold" if is_threshold else "rate"
        self.index = index
        self.value_type = value_type

    @property
    def label(self):
        metadata_label = self.openfisca_parameter.metadata.get("label")
        if metadata_label is not None:
            return metadata_label
        parent_name = self.parent.metadata.get("label", self.parent.name)
        if self.is_threshold:
            return f"{parent_name} (threshold {self.index + 1})"
        else:
            return f"{parent_name} (rate {self.index + 1})"

    @property
    def name(self):
        defined_name = self.openfisca_parameter.metadata.get("name")
        if defined_name is not None:
            return defined_name
        stem = self.parent.metadata.get(
            "name", self.parent.name.replace(".", "_")
        )
        if self.is_threshold:
            return f"{stem}_{self.index + 1}_threshold"
        else:
            return f"{stem}_{self.index + 1}_rate"

    @property
    def unit(self):
        return self.openfisca_parameter.metadata.get(
            "unit", self.parent.metadata.get(f"{self.value_type}_unit")
        )

    @property
    def period(self):
        default_period = "year" if self.is_threshold else None
        return self.openfisca_parameter.metadata.get(
            "period",
            self.parent.metadata.get(f"{self.type}_period", default_period),
        )


def get_enum_map_from_variable_name(
    variable: str, variables: Dict[str, Variable]
) -> Dict[str, str]:
    """Get the mapping of enum values to their labels from a variable name.

    Args:
        variable (str): The name of the variable.
        variables (Dict[str, Variable]): The variables in the tax benefit system.

    Returns:
        Dict[str, str]: The mapping of enum values to their labels.
    """
    if not isinstance(variable, str) or variable not in variables:
        return {}
    enum: Type[Enum] = variables[variable].possible_values
    return {key: enum.value for key, enum in enum._member_map_.items()}


def flow_breakdown_parameter_metadata_down(
    parameters: ParameterNode, variables: List[Variable]
) -> ParameterNode:
    """Recursively add metadata to parameters that are part of a flow breakdown.

    Args:
        parameters (ParameterNode): The parameters to add metadata to.
        variables (List[Variable]): The variables to use to determine the metadata.

    Returns:
        ParameterNode: The parameters with metadata added.
    """
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


def build_parameters(
    system: TaxBenefitSystem, date: str = None
) -> Dict[str, dict]:
    """Extracts PolicyEngine parameters from OpenFisca parameter metadata.

    Args:
        system (TaxBenefitSystem): The tax-benefit system to extract from.
        date (str): The date to extract parameters for. Defaults to the current date.

    Returns:
        Dict[str, dict]: The parameter metadata.
    """
    if date is not None:
        date = datetime.strptime(date, "%Y-%m-%d").strftime("%Y-%m-%d")
    else:
        date = NOW
    parameters = []
    system.parameters = flow_breakdown_parameter_metadata_down(
        system.parameters, system.variables
    )
    for parameter in system.parameters.get_descendants():
        if isinstance(parameter, Parameter):
            parameters.append(PolicyEngineParameter(parameter, date=date))
        elif isinstance(parameter, ParameterScale):
            i = 0
            for bracket in parameter.brackets:
                for attribute in ("rate", "amount", "threshold"):
                    if hasattr(bracket, attribute):
                        component = getattr(bracket, attribute)
                        parameters.append(
                            PolicyEngineScaleComponentParameter(
                                component,
                                parameter,
                                attribute == "threshold",
                                attribute,
                                i,
                                date=date,
                            )
                        )
                i += 1
            parameters.append(PolicyEngineScaleParameter(parameter, date=date))
        else:
            parameters += [PolicyEngineParameter(parameter, date=date)]
    parameter_metadata = OrderedDict()
    for parameter in parameters:
        try:
            data = parameter.to_dict()
            if data is not None:
                parameter_metadata[data["name"]] = data
        except Exception as e:
            pass
    return parameter_metadata
