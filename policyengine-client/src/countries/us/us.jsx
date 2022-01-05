/*
 * Parameters for the US app.
*/

import Country from "../country"

export class US extends Country {
    name = "us"
    properName = "US"
    beta = true
    // Pages to show
    showPolicy = false
    showPopulationImpact = false
    showHousehold = true
    showFAQ = true
};
