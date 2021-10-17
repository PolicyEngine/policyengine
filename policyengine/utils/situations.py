"""
Functions to convert URL query parameters into OpenFisca situation initialiser functions.
"""

from openfisca_core.taxbenefitsystems import TaxBenefitSystem


def create_situation(params: dict, system: TaxBenefitSystem):
    entities = {entity.key: entity for entity in system.entities}
    def situation(sim):
        situation_data = {}
        entity_membership = {}
        for entity in entities:
            situation_data[entity] = {}
            entity_membership[entity] = {}
        for key in params:
            components = key.split("_")
            if components[0] != "policy":
                variable = "_".join(components[:-1])
                entity_id = components[-1]
                try:
                    value = float(params[key])
                except:
                    value = params[key]
                if value == "true":
                    value = True
                elif value == "false":
                    value = False
                if variable in system.variables:
                    variable_entity = system.variables[variable].entity
                    if entity_id not in situation_data[variable_entity.plural]:
                        situation_data[variable_entity.plural][entity_id] = {}
                    situation_data[variable_entity.plural][entity_id] = value
                elif variable in entities:
                    if isinstance(value, float):
                        value = str(int(value))
                    situation_data[variable_entity.plural]
        members_of_families = sum(map(list, family_members.values()), [])

        def is_adult(p_id):
            return people[p_id]["age"] >= 18

        def is_child(p_id):
            return not is_adult(p_id)

        for person in people:
            if "age" not in people[person]:
                people[person]["age"] = 18
            if person not in members_of_families:
                family_names = list(family_members.keys())
                i = 0
                if i == len(family_names):
                    families[str(i + 1)] = {}
                    family_names += [str(i + 1)]
                    family_members[str(i + 1)] = []
                adoptive_family = family_names[i]
                while (
                    len(
                        list(filter(is_adult, family_members[adoptive_family]))
                    )
                    >= 2
                ):
                    i += 1
                    if i == len(families):
                        families[str(i + 1)] = {}
                        family_names += [str(i + 1)]
                        family_members[str(i + 1)] = []
                    adoptive_family = family_names[i]
                family_members[adoptive_family] += [person]
        i = 0
        for person_id, person in people.items():
            if i == 0:
                id_vars = dict(is_household_head=True, is_benunit_head=True)
                i += 1
            else:
                id_vars = dict()
            sim.add_person(**person, **id_vars, name=person_id)
        for family_id, family in families.items():
            sim.add_benunit(
                **family,
                adults=list(filter(is_adult, family_members[family_id])),
                children=list(filter(is_child, family_members[family_id])),
            )
        sim.add_household(
            **household,
            adults=list(filter(is_adult, people)),
            children=list(filter(is_child, people)),
        )
        return sim

    return situation
