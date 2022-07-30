

from typing import Callable, Dict

from policyengine.web_server.logging import PolicyEngineLogger


class PolicyEngineCountry:
    """Base class for a PolicyEngine country. Each country has a set of API endpoints available."""
    
    api_endpoints: Dict[str, Callable] = None
    """The API endpoints available for this country.
    """

    name: str = None
    """The name of the country.
    """

    def __init__(self):
        self.api_endpoints = dict(
            variables=self.variables,
        )
        if self.name is None:
            self.name = self.__class__.__name__.lower()

    def variables(self, params: dict, logger: PolicyEngineLogger) -> dict:
        return dict(variables=["tax", "benefits"])