from pathlib import Path
from typing import Tuple, Type
from openfisca_core.indexed_enums.enum import Enum
from openfisca_core.model_api import Reform
import dpath.util
from openfisca_core.taxbenefitsystems.tax_benefit_system import (
    TaxBenefitSystem,
)
from openfisca_core.simulation_builder import SimulationBuilder
from policyengine.impact.population.breakdown import (
    get_breakdown_and_chart_per_provision,
)
from policyengine.impact.population.charts import age_chart
from policyengine.utils.computation_trees import get_computation_trees_json
from policyengine.utils.general import (
    PolicyEngineResultsConfig,
    exclude_from_cache,
)
from openfisca_tools import Microsimulation, IndividualSim
from policyengine.countries.entities import build_entities
from policyengine.impact.household.charts import (
    budget_chart,
    household_waterfall_chart,
    mtr_chart,
)
from policyengine.impact.household.metrics import headline_figures
from policyengine.impact.population.metrics import headline_metrics
from policyengine.impact.population.charts import (
    decile_chart,
    inequality_chart,
    poverty_chart,
    population_waterfall_chart,
    intra_decile_chart,
)
from policyengine.utils.reforms import (
    add_parameter_file,
    apply_reform,
    create_reform,
    get_PE_parameters,
    use_current_parameters,
)
from policyengine.utils.situations import create_situation, get_PE_variables


class PolicyEngineCountry:
    name: str
    system: Type[TaxBenefitSystem]
    Microsimulation: Type[Microsimulation]
    IndividualSim: Type[IndividualSim]
    default_reform: type = ()
    parameter_file: Path = None
    default_dataset: type
    calculate_only: bool = False
    version: str
    results_config: Type[PolicyEngineResultsConfig]

    def __init__(self):
        if self.calculate_only:
            self.default_reform = (
                add_parameter_file(self.parameter_file.absolute())
                if self.parameter_file is not None
                else (),
                self.default_reform,
                use_current_parameters(),
            )
            self.baseline_system = self.system()
            self.policyengine_parameters = get_PE_parameters(
                self.baseline_system
            )

            self.policyengine_variables = get_PE_variables(
                self.baseline_system
            )

            self.api_endpoints = dict(
                parameters=self.parameters,
                entities=self.entities,
                variables=self.variables,
                calculate=self.calculate,
                household_variation=self.household_variation,
            )

            self.entities = build_entities(self.baseline_system)
        else:
            self.default_reform = (
                add_parameter_file(self.parameter_file.absolute())
                if self.parameter_file is not None
                else (),
                self.default_reform,
                self.Microsimulation.post_reform,
                use_current_parameters(),
            )

            self.baseline = self.Microsimulation(
                self.default_reform,
                dataset=self.default_dataset,
                post_reform=(),
            )

            self.baseline_system = apply_reform(
                self.default_reform[:-1], self.system()
            )
            self.year = 2022

            self.policyengine_parameters = get_PE_parameters(
                self.baseline.simulation.tax_benefit_system
            )

            self.policyengine_variables = get_PE_variables(
                self.baseline.simulation.tax_benefit_system
            )

            self.api_endpoints = dict(
                household_reform=self.household_reform,
                population_reform=self.population_reform,
                ubi=self.ubi,
                parameters=self.parameters,
                entities=self.entities,
                variables=self.variables,
                population_breakdown=self.population_breakdown,
                calculate=self.calculate,
                computation_tree=self.computation_tree,
                household_variation=self.household_variation,
                dependencies=self.dependencies,
                leaf_nodes=self.leaf_nodes,
                age_chart=self.age_chart,
            )

            self.entities = build_entities(
                self.baseline.simulation.tax_benefit_system
            )

    def _get_microsimulations(
        self, params: dict, refresh_baseline: bool = False
    ) -> Tuple[Microsimulation, Microsimulation]:
        if isinstance(params, type) or isinstance(params, tuple):
            reform_config = dict(
                baseline=dict(
                    has_changed=False,
                ),
                reform=dict(
                    reform=(
                        self.default_reform[:-1],
                        params,
                        self.default_reform[-1],
                    ),
                ),
            )
        else:
            reform_config = create_reform(
                params, self.policyengine_parameters, self.default_reform[:-1]
            )
        baseline = (
            self.baseline
            if not reform_config["baseline"]["has_changed"]
            else self.Microsimulation(
                (
                    reform_config["baseline"]["reform"],
                    self.default_reform[-1],
                ),
                dataset=self.default_dataset,
                year=self.default_dataset_year,
                post_reform=(),
            )
        )
        if refresh_baseline and not reform_config["baseline"]["has_changed"]:
            baseline = self.Microsimulation(
                self.default_reform,
                dataset=self.default_dataset,
                post_reform=(),
            )
        reformed = self.Microsimulation(
            (
                reform_config["reform"]["reform"],
                self.default_reform[-1],
            ),
            dataset=self.default_dataset,
            year=self.default_dataset_year,
            post_reform=(),
        )
        baseline.year = 2022
        reformed.year = 2022
        return baseline, reformed

    def _get_individualsims(
        self, params: dict
    ) -> Tuple[IndividualSim, IndividualSim]:
        if isinstance(params, type) or isinstance(params, tuple):
            reform_config = dict(
                baseline=dict(
                    has_changed=False,
                ),
                reform=dict(
                    reform=(
                        self.default_reform[:-1],
                        params,
                        self.default_reform[-1],
                    ),
                ),
            )
        else:
            reform_config = create_reform(
                params, self.policyengine_parameters, self.default_reform[:-1]
            )
        situation = create_situation(params["household"])
        baseline = situation(
            self.IndividualSim(reform_config["baseline"]["reform"], 2022)
        )
        if len(params.keys()) - 1 > 0:
            reformed = situation(
                self.IndividualSim(reform_config["reform"]["reform"], 2022)
            )
        else:
            reformed = baseline
        return baseline, reformed

    def population_reform(self, params: dict = None):
        baseline, reformed = self._get_microsimulations(params)
        rel_income_decile_chart, avg_income_decile_chart = decile_chart(
            baseline, reformed, self.results_config
        )
        rel_wealth_decile_chart, avg_wealth_decile_chart = decile_chart(
            baseline,
            reformed,
            self.results_config,
            decile_type="wealth",
        )
        return dict(
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
            waterfall_chart=population_waterfall_chart(
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

    @exclude_from_cache
    def household_reform(self, params=None):
        # Deprecated - use /calculate or /household_variation
        has_reform = len(params.keys()) - 1 > 0
        baseline, reformed = self._get_individualsims(params)
        headlines = headline_figures(baseline, reformed, self.results_config)
        waterfall = household_waterfall_chart(
            baseline, reformed, self.results_config
        )
        vary_max = max(200000, baseline.calc("employment_income").sum() * 1.5)
        baseline.vary(
            "employment_income",
            step=100,
            max=vary_max,
        )
        reformed.vary(
            "employment_income",
            step=100,
            max=vary_max,
        )
        budget = budget_chart(
            baseline, reformed, False, self.results_config, has_reform
        )
        budget_difference = budget_chart(
            baseline, reformed, True, self.results_config, has_reform
        )
        mtr = mtr_chart(baseline, reformed, self.results_config, has_reform)
        return dict(
            **headlines,
            waterfall_chart=waterfall,
            budget_chart=budget,
            budget_difference_chart=budget_difference,
            mtr_chart=mtr,
        )

    def ubi(self, params=None):
        baseline, reformed = self._get_microsimulations(params)
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
        return {"UBI": float(UBI_amount)}

    @exclude_from_cache
    def parameters(self, params=None):
        if "policy_date" in params:
            return get_PE_parameters(
                self.baseline_system, date=params.get("policy_date")
            )
        return self.policyengine_parameters

    @exclude_from_cache
    def entities(self, params=None):
        return self.entities

    @exclude_from_cache
    def variables(self, params=None):
        return self.policyengine_variables

    def population_breakdown(self, params=None):
        reform_config = create_reform(
            params, self.policyengine_parameters, self.default_reform[:-1]
        )
        if reform_config["baseline"]["has_changed"]:
            baseline_reform_indices = [
                i
                for i in range(len(reform_config["reform"]["descriptions"]))
                if reform_config["reform"]["descriptions"][i]
                in reform_config["baseline"]["descriptions"]
            ]
            filtered_reforms = [
                reform
                for i, reform in enumerate(reform_config["reform"]["reform"])
                if i not in baseline_reform_indices
            ]
            filtered_descriptions = [
                description
                for i, description in enumerate(
                    reform_config["reform"]["descriptions"]
                )
                if i not in baseline_reform_indices
            ]
        else:
            filtered_reforms = reform_config["reform"]["reform"][1:]
            filtered_descriptions = reform_config["reform"]["descriptions"][1:]

        def _create_reform(reform):
            if reform_config["baseline"]["has_changed"]:
                reform_input = (
                    reform_config["baseline"]["reform"][1:],
                    reform_config["reform"]["reform"][0],
                    *reform,
                )
            else:
                reform_input = (reform_config["reform"]["reform"][0], *reform)
            sim = self.Microsimulation(
                reform_input,
                dataset=self.default_dataset,
                post_reform=(),
            )
            sim.year = 2022
            return sim

        baseline, reformed = self._get_microsimulations(params)
        return get_breakdown_and_chart_per_provision(
            filtered_reforms,
            filtered_descriptions,
            baseline,
            reformed,
            _create_reform,
            self.results_config,
        )

    @exclude_from_cache
    def calculate(self, params=None):
        reform = create_reform(
            {x: y for x, y in params.items() if x != "ignoreReform"},
            self.policyengine_parameters,
            self.default_reform[:-1],
        )
        if "ignoreReform" not in params:
            system = apply_reform(reform["reform"]["reform"], self.system())
        else:
            system = apply_reform(reform["baseline"]["reform"], self.system())
        simulation = SimulationBuilder().build_from_entities(
            system, params["household"]
        )

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

            if isinstance(entity_result, list) and len(entity_result) > 2_000:
                entity_result = {period: entity_result[-1]}

            dpath.util.new(computation_results, path, entity_result)

        dpath.util.merge(params["household"], computation_results)

        return params["household"]

    @exclude_from_cache
    def computation_tree(self, params=None):
        reform = create_reform(
            {x: y for x, y in params.items() if x != "ignoreReform"},
            self.policyengine_parameters,
            self.default_reform[:-1],
        )
        if "ignoreReform" not in params:
            system = apply_reform(reform["reform"]["reform"], self.system())
        else:
            system = apply_reform(reform["baseline"]["reform"], self.system())
        simulation = SimulationBuilder().build_from_entities(
            system, params["household"]
        )

        return get_computation_trees_json(simulation, params)

    @exclude_from_cache
    def dependencies(self, params=None):
        reform = create_reform(
            {x: y for x, y in params.items() if x != "ignoreReform"},
            self.policyengine_parameters,
            self.default_reform[:-1],
        )
        if "ignoreReform" not in params:
            system = apply_reform(reform["reform"]["reform"], self.system())
        else:
            system = apply_reform(reform["baseline"]["reform"], self.system())

        simulation = SimulationBuilder().build_from_entities(
            system, params["household"]
        )

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

    @exclude_from_cache
    def leaf_nodes(self, params=None):
        reform = create_reform(
            {x: y for x, y in params.items() if x != "ignoreReform"},
            self.policyengine_parameters,
            self.default_reform[:-1],
        )
        if "ignoreReform" not in params:
            system = apply_reform(reform["reform"]["reform"], self.system())
        else:
            system = apply_reform(reform["baseline"]["reform"], self.system())

        simulation = SimulationBuilder().build_from_entities(
            system, params["household"]
        )

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

    @exclude_from_cache
    def household_variation(self, params=None):
        has_reform = len(params.keys()) - 1 > 0
        baseline, reformed = self._get_individualsims(params)
        employment_income = baseline.calc(
            self.results_config.employment_income_variable
        ).sum()
        self_employment_income = baseline.calc(
            self.results_config.self_employment_income_variable
        ).sum()
        earnings_variable = (
            self.results_config.employment_income_variable
            if employment_income >= self_employment_income
            else self.results_config.self_employment_income_variable
        )
        earnings = max(employment_income, self_employment_income)
        total_income = baseline.calc(
            self.results_config.total_income_variable
        ).sum()
        vary_max = max(200_000, earnings * 1.5)
        baseline.vary(
            earnings_variable,
            step=100,
            max=vary_max,
        )
        if len(params.keys()) - 1 > 0:
            reformed.vary(
                earnings_variable,
                step=100,
                max=vary_max,
            )
        budget = budget_chart(
            baseline,
            reformed,
            False,
            self.results_config,
            has_reform,
            total_income,
        )
        budget_difference = budget_chart(
            baseline,
            reformed,
            True,
            self.results_config,
            has_reform,
            total_income,
        )
        mtr = mtr_chart(
            baseline,
            reformed,
            False,
            self.results_config,
            has_reform,
            total_income,
        )
        mtr_difference = mtr_chart(
            baseline,
            reformed,
            True,
            self.results_config,
            has_reform,
            total_income,
        )
        return dict(
            budget_chart=budget,
            budget_difference_chart=budget_difference,
            mtr_chart=mtr,
            mtr_difference_chart=mtr_difference,
        )

    def age_chart(self, params: dict = None):
        baseline, reformed = self._get_microsimulations(params)
        chart = age_chart(baseline, reformed, self.results_config)
        return dict(
            age_chart=chart,
        )
