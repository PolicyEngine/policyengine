"""
Utility functions for handling numeric operations.
"""


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
