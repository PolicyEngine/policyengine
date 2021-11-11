from setuptools import setup, find_packages
from pathlib import Path

setup(
    name="PolicyEngine",
    version="1.1.4",
    author="PolicyEngine",
    license="http://www.fsf.org/licensing/licenses/agpl-3.0.html",
    url="https://github.com/policyengine/policyengine",
    install_requires=[
        "OpenFisca-UK>=0.7.1,<0.8.0",
        "OpenFisca-US>=0.0.3,<0.1.0",
        "plotly",
        "flask",
        "flask_cors",
        "kaleido",
        "google-cloud-storage>=1.42.0",
        "gunicorn",
        "OpenFisca-Core",
        "microdf_python",
        "numpy",
        "pandas",
        "tables",
        "wheel",
        "rdbl",
    ],
    packages=find_packages(),
)
