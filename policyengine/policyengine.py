import os
from typing import Tuple, Type
from flask import Flask
from flask_cors import CORS
from policyengine.web_server.cache import (
    DisabledCache,
    LocalCache,
    PolicyEngineCache,
    add_params_and_caching,
)
from policyengine.web_server.logging import PolicyEngineLogger, logged_endpoint
from policyengine.web_server.cors import after_request_func
from policyengine.web_server.static_site import add_static_site_handling
from policyengine.package import POLICYENGINE_PACKAGE_PATH
from .country import PolicyEngineCountry, UK, US


class PolicyEngine:
    """Class initialising and running the PolicyEngine API."""

    version: str = "1.108.0"
    """The version of the PolicyEngine API, used to identify the API version in the cache.
    """

    cache_bucket_name: str = "uk-policy-engine.appspot.com"
    """The name of the Google Cloud Storage bucket used to cache results.
    """

    countries: Tuple[Type[PolicyEngineCountry]] = (UK, US)
    """The country models supported by the PolicyEngine API.
    """

    app: Flask
    """The Flask application handling the web server."""

    @property
    def debug_mode(self):
        """Whether the PolicyEngine API is running in debug mode."""
        return bool(os.environ.get("POLICYENGINE_DEBUG")) or self._debug

    def log(self, message: str):
        """Log a message to the PolicyEngine API logger as a general server message."""
        self.logger.log(event="general_server_message", message=message)

    def __init__(self, debug: bool = False):
        self._debug = debug
        self._init_logger()
        self.log("Initialising server.")
        self._init_countries()
        self._init_cache()
        self._init_flask()
        self._init_routes()
        self.log("Initialisation complete.")

    def _init_countries(self):
        """Initialise the country models."""
        self.countries = tuple(map(lambda country: country(), self.countries))

    def _init_cache(self):
        """Initialise the cache for load-intensive endpoint results."""
        if self.cache_bucket_name is not None and not self.debug_mode:
            print("Initialising cache.")
            self.cache = PolicyEngineCache(
                self.version, self.cache_bucket_name
            )
        else:
            self.cache = LocalCache(self.version)

    def _init_flask(self):
        """Initialise the Flask application."""
        self.app = Flask(
            type(self).__name__,
            static_url_path="",
            static_folder=str(
                (POLICYENGINE_PACKAGE_PATH / "static").absolute()
            ),
        )
        CORS(self.app)

    def _init_routes(self):
        """Initialise Flask routing to direct non-API requests to a static assets folder."""
        add_static_site_handling(self.app)
        for country in self.countries:
            for endpoint, endpoint_fn in country.api_endpoints.items():
                endpoint_fn = add_params_and_caching(
                    endpoint_fn, self.cache, self.logger
                )
                endpoint_fn = logged_endpoint(endpoint_fn, self.logger)
                self.app.route(
                    f"/{country.name}/api/{endpoint.replace('_', '-')}",
                    methods=["GET", "POST"],
                    endpoint=f"{country.name}_{endpoint}",
                )(endpoint_fn)
                setattr(self, endpoint_fn.__name__, endpoint_fn)
        self.after_request_func = self.app.after_request(after_request_func)

    def _init_logger(self):
        """Initialise the logger for the PolicyEngine API."""
        self.logger = PolicyEngineLogger(local=self.debug_mode)
