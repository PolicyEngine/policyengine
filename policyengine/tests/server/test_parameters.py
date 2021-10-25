from openfisca_tools.testing import generate_tests
from policyengine.countries.uk import UK

PolicyEngineUK = UK()

test_UK_parameter = generate_tests(PolicyEngineUK.baseline)
