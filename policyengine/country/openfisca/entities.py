from openfisca_core.entities.role import Role
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_core.entities import Entity


def build_entities(tax_benefit_system: TaxBenefitSystem) -> dict:
    entities = {
        entity.key: build_entity(entity)
        for entity in tax_benefit_system.entities
    }
    return entities


def build_entity(entity: Entity) -> dict:
    formatted_doc = entity.doc.strip()

    formatted_entity = {
        "key": entity.key,
        "label": entity.label,
        "is_group": not entity.is_person,
        "plural": entity.plural,
        "description": entity.label,
        "documentation": formatted_doc,
    }
    if not entity.is_person:
        formatted_entity["roles"] = {
            role.key: build_role(role) for role in entity.roles
        }
    return formatted_entity


def build_role(role: Role) -> dict:
    formatted_role = {
        "key": role.key,
        "label": role.label,
        "plural": role.plural,
        "description": role.doc,
    }

    if role.max:
        formatted_role["max"] = role.max
    if role.subroles:
        formatted_role["max"] = len(role.subroles)

    return formatted_role
