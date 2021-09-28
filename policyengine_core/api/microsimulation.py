"""
Microsimulation interfaces and utility functions.
"""
from typing import List, Tuple
from openfisca_core.entities.entity import Entity
from policyengine_core.api.general import ReformType
from microdf.generic import MicroDataFrame
import numpy as np
from openfisca_core.entities import GroupEntity
from openfisca_core.model_api import *
from openfisca_core.simulation_builder import SimulationBuilder
from microdf import MicroSeries
import tables
from openfisca_core.taxbenefitsystems import TaxBenefitSystem


class Microsimulation:
    tax_benefit_system: TaxBenefitSystem
    default_dataset: type
    entities: Tuple[Entity]
    default_role: str = "member"

    def __init__(
        self, reform: ReformType = (), dataset: type = None, year: int = 2020
    ):
        """Initialises a microsimulation.

        Args:
            reform (ReformType): The reform to apply. Can be a tuple of OpenFisca Reforms.
            dataset (type, optional): The dataset to use.
            year (int, optional): The year of the dataset to load. Defaults to 2020.
        """
        tables.file._open_files.close_all()
        self.reform = reform
        if dataset is None:
            self.dataset = self.default_dataset
        else:
            self.dataset = dataset
        if year is None:
            self.year = max(dataset.years)
        else:
            self.year = year
        self.default_year = year
        self.bonus_sims = {}
        self.person_entities = tuple(
            filter(
                lambda entity: not isinstance(entity, GroupEntity),
                self.entities,
            )
        )
        self.person_entity_names = tuple(
            map(lambda entity: entity.key, self.person_entities)
        )
        self.group_entities = tuple(
            filter(
                lambda entity: isinstance(entity, GroupEntity),
                self.entities,
            )
        )
        self.group_entity_names = tuple(
            map(lambda entity: entity.key, self.group_entities)
        )
        self.load_dataset(self.dataset, self.year)

    def apply_reform(self, reform: ReformType) -> None:
        """Recursively applies a reform to the tax-benefit system.

        Args:
            reform (ReformType): The reform to apply to the tax-benefit system.
        """
        for reform in self.reform:
            if isinstance(reform, tuple):
                self.apply_reform(reform)
            else:
                self.system = reform(self.system)

    def load_dataset(self, dataset: type, year: int) -> None:
        """Loads the dataset with the specified year.

        Args:
            dataset (type): The dataset to use.
            year (int): The year of the data to load.
        """
        self.system = self.tax_benefit_system()
        self.apply_reform(self.reform)
        builder = SimulationBuilder()
        builder.create_entities(self.system)

        data = dataset.load(year)

        for person_entity in self.person_entity_names:
            builder.declare_person_entity(
                person_entity, np.array(data[f"{person_entity}_id"])
            )

        for group_entity in self.group_entity_names:
            primary_keys = np.array(data[f"{group_entity}_id"])
            group = builder.declare_entity(group_entity, primary_keys)
            foreign_keys = np.array(data[f"person_{group_entity}_id"])
            if f"person_{group_entity}_role" in data.keys():
                roles = np.array(data[f"person_{group_entity}_role"])
            else:
                roles = np.array([self.default_role] * len(foreign_keys))
            builder.join_with_persons(group, foreign_keys, roles)

        self.simulation = builder.build(self.system)
        self.set_input = self.simulation.set_input

        for variable in data.keys():
            if variable in self.system.variables:
                self.set_input(
                    variable,
                    year,
                    np.array(data[variable]),
                )
        data.close()

    def map_to(
        self, arr: np.array, entity: str, target_entity: str, how: str = None
    ):
        """Maps values from one entity to another.

        Args:
            arr (np.array): The values in their original position.
            entity (str): The source entity.
            target_entity (str): The target entity.
            how (str, optional): A function to use when mapping. Defaults to None.

        Raises:
            ValueError: If an invalid (dis)aggregation function is passed.

        Returns:
            np.array: The mapped values.
        """
        entity_pop = self.simulation.populations[entity]
        target_pop = self.simulation.populations[target_entity]
        if entity == "person" and target_entity in self.group_entity_names:
            if how and how not in (
                "sum",
                "any",
                "min",
                "max",
                "all",
                "value_from_first_person",
            ):
                raise ValueError("Not a valid function.")
            return target_pop.__getattribute__(how or "sum")(arr)
        elif entity in self.group_entity_names and target_entity == "person":
            if not how:
                return entity_pop.project(arr)
            if how == "mean":
                return entity_pop.project(arr / entity_pop.nb_persons())
        elif entity == target_entity:
            return arr
        else:
            return self.map_to(
                self.map_to(arr, entity, "person", how="mean"),
                "person",
                target_entity,
                how="sum",
            )

    def calc(
        self,
        variable: str,
        map_to: str = None,
        how: str = None,
        period: int = None,
        weighted: bool = True,
    ):
        """Calculates the values of a variable, executing any formulas required.

        Args:
            variable (str): The name of the variable.
            map_to (str, optional): The entity to map to. Defaults to None (the original entity).
            how (str, optional): The (dis)aggregation function to use when mapping. Defaults to None.
            period (int, optional): The time period to calculate for. Defaults to 2020.
            weighted (bool, optional): Whether to return weighted results. Defaults to True.

        Returns:
            Union[np.array, MicroSeries]: A weighted or unweighted array.
        """
        if period is None:
            period = self.default_year
        var_metadata = self.simulation.tax_benefit_system.variables[variable]
        entity = var_metadata.entity.key
        arr = self.simulation.calculate(variable, period)
        if var_metadata.value_type == Enum:
            arr = arr.decode_to_str()
        if map_to:
            arr = self.map_to(arr, entity, map_to, how=how)
            entity = map_to
        if weighted:
            series = MicroSeries(
                arr,
                weights=self.calc(
                    f"{entity}_weight", period=period, weighted=False
                ),
                index=self.calc(f"{entity}_id", period=period, weighted=False),
            )
            return series
        else:
            return arr

    def df(
        self,
        variables: List[str],
        map_to: str = None,
        how: str = None,
        period: int = None,
    ) -> MicroDataFrame:
        """Constructs a DataFrame of multiple variables.

        Args:
            variables (List[str]): The variables to include in the DataFrame.
            period (int, optional): The time period to calculate for. Defaults to None.

        Returns:
            MicroDataFrame: The weighted DataFrame.
        """
        if period is None:
            period = self.default_year
        df_dict = {}
        var_metadata = self.simulation.tax_benefit_system.variables[
            variables[0]
        ]
        entity = var_metadata.entity.key or map_to
        weights = self.calc(f"{entity}_weight", period=period, weighted=False)
        for var in variables:
            df_dict[var] = self.calc(
                var, period=period, map_to=entity, how=how
            )
        return MicroDataFrame(df_dict, weights=weights)

    def deriv(
        self,
        target: str,
        wrt: str,
        delta: float = 100,
        percent: bool = False,
        group_limit: int = 5,
    ) -> MicroSeries:
        """Calculates the derivative of one variable with respect to another.

        Args:
            target (str): The target variable.
            wrt (str): The source variable.
            delta (float, optional): The amount to increase the source by. Defaults to 100.
            percent (bool, optional): Whether the delta is relative to the original value or absolute. Defaults to False.
            group_limit (int, optional): The maximum number of people in a group to calculate derivatives for. Defaults to 5.

        Raises:
            ValueError: If source variable is upstream of the target variable.

        Returns:
            MicroSeries: The weighted derivatives.
        """
        system = self.simulation.tax_benefit_system
        target_entity = system.variables[target].entity.key
        wrt_entity = system.variables[wrt].entity.key
        if target_entity == wrt_entity:
            # calculating a derivative with both source and target in the same entity
            config = (wrt, delta, percent, "same-entity")
            if config not in self.bonus_sims:
                self.bonus_sims[config] = type(self)(
                    self.bonus_sims,
                    dataset=self.dataset,
                    year=self.year,
                )
                original_values = (
                    self.bonus_sims[config].calc(wrt, period=self.year).values
                )
                if not percent:
                    self.bonus_sims[config].simulation.set_input(
                        wrt, self.year, original_values + delta
                    )
                else:
                    self.bonus_sims[config].simulation.set_input(
                        wrt, self.year, original_values * (1 + delta)
                    )

            bonus_sim = self.bonus_sims[config]
            bonus_increase = bonus_sim.calc(wrt).astype(float) - self.calc(
                wrt
            ).astype(float)
            target_increase = bonus_sim.calc(target).astype(float) - self.calc(
                target
            ).astype(float)

            gradient = target_increase / bonus_increase

            return gradient
        elif (
            target_entity in self.group_entity_names
            and wrt_entity in self.person_entity_names
        ):
            # calculate the derivative for a group variable wrt a source variable, independent of other members in the group
            index_in_group = (
                self.calc("person_id")
                .groupby(self.calc(f"{target_entity}_id", map_to="person"))
                .cumcount()
            )
            max_group_size = min(max(index_in_group) + 1, group_limit)

            derivative = np.empty((len(index_in_group))) * np.nan

            for i in range(max_group_size):
                config = (wrt, delta, percent, "group-entity", i)
                if config not in self.bonus_sims:
                    self.bonus_sims[config] = type(self)(
                        self.reform,
                        dataset=self.dataset,
                        year=self.year,
                    )
                    original_values = (
                        self.bonus_sims[config]
                        .calc(wrt, period=self.year)
                        .values
                    )

                    if not percent:
                        self.bonus_sims[config].simulation.set_input(
                            wrt,
                            self.year,
                            original_values + delta * (index_in_group == i),
                        )
                    else:
                        self.bonus_sims[config].simulation.set_input(
                            wrt,
                            self.year,
                            original_values
                            * (1 + delta * (index_in_group == i)),
                        )

                bonus_sim = self.bonus_sims[config]
                bonus_increase = bonus_sim.calc(wrt).astype(float) - self.calc(
                    wrt
                ).astype(float)
                target_increase = bonus_sim.calc(
                    target, map_to="person"
                ).astype(float) - self.calc(target, map_to="person").astype(
                    float
                )
                result = target_increase / bonus_increase
                derivative[bonus_increase > 0] = result[bonus_increase > 0]

            return MicroSeries(
                derivative,
                weights=self.calc("person_weight", weighted=False),
                index=self.calc("person_id", weighted=False),
            )
        else:
            raise ValueError(
                "Unable to compute derivative - target variable must be from a group of or the same as the source variable."
            )

    def deriv_df(
        self, *targets, wrt="employment_income", delta=100, percent=False
    ) -> MicroDataFrame:
        wrt_entity = self.simulation.tax_benefit_system.variables[
            wrt
        ].entity.key
        df = MicroDataFrame(weights=self.entity_weights[wrt_entity])
        for target in targets:
            df[target] = self.deriv(
                target, wrt=wrt, delta=delta, percent=percent
            )
        return df
