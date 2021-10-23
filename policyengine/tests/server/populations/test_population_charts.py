from policyengine.impact.population.charts import (
    decile_chart,
    poverty_chart,
    population_waterfall_chart,
)
from policyengine.countries.uk import UK, UKResultsConfig
from policyengine.utils.reforms import abolish, parametric
import pytest

PolicyEngineUK = UK()

reform_examples = (
    (),
    abolish("personal_allowance"),
    parametric("tax.income_tax.rates.uk[0].rate", 0.21),
)

# Test charts for each reform


@pytest.mark.parametrize("reform", reform_examples)
def test_UK_decile_chart(reform):
    decile_chart(
        PolicyEngineUK.baseline,
        PolicyEngineUK._create_reform_sim(reform),
        UKResultsConfig,
    )


@pytest.mark.parametrize("reform", reform_examples)
def test_UK_poverty_chart(reform):
    poverty_chart(
        PolicyEngineUK.baseline,
        PolicyEngineUK._create_reform_sim(reform),
        UKResultsConfig,
    )


@pytest.mark.parametrize("reform", reform_examples)
def test_UK_population_waterfall_chart(reform):
    population_waterfall_chart(
        PolicyEngineUK.baseline,
        PolicyEngineUK._create_reform_sim(reform),
        UKResultsConfig,
    )
