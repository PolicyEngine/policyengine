"""
IndividualSim and any other interfaces to intialising and running simulations on hypothetical situations.
"""
from openfisca_core.entities.entity import Entity
from policyengine_core.api.general import ReformType
import numpy as np
from openfisca_core.simulation_builder import SimulationBuilder
from openfisca_core.taxbenefitsystems.tax_benefit_system import (
    TaxBenefitSystem,
)
from openfisca_core.periods import period


class IndividualSim:
    tax_benefit_system: TaxBenefitSystem

    def __init__(self, reform: ReformType = (), year: int = 2021) -> None:
        """Initialises a hypothetical simulation.

        Args:
            reform (ReformType, optional): The reform to apply. Defaults to ().
            year (int, optional): The default year input. Defaults to 2020.
        """
        self.year = year
        self.reforms = reform
        self.system = self.tax_benefit_system()
        self.sim_builder = SimulationBuilder()
        self.entity_names = {var.key: var for var in self.system.entities}
        self.apply_reform(self.reforms)
        self.situation_data = {entity: {} for entity in self.entity_names}
        self.varying = False
        self.num_points = None

        # Add add_entity functions

        for entity in self.entity_names:
            setattr(
                self,
                f"add_{entity}",
                lambda *args, **kwargs: self.add_data(
                    *args, **kwargs, entity=entity
                ),
            )

    def build(self):
        self.sim = self.sim_builder.build_from_entities(
            self.system, self.situation_data
        )

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

    def add_data(
        self,
        entity: str = "person",
        name: str = None,
        input_period: str = None,
        auto_period: str = True,
        **kwargs: dict,
    ) -> None:
        """Add an entity to the situation data.

        Args:
            entity (str, optional): The entity name. Defaults to "person".
            name (str, optional): The name of the entity instance. Defaults to None.
            input_period (str, optional): The input period for the values. Defaults to None.
            auto_period (str, optional): Whether to automatically repeat inputs onto subperiods. Defaults to True.
            kwargs (dict): A dictionary of (variable, value).
        """
        input_period = input_period or self.year
        entity_plural = self.entities[entity].plural
        if name is None:
            name = (
                entity + "_" + str(len(self.situation_data[entity_plural]) + 1)
            )
        if auto_period:
            data = {}
            for var, value in kwargs.items():
                try:
                    def_period = self.system.get_variable(
                        var
                    ).definition_period
                    if def_period in ["eternity", "year"]:
                        input_periods = [input_period]
                    else:
                        input_periods = period(input_period).get_subperiods(
                            def_period
                        )
                    data[var] = {
                        str(subperiod): value for subperiod in input_periods
                    }
                except:
                    data[var] = value
        self.situation_data[entity_plural][name] = data

    def get_entity(self, name: str) -> Entity:
        """Gets the entity type of the entity with a given name.

        Args:
            name (str): The name of the entity.

        Returns:
            Entity: The type of the entity.
        """
        entity_type = [
            entity
            for entity in self.entities.values()
            if name in self.situation_data[entity.plural]
        ][0]
        return entity_type

    def get_group(self, entity: str, name: str) -> str:
        """Gets the name of the containing entity for a named entity and group type.

        Args:
            entity (str): The group type, e.g. "household".
            name (str): The name of the entity, e.g. "person1".

        Returns:
            str: The containing entity, e.g. "household1".
        """
        containing_entity = [
            group
            for group in self.situation_data[entity.plural]
            if name in self.situation_data[entity.plural][group]["adults"]
            or name in self.situation_data[entity.plural][group]["children"]
        ][0]
        return containing_entity

    def calc(
        self,
        var: str,
        period: int = None,
        target: str = None,
        index: int = None,
    ) -> np.array:
        """Calculates the value of a variable, executing any required formulas.

        Args:
            var (str): The variable to calculate.
            period (int, optional): The time period to calculate for. Defaults to None.
            target (str, optional): The target entity if not all entities are required. Defaults to None.
            index (int, optional): The numerical index of the target entity. Defaults to None.

        Returns:
            np.array: The resulting values.
        """
        if not hasattr(self, "sim"):
            self.build()
        period = period or self.year
        entity = self.system.variables[var].entity
        if target is not None:
            target_entity = self.get_entity(target)
            if target_entity.key != entity.key:
                target = self.get_group(entity, target)
        try:
            result = self.sim.calculate(var, period)
        except:
            try:
                result = self.sim.calculate_add(var, period)
            except:
                result = self.sim.calculate_divide(var, period)
        if self.varying:
            result = result.reshape(
                (self.num_points, len(self.situation_data[entity.plural]))
            ).transpose()
        members = list(self.situation_data[entity.plural])
        if index is not None:
            index = min(len(members) - 1, index)
        if target is not None:
            index = members.index(target)
        if target is not None or index is not None:
            return result[index]
        return result

    def deriv(
        self,
        var: str,
        wrt: str = "employment_income",
        period: int = None,
        var_target: str = None,
        wrt_target: str = None,
    ):
        """Calculates the derivative of one variable with respect to another.

        Args:
            var (str): The target variable.
            wrt (str, optional): The varying variable. Defaults to "employment_income".
            period (int, optional): The time period to calculate over. Defaults to None.
            var_target (str, optional): The target name. Defaults to None.
            wrt_target (str, optional): The source name. Defaults to None.

        Returns:
            np.array: The derivatives as the source variable varies.
        """
        period = period or self.year
        y = self.calc(var, period=period, target=var_target)
        x = self.calc(wrt, period=period, target=wrt_target)
        try:
            y = y.squeeze()
        except:
            pass
        try:
            x = x.squeeze()
        except:
            pass
        x = x.astype(np.float32)
        y = y.astype(np.float32)
        assert (
            len(y) > 1 and len(x) > 1
        ), "Simulation must vary on an axis to calculate derivatives."
        deriv = (y[1:] - y[:-1]) / (x[1:] - x[:-1])
        deriv = np.append(deriv, deriv[-1])
        return deriv

    def reset_vary(self) -> None:
        """Removes an axis from the simulation."""
        del self.situation_data["axes"]
        self.varying = False
        self.num_points = None

    def vary(
        self,
        var: str,
        min: float = 0,
        max: float = 200000,
        step: float = 100,
        index: int = 0,
        period: int = None,
    ) -> None:
        """Adds an axis to the situation, varying one variable.

        Args:
            var (str): The variable to change.
            min (float, optional): The minimum value. Defaults to 0.
            max (float, optional): The maximum value. Defaults to 200000.
            step (float, optional): The step size. Defaults to 100.
            index (int, optional): The specific entity index to target. Defaults to 0.
            period (int, optional): The time period. Defaults to None.
        """
        period = period or self.year
        if "axes" not in self.situation_data:
            self.situation_data["axes"] = [[]]
        count = int((max - min) / step)
        self.situation_data["axes"][0] += [
            {
                "count": count,
                "name": var,
                "min": min,
                "max": max,
                "period": period,
                "index": index,
            }
        ]
        self.build()
        self.varying = True
        self.num_points = count
