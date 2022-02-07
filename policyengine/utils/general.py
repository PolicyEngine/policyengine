import json
from time import time
from typing import Callable
from flask import request, make_response
from openfisca_core.model_api import *


class PolicyEngineResultsConfig:
    net_income_variable: str
    in_poverty_variable: str
    household_net_income_variable: str
    equiv_household_net_income_variable: str
    child_variable: str
    working_age_variable: str
    senior_variable: str
    person_variable: str
    earnings_variable: str
    tax_variable: str
    benefit_variable: str


def dict_to_string(d: dict) -> str:
    return "_".join(["_".join((x, y)) for x, y in d.items()])


def exclude_from_cache(f: Callable) -> Callable:
    setattr(f, "_exclude_from_cache", True)
    return f


def get_cached_result(
    params: dict, endpoint: str, version: str, bucket
) -> dict:
    request_id = f"{endpoint}-{dict_to_string(params)}-{version}"
    blob = bucket.blob(request_id + ".json")
    if blob.exists():
        return json.loads(blob.download_as_string())


def set_cached_result(
    params: dict, endpoint: str, version: str, bucket, result: dict
) -> None:
    request_id = f"{endpoint}-{dict_to_string(params)}-{version}"
    blob = bucket.blob(request_id + ".json")
    blob.upload_from_string(json.dumps(result))


def after_request_func(response):
    origin = request.headers.get("Origin")
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Headers", "x-csrf-token")
        response.headers.add(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS, PUT, PATCH, DELETE",
        )
        if origin:
            response.headers.add("Access-Control-Allow-Origin", origin)
    else:
        response.headers.add("Access-Control-Allow-Credentials", "true")
        if origin:
            response.headers.add("Access-Control-Allow-Origin", origin)
        response.headers[
            "Cache-Control"
        ] = "no-cache, no-store, must-revalidate, public, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response
