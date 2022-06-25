from pathlib import Path
from typing import Tuple
import numpy as np
from openfisca_us import CountryTaxBenefitSystem
from openfisca_us.entities import *
from policyengine.countries.us.default_reform import create_default_reform
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry
from openfisca_us import IndividualSim, Microsimulation, CPS

US_FOLDER = Path(__file__).parent


class USResultsConfig(PolicyEngineResultsConfig):
    household_net_income_variable: str = "spm_unit_net_income"
    tax_variable: str = "spm_unit_taxes"
    benefit_variable: str = "spm_unit_benefits"
    employment_income_variable: str = "employment_income"
    self_employment_income_variable: str = "self_employment_income"
    total_income_variable: str = "spm_unit_market_income"
    in_poverty_variable = "spm_unit_is_in_spm_poverty"
    in_deep_poverty_variable = "spm_unit_is_in_deep_spm_poverty"
    household_wealth_variable = "spm_unit_net_income"  # Placeholder
    equiv_household_net_income_variable = "spm_unit_oecd_equiv_net_income"
    child_variable = "is_child"
    working_age_variable = "is_wa_adult"
    senior_variable = "is_senior"
    person_variable = "people"
    earnings_variable = "employment_income"
    household_entity = "spm_unit"
    currency = "$"


class US(PolicyEngineCountry):
    name = "us"
    system = CountryTaxBenefitSystem
    IndividualSim = IndividualSim
    results_config = USResultsConfig
    Microsimulation = Microsimulation
    default_dataset = CPS
    default_dataset_year = 2020
    default_reform = create_default_reform()
    parameter_file = US_FOLDER / "reform_parameters.yaml"

    def __init__(self):
        if not self.default_dataset_year in self.default_dataset.years:
            self.default_dataset.download(self.default_dataset_year)
        super().__init__()

    def _get_microsimulations(
        self, params: dict
    ) -> Tuple[Microsimulation, Microsimulation]:
        if isinstance(params, dict) and "baseline_state_specific" in params:
            baseline, reformed = super()._get_microsimulations(
                params, refresh_baseline=True
            )
            filtered_state = params["baseline_state_specific"]
            household_weights = baseline.calc("household_weight")
            state = baseline.calc("state_code")
            baseline.set_input(
                "household_weight",
                baseline.year,
                np.where(state == filtered_state, household_weights, 0),
            )
            reformed.set_input(
                "household_weight",
                reformed.year,
                np.where(state == filtered_state, household_weights, 0),
            )
            person_weights = baseline.calc("person_weight")
            person_state = baseline.calc("state_code", map_to="person")
            baseline.set_input(
                "person_weight",
                baseline.year,
                np.where(person_state == filtered_state, person_weights, 0),
            )
            reformed.set_input(
                "person_weight",
                reformed.year,
                np.where(person_state == filtered_state, person_weights, 0),
            )

            for subgroup in ("tax_unit", "family", "spm_unit"):
                subgroup_in_state = (
                    baseline.simulation.populations[subgroup].household(
                        "state_code_str", baseline.year
                    )
                    == filtered_state
                )
                weight = baseline.calc(f"{subgroup}_weight")
                baseline.set_input(
                    f"{subgroup}_weight",
                    baseline.year,
                    np.where(subgroup_in_state, weight, 0),
                )
                reformed.set_input(
                    f"{subgroup}_weight",
                    baseline.year,
                    np.where(subgroup_in_state, weight, 0),
                )
        else:
            baseline, reformed = super()._get_microsimulations(params)
            # US-wide, take State tax as reported
            for sim in baseline, reformed:
                reported_state_tax = sim.calc(
                    "spm_unit_state_tax_reported"
                ).values
                sim.set_input(
                    "spm_unit_state_tax",
                    2022,
                    reported_state_tax,
                )
        return baseline, reformed
