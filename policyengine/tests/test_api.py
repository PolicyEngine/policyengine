import pytest
from pathlib import Path
import yaml
from policyengine import PolicyEngine
from time import sleep, time
import warnings

warnings.filterwarnings("ignore")

# Initialise the API
test_client = PolicyEngine(debug=True).app.test_client()

# Each YAML file in this directory has the structure:
# - endpoint: /uk/policy
# - input: {}
# - output: {}

# This function will test each endpoint with the given input and check that the
# output contains the the data given in the output object. It uses PyTest's parametric
# testing feature to run each test case.

files = Path(__file__).parent.glob("**/*.yaml")
tests = []
for test_file in files:
    with open(test_file, "r") as f:
        cases = yaml.safe_load(f)
        i = 0
        for case in cases:
            i += 1
            tests.append(
                (
                    case.get("label", f"{test_file}-{i}"),
                    case.get("async", False),
                    case["endpoint"],
                    case["input"],
                    case["output"],
                    case.get("time"),
                )
            )


def match_value(actual, target):
    if isinstance(target, str):
        # Decode Python
        assert eval(
            target, dict(x=actual)
        ), f"{actual} does not match {target}"
    else:
        assert actual == target


def match_object(actual, target):
    if isinstance(target, dict):
        for key in target.keys():
            if key not in actual:
                raise ValueError(
                    f"Key {key} not found in the response: {actual}, but it is in the target: {target}"
                )
            match_object(actual[key], target[key])
    else:
        match_value(actual, target)


@pytest.mark.parametrize(
    "label,asynchronous,endpoint,input,output,time_limit",
    tests,
    ids=[t[0] for t in tests],
)
def test_endpoint(label, asynchronous, endpoint, input, output, time_limit):
    start_time = time()
    response = test_client.post(endpoint, json=input)
    if response.status_code != 200:
        raise ValueError(
            f"Endpoint {endpoint} failed with status code {response.status_code}. The full result is {response.json}"
        )
    if asynchronous:
        # Keep trying every 5 seconds until we get a response with data.
        while response.json is not None and response.json.get("status") in (
            "queued",
            "in_progress",
        ):
            sleep(5)
            response = test_client.post(endpoint, json=input)
    match_object(response.json, output)
    t = time() - start_time
    if time_limit is not None:
        if isinstance(time_limit, str):
            assert eval(
                time_limit,
                dict(t=t, s=1, m=60, h=60 * 60, ms=1 / 1000),
            )
        else:
            assert t < time_limit
