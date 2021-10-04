import React from 'react'

import { PolicyEngine, Header, Footer, Policy, Responsive, PopulationResults, Switch, Route, getPolicyFromURL, Household, HouseholdImpact } from 'policyengine-client'
import "policyengine-client/src/policyengine.css";

import PARAMETER_MENU from './controls';
import POLICY from "./parameters";
import { ADULT, CHILD, SITUATION } from "./household";
import { Divider, Button, message } from "antd";


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {policy: getPolicyFromURL(POLICY), household: SITUATION, householdEntered: false, page: ""};
  }
  
  render() {
    console.log(this.state.page)
    return (
      <PolicyEngine>
        <Header country="UK" beta policy={this.state.policy} household={this.state.householdEntered}/>
          <Responsive>
            <Switch>
              <Route path="/" exact>
                <Policy 
                  policy={this.state.policy}
                  menuStructure={PARAMETER_MENU}
                  selected={"/Tax/Income Tax/Labour income"}
                  open={["/Tax", "/Tax/Income Tax", "/Benefit"]}
                  setPolicy={policy => {this.setState({policy: policy})}}
                  overrides={{autoUBI: <AutoUBI />}}
                  setPage={page => {this.setState({page: page})}}
                />
              </Route>
              <Route path="/household">
                <Household 
                  policy={this.state.policy}
                  household={this.state.household}
                  selected="head"
                  defaultAdult={ADULT}
                  defaultChild={CHILD}
                  setHousehold={household => {this.setState({household: household, householdEntered: true})}}
                  setPage={page => {this.setState({page: page})}}
                />
              </Route>
              <Route path="/population-impact">
                <PopulationResults 
                  country={"UK"}
                  policy={this.state.policy}
                  setPage={page => {this.setState({page: page})}}
                />
              </Route>
              <Route path="/household-impact">
                <HouseholdImpact
                  policy={this.state.policy}
                  household={this.state.household}
                  setPage={page => {this.setState({page: page})}}
                />
              </Route>
              <Route path="/faq">
              </Route>
          </Switch>
        </Responsive>
        <Footer />
      </PolicyEngine>
    );
  }
}

function AutoUBI(props) {
  function applyAutoUBI() {
		const submission = {};
		for (const key in props.policy) {
			if(props.policy[key].value !== props.policy[key].default) {
				submission["policy_" + key] = props.policy[key].value;
			}
		}
		let url = new URL("https://uk.policyengine.org/api/ubi");
		url.search = new URLSearchParams(submission).toString();
		fetch(url)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw res;
        }
      }).then((json) => {
        props.setPolicy("child_UBI", props.policy["child_UBI"].value + Math.round(json.UBI / 52, 2));
        props.setPolicy("adult_UBI", props.policy["adult_UBI"].value + Math.round(json.UBI / 52, 2));
        props.setPolicy("senior_UBI", props.policy["senior_UBI"].value + Math.round(json.UBI / 52, 2));
      }).catch(e => {
        message.error("Couldn't apply AutoUBI - something went wrong.")
      });
	}
  return (
    <>
      <Divider>AutoUBI</Divider>
      <Button onClick={applyAutoUBI}>Direct surplus revenue into UBI</Button>
    </>
  );
}


export default App;
