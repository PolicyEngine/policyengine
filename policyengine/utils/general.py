import json
from time import time
from flask import request, make_response


def dict_to_string(d: dict) -> str:
    return "_".join(["_".join((x, y)) for x, y in d.items()])


def get_cached_result(
    params: dict, endpoint: str, version: str, bucket
) -> dict:
    request_id = f"{endpoint}-{dict_to_string(params)}-{version}"
    blob = bucket.blob(request_id + ".json")
    if blob.exists():
        return json.loads(blob.download_as_string())


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
