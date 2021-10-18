"""
Functions to convert URL query parameters into OpenFisca situation initialiser functions.
"""

from typing import Dict
from openfisca_core.taxbenefitsystems import TaxBenefitSystem

def get_PE_variables(system: TaxBenefitSystem) -> Dict[str, dict]:
    """Extracts PolicyEngine parameters from OpenFisca parameter metadata.

    Args:
        system (TaxBenefitSystem): The tax-benefit system to extract from.

    Returns:
        Dict[str, dict]: The parameter metadata.
    """
    variables = list(map(type, system.variables.values()))
    variables = list(
        filter(
            lambda variable: hasattr(variable, "metadata")
            and "policyengine" in variable.metadata,
            variables,
        )
    )
    variable_metadata = {}
    for v in variables:
        meta = v.metadata["policyengine"]
        var = dict(
            title=v.label,
            short_name=v.__name__,
            description=v.documentation,
            type="amount",
            default=0,
            min=0,
            max=1,
        )
        var.update(meta)
        var["value"] = var["default"]
        variable_metadata[var["short_name"]] = var
    return variable_metadata