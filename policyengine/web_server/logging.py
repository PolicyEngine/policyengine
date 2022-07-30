
from datetime import datetime
from pathlib import Path
from time import time
from typing import Callable
import yaml
from policyengine.package import POLICYENGINE_PACKAGE_PATH


class PolicyEngineLogger:
    """Class managing PolicyEngine server logs."""

    local: bool = True
    """Whether to log to a local YAML file or to Google Cloud.
    """

    print_to_console: bool = True
    """Whether to print log messages to the console as well as to a log file.
    """

    def __init__(self, local: bool = True, print_to_console: bool = True):
        self.local = local
        self.print_to_console = print_to_console
    
    def log(self, **data: dict):
        """Log a message to the PolicyEngine server logs.

        Args:
            data (dict): The data to log.
        """
        if self.local:

            with open(Path(__file__).parent / "logs.yaml", "a") as f:
                yaml.dump(
                    [{
                        "time": datetime.now().isoformat(),
                        **data,
                    }],
                    f,
                )
        else:
            raise NotImplementedError("Logging to Google Cloud is not yet implemented.")
        
        if self.print_to_console:
            print(f"[{datetime.now().isoformat()}]" + "".join([f" {k}: {v}" for k, v in data.items()]))


def logged_endpoint(fn: Callable, logger: PolicyEngineLogger) -> Callable:
    """Decorator for logging the start and end of an endpoint.
    
    Args:
        fn (Callable): The endpoint function.
        logger (PolicyEngineLogger): The logger to use.
    
    Returns:
        Callable: The decorated function.
    """
    def new_fn(*args, **kwargs):
        start_time = time()
        result = fn(*args, **kwargs, logger=logger)
        duration = time() - start_time
        logger.log(
            event="endpoint_call",
            endpoint=fn.__name__,
            time=duration,
        )
        return result

    new_fn.__name__ = "timed_" + fn.__name__
    return new_fn
