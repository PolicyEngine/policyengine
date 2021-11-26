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
    variables = list(
        filter(
            lambda variable: hasattr(variable, "metadata")
            and "policyengine" in variable.metadata,
            variables,
        )
    )
    variable_metadata = {}
    for variable in variables:
        try:
            variable_metadata[variable.name] = dict(
                name=variable.name,
                unit=variable.unit,
                label=variable.label,
                documentation=variable.documentation,
                value_type=variable.value_type.__name__,
                default_value=variable.default_value,
                definition_period=variable.definition_period,
                entity=variable.entity.key,
            )
            if variable_metadata[variable.name]["value_type"] == "Enum":
                variable_metadata[variable.name]["possible_values"] = list(
                    map(lambda enum: enum.value, variable.possible_values)
                )
                variable_metadata[variable.name][
                    "default_value"
                ] = variable.default_value.value
        except:
            pass
    return variable_metadata


def create_situation(
    household: dict,
    entities: Tuple[str],
    entity_hierarchy: dict,
    entity_metadata: dict,
) -> Callable:
    node = household

    def situation(sim_: IndividualSim) -> IndividualSim:
        def extract(sim, node, child_entities, parents):
            for entity in child_entities:
                for instance in node[entity]:
                    variables = {}
                    for v in node[entity][instance]["variables"].values():
                        variables[v["short_name"]] = v["value"]
                    sim.add_data(
                        entity
                        if entity_hierarchy[entity]["is_group"]
                        else "person",
                        name=instance,
                        **variables
                    )
                    if entity_hierarchy[entity]["is_group"]:
                        parents[entity_metadata[entity]["plural"]] += [
                            instance
                        ]
                        sim = extract(
                            sim,
                            node[entity][instance],
                            entity_hierarchy[entity]["children"],
                            parents,
                        )
                        parents[entity_metadata[entity]["plural"]].remove(
                            instance
                        )
                    else:
                        for entity_plural in parents:
                            for parent_entity in parents[entity_plural]:
                                role_plural = entity_metadata["household"][
                                    "roles"
                                ][entity]["plural"]
                                if (
                                    role_plural
                                    not in sim.situation_data[entity_plural][
                                        parent_entity
                                    ]
                                ):
                                    sim.situation_data[entity_plural][
                                        parent_entity
                                    ][role_plural] = []
                                sim.situation_data[entity_plural][
                                    parent_entity
                                ][role_plural] += [instance]
            return sim

        sim_ = extract(
            sim_,
            node,
            entities,
            {
                entity_metadata[entity]["plural"]: []
                for entity in entity_metadata.keys()
            },
        )
        return sim_

    return situation
