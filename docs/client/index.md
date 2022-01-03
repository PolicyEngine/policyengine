# Client

The client app code is contained within the `policyengine-client/` folder. This contains all JavaScript code files (containing React components), organised in the following structure:

* `common/` - Components shared by all country sites
  * `images/` - Images used by the site
  * `pages` - Components used to render pages
    * `policy.jsx`
    * `populationImpact.jsx`
    * `household.jsx`
    * `householdImpact.jsx`
  * `url.jsx`
* `countries/` - Components specific to each country site
* `data/` - Data files used by the client (not country-specific)
