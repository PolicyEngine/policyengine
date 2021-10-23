from policyengine.impact.population.metrics import headline_metrics
from policyengine.countries.uk import UK, UKResultsConfig
from policyengine.utils.reforms import parametric, abolish
import pytest

PolicyEngineUK = UK()

reform_examples = (
    (),
    abolish("personal_allowance"),
    parametric("tax.income_tax.rates.uk[0].rate", 0.21),
    parametric(
        "benefit.universal_credit.standard_allowance.amount.SINGLE_OLD", 1000
    ),
    parametric("benefit.child_benefit.amount.eldest", 1000),
)

# Wide ranges - these tests are verifying that the model is being used
# correctly rather testing than the actual model output

EXPECTED_RESULTS = (
    dict(net_cost_numeric=(0, 0)),
    dict(net_cost_numeric=(-110e9, -90e9)),
    dict(net_cost_numeric=(-6e9, -3e9)),
    dict(net_cost_numeric=(10e9, 20e9)),
    dict(loser_share=(0, 1e-3)),
)

# Test metrics for each reform


@pytest.mark.parametrize(
    "reform,expected", zip(reform_examples, EXPECTED_RESULTS)
)
def test_headline_metrics(reform, expected):
    results = headline_metrics(
        PolicyEngineUK.baseline,
        PolicyEngineUK._create_reform_sim(reform),
        UKResultsConfig,
    )
    for result in expected:
        assert expected[result][0] <= results[result] <= expected[result][1]
