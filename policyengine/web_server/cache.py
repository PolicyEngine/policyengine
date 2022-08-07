import json
from multiprocessing import Process
from time import time
from typing import Callable
from flask import request, make_response
from threading import Thread
import traceback
from policyengine.web_server.logging import PolicyEngineLogger
from typing import Dict, Any
import hashlib
import json


def dict_hash(dictionary: Dict[str, Any]) -> str:
    """MD5 hash of a dictionary."""
    dhash = hashlib.md5()
    # We need to sort arguments so {'a': 1, 'b': 2} is
    # the same as {'b': 2, 'a': 1}
    encoded = json.dumps(dictionary, sort_keys=True).encode()
    dhash.update(encoded)
    return dhash.hexdigest()


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
        return f"{endpoint}-{dict_hash(params)}-{self.version}"

    def get(self, params: dict, endpoint: str) -> dict:
        """Looks up an API request in the cache, returning a result if it exists.

        Args:
            params (dict): The parameters of the request.
            endpoint (str): The endpoint name.

        Returns:
            dict: _description_
        """
        request_id = self.get_name(params, endpoint)
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
        request_id = self.get_name(params, endpoint)
        blob = self.bucket.blob(request_id + ".json")
        blob.upload_from_string(json.dumps(result))


class LocalCache(PolicyEngineCache):
    def __init__(self, version):
        self.cache = {}
        self.version = version

    def get(self, params: dict, endpoint: str) -> dict:
        request_id = self.get_name(params, endpoint)
        return self.cache.get(request_id)

    def set(self, params: dict, endpoint: str, result: dict) -> None:
        request_id = self.get_name(params, endpoint)
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
        cache: PolicyEngineCache,
        logger: PolicyEngineLogger,
    ):
        """Initialises the task.

        Args:
            task (Callable): The task.
            params (dict): The parameters of the request.
            endpoint (str): The endpoint name.
            kwargs (dict): The keyword arguments of the request.
            cache (PolicyEngineCache): The cache.
            logger (PolicyEngineLogger): The logger.
        """
        self.task = task
        self.params = params
        self.endpoint = endpoint
        self.kwargs = kwargs
        self.cache = cache
        self.logger = logger

    def execute(self):
        """Executes the task."""
        self.mark_in_progress()
        # Ensure that if an endpoint modifies the params, it doesn't affect the cache key.
        params_copy = json.loads(json.dumps(self.params))
        self.cache.set(
            params_copy,
            self.endpoint,
            {"status": TaskStatus.IN_PROGRESS},
        )
        start_time = time()
        try:
            result = self.task(params=self.params, **self.kwargs)
        except Exception as e:
            self.logger.log(
                event="task_error",
                endpoint=self.endpoint,
                error=str(e),
                full_trace=traceback.format_exc(),
            )
            result = {"status": "error", "error": str(e)}
        duration = time() - start_time
        self.logger.log(
            event="endpoint_thread_completion",
            endpoint=self.endpoint,
            time=duration,
            cache_key=self.cache.get_name(params_copy, self.endpoint),
        )
        self.cache.set(
            params_copy,
            self.endpoint,
            {**result, "status": TaskStatus.COMPLETED},
        )
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
            result = {"status": TaskStatus.QUEUED}
            cache.set(params, fn.__name__, result)
            task = Thread(
                target=PolicyEngineTask(
                    fn, params, fn.__name__, kwargs, cache, logger
                ).execute
            )
            task.start()
            return result

    new_fn.__name__ = fn.__name__
    return new_fn
