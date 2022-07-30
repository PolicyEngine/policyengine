import json
from typing import Callable
from flask import request, make_response

def dict_to_string(d: dict) -> str:
    """Converts a dictionary to a file-name-safe string.

    Args:
        d (dict): The input dictionary.

    Returns:
        str: The resultant string
    """
    return "_".join(["_".join((str(x), str(y))) for x, y in d.items()])


def cached_endpoint(f: Callable) -> Callable:
    """Marks a function as a cached endpoint.

    Args:
        f (Callable): The function.

    Returns:
        Callable: The function with metadata added.
    """
    setattr(f, "_cached_endpoint", True)
    return f







class PolicyEngineCache:
    def __init__(self, version, bucket_name: str = None):
        """Initialises the cache.

        Args:
            version (str): The version of the API.
            bucket (google.cloud.Bucket): The Google Cloud bucket.
        """
        from google.cloud import storage

        self.bucket = storage.Client().get_bucket(bucket_name)
        self.version = version
    
    def get(
        self, params: dict, endpoint: str
    ) -> dict:
        """Looks up an API request in the cache, returning a result if it exists.

        Args:
            params (dict): The parameters of the request.
            endpoint (str): The endpoint name.

        Returns:
            dict: _description_
        """
        request_id = f"{endpoint}-{dict_to_string(params)}-{self.version}"
        blob = self.bucket.blob(request_id + ".json")
        if blob.exists():
            return json.loads(blob.download_as_string())
    
    def set(
        self, params: dict, endpoint: str, result: dict
    ) -> None:
        """Sets a result in the cache.

        Args:
            params (dict): The parameters of the request.
            endpoint (str): The endpoint name.
            result (dict): The API result.
        """
        request_id = f"{endpoint}-{dict_to_string(params)}-{self.version}"
        blob = self.bucket.blob(request_id + ".json")
        blob.upload_from_string(json.dumps(result))

class DisabledCache(PolicyEngineCache):
    __init__ = lambda *args, **kwargs: None
    get = lambda *args, **kwargs: None
    set = lambda *args, **kwargs: None

def add_params_and_caching(fn: Callable, cache: PolicyEngineCache) -> Callable:
    """Adds request parameters to a function call under the variable `params` and caches the result if the caching decorator is present.

    Args:
        fn (Callable): The endpoint function defining behaviour.
        cache (PolicyEngineCache): The cache to lookup from and store results to.

    Returns:
        Callable: The function with the Flask handling added.
    """
    should_cache = hasattr(fn, "_cached_endpoint")
    cache = cache if should_cache else DisabledCache()
    def new_fn(*args, **kwargs):
        params = {**request.args, **(request.json or {})}
        if should_cache:
            cached_result = cache.get(params, fn.__name__)
        else:
            cached_result = None
        if cached_result is not None:
            return cached_result
        else:
            result = fn(*args, params=params, **kwargs)
            if should_cache:
                cache.set(params, fn.__name__, result)
            return result

    new_fn.__name__ = fn.__name__
    return new_fn

