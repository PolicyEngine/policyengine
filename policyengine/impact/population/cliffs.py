from openfisca_tools import Microsimulation
from policyengine.country.results_config import PolicyEngineResultsConfig
from policyengine.impact.utils.plotly import (
    GRAY,
    DARK_GREEN,
    add_custom_hovercard,
    add_zero_line,
    formatted_fig_json,
)
from policyengine.impact.utils.numeric import num
import plotly.express as px


def get_cliff_figures(
    sim_1: Microsimulation,
    sim_2: Microsimulation,
    config: PolicyEngineResultsConfig,
) -> float:
    """Returns the share of adults who experience a cliff, and the aggregate cliff size."""
    net_income_change = sim_2.calc(
        config.household_net_income_variable
    ) - sim_1.calc(config.household_net_income_variable)
    household_on_cliff = net_income_change < 0

    people_in_household = sim_1.calc(
        config.person_variable, map_to=config.household_entity
    )
    people_on_cliff = (household_on_cliff * people_in_household).sum()
    total_people = people_in_household.sum()
    cliff_share = people_on_cliff / total_people

    cliff_size = -net_income_change[household_on_cliff].sum()

    return cliff_share, cliff_size


def get_cliff_impact(
    baseline: Microsimulation,
    baseline_copy: Microsimulation,
    reformed: Microsimulation,
    reformed_copy: Microsimulation,
    config: PolicyEngineResultsConfig,
) -> dict:
    """Calculate the cliff impact of a reform."""

    earnings = baseline.calc("employment_income").values
    is_first_adult = baseline.calc("is_tax_unit_head").values
    earnings_with_increase = earnings + 2_000 * is_first_adult
    baseline_copy.simulation.set_input(
        "employment_income", 2022, earnings_with_increase
    )
    reformed_copy.simulation.set_input(
        "employment_income", 2022, earnings_with_increase
    )

    baseline_cliff_share, baseline_cliff_size = get_cliff_figures(
        baseline, baseline_copy, config
    )
    reformed_cliff_share, reformed_cliff_size = get_cliff_figures(
        reformed, reformed_copy, config
    )

    return get_cliff_chart(
        baseline_cliff_share,
        reformed_cliff_share,
        baseline_cliff_size,
        reformed_cliff_size,
        config,
    )


def get_cliff_chart(
    baseline_cliff_rate: float,
    reformed_cliff_rate: float,
    baseline_cliff_gap: float,
    reformed_cliff_gap: float,
    config: PolicyEngineResultsConfig,
) -> dict:
    """Create a cliff chart."""
    cliff_rate_change = reformed_cliff_rate / baseline_cliff_rate - 1
    cliff_gap_change = reformed_cliff_gap / baseline_cliff_gap - 1
    currency = config.currency

    hover_labels = [
        f"<b>Cliff rate {'rises' if cliff_rate_change > 0 else 'falls'} {abs(cliff_rate_change):.1%}</b><br><br>From {baseline_cliff_rate:.1%} to {reformed_cliff_rate:.1%} of people receiving less net income if their earnings rise by {currency}2,000.",
        f"<b>Cliff gap {'widens' if cliff_gap_change > 0 else 'narrows'} by {abs(cliff_gap_change):.1%}</b><br><br>From {currency}{num(baseline_cliff_gap)} to {currency}{num(reformed_cliff_gap)} of lost net income among people on cliffs if their income rises by {currency}2,000.",
    ]

    fig = (
        px.bar(
            x=["Cliff rate", "Cliff gap"],
            y=[cliff_rate_change, cliff_gap_change],
            custom_data=[hover_labels],
        )
        .update_traces(
            marker_color=[
                DARK_GREEN if cliff_rate_change <= 0 else GRAY,
                DARK_GREEN if cliff_gap_change <= 0 else GRAY,
            ],
        )
        .update_layout(
            title="Cliff impact",
            yaxis=dict(
                title="Percent change",
                tickformat=".0%",
            ),
            xaxis=dict(
                title="",
            ),
        )
    )

    add_custom_hovercard(fig)

    add_zero_line(fig)

    return formatted_fig_json(fig)
