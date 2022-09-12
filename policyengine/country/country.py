import logging
from time import time
from types import ModuleType
from typing import Callable, Dict, Type
import numpy as np
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_core.simulation_builder import SimulationBuilder, Simulation
from openfisca_core.model_api import Enum
from openfisca_core.reforms import Reform
from policyengine.country.openfisca.computation_trees import (
    get_computation_trees_json,
)
from policyengine.country.openfisca.entities import build_entities
from policyengine.country.openfisca.parameters import build_parameters
from policyengine.country.openfisca.reforms import apply_reform, PolicyReform
from policyengine.country.openfisca.variables import build_variables
from policyengine.country.results_config import PolicyEngineResultsConfig
from policyengine.impact.household.earnings_impact import earnings_impact
from policyengine.impact.population.charts.age import age_chart
from policyengine.web_server.cache import PolicyEngineCache, cached_endpoint
from policyengine.web_server.logging import PolicyEngineLogger
import dpath
from policyengine.impact.population.charts import (
    decile_chart,
    inequality_chart,
    intra_decile_chart,
    poverty_chart,
    waterfall_chart,
)
from policyengine.impact.population.by_provision import (
    get_breakdown_and_chart_per_provision,
)
from policyengine.impact.population.metrics import headline_metrics
from openfisca_tools.data import Dataset


class PolicyEngineCountry:
    """Base class for a PolicyEngine country. Each country has a set of API endpoints available."""

    api_endpoints: Dict[str, Callable] = None
    """The API endpoints available for this country.
    """

    name: str = None
    """The name of the country.
    """

    openfisca_country_model: ModuleType = None
    """The OpenFisca country model for this country.
    """

    default_reform: Reform = None
    """An OpenFisca reform to apply to the country model before use.
    """

    results_config: Type[PolicyEngineResultsConfig] = None
    """The results configuration for this country. Used to interface with the OpenFisca country model.
    """

    dataset: Dataset = None
    dataset_year: int = None

    def __init__(self):
        self.api_endpoints = dict(
            entities=self.entities,
            variables=self.variables,
            parameters=self.parameters,
            parameter=self.parameter,
            budgetary_impact=self.budgetary_impact,
            calculate=self.calculate,
            population_reform=self.population_reform,
            endpoint_runtimes=self.endpoint_runtimes,
            household_variation=self.household_variation,
            computation_tree=self.computation_tree,
            dependencies=self.dependencies,
            leaf_nodes=self.leaf_nodes,
            age_chart=self.age_chart,
            population_breakdown=self.population_breakdown,
            auto_ubi=self.auto_ubi,
        )
        if self.name is None:
            self.name = self.__class__.__name__.lower()
        if self.openfisca_country_model is None:
            raise ValueError("No OpenFisca country model specified.")
        (
            self.tax_benefit_system_type,
            self.microsimulation_type,
            self.individualsim_type,
        ) = map(
            lambda name: getattr(self.openfisca_country_model, name),
            ("CountryTaxBenefitSystem", "Microsimulation", "IndividualSim"),
        )
        self.tax_benefit_system = self.tax_benefit_system_type()
        self.baseline_tax_benefit_system = self.tax_benefit_system_type()
        if self.default_reform is not None:
            apply_reform(self.default_reform, self.tax_benefit_system)

        self.entity_data = build_entities(self.tax_benefit_system)
        self.variable_data = build_variables(self.tax_benefit_system)
        self.parameter_data = build_parameters(self.tax_benefit_system)

        self.baseline_microsimulation = None

        self.endpoint_runtimes = dict(
            population_impact_reform_only=[10],
            population_impact_reform_and_baseline=[20],
            household_variation_baseline_only=[10],
            household_variation_reform_and_baseline=[20],
            auto_ubi=[10],
            age_chart=[10],
        )

    def create_reform(self, parameters: dict) -> PolicyReform:
        """Generate an OpenFisca reform from PolicyEngine parameters.

        Args:
            parameters (dict): The PolicyEngine parameters.

        Returns:
            Reform: The OpenFisca reform.
        """
        return PolicyReform(
            parameters, self.parameter_data, default_reform=self.default_reform
        )

    def create_microsimulations(
        self,
        parameters: dict,
        force_refresh_baseline: bool = False,
        do_not_cache: bool = False,
    ):
        """Generate a microsimulations from PolicyEngine parameters.

        Args:
            parameters (dict): The PolicyEngine parameters.
            force_refresh_baseline (bool): If True, force a refresh of the baseline microsimulation.
            do_not_cache (bool): If True, do not cache the microsimulation.
        """
        policy_reform = self.create_reform(parameters)
        if (
            not policy_reform.edits_baseline
            and self.baseline_microsimulation is None
            and not do_not_cache
        ):
            try:
                baseline = (
                    self.baseline_microsimulation
                ) = self.microsimulation_type(
                    self.default_reform, dataset=self.dataset
                )
            except OSError:
                logging.warning("Dataset corrupted, re-downloading.")
                self.dataset.download(self.dataset_year)
                baseline = (
                    self.baseline_microsimulation
                ) = self.microsimulation_type(
                    self.default_reform, dataset=self.dataset
                )

        elif policy_reform.edits_baseline or force_refresh_baseline:
            baseline = self.microsimulation_type(policy_reform.baseline)
        else:
            baseline = self.baseline_microsimulation
        reformed = self.microsimulation_type(policy_reform.reform)

        # Apply multipliers

        for simulation in (baseline, reformed):
            for variable in simulation.simulation.tax_benefit_system.variables:
                if (
                    hasattr(variable, "metadata")
                    and variable.metadata.get("multiplier") is not None
                ):
                    multiplier = variable.metadata.get("multiplier")
                    values = simulation.calc(variable.name)
                    new_values = values * multiplier
                    simulation.set_input(variable.name, new_values)

        return baseline, reformed

    def create_individualsims(self, parameters: dict, situation: dict):
        """Generate a individual simulations from PolicyEngine parameters.

        Args:
            parameters (dict): The PolicyEngine parameters.
            situation (dict): The OpenFisca situation JSON.
        """
        policy_reform = self.create_reform(parameters)
        policy_date = parameters.get("baseline_policy_date")
        baseline = self.individualsim_type(policy_reform.baseline)
        baseline.situation_data = situation
        baseline.build()
        if len(parameters) > (
            2 if "baseline_policy_date" in parameters else 1
        ):
            reformed = self.individualsim_type(policy_reform.reform)
            reformed.situation_data = situation
            reformed.build()
        else:
            reformed = None
        if policy_date is not None:
            year = int(str(policy_date)[:4])
            baseline.year = year
            if reformed is not None:
                reformed.year = year

        return baseline, reformed

    def create_openfisca_simulation(self, parameters: dict) -> Simulation:
        """Initialises an OpenFisca simulation from given household or reform parameters (optimised for performance by skipping no-reform applications).

        Args:
            parameters (dict): Policy reform parameters, and a 'household' entry.

        Returns:
            Simulation: The OpenFisca Simulation object.
        """
        if len(parameters) == 1:
            # Cache the tax-benefit system for no-reform simulations
            system = self.tax_benefit_system
        else:
            reform = self.create_reform(parameters)
            system = apply_reform(
                reform.reform, self.tax_benefit_system_type()
            )
        return SimulationBuilder().build_from_entities(
            system, parameters["household"]
        )

    def entities(self, params: dict, logger: PolicyEngineLogger) -> dict:
        """Get the available entities for the OpenFisca country model."""
        return self.entity_data

    def variables(self, params: dict, logger: PolicyEngineLogger) -> dict:
        """Get the available entities for the OpenFisca country model."""
        return self.variable_data

    def parameters(self, params: dict, logger: PolicyEngineLogger) -> dict:
        """Get the available entities for the OpenFisca country model."""
        if "policy_date" in params:
            return build_parameters(
                self.baseline_tax_benefit_system,
                date=params.get("policy_date"),
            )
        return self.parameter_data

    def parameter(self, params: dict, logger: PolicyEngineLogger) -> dict:
        """Get a specific parameter."""
        return self.parameter_data[params["q"]]

    @cached_endpoint
    def budgetary_impact(
        self, params: dict, logger: PolicyEngineLogger
    ) -> dict:
        """Get the budgetary impact of a reform."""
        baseline, reformed = self.create_microsimulations(params)
        baseline_net_income = baseline.calc(
            self.results_config.household_net_income_variable
        ).sum()
        reformed_net_income = reformed.calc(
            self.results_config.household_net_income_variable
        ).sum()
        difference = reformed_net_income - baseline_net_income
        return {
            "budgetary_impact": difference,
        }

    def calculate(
        self,
        params: dict,
        logger: PolicyEngineLogger,
    ) -> dict:
        """Calculate variables for a given household and policy reform."""
        simulation = self.create_openfisca_simulation(params)
        system = simulation.tax_benefit_system

        requested_computations = dpath.util.search(
            params["household"],
            "*/*/*/*",
            afilter=lambda t: t is None,
            yielded=True,
        )
        computation_results = {}

        for computation in requested_computations:
            path = computation[0]
            entity_plural, entity_id, variable_name, period = path.split("/")
            variable = system.get_variable(variable_name)
            result = simulation.calculate(variable_name, period)
            population = simulation.get_population(entity_plural)
            try:
                entity_index = population.get_index(entity_id)

                if variable.value_type == Enum:
                    entity_result = result.decode()[entity_index].name
                elif variable.value_type == float:
                    entity_result = float(str(result[entity_index]))
                elif variable.value_type == str:
                    entity_result = str(result[entity_index])
                else:
                    entity_result = result.tolist()[entity_index]

                # Bug fix, unclear of the root cause

                if (
                    isinstance(entity_result, list)
                    and len(entity_result) > 2_000
                ):
                    entity_result = {period: entity_result[-1]}
            except:
                # In cases of axes, the entity ID won't resolve (e.g. you requested a value for person, but instead there's on person1, person2, ...)
                entity_result = list(result.astype(float))

            dpath.util.new(computation_results, path, entity_result)

        dpath.util.merge(params["household"], computation_results)

        return params["household"]

    def endpoint_runtimes(
        self, params: dict, logger: PolicyEngineLogger
    ) -> dict:
        """Get the average runtime of a population reform."""
        average_runtimes = {}
        for key in self.endpoint_runtimes:
            while len(self.endpoint_runtimes[key]) > 10:
                self.endpoint_runtimes[key].pop(0)
            average_runtimes[key] = np.average(self.endpoint_runtimes[key])
        return average_runtimes

    @cached_endpoint
    def population_reform(
        self, params: dict, logger: PolicyEngineLogger
    ) -> dict:
        """Compute the population-level impact of a reform."""
        start_time = time()
        edits_baseline = any(["baseline_" in param for param in params])
        baseline, reformed = self.create_microsimulations(params)
        rel_income_decile_chart, avg_income_decile_chart = decile_chart(
            baseline, reformed, self.results_config
        )
        rel_wealth_decile_chart, avg_wealth_decile_chart = decile_chart(
            baseline,
            reformed,
            self.results_config,
            decile_type="wealth",
        )
        result = dict(
            **headline_metrics(baseline, reformed, self.results_config),
            rel_income_decile_chart=rel_income_decile_chart,
            avg_income_decile_chart=avg_income_decile_chart,
            rel_wealth_decile_chart=rel_wealth_decile_chart,
            avg_wealth_decile_chart=avg_wealth_decile_chart,
            poverty_chart=poverty_chart(
                baseline, reformed, False, self.results_config
            ),
            deep_poverty_chart=poverty_chart(
                baseline, reformed, True, self.results_config
            ),
            waterfall_chart=waterfall_chart(
                baseline, reformed, self.results_config
            ),
            intra_income_decile_chart=intra_decile_chart(
                baseline, reformed, self.results_config
            ),
            intra_wealth_decile_chart=intra_decile_chart(
                baseline,
                reformed,
                self.results_config,
                decile_type="wealth",
            ),
            inequality_chart=inequality_chart(
                baseline,
                reformed,
                self.results_config,
            ),
        )
        classification = (
            "reform_and_baseline" if edits_baseline else "reform_only"
        )
        self.endpoint_runtimes[f"population_impact_{classification}"].append(
            time() - start_time
        )
        return result

    @cached_endpoint
    def auto_ubi(self, params=None, logger=None):
        """Compute the size of a UBI which makes a given policy reform budget-neutral."""
        start_time = time()
        baseline, reformed = self.create_microsimulations(params)
        revenue = (
            baseline.calc(
                self.results_config.household_net_income_variable
            ).sum()
            - reformed.calc(
                self.results_config.household_net_income_variable
            ).sum()
        )
        UBI_amount = max(
            0,
            revenue / baseline.calc(self.results_config.person_variable).sum(),
        )
        self.endpoint_runtimes["auto_ubi"].append(time() - start_time)
        return {"UBI": float(UBI_amount)}

    @cached_endpoint
    def household_variation(self, params=None, logger=None):
        """Compute how changes in earnings affect household income."""
        start_time = time()
        baseline, reformed = self.create_individualsims(
            params, params["household"]
        )
        result = earnings_impact(baseline, reformed, self.results_config)
        has_reform = len(params) > 1
        classification = (
            "reform_and_baseline" if has_reform else "baseline_only"
        )
        self.endpoint_runtimes[f"household_variation_{classification}"].append(
            time() - start_time
        )
        return result

    def computation_tree(self, params=None):
        """Get the computation tree for a given household (with any policy reforms applied)."""
        simulation = self.create_openfisca_simulation(params)
        return get_computation_trees_json(simulation, params)

    def dependencies(self, params=None):
        """Get a list of all variables needed to compute a given household simulation."""
        simulation = self.create_openfisca_simulation(params)
        trees = get_computation_trees_json(simulation, params)[
            "computation_trees"
        ]

        def get_dependencies(node):
            nodes = [node["name"]]
            for child in node["children"]:
                nodes += get_dependencies(child)
            return list(set(nodes))

        return dict(
            dependencies=list(
                set(sum([get_dependencies(tree) for tree in trees], []))
            )
        )

    def leaf_nodes(self, params=None):
        """Get a list of the input variables involved in a given household simulation."""
        simulation = self.create_openfisca_simulation(params)

        trees = get_computation_trees_json(simulation, params)[
            "computation_trees"
        ]

        def get_leaf_nodes(node):
            if len(node["children"]) == 0:
                return [node["name"]]
            else:
                return sum(
                    [get_leaf_nodes(child) for child in node["children"]], []
                )

        return dict(
            leaf_nodes=list(
                set(sum([get_leaf_nodes(tree) for tree in trees], []))
            )
        )

    @cached_endpoint
    def age_chart(self, params: dict = None, logger=None):
        """Generate a chart showing the average change to income by age."""
        start_time = time()
        baseline, reformed = self.create_microsimulations(params)
        chart = age_chart(baseline, reformed, self.results_config)
        self.endpoint_runtimes["age_chart"].append(time() - start_time)
        return dict(
            age_chart=chart,
        )

    @cached_endpoint
    def population_breakdown(self, params=None, logger=None):
        """Score a policy reform with a breakdown by provision."""
        baseline, reformed = self.create_microsimulations(params)
        return get_breakdown_and_chart_per_provision(
            self,
            params,
            baseline,
            reformed,
            self.results_config,
        )
