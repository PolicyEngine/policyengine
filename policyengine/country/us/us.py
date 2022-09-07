import numpy as np
from policyengine.country.us.default_reform import create_default_reform
from policyengine.country.us.results_config import USResultsConfig
from .. import PolicyEngineCountry
import openfisca_us
from openfisca_us.data import CPS


class US(PolicyEngineCountry):
    openfisca_country_model = openfisca_us
    default_reform = create_default_reform()
    results_config = USResultsConfig
    dataset = CPS
    dataset_year = 2020

    def __init__(self, *args, **kwargs):
        if 2020 not in CPS.years:
            CPS.download(2020)
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

        policy_date = parameters.get("policy_date")
        if policy_date is not None:
            year = int(str(policy_date)[:4])
            baseline.year = year
            reformed.year = year

        return baseline, reformed
