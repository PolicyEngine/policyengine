import numpy as np
from policyengine.country.uk.default_reform import create_default_reform
from policyengine.country.uk.results_config import UKResultsConfig
from .. import PolicyEngineCountry
import openfisca_uk
from openfisca_uk import EnhancedFRS


class UK(PolicyEngineCountry):
    openfisca_country_model = openfisca_uk
    default_reform = create_default_reform()
    results_config = UKResultsConfig
    dataset = EnhancedFRS
    dataset_year = 2022

    def __init__(self, *args, **kwargs):
        if 2022 not in EnhancedFRS.years:
            EnhancedFRS.download(2022)
        super().__init__(*args, **kwargs)

    def create_microsimulations(self, parameters):
        filtered_country = parameters.get("baseline_country_specific")
        if filtered_country is not None:
            baseline, reformed = super().create_microsimulations(
                parameters,
                force_refresh_baseline=True,
                do_not_cache=True,
            )
            # Specific country selected: filter out other countries.
            household_weights = baseline.calc("household_weight")
            country = baseline.calc("country")
            baseline.set_input(
                "household_weight",
                baseline.year,
                np.where(country == filtered_country, household_weights, 0),
            )
            reformed.set_input(
                "household_weight",
                reformed.year,
                np.where(country == filtered_country, household_weights, 0),
            )
            person_weights = baseline.calc("person_weight")
            person_country = baseline.calc("country", map_to="person")
            baseline.set_input(
                "person_weight",
                baseline.year,
                np.where(
                    person_country == filtered_country, person_weights, 0
                ),
            )
            reformed.set_input(
                "person_weight",
                reformed.year,
                np.where(
                    person_country == filtered_country, person_weights, 0
                ),
            )
        else:
            baseline, reformed = super().create_microsimulations(parameters)

        policy_date = parameters.get("policy_date")
        if policy_date is not None:
            year = int(str(policy_date)[:4])
            baseline.year = year
            reformed.year = year

        return baseline, reformed
