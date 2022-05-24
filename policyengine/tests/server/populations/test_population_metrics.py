from policyengine.impact.population.metrics import headline_metrics
from policyengine.countries.uk import UK, UKResultsConfig
from policyengine.utils.reforms import parametric, abolish
import pytest

PolicyEngineUK = UK()

reform_examples = (
    {},
    dict(personal_allowance=0),
    dict(basic_rate=0.21),
    dict(UC_single_old=1000),
    dict(CB_eldest=1000),
)

# Wide ranges - these tests are verifying that the model is being used
# correctly rather testing than the actual model output

EXPECTED_RESULTS = (
    dict(net_cost_numeric=(0, 0)),
    dict(net_cost_numeric=(-115e9, -90e9)),
    dict(net_cost_numeric=(-6e9, -3e9)),
    dict(net_cost_numeric=(10e9, 35e9)),
    dict(loser_share=(0, 1e-3)),
)

# Test metrics for each reform


@pytest.mark.parametrize(
    "reform_params,expected", zip(reform_examples, EXPECTED_RESULTS)
)
def test_headline_metrics(reform_params, expected):
    results = headline_metrics(
        *PolicyEngineUK._get_microsimulations(reform_params),
        UKResultsConfig,
    )
    for result in expected:
        assert expected[result][0] <= results[result] <= expected[result][1]
