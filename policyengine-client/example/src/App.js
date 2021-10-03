import React from 'react'

import { PolicyEngine, Header, Footer, Policy, PopulationResults, Switch, Route, getPolicyFromURL, Household, HouseholdImpact } from 'policyengine-client'
import "policyengine-client/src/policyengine.css";

import PARAMETER_MENU from './controls';
import POLICY from "./parameters";
import { ADULT, CHILD, SITUATION } from "./household";


const App = () => {
  return (
    <PolicyEngine>
      <Header country="UK" beta />
      <Body />
      <Footer />
    </PolicyEngine>
  );
}

class Body extends React.Component {
  constructor(props) {
    super(props);
    this.state = {policy: getPolicyFromURL(POLICY), household: SITUATION};
  }
  
  render() {
    return (
      <Switch>
        <Route path="/" exact>
          <Policy 
            policy={this.state.policy}
            menuStructure={PARAMETER_MENU}
            selected={"/Tax/Income Tax/Labour income"}
            open={["/Tax", "/Tax/Income Tax", "/Benefit"]}
            setPolicy={policy => {this.setState({policy: policy})}}
          />
        </Route>
        <Route path="/household">
          <Household 
            policy={this.state.policy}
            household={this.state.household}
            selected="head"
            defaultAdult={ADULT}
            defaultChild={CHILD}
            setHousehold={household => {this.setState({household: household})}}
          />
        </Route>
        <Route path="/population-impact">
          <PopulationResults 
            country={"uk"}
            policy={this.state.policy}
          />
        </Route>
        <Route path="/household-impact">
          <HouseholdImpact
            policy={this.state.policy}
            household={this.state.household}
          />
        </Route>
        <Route path="/faq">
        </Route>
      </Switch>
    );
  }
}



export default App
