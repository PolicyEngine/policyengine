from policyengine import PolicyEngine
import yaml
from pathlib import Path
import pytest

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
        for case in cases:
            tests.append(
                (
                    case["endpoint"],
                    case["input"],
                    case["output"],
                )
            )

def match_object(actual, target):
    for key, value in target.items():
        if isinstance(value, dict):
            match_object(actual[key], value)
        else:
            assert actual[key] == value, f"Expected key {key} to equal {value}, but it equals {actual[key]}."

print(tests)

@pytest.mark.parametrize("endpoint,input,output", tests)
def test_endpoints(endpoint, input, output):
    response = test_client.post(endpoint, json=input)
    if response.status_code != 200:
        raise ValueError(f"Endpoint {endpoint} failed with status code {response.status_code}.")
    for key, value in output.items():
        match_object(response.json[key], value)

