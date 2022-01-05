/*
 * Parameters for the US app.
*/

import Country from "../country"

export class US extends Country {
    name = "us"
    properName = "US"
    apiURL = "http://localhost:5000/us/api"
    beta = true
    // Pages to show
    showPolicy = true
    showPopulationImpact = false
    showHousehold = true
    showFAQ = true
};
