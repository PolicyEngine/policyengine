from policyengine.server import app
from pathlib import Path
from argparse import ArgumentParser
import json


def write_api_results(url: str) -> str:
    with app.test_client() as client:
        response = client.get(url)
        data = json.loads(response.data.decode("utf-8"))
    data = {key: value for key, value in data.items() if "chart" not in key}
    text = ""
    for key, value in data.items():
        text += f"* {key}: {value}\n"
    return text


WATCHED_URLS = {
    "Autumn Budget UC reform": "/uk/api/population-reform?UC_reduction_rate=0.55&UC_work_allowance_without_housing=557&UC_work_allowance_with_housing=335",
}


def write_all_watched_urls():
    text = ""
    for name, url in WATCHED_URLS.items():
        text += f"## {name}\n{write_api_results(url)}"
    return text


with open(Path(__file__).parent / "watched_reforms.md", "w+") as f:
    f.write(write_all_watched_urls())
