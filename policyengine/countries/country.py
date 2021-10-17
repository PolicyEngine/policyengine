from pathlib import Path
from typing import Dict, Tuple, Type
from openfisca_core.taxbenefitsystems.tax_benefit_system import (
    TaxBenefitSystem,
)
from policyengine.api.general import PolicyEngineResultsConfig
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
from policyengine.api.microsimulation import Microsimulation
from policyengine.api.hypothetical import IndividualSim


class PolicyEngineCountry:
    name: str
    system: Type[TaxBenefitSystem]
    Microsimulation: Type[Microsimulation]
    IndividualSim: Type[IndividualSim]
    default_reform: type = ()
    parameter_file: Path = None
    default_dataset: type
    version: str

    results_config: Type[PolicyEngineResultsConfig]

    def __init__(self):
        self.default_reform = (
            use_current_parameters(),
            add_parameter_file(self.parameter_file)
            if self.parameter_file is not None
            else (),
            tuple(self.default_reform),
        )

        self.baseline = self.Microsimulation(
            self.default_reform, dataset=self.default_dataset
        )

        self.policyengine_parameters = get_PE_parameters(
            self.baseline.simulation.tax_benefit_system
        )

        self.api_endpoints = dict(
            household_reform=self.household_reform,
            population_reform=self.population_reform,
            ubi=self.ubi,
            parameters=self.parameters,
        )

    def population_reform(self, params: dict = None):
        reform = create_reform(params, self.policyengine_parameters)
        reformed = self.Microsimulation(
            (self.default_reform, reform), dataset=self.default_dataset
        )
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

    def household_reform(self, params=None):
        situation = create_situation(params)
        reform = create_reform(params)
        baseline_config = self.default_reform
        reform_config = self.default_reform, reform
        baseline = situation(IndividualSim(baseline_config, year=2021))
        reformed = situation(IndividualSim(reform_config, year=2021))
        headlines = headline_figures(baseline, reformed)
        waterfall = household_waterfall_chart(baseline, reformed)
        baseline.vary("employment_income", step=100)
        reformed.vary("employment_income", step=100)
        budget = budget_chart(baseline, reformed)
        mtr = mtr_chart(baseline, reformed)
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
        UBI_amount = max(0, revenue / self.baseline.calc(self.results_config.person_variable).sum())
        return {"UBI": float(UBI_amount)}

    def parameters(self, params=None):
        return self.policyengine_parameters
