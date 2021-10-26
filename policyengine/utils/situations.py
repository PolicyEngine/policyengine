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
    variables = list(map(type, system.variables.values()))
    variables = list(
        filter(
            lambda variable: hasattr(variable, "metadata")
            and "policyengine" in variable.metadata,
            variables,
        )
    )
    variable_metadata = {}
    for v in variables:
        meta = v.metadata["policyengine"]
        var = dict(
            title=v.label,
            short_name=v.__name__,
            description=v.documentation if hasattr(v, "documentation") else "",
            type="amount",
            default=0,
            min=0,
            max=1,
            roles=[],
            entity=v.entity.key,
            hidden=False,
        )
        if v.definition_period != "eternity":
            var["type"] = v.definition_period + "ly"
        if v.value_type == Enum:
            var["options"] = v.possible_values._member_names_
            var["default"] = v.default_value._name_
        elif v.value_type == bool:
            var["type"] = "bool"
        var.update(meta)
        var["value"] = var["default"]
        if "roles" in var:
            for role in var["roles"]:
                if "default" in var["roles"][role]:
                    var["roles"][role]["value"] = var["roles"][role]["default"]
        variable_metadata[var["short_name"]] = var
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
