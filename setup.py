from setuptools import setup, find_packages
from policyengine import VERSION

setup(
    name="PolicyEngine",
    version=VERSION,
    author="PolicyEngine",
    license="http://www.fsf.org/licensing/licenses/agpl-3.0.html",
    url="https://github.com/policyengine/policyengine",
    install_requires=[
        "OpenFisca-UK==0.13.0",
        "OpenFisca-US==0.35.3",
        "OpenFisca-Tools>=0.4.1",
        "plotly",
        "flask",
        "itsdangerous==2.0.1",
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
        "pytest",
        "dpath>=1.5.0",
    ],
    packages=find_packages(),
)
