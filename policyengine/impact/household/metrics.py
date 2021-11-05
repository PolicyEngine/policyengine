from typing import Callable, Type
from openfisca_tools.model_api import ReformType
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
        return float(np.array(sim.calc(name)).sum())

    def get_values(name):
        return {
            "old": get_value(baseline, name),
            "new": get_value(reformed, name),
        }

    VARIABLES = [
        config.net_income_variable,
    ]
    return {name: get_values(name) for name in VARIABLES}


def variable_changes(
    baseline: IndividualSim,
    reformed: IndividualSim,
    baseline_extra_earnings: IndividualSim,
    reformed_extra_earnings: IndividualSim,
    ) -> dict:
    """Create dictionary of baseline and reform changes for a set of variables.

    :param baseline: Baseline simulation
    :type baseline: IndividualSim
    :param reformed: Reform simulation
    :type reformed: IndividualSim
    :return: Dictionary of baseline and reformed sums for a set of variables
    """
    variables = filter(
        lambda var: hasattr(var, "metadata") and "policyengine" in var.metadata,
        baseline.simulation.tax_benefit_system.variables.values(),
    )
    variables = map(lambda var: type(var).__name__, variables)
    return {name: {
        "old": float(baseline.calc(name).sum()),
        "new": float(reformed.calc(name).sum()),
        "difference": float(reformed.calc(name).sum() - baseline.calc(name).sum()),
        "old_deriv": float(baseline_extra_earnings.calc(name).sum() - baseline.calc(name).sum()),
        "new_deriv": float(reformed_extra_earnings.calc(name).sum() - reformed.calc(name).sum()),
        "difference_deriv": float(
            (
                reformed_extra_earnings.calc(name).sum() 
                - reformed.calc(name).sum()
            ) - (
                baseline_extra_earnings.calc(name).sum() 
                - baseline.calc(name).sum()
            )),
    } for name in variables}