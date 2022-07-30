"""
Functions to convert URL query parameters into OpenFisca situation initialiser functions.
"""

from typing import Callable, Dict, Tuple
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_core.model_api import Enum
from openfisca_tools.model_api import FLOW
from openfisca_tools import IndividualSim
from collections import Sequence


def get_PE_variables(system: TaxBenefitSystem) -> Dict[str, dict]:
    """Extracts PolicyEngine parameters from OpenFisca parameter metadata.

    Args:
        system (TaxBenefitSystem): The tax-benefit system to extract from.

    Returns:
        Dict[str, dict]: The parameter metadata.
    """
    variables = list(system.variables.values())
    variable_metadata = {}
    for variable in variables:
        try:
            try:
                if isinstance(variable.reference, Sequence):
                    reference = {v: v for v in variable.reference}
                elif variable.reference is None:
                    reference = {}
                else:
                    reference = {variable.reference: variable.reference}
            except:
                reference = {}
            if variable.documentation is not None:
                description = variable.documentation
                if description[-1] != ".":
                    description += "."
            else:
                description = None
            variable_metadata[variable.name] = dict(
                name=variable.name,
                unit=variable.unit,
                label=variable.label,
                documentation=description,
                description=description,
                valueType=variable.value_type.__name__,
                defaultValue=variable.default_value,
                definitionPeriod=variable.definition_period,
                entity=variable.entity.key,
                possibleValues=None,
                possibleKeys=None,
                reference=reference,
                quantityType=FLOW.lower()
                if not hasattr(variable, "quantity_type")
                else variable.quantity_type.lower(),
            )
            if variable_metadata[variable.name]["valueType"] == "Enum":
                if (len(variable.possible_values) > 100) and (
                    variable.name != "BRMA"
                ):
                    del variable_metadata[variable.name]
                    raise ValueError(
                        f"Enums with more than 100 values are not supported ({variable.name} has {len(variable.possible_values)})."
                    )
                variable_metadata[variable.name]["possibleValues"] = [
                    dict(key=enum.name, value=enum.value)
                    for enum in variable.possible_values
                ]
                variable_metadata[variable.name]["defaultValue"] = dict(
                    key=variable.default_value.name,
                    value=variable.default_value.value,
                )
        except:
            pass
    return variable_metadata


def create_situation(situation_json: dict) -> Callable:
    def situation(sim: IndividualSim):
        sim.situation_data = situation_json
        sim.build()
        return sim

    return situation
