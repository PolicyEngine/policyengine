from typing import Type
from openfisca_uk.tools.simulation import IndividualSim
import numpy as np

from policyengine.utils.general import PolicyEngineResultsConfig


def headline_figures(
    baseline: IndividualSim,
    reformed: IndividualSim,
    config: Type[PolicyEngineResultsConfig],
) -> dict:
    """Create dictionary of totals for the reform and baseline.

    :param baseline: Baseline simulation
    :type baseline: IndividualSim
    :param reformed: Reform simulation
    :type reformed: IndividualSim
    :return: Dictionary of baseline and reformed sums for a set of variables
    """

    def get_value(sim, name):
        return float(np.array(sim.calc(name, map_to="household")).sum())

    def get_values(name):
        return {
            "old": get_value(baseline, name),
            "new": get_value(reformed, name),
        }

    VARIABLES = [
        config.household_net_income_variable,
    ]
    return {name: get_values(name) for name in VARIABLES}
