import requests


def test_basic_usage():
    from policyengine.server import app

    with app.test_client() as client:
        response = client.post(
            "/us/api/calculate",
            json={
                "household": {
                    "people": {"person": {}},
                    "spm_units": {
                        "spm_unit": {
                            "members": ["person"],
                            "snap": {"2022": None},
                        },
                    },
                }
            },
        )

        snap = response.json["spm_units"]["spm_unit"]["snap"]

        assert not isinstance(snap, list)
        assert snap["2022"] > 0
