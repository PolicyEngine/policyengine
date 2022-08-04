from typing import Callable, Dict, List, Tuple
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_core.model_api import Enum, Variable
from openfisca_tools.model_api import FLOW
from openfisca_tools import IndividualSim
from collections import Sequence


class PolicyEngineVariable:
    PROPERTIES: List[str] = (
        "name",
        "unit",
        "label",
        "description",
        "valueType",
        "defaultValue",
        "definitionPeriod",
        "entity",
        "possibleValues",
        "reference",
        "quantityType",
    )

    def __init__(self, openfisca_variable: Variable):
        self.openfisca_variable = openfisca_variable

    @property
    def reference(self):
        try:
            if isinstance(self.openfisca_variable.reference, Sequence):
                return {v: v for v in self.openfisca_variable.reference}
            elif self.openfisca_variable.reference is None:
                return {}
            elif isinstance(reference, dict):
                reference = [reference]
            else:
                return {
                    self.openfisca_variable.reference: self.openfisca_variable.reference
                }
        except:
            return {}

    @property
    def description(self):
        if self.openfisca_variable.documentation is not None:
            description = self.openfisca_variable.documentation
            if description[-1] != ".":
                description += "."
        else:
            description = None
        return description

    @property
    def possibleValues(self):
        if self.openfisca_variable.value_type == Enum:
            if len(self.openfisca_variable.possible_values) > 200:
                raise ValueError(
                    f"Enums with more than 100 values are not supported ({self.openfisca_variable.name} has {len(self.openfisca_variable.possible_values)})."
                )
            return [
                dict(key=enum.name, value=enum.value)
                for enum in self.openfisca_variable.possible_values
            ]
        else:
            return None

    @property
    def defaultValue(self):
        if self.openfisca_variable.value_type == Enum:
            return dict(
                key=self.openfisca_variable.default_value.name,
                value=self.openfisca_variable.default_value.value,
            )
        else:
            return self.openfisca_variable.default_value

    @property
    def quantityType(self):
        if hasattr(self.openfisca_variable, "quantity_type"):
            return self.openfisca_variable.quantity_type.lower()
        else:
            return FLOW.lower()

    @property
    def valueType(self):
        return self.openfisca_variable.value_type.__name__

    @property
    def entity(self):
        return self.openfisca_variable.entity.key

    @property
    def definitionPeriod(self):
        return self.openfisca_variable.definition_period

    def __getattr__(self, key: str):
        if hasattr(self.openfisca_variable, key):
            return getattr(self.openfisca_variable, key)
        else:
            raise ValueError(f"Property {key} not found.")

    def to_dict(self) -> dict:
        """Return a dictionary representation of the variable.

        Raises:
            ValueError: If a required property is not found. This will likely be due to a change in the OpenFisca API.

        Returns:
            dict: The variable metadata.
        """
        data = {}
        for prop in self.PROPERTIES:
            try:
                if hasattr(self, prop):
                    data[prop] = getattr(self, prop)
                else:
                    raise ValueError(f"Property {prop} not found.")
            except:
                # In the case of an exception, abandon the entire variable.
                return None
        return data


def build_variables(system: TaxBenefitSystem) -> Dict[str, dict]:
    """Extracts PolicyEngine parameters from OpenFisca parameter metadata.

    Args:
        system (TaxBenefitSystem): The tax-benefit system to extract from.

    Returns:
        Dict[str, dict]: The parameter metadata.
    """
    variables = system.variables.values()
    variable_metadata = {}
    for variable in variables:
        processed_variable = PolicyEngineVariable(variable)
        data = processed_variable.to_dict()
        if data is not None:
            variable_metadata[variable.name] = data
    return variable_metadata
