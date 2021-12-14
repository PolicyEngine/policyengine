from datetime import datetime
from pathlib import Path
from typing import Dict, Tuple, Type
from openfisca_core.indexed_enums.enum import Enum
from openfisca_core.parameters.parameter import Parameter
from openfisca_tools.model_api import ReformType
import yaml
import dpath
from openfisca_core.taxbenefitsystems.tax_benefit_system import (
    TaxBenefitSystem,
)
from openfisca_core.simulation_builder import SimulationBuilder
from policyengine.impact.population.breakdown import (
    get_breakdown_and_chart_per_provision,
)
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
            )

            self.entities = build_entities(self.baseline_system)
        else:
            if self.default_dataset_year not in self.default_dataset.years:
                self.default_dataset.download(self.default_dataset_year)

            self.default_reform = (
                add_parameter_file(self.parameter_file.absolute())
                if self.parameter_file is not None
                else (),
                self.default_reform,
                use_current_parameters(),
            )

            self.baseline = self.Microsimulation(
                self.default_reform, dataset=self.default_dataset
            )

            self.baseline.simulation.trace = True
            self.default_year = 2021
            self.baseline.calc("net_income")

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
            )

            self.entities = build_entities(
                self.baseline.simulation.tax_benefit_system
            )

    def _get_microsimulations(
        self, params: dict
    ) -> Tuple[Microsimulation, Microsimulation]:
        reform_config = create_reform(
            params, self.policyengine_parameters, self.default_reform[:-1]
        )
        baseline = (
            self.baseline
            if not reform_config["baseline"]["has_changed"]
            else self.Microsimulation(
                reform_config["baseline"]["reform"],
                dataset=self.default_dataset,
            )
        )
        reformed = self.Microsimulation(
            reform_config["reform"]["reform"], dataset=self.default_dataset
        )
        baseline.default_year = 2021
        reformed.default_year = 2021
        return baseline, reformed

    def _get_individualsims(
        self, params: dict
    ) -> Tuple[IndividualSim, IndividualSim]:
        reform_config = create_reform(
            params, self.policyengine_parameters, self.default_reform[:-1]
        )
        situation = create_situation(params["household"])
        baseline = situation(
            self.IndividualSim(reform_config["baseline"]["reform"], 2021)
        )
        reformed = situation(
            self.IndividualSim(reform_config["reform"]["reform"], 2021)
        )
        return baseline, reformed

    def population_reform(self, params: dict = None):
        baseline, reformed = self._get_microsimulations(params)
        rel_decile_chart, avg_decile_chart = decile_chart(
            baseline, reformed, self.results_config
        )
        return dict(
            **headline_metrics(baseline, reformed, self.results_config),
            rel_decile_chart=rel_decile_chart,
            avg_decile_chart=avg_decile_chart,
            poverty_chart=poverty_chart(
                baseline, reformed, self.results_config
            ),
            waterfall_chart=population_waterfall_chart(
                baseline, reformed, self.results_config
            ),
            intra_decile_chart=intra_decile_chart(
                baseline, reformed, self.results_config
            ),
        )

    @exclude_from_cache
    def household_reform(self, params=None):
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
        budget = budget_chart(baseline, reformed, self.results_config)
        mtr = mtr_chart(baseline, reformed, self.results_config)
        return dict(
            **headlines,
            waterfall_chart=waterfall,
            budget_chart=budget,
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
            system = apply_reform(self.default_reform[:-1], self.system())
            system = use_current_parameters(params["policy_date"])(system)
            return get_PE_parameters(system)
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

        def _create_reform(reform):
            return self.Microsimulation(
                (reform_config["reform"]["reform"][0], *reform),
                dataset=self.default_dataset,
            )

        baseline, reformed = self._get_microsimulations(params)
        return get_breakdown_and_chart_per_provision(
            reform_config["reform"]["reform"][1:],
            reform_config["reform"]["descriptions"][1:],
            baseline,
            reformed,
            _create_reform,
            self.results_config,
        )

    @exclude_from_cache
    def calculate(self, params=None):
        system = apply_reform(self.default_reform, self.system())
        simulation = SimulationBuilder().build_from_entities(system, params)

        requested_computations = dpath.util.search(
            params, "*/*/*/*", afilter=lambda t: t is None, yielded=True
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

            dpath.util.new(computation_results, path, entity_result)

        dpath.merge(params, computation_results)

        return params
