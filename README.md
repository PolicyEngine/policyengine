# PolicyEngine

This repository contains the core infrastructure for [policyengine.org](https://policyengine.org).
Namely:
* `policyengine`, a Python package which contains the server-side implementations, and
* `policyengine-client`, a React library containing high-level components to build the client-side interface.

## Development

*NOTE:* requires Python 3.7 

First, install using `make install`. Then, to debug the client, run `make debug-client`, or to debug the server, run `make debug-server`.

If your changes involve the server, change `useLocalServer = false;` to `useLocalServer = true;` in `policyengine-client/src/countries/country.jsx`.
Otherwise, change `usePolicyEngineOrgServer = false;` to `usePolicyEngineOrgServer = true;` in `policyengine-client/src/countries/country.jsx`.

If you don't have access to the UK Family Resources Survey, you can still run the UK population-wide calculator on an anonymised version. To do that, instead of running `make debug-server`, run `UK_SYNTHETIC=1 make debug-server`
