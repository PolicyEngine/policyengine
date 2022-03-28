from policyengine.countries.uk import UK
from policyengine.server import app


PolicyEngineUK = UK()

test_client = app.test_client()
