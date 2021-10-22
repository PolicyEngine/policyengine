from openfisca_uk import Microsimulation
from openfisca_uk_data import FRS

sim = Microsimulation(dataset=FRS, year=2019)
sim.calc("employment_income", 2021)