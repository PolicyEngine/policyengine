def test_server_starts():
    from policyengine.server import app

    with app.test_client() as client:
        for url in [
            "/",
            "/us",
            "/uk/policy",
            "/uk/population-impact",
            "/uk/household",
            "/us/policy",
            "/us/household",
        ]:
            response = client.get(url)
            assert response.status_code == 200
