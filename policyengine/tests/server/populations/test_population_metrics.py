from openfisca_core.reforms import reform
from policy_engine_uk.populations.metrics import headline_metrics
from openfisca_uk import Microsimulation, reforms
from openfisca_uk_data import FRS_WAS_Imputation, FRS
import pytest

baseline = Microsimulation()

reform_examples = (
    (),
    reforms.structural.abolish("personal_allowance"),
    reforms.parametric.set_parameter("tax.income_tax.rates.uk[0].rate", 0.21),
    reforms.parametric.set_parameter(
        "benefit.universal_credit.standard_allowance.amount.SINGLE_OLD", 1000
    ),
    reforms.parametric.set_parameter(
        "benefit.child_benefit.amount.eldest", 1000
    ),
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
    reformed = Microsimulation(reform)
    results = headline_metrics(baseline, reformed)
    for result in expected:
        assert expected[result][0] <= results[result] <= expected[result][1]
