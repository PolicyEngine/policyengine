"""
Utility functions for handling numeric operations.
"""


from typing import Callable


def pct_change(x: float, y: float) -> float:
    return (y - x) / x


def num(x: float) -> str:
    """Converts a number to a human-readable string, using the k/m/bn/tr suffixes after rounding to 2 significant figures."""

    if x < 0:
        return "-" + num(-x)
    if x < 1e3:
        return f"{x:.2f}"
    if x < 1e6:
        return f"{x / 1e3:.0f}k"
    if x < 1e9:
        return f"{x / 1e6:.0f}m"
    if x < 1e10:
        return f"{x / 1e9:.2f}bn"
    if x < 1e12:
        return f"{x / 1e9:.1f}bn"
    return f"{x / 1e12:.2f}tr"


def ordinal(n: int) -> str:
    """Create an ordinal number (1st, 2nd, etc.) from an integer.

    Source: https://stackoverflow.com/a/20007730/1840471

    :param n: Number.
    :type n: int
    :return: Ordinal number (1st, 2nd, etc.).
    :rtype: str
    """
    return "%d%s" % (
        n,
        "tsnrhtdd"[(n // 10 % 10 != 1) * (n % 10 < 4) * n % 10 :: 4],
    )


def describe_change(
    x: float,
    y: float,
    formatter: Callable = lambda x: x,
    change_formatter=lambda x: x,
    plural: bool = False,
) -> str:
    s = "" if plural else "s"
    if y > x:
        return f"rise{s} from {formatter(x)} to {formatter(y)} (+{change_formatter(y - x)})"
    elif y == x:
        return f"remain{s} at {formatter(x)}"
    else:
        return f"fall{s} from {formatter(x)} to {formatter(y)} (-{change_formatter(x - y)})"
