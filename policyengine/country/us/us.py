import numpy as np
from policyengine.country.us.default_reform import create_default_reform
from policyengine.country.us.results_config import USResultsConfig
from .. import PolicyEngineCountry
import policyengine_us
from policyengine_us.data import CPS


class US(PolicyEngineCountry):
    openfisca_country_model = policyengine_us
    default_reform = create_default_reform()
    results_config = USResultsConfig
    dataset = CPS
    dataset_year = 2021

    def __init__(self, *args, **kwargs):
        if self.dataset_year not in self.dataset.years:
            self.dataset.download(self.dataset_year)
        super().__init__(*args, **kwargs)

    def create_microsimulations(self, parameters):
        filtered_state = parameters.get("baseline_state_specific")
        if filtered_state is None:
            baseline, reformed = super().create_microsimulations(parameters)
            # US-wide analyses hold State tax policy fixed.
            for sim in baseline, reformed:
                reported_state_tax = sim.calc(
                    "spm_unit_state_tax_reported"
                ).values
                sim.set_input(
                    "spm_unit_state_tax",
                    2022,
                    reported_state_tax,
                )
        else:
            baseline, reformed = super().create_microsimulations(
                parameters, force_refresh_baseline=True, do_not_cache=True
            )
            # Specific State selected: filter out other States.
            household_weights = baseline.calc("household_weight")
            state = baseline.calc("state_code_str")
            baseline.set_input(
                "household_weight",
                baseline.default_calculation_period,
                np.where(state == filtered_state, household_weights, 0),
            )
            reformed.set_input(
                "household_weight",
                reformed.default_calculation_period,
                np.where(state == filtered_state, household_weights, 0),
            )
            person_weights = baseline.calc("person_weight")
            person_state = baseline.calc("state_code_str", map_to="person")
            baseline.set_input(
                "person_weight",
                baseline.default_calculation_period,
                np.where(person_state == filtered_state, person_weights, 0),
            )
            reformed.set_input(
                "person_weight",
                reformed.default_calculation_period,
                np.where(person_state == filtered_state, person_weights, 0),
            )

            for subgroup in ("tax_unit", "family", "spm_unit"):
                subgroup_in_state = (
                    baseline.populations[subgroup].household(
                        "state_code_str", baseline.default_calculation_period
                    )
                    == filtered_state
                )
                weight = baseline.calc(f"{subgroup}_weight")
                baseline.set_input(
                    f"{subgroup}_weight",
                    baseline.default_calculation_period,
                    np.where(subgroup_in_state, weight, 0),
                )
                reformed.set_input(
                    f"{subgroup}_weight",
                    baseline.default_calculation_period,
                    np.where(subgroup_in_state, weight, 0),
                )

        policy_date = parameters.get("policy_date")
        if policy_date is not None:
            year = int(str(policy_date)[:4])
            baseline.default_calculation_period = year
            reformed.default_calculation_period = year

        return baseline, reformed
