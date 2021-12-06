# policyengine-core

This repository contains the core infrastructure for PolicyEngine sites in order to reduce code duplication. Namely, `policyengine`, a Python package which contains the server-side implementations, and `policyengine-core`, a React library containing high-level components to build the client-side interface.

## Development

First, install using `make install`. Then, to debug the client, run `make debug-client`, or to debug the server, run `make debug-server`.

If you're just developing the client side (i.e. no changes to simulation or other server code), no further action is needed. If your changes involve both the client and the server, you'll need to change the API urls in `App.jsx` to `http://localhost:5000/{country}/api` for each country (UK, US) as needed.
