import json
from time import time
from typing import Callable
from flask import request, make_response
from threading import Thread

from policyengine.web_server.logging import PolicyEngineLogger


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


class TaskStatus:
    QUEUED = "queued"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


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

    def get_name(self, params: dict, endpoint: str) -> str:
        """Gets the key representing a request in the cache.

        Args:
            params (dict): The parameters of the request.
            endpoint (str): The endpoint name.

        Returns:
            str: The key.
        """
        return f"{endpoint}-{dict_to_string(params)}-{self.version}"

    def get(self, params: dict, endpoint: str) -> dict:
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

    def set(self, params: dict, endpoint: str, result: dict) -> None:
        """Sets a result in the cache.

        Args:
            params (dict): The parameters of the request.
            endpoint (str): The endpoint name.
            result (dict): The API result.
        """
        request_id = f"{endpoint}-{dict_to_string(params)}-{self.version}"
        blob = self.bucket.blob(request_id + ".json")
        blob.upload_from_string(json.dumps(result))


class LocalCache(PolicyEngineCache):
    def __init__(self, version):
        self.cache = {}
        self.version = version

    def get(self, params: dict, endpoint: str) -> dict:
        request_id = f"{endpoint}-{dict_to_string(params)}-{self.version}"
        return self.cache.get(request_id)

    def set(self, params: dict, endpoint: str, result: dict) -> None:
        request_id = f"{endpoint}-{dict_to_string(params)}-{self.version}"
        self.cache[request_id] = result


class DisabledCache(PolicyEngineCache):
    __init__ = lambda *args, **kwargs: None
    get = lambda *args, **kwargs: None
    set = lambda *args, **kwargs: None


class PolicyEngineTask:
    key: str
    """A unique identifier for the task."""

    status: str = TaskStatus.QUEUED
    """The status of the task."""

    def mark_in_progress(self):
        """Marks the task as in progress."""
        self.status = TaskStatus.IN_PROGRESS

    def mark_completed(self):
        """Marks the task as completed."""
        self.status = TaskStatus.COMPLETED

    def __init__(
        self,
        task: Callable,
        params: dict,
        endpoint: str,
        kwargs: dict,
        key: str,
        cache: PolicyEngineCache,
        logger: PolicyEngineLogger,
    ):
        """Initialises the task.

        Args:
            task (Callable): The task.
            params (dict): The parameters of the request.
            endpoint (str): The endpoint name.
            kwargs (dict): The keyword arguments of the request.
            key (str): The key to use for the task.
            cache (PolicyEngineCache): The cache.
            logger (PolicyEngineLogger): The logger.
        """
        self.task = task
        self.params = params
        self.endpoint = endpoint
        self.kwargs = kwargs
        self.key = key
        self.cache = cache
        self.logger = logger

    def execute(self):
        """Executes the task."""
        existing_cached_result = self.cache.get(self.params, self.endpoint)
        if existing_cached_result is not None:
            return existing_cached_result
        self.mark_in_progress()
        start_time = time()
        result = self.task(params=self.params, **self.kwargs)
        duration = time() - start_time
        self.logger.log(
            event="endpoint_thread_completion",
            endpoint=self.endpoint,
            time=duration,
            params=self.params,
        )
        self.cache.set(self.params, self.endpoint, result)
        self.mark_completed()


def add_params_and_caching(
    fn: Callable, cache: PolicyEngineCache, logger: PolicyEngineLogger
) -> Callable:
    """Adds request parameters to a function call under the variable `params` and caches the result if the caching decorator is present.

    Args:
        fn (Callable): The endpoint function defining behaviour.
        cache (PolicyEngineCache): The cache to lookup from and store results to.
        logger (PolicyEngineLogger): The logger to use to log timings.

    Returns:
        Callable: The function with the Flask handling added.
    """
    should_cache = hasattr(fn, "_cached_endpoint")
    cache = cache if should_cache else None

    def new_fn(*args, **kwargs):
        params = {**request.args, **(request.json or {})}
        if should_cache:
            cached_result = cache.get(params, fn.__name__)
        else:
            return fn(params=params, *args, **kwargs)
        if cached_result is not None:
            return cached_result
        else:
            key = cache.get_name(params, fn.__name__)
            thread = Thread(
                target=PolicyEngineTask(
                    fn, params, fn.__name__, kwargs, key, cache, logger
                ).execute
            )
            thread.start()
            result = {"status": TaskStatus.QUEUED}
            cache.set(params, fn.__name__, result)
            return result

    new_fn.__name__ = fn.__name__
    return new_fn
