from openfisca_uk import IndividualSim, reforms
from policyengine.countries.uk import UKResultsConfig
from policyengine.impact.household.charts import (
    household_waterfall_chart,
    budget_chart,
    mtr_chart,
)
import pytest
import itertools


def single_adult(sim):
    sim.add_person(age=18, name="p")
    sim.add_benunit(adults=["p"])
    sim.add_household(adults=["p"])
    return sim


situation_examples = (single_adult,)

empty_reform = ()
abolish_personal_allowance = reforms.structural.abolish("personal_allowance")
raise_basic_rate = reforms.parametric.set_parameter(
    "tax.income_tax.rates.uk[0].rate", 0.21
)

reform_examples = (
    empty_reform,
    abolish_personal_allowance,
    raise_basic_rate,
)

# Test charts for each possible (reform, situation) pair


@pytest.mark.parametrize(
    "situation,reform", itertools.product(situation_examples, reform_examples)
)
def test_household_waterfall_chart(situation, reform):
    baseline = situation(IndividualSim())
    reformed = situation(IndividualSim(reform))
    baseline.vary("employment_income")
    reformed.vary("employment_income")
    household_waterfall_chart(baseline, reformed, UKResultsConfig)


@pytest.mark.parametrize(
    "situation,reform", itertools.product(situation_examples, reform_examples)
)
def test_budget_chart(situation, reform):
    baseline = situation(IndividualSim())
    reformed = situation(IndividualSim(reform))
    baseline.vary("employment_income")
    reformed.vary("employment_income")
    budget_chart(
        baseline,
        reformed,
        False,
        UKResultsConfig,
        has_reform=True,
        original_total_income=0,
    )


@pytest.mark.parametrize(
    "situation,reform", itertools.product(situation_examples, reform_examples)
)
def test_mtr_chart(situation, reform):
    baseline = situation(IndividualSim())
    reformed = situation(IndividualSim(reform))
    baseline.vary("employment_income")
    reformed.vary("employment_income")
    mtr_chart(
        baseline,
        reformed,
        False,
        UKResultsConfig,
        has_reform=True,
        original_total_income=0,
    )
