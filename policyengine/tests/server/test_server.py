def test_server_starts():
    from policyengine.server import app

    with app.test_client() as client:
        response = client.get("/")
        assert response.status_code == 200
