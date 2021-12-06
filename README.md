# policyengine-core

This repository contains the core infrastructure for PolicyEngine sites in order to reduce code duplication. Namely, `policyengine`, a Python package which contains the server-side implementations, and `policyengine-core`, a React library containing high-level components to build the client-side interface.

## Development

First, install using `make install`. Then, to debug the client, run `make debug-client`, or to debug the server, run `make debug-server`.

If your changes involve the server, change `const useLocalServer = false;` to `const useLocalServer = true;` in `src/App.jsx`.
