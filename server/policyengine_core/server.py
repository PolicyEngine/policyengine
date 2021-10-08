"""
The PolicyEngine server logic (Flask-based).
"""
from typing import Callable, Tuple
from flask import Flask, request, make_response, send_from_directory
from flask_cors import CORS
import logging
from time import time

from policyengine_core.utils.general import (
    dict_to_string,
    get_cached_result,
    after_request_func,
)


class PolicyEngine:
    static_folder: str = "static"
    version: str
    cache_bucket_name: str = None
    Microsimulation: type
    IndividualSim: type
    default_reform: type
    default_dataset: type
    client_endpoints: Tuple[str] = (
        "/",
        "/population-impact",
        "/household",
        "/household-impact",
        "/faq",
    )
    api_endpoints: Tuple[str] = ("population_reform", "household_reform")

    def __init__(self):
        # Set up Flask server and caching
        self.app = Flask(
            type(self).__name__,
            static_url_path="",
            static_folder=self.static_folder,
        )
        self.app.logger.info("Initialising server.")
        CORS(self.app)
        if self.cache_bucket_name is not None:
            from google.cloud import storage

            self.cache = storage.Client().get_bucket(self.cache_bucket_name)
        else:
            self.cache = None

        # Forward client endpoints to React and API endpoints to Flask

        def static_site():
            return send_from_directory(self.static_folder, "index.html")

        for route in self.client_endpoints:
            static_site = self.app.route(route)(static_site)

        def timed_endpoint(fn):
            def new_fn(*args, **kwargs):
                start_time = time()
                result = fn(*args, **kwargs)
                duration = time() - start_time
                self.app.logger.info(
                    f"{fn.__name__} completed in {round(duration, 1)}s."
                )
                return result

            return new_fn

        def pass_params_and_cache(fn):
            def new_fn(*args, **kwargs):
                params = {**request.args, **(request.json or {})}
                if self.cache is not None:
                    cached_result = get_cached_result(
                        params, fn.__name__, self.version, self.cache
                    )
                    return cached_result
                else:
                    return fn(*args, params=params, **kwargs)

            return new_fn

        self.api_decorators = (
            timed_endpoint,
            pass_params_and_cache,
        )

        for route in self.api_endpoints:
            for decorator in (
                *self.api_decorators,
                self.app.route(f"/api/{route.replace('_', '-')}"),
            ):
                new_fn = decorator(getattr(self, route))
                new_fn.__name__ = route
                setattr(self, route, new_fn)

        self.after_request_func = self.app.after_request(after_request_func)

        # Initialise baseline simulation

        self.baseline = self.Microsimulation(
            self.default_reform, dataset=self.default_dataset
        )

        self.app.logger.info("Initialisation complete.")
