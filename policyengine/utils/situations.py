"""
Functions to convert URL query parameters into OpenFisca situation initialiser functions.
"""

from typing import Callable, Dict, Tuple
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_core.model_api import Enum

from openfisca_tools import IndividualSim


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
            variable_metadata[variable.name] = dict(
                name=variable.name,
                unit=variable.unit,
                label=variable.label,
                documentation=variable.documentation,
                value_type=variable.value_type.__name__,
                defaultValue=variable.default_value,
                definitionPeriod=variable.definition_period,
                entity=variable.entity.key,
            )
            if variable_metadata[variable.name]["value_type"] == "Enum":
                variable_metadata[variable.name]["possible_values"] = list(
                    map(lambda enum: enum.value, variable.possible_values)
                )
                variable_metadata[variable.name][
                    "defaultValue"
                ] = variable.default_value.value
        except:
            pass
    return variable_metadata


def create_situation(situation_json: dict) -> Callable:
    def situation(sim: IndividualSim):
        sim.situation_data = situation_json
        sim.build()
        return sim

    return situation
