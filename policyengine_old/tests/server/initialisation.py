from policyengine_old.countries.uk import UK
from policyengine_old.server import app
import logging

logging.info(f"Initialising PolicyEngine for test runs")

PolicyEngineUK = UK()

logging.info(f"Initialising Flask test client")

test_client = app.test_client()
