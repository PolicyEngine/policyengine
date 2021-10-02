import React from 'react'

import { PolicyEngine, Header, Footer } from 'policyengine-client'
import "policyengine-client/src/policyengine.css";

const App = () => {
  return (
    <PolicyEngine>
      <Header country="US" beta />
      <Footer />
    </PolicyEngine>
  );
}

export default App
