from pathlib import Path
from typing import Tuple
import numpy as np
from openfisca_uk import (
    Microsimulation,
    IndividualSim,
    CountryTaxBenefitSystem,
)
from openfisca_uk.entities import *
from openfisca_uk.data import EnhancedFRS, SynthFRS
from policyengine.utils.general import PolicyEngineResultsConfig
from policyengine.countries.country import PolicyEngineCountry
from policyengine.countries.uk.default_reform import create_default_reform
import os
import logging

UK_FOLDER = Path(__file__).parent


class UKResultsConfig(PolicyEngineResultsConfig):
    net_income_variable: str = "net_income"
    in_poverty_variable: str = "in_poverty_bhc"
    in_deep_poverty_variable: str = "in_deep_poverty_bhc"
    household_net_income_variable: str = "household_net_income"
    household_wealth_variable: str = "total_wealth"
    equiv_household_net_income_variable: str = "equiv_household_net_income"
    child_variable: str = "is_child"
    working_age_variable: str = "is_WA_adult"
    senior_variable: str = "is_SP_age"
    person_variable: str = "people"
    tax_variable: str = "household_tax"
    benefit_variable: str = "household_benefits"
    employment_income_variable: str = "employment_income"
    self_employment_income_variable: str = "self_employment_income"
    total_income_variable: str = "total_income"
    currency = "£"


class UK(PolicyEngineCountry):
    name = "uk"
    system = CountryTaxBenefitSystem
    Microsimulation = Microsimulation
    IndividualSim = IndividualSim
    default_dataset = EnhancedFRS
    default_dataset_year = 2022
    default_reform = create_default_reform()
    parameter_file = UK_FOLDER / "reform_parameters.yaml"
    default_household_file = UK_FOLDER / "default_household.yaml"
    entity_hierarchy_file = UK_FOLDER / "entities.yaml"
    version = "0.2.0"
    results_config = UKResultsConfig

    @property
    def synthetic(self):
        return bool(os.environ.get("UK_SYNTHETIC"))

    def __init__(self):
        if self.synthetic:
            self.default_dataset = SynthFRS
            logging.warn("Using the synthetic FRS.")
        if self.default_dataset_year not in self.default_dataset.years:
            logging.info(
                f"{self.default_dataset_year} not found in dataset {self.default_dataset.name} years, downloading."
            )
            self.default_dataset.download(self.default_dataset_year)
        super().__init__()

    def _get_microsimulations(
        self, params: dict
    ) -> Tuple[Microsimulation, Microsimulation]:
        if isinstance(params, dict) and "baseline_country_specific" in params:
            baseline, reformed = super()._get_microsimulations(
                params, refresh_baseline=True
            )
            filtered_country = params["baseline_country_specific"]
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
            baseline, reformed = super()._get_microsimulations(params)
        return baseline, reformed
