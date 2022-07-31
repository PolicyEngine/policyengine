from types import ModuleType
from typing import Callable, Dict, Type
from openfisca_core.taxbenefitsystems import TaxBenefitSystem
from openfisca_core.reforms import Reform
from policyengine.country.openfisca.entities import build_entities
from policyengine.country.openfisca.parameters import build_parameters
from policyengine.country.openfisca.reforms import apply_reform, PolicyReform
from policyengine.country.openfisca.variables import build_variables
from policyengine.country.results_config import PolicyEngineResultsConfig
from policyengine.web_server.cache import PolicyEngineCache, cached_endpoint
from policyengine.web_server.logging import PolicyEngineLogger


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

    results_config: Type[PolicyEngineResultsConfig] = None
    """The results configuration for this country. Used to interface with the OpenFisca country model.
    """

    def __init__(self):
        self.api_endpoints = dict(
            entities=self.entities,
            variables=self.variables,
            parameters=self.parameters,
            parameter=self.parameter,
            budgetary_impact=self.budgetary_impact,
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

        self.baseline_microsimulation = None

    def create_microsimulations(self, parameters: dict) -> Reform:
        """Generate an OpenFisca reform from PolicyEngine parameters.

        Args:
            parameters (dict): The PolicyEngine parameters.

        Returns:
            Reform: The OpenFisca reform.
        """
        policy_reform = PolicyReform(parameters, self.parameter_data)
        if (
            not policy_reform.edits_baseline
            and self.baseline_microsimulation is None
        ):
            baseline = (
                self.baseline_microsimulation
            ) = self.microsimulation_type(self.default_reform)
        elif policy_reform.edits_baseline:
            baseline = self.microsimulation_type(
                (self.default_reform, policy_reform.baseline)
            )
        else:
            baseline = self.baseline_microsimulation
        reformed = self.microsimulation_type(
            (self.default_reform, policy_reform.reform)
        )
        return baseline, reformed

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

    def parameter(self, params: dict, logger: PolicyEngineLogger) -> dict:
        """Get a specific parameter."""
        return self.parameter_data[params["q"]]

    @cached_endpoint
    def budgetary_impact(
        self, params: dict, logger: PolicyEngineLogger
    ) -> dict:
        """Get the budgetary impact of a reform."""
        baseline, reformed = self.create_microsimulations(params)
        baseline_net_income = baseline.calc(
            self.results_config.household_net_income_variable
        ).sum()
        reformed_net_income = reformed.calc(
            self.results_config.household_net_income_variable
        ).sum()
        difference = reformed_net_income - baseline_net_income
        return {
            "budgetary_impact": difference,
        }
