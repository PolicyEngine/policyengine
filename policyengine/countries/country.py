from pathlib import Path
from typing import Dict, Tuple, Type
from openfisca_tools.model_api import ReformType
import yaml
from openfisca_core.taxbenefitsystems.tax_benefit_system import (
    TaxBenefitSystem,
)
from policyengine.impact.population.revenue_breakdown import (
    get_breakdown_per_provision,
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
    default_household_file: Path
    entity_hierarchy_file: Path
    version: str

    results_config: Type[PolicyEngineResultsConfig]

    def __init__(self):
        self.default_reform = (
            use_current_parameters(),
            add_parameter_file(self.parameter_file.absolute())
            if self.parameter_file is not None
            else (),
            self.default_reform,
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
            default_household=self.default_household,
            population_breakdown=self.population_breakdown,
        )
        with open(self.entity_hierarchy_file) as f:
            self.entities = dict(
                entities=build_entities(
                    self.baseline.simulation.tax_benefit_system
                ),
                hierarchy=yaml.safe_load(f),
            )

        with open(self.default_household_file) as f:
            self.default_household_data = yaml.safe_load(f)

    def _create_reform_sim(self, reform: ReformType) -> Microsimulation:
        sim = self.Microsimulation(
            (self.default_reform, reform), dataset=self.default_dataset
        )
        sim.simulation.trace = True
        self.default_year = 2021
        sim.calc("net_income")
        return sim

    def population_reform(self, params: dict = None):
        reform = create_reform(params, self.policyengine_parameters)
        reformed = self._create_reform_sim(reform)
        return dict(
            **headline_metrics(self.baseline, reformed, self.results_config),
            decile_chart=decile_chart(
                self.baseline, reformed, self.results_config
            ),
            poverty_chart=poverty_chart(
                self.baseline, reformed, self.results_config
            ),
            waterfall_chart=population_waterfall_chart(
                self.baseline, reformed, self.results_config
            ),
            intra_decile_chart=intra_decile_chart(
                self.baseline, reformed, self.results_config
            ),
        )

    @exclude_from_cache
    def household_reform(self, params=None):
        situation = create_situation(
            params["household"],
            ["household"],
            self.entities["hierarchy"],
            self.entities["entities"],
        )
        reform = create_reform(params, self.policyengine_parameters)
        baseline_config = self.default_reform
        reform_config = self.default_reform, reform
        baseline: IndividualSim = situation(
            self.IndividualSim(baseline_config, year=2021)
        )
        reformed: IndividualSim = situation(
            self.IndividualSim(reform_config, year=2021)
        )
        baseline.calc("net_income")
        reformed.calc("net_income")
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
        reform = create_reform(params, self.policyengine_parameters)
        reformed = self.Microsimulation(
            (self.default_reform, reform), dataset=self.default_dataset
        )
        revenue = (
            self.baseline.calc(self.results_config.net_income_variable).sum()
            - reformed.calc(self.results_config.net_income_variable).sum()
        )
        UBI_amount = max(
            0,
            revenue
            / self.baseline.calc(self.results_config.person_variable).sum(),
        )
        return {"UBI": float(UBI_amount)}

    @exclude_from_cache
    def parameters(self, params=None):
        return self.policyengine_parameters

    @exclude_from_cache
    def entities(self, params=None):
        return self.entities

    @exclude_from_cache
    def variables(self, params=None):
        return self.policyengine_variables

    @exclude_from_cache
    def default_household(self, params=None):
        return self.default_household_data

    def population_breakdown(self, params=None):
        reform, provisions = create_reform(
            params, self.policyengine_parameters, return_descriptions=True
        )
        return get_breakdown_per_provision(
            reform, provisions, self.baseline, self._create_reform_sim
        )
