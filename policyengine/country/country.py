from types import ModuleType
from typing import Callable, Dict, Type
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_core.reforms import Reform
from policyengine.country.openfisca.entities import build_entities
from policyengine.country.openfisca.parameters import build_parameters
from policyengine.country.openfisca.reforms import apply_reform
from policyengine.country.openfisca.variables import build_variables
from policyengine.web_server.logging import PolicyEngineLogger
import importlib


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

    def __init__(self):
        self.api_endpoints = dict(
            entities=self.entities,
            variables=self.variables,
            parameters=self.parameters,
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
