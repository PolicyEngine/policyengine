from policyengine.impact.population.charts import (
    decile_chart,
    poverty_chart,
    population_waterfall_chart,
)
from policyengine.countries.uk import UK, UKResultsConfig
import pytest

PolicyEngineUK = UK()

reform_examples = (
    {},
    dict(personal_allowance=0),
    dict(basic_rate=0.21),
)

is_deep_examples = (
    dict(is_deep=False),
    dict(is_deep=True),
)

# Test charts for each reform


@pytest.mark.parametrize("reform", reform_examples)
def test_UK_decile_chart(reform):
    decile_chart(
        *PolicyEngineUK._get_microsimulations(reform),
        UKResultsConfig,
    )


@pytest.mark.parametrize("reform", reform_examples)
@pytest.mark.parametrize("is_deep", reform_examples)
def test_UK_poverty_chart(reform, is_deep):
    poverty_chart(
        *PolicyEngineUK._get_microsimulations(reform),
        is_deep,
        UKResultsConfig,
    )


@pytest.mark.parametrize("reform", reform_examples)
def test_UK_population_waterfall_chart(reform):
    population_waterfall_chart(
        *PolicyEngineUK._get_microsimulations(reform),
        UKResultsConfig,
    )
