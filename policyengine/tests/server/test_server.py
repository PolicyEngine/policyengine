from policyengine.tests.server.initialisation import test_client


def test_server_starts():
    for url in [
        "/",
        "/us",
        "/uk/policy",
        "/uk/population-impact",
        "/uk/household",
        "/us/policy",
        "/us/household",
    ]:
        response = test_client.get(url)
        assert response.status_code == 200
