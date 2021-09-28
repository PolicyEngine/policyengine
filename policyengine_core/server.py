"""
The PolicyEngine server logic (Flask-based).
"""
from flask import Flask, request, make_response, send_from_directory
from flask_cors import CORS
import logging
from time import time


class PolicyEngine:
    static_folder: str
    version: str
    use_cache: bool

    def __init__(self):
        self.app = Flask(type(self).__name__)


VERSION = "0.1.5"
USE_CACHE = True
logging.getLogger("werkzeug").disabled = True

client = storage.Client()
bucket = client.get_bucket("uk-policy-engine.appspot.com")

baseline = Microsimulation(use_current_parameters())
baseline_microsim = baseline

app = Flask(__name__, static_url_path="")
logging.getLogger("werkzeug").disabled = True
CORS(app)


def static_site():
    return send_from_directory("static", "index.html")


STATIC_SITE_ROUTES = (
    "/",
    "/faq",
    "/situation",
    "/population-results",
    "/situation-results",
)

for route in STATIC_SITE_ROUTES:
    static_site = app.route(route)(static_site)


@app.route("/api/ubi")
def ubi():
    start_time = time()
    app.logger.info("UBI size request received")
    params = {**request.args, **(request.json or {})}
    request_id = "ubi-" + dict_to_string(params) + "-" + VERSION
    blob = bucket.blob(request_id + ".json")
    if blob.exists() and USE_CACHE:
        app.logger.info("Returning cached response")
        result = json.loads(blob.download_as_string())
        return result
    reform, _ = create_reform(params, return_names=True)
    reformed = Microsimulation(reform)
    revenue = (
        baseline.calc("net_income").sum() - reformed.calc("net_income").sum()
    )
    UBI_amount = max(0, revenue / baseline.calc("people").sum())
    result = {"UBI": float(UBI_amount)}
    if USE_CACHE:
        blob.upload_from_string(json.dumps(result))
    gc.collect()
    duration = time() - start_time
    app.logger.info(f"UBI size calculation completed ({round(duration, 2)}s)")
    return result


@app.route("/api/population-reform")
def population_reform():
    start_time = time()
    app.logger.info("Population reform request received")
    params = {**request.args, **(request.json or {})}
    request_id = "population-" + dict_to_string(params) + "-" + VERSION
    blob = bucket.blob(request_id + ".json")
    if blob.exists() and USE_CACHE:
        app.logger.info("Returning cached response")
        result = json.loads(blob.download_as_string())
        return result
    reform, components = create_reform(params, return_names=True)
    reformed = Microsimulation(reform)
    result = dict(
        **headline_metrics(baseline, reformed),
        decile_chart=decile_chart(baseline, reformed),
        age_chart=age_chart(baseline, reformed),
        poverty_chart=poverty_chart(baseline, reformed),
        waterfall_chart=population_waterfall_chart(
            reform, components, baseline, reformed
        ),
        intra_decile_chart=intra_decile_chart(baseline, reformed),
    )
    del reformed
    del reform
    if USE_CACHE:
        blob.upload_from_string(json.dumps(result))
    gc.collect()
    duration = time() - start_time
    app.logger.info(f"Population reform completed ({round(duration, 2)}s)")
    return result


def dict_to_string(d):
    return "_".join(["_".join((x, y)) for x, y in d.items()])


@app.route("/api/situation-reform", methods=["GET", "POST"])
def situation_reform():
    start_time = time()
    app.logger.info("Situation reform request received")
    params = {**request.args, **(request.json or {})}
    request_id = "situation-" + dict_to_string(params) + "-" + VERSION
    blob = bucket.blob(request_id + ".json")
    if blob.exists() and USE_CACHE:
        app.logger.info("Returning cached response")
        result = json.loads(blob.download_as_string())
        return result
    app.logger.info("Creating situation")
    situation = create_situation(params)
    app.logger.info("Creating reform")
    reform, subreform_labels = create_reform(params, return_names=True)
    baseline_config = use_current_parameters(), add_LVT()
    reform_config = use_current_parameters(), reform
    app.logger.info("Creating baseline individualsim")
    baseline = situation(IndividualSim(baseline_config, year=2021))
    app.logger.info("Creating reform individualsim")
    reformed = situation(IndividualSim(reform_config, year=2021))
    app.logger.info("Headline figures")
    headlines = headline_figures(baseline, reformed)
    app.logger.info("waterfall")
    waterfall = household_waterfall_chart(
        reform, subreform_labels, situation, baseline, reformed
    )
    app.logger.info("Varying baseline")
    baseline.vary("employment_income", step=10)
    app.logger.info("Varying reform")
    reformed.vary("employment_income", step=10)
    app.logger.info("Budget")
    budget = budget_chart(baseline, reformed)
    app.logger.info("mtr chart")
    mtr = mtr_chart(baseline, reformed)
    del situation
    del reform
    del baseline
    del reformed
    result = dict(
        **headlines,
        waterfall_chart=waterfall,
        budget_chart=budget,
        mtr_chart=mtr,
    )
    if USE_CACHE:
        blob.upload_from_string(json.dumps(result))
    gc.collect()
    duration = time() - start_time
    app.logger.info(f"Situation reform completed ({round(duration, 2)}s)")
    return result


@app.after_request
def after_request_func(response):
    origin = request.headers.get("Origin")
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Headers", "x-csrf-token")
        response.headers.add(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS, PUT, PATCH, DELETE",
        )
        if origin:
            response.headers.add("Access-Control-Allow-Origin", origin)
    else:
        response.headers.add("Access-Control-Allow-Credentials", "true")
        if origin:
            response.headers.add("Access-Control-Allow-Origin", origin)
        response.headers[
            "Cache-Control"
        ] = "no-cache, no-store, must-revalidate, public, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response


if __name__ == "__main__":
    app.run()
