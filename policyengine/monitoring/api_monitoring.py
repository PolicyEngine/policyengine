from policyengine.server import app
from pathlib import Path
import json


def write_api_results(url: str) -> str:
    with app.test_client() as client:
        response = client.get(url)
        data = json.loads(response.data.decode("utf-8"))
    data = {key: value for key, value in data.items() if "chart" not in key}
    text = f"""
* Net cost: {data["net_cost"]}
* Poverty change: {round(100 * data["poverty_change"], 1)}%
* Winner share: {round(100 * data["winner_share"], 1)}%
* Loser share: {round(100 * data["loser_share"], 1)}%\n\n"""
    return text


WATCHED_URLS = {
    "Autumn Budget UC reform": "/uk/api/population-reform?UC_reduction_rate=0.55&UC_work_allowance_without_housing=557&UC_work_allowance_with_housing=335&policy_date=20211030",
}


def write_all_watched_urls():
    text = ""
    for name, url in WATCHED_URLS.items():
        text += f"## {name}\n{write_api_results(url)}"
    return text


with open(Path(__file__).parent / "watched_reforms.md", "w+") as f:
    f.write(write_all_watched_urls())
