from ..country import PolicyEngineCountry
import openfisca_us


class US(PolicyEngineCountry):
    openfisca_country_model = openfisca_us
    pass
