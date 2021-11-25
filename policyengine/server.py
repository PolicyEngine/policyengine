"""
The PolicyEngine server logic (Flask-based).
"""
from pathlib import Path
from typing import Tuple, Type
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from time import time
from policyengine.utils.general import (
    get_cached_result,
    after_request_func,
    set_cached_result,
)
from policyengine.countries import UK, US, PolicyEngineCountry
from policyengine import VERSION


class PolicyEngine:
    version: str = VERSION
    cache_bucket_name: str = "uk-policy-engine.appspot.com"
    countries: Tuple[Type[PolicyEngineCountry]] = (UK, US)

    def _init_countries(self):
        self.countries = list(map(lambda country: country(), self.countries))

    def _init_forwarding(self):
        def static_site(e):
            return send_from_directory(
                str(Path(__file__).parent / "static"), "index.html"
            )

        self.static_site = self.app.errorhandler(404)(static_site)

        def timed_endpoint(fn):
            def new_fn(*args, **kwargs):
                start_time = time()
                result = fn(*args, **kwargs)
                duration = time() - start_time
                self.app.logger.info(
                    f"{fn.__name__} completed in {round(duration, 1)}s."
                )
                return result

            new_fn.__name__ = "timed_" + fn.__name__
            return new_fn

        def pass_params_and_cache(fn):
            def new_fn(*args, **kwargs):
                params = {**request.args, **(request.json or {})}
                cached_result = None
                cache = (
                    self.cache
                    if not hasattr(fn, "_exclude_from_cache")
                    else None
                )
                if cache is not None:
                    cached_result = get_cached_result(
                        params, fn.__name__, self.version, self.cache
                    )
                if cached_result is not None:
                    return cached_result
                else:
                    result = fn(*args, params=params, **kwargs)
                    if cache is not None:
                        set_cached_result(
                            params,
                            fn.__name__,
                            self.version,
                            self.cache,
                            result,
                        )
                    return result

            new_fn.__name__ = "cached_" + fn.__name__
            return new_fn

        self.api_decorators = (
            pass_params_and_cache,
            timed_endpoint,
        )

        for country in self.countries:
            for route, handler in country.api_endpoints.items():
                fn = handler
                for decorator in (
                    *self.api_decorators,
                    self.app.route(
                        f"/{country.name}/api/{route.replace('_', '-')}",
                        methods=["GET", "POST"],
                        endpoint=f"{country.name}_{route}",
                    ),
                ):
                    fn = decorator(fn)
                    setattr(self, fn.__name__, fn)

        self.after_request_func = self.app.after_request(after_request_func)

    def _init_flask(self):
        self.app = Flask(
            type(self).__name__,
            static_url_path="",
            static_folder=str((Path(__file__).parent / "static").absolute()),
        )
        CORS(self.app)

    def _init_cache(self):
        if self.cache_bucket_name is not None:
            from google.cloud import storage

            self.cache = storage.Client().get_bucket(self.cache_bucket_name)
        else:
            self.cache = None

    def __init__(self):
        self._init_flask()
        self.app.logger.info("Initialising server.")
        self._init_countries()
        self._init_cache()
        self._init_forwarding()
        self.app.logger.info("Initialisation complete.")


app = PolicyEngine().app
