from policyengine.countries.uk import UK
from policyengine.server import app
import logging

logging.info(f"Initialising PolicyEngine for test runs")

PolicyEngineUK = UK()

logging.info(f"Initialising Flask test client")

test_client = app.test_client()
