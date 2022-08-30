from typing import Any


def format_summary_of_parameter_value(metadata: dict, value: Any) -> str:
    """Formats a parameter value for display.

    Args:
        metadata (dict): The parameter metadata.
        value (Any): The parameter value.

    Returns:
        str: The formatted parameter value.
    """
    unit = metadata.get("unit")
    if unit == "currency-GBP":
        prefix = "£"
    elif unit == "currency-USD":
        prefix = "$"
    else:
        prefix = ""

    period = metadata.get("period")
    if period == "year":
        suffix = "/year"
    elif period == "month":
        suffix = "/month"
    elif period == "week":
        suffix = "/week"
    else:
        suffix = ""
    label = metadata.get("label")
    uncapitalised_label = f"{label.lower()[0]}{label[1:]}"
    if unit == "abolition":
        return f"Abolish {metadata.get('variable')}"
    elif (unit == "bool") and value:
        return metadata.get("label")
    elif unit == "bool":
        return f"Revoke {uncapitalised_label}"
    elif unit == "Enum":
        return f"Set {uncapitalised_label} to {value}"
    elif unit == "/1":
        return f"Set {uncapitalised_label} to {value:.1%}"
    else:
        return f"Set {uncapitalised_label} to {prefix}{value:,.2f}{suffix}"
