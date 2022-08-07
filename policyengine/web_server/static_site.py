from flask import Flask, request, send_from_directory
from .social_card import add_social_card_metadata
from pathlib import Path
from policyengine.package import POLICYENGINE_PACKAGE_PATH


def add_static_site_handling(app: Flask):
    """Add a handling route to a Flask app, directing 404 results to index.html, adding country-specific social card metadata.

    Args:
        app (Flask): A Flask application.
    """

    def static_site(e):
        with open(
            str(POLICYENGINE_PACKAGE_PATH / "static" / "index.html")
        ) as f:
            text = f.read()
            modified = add_social_card_metadata(request.path, text)
        with open(
            str(POLICYENGINE_PACKAGE_PATH / "static" / "index_mod.html"), "w"
        ) as f:
            f.write(modified)
        response = send_from_directory(
            str(POLICYENGINE_PACKAGE_PATH / "static"), "index_mod.html"
        )
        return response

    app.errorhandler(404)(static_site)
