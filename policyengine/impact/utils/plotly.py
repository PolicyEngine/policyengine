"""
Utility functions for formatting charts.
"""
import plotly.graph_objects as go
import json


def plotly_json_to_fig(json):
    """Converts a JSON dict to a plotly figure.

    :param json: JSON dict.
    :type json: dict
    :return: Plotly figure.
    :rtype: go.Figure
    """
    return go.Figure(data=json["data"], layout=json["layout"])


WHITE = "#FFF"
BLUE = "#5091cc"
GRAY = "#BDBDBD"
DARK_GRAY = "#616161"
LIGHT_GRAY = "#F5F5F5"
LIGHT_GREEN = "#C5E1A5"
DARK_GREEN = "#558B2F"


def formatted_fig_json(fig: go.Figure) -> dict:
    """Formats figure with styling and returns as JSON.

    :param fig: Plotly figure.
    :type fig: go.Figure
    :return: Formatted plotly figure as a JSON dict.
    :rtype: dict
    """
    fig.update_xaxes(
        title_font=dict(size=16, color="black"), tickfont={"size": 14}
    )
    fig.update_yaxes(
        title_font=dict(size=16, color="black"), tickfont={"size": 14}
    )
    fig.update_layout(
        hoverlabel_align="right",
        font_family="Ubuntu",
        font_color="Black",
        title_font_size=20,
        plot_bgcolor="white",
        paper_bgcolor="white",
        hoverlabel=dict(font_family="Ubuntu"),
    )
    return json.loads(fig.to_json())


def add_custom_hovercard(fig: go.Figure) -> None:
    """Add a custom hovercard to the figure based on the first element of
    customdata, without the title to the right.

    :param fig: Plotly figure.
    :type fig: go.Figure
    """
    # Per https://stackoverflow.com/a/69430974/1840471.
    fig.update_traces(hovertemplate="%{customdata[0]}<extra></extra>")


def add_zero_line(fig: go.Figure) -> None:
    """Add a solid line across y=0.

    :param fig: Plotly figure.
    :type fig: go.Figure
    """
    fig.add_shape(
        type="line",
        xref="paper",
        yref="y",
        x0=0,
        y0=0,
        x1=1,
        y1=0,
        line=dict(color="grey", width=1),
    )
