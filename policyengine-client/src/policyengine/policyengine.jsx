/*
 * The main component for PolicyEngine-[Country]
 */

import React from "react";
import { Route, Switch } from "react-router-dom";
import { CountryContext, UK, US } from "../countries";
import { Header } from "./header";
import { PolicyEngineWrapper } from "./layout/general";
import PolicyPage from "./pages/policy/policy";
import { urlToPolicy } from "./tools/url";


export default class PolicyEngine extends React.Component {
    constructor(props) {
        super(props);
        this.prepareData = this.prepareData.bind(this);
        this.state = {country: {uk: new UK(), us: new US()}[props.country]};
    }

    setCountryState(data, callback) {
        let country = this.state.country;
        for(let key of Object.keys(data)) {
            country[key] = data[key];
        }
        this.setState({country: country}, callback);
    }

    prepareData() {
        // Once data is fetched, apply some adjustments to the OpenFisca data
        // (that we don't want to apply in OpenFisca-[Country] because they're not
        // legislative)
        let { policy } = this.state.country.validatePolicy(urlToPolicy(this.state.country.parameters), this.state.country.parameters);
        for(let parameter of Object.keys(policy)) {
            if(Object.keys(this.state.country.extraParameterMetadata).includes(parameter)) {
                policy[parameter] = Object.assign(policy[parameter], this.state.country.extraParameterMetadata[parameter]);
            }
        }
        this.setCountryState({policy: policy, fullyLoaded: true});
    }

    componentDidMount() {
        // When the page loads, fetch parameter, variables and entities, and
        // then mark as done.
        const checkAllFetchesComplete = () => {
            if(
                (this.state.country.parameters !== null)
                && (this.state.country.variables !== null)
                && (this.state.country.entities !== null)
            ) {
                this.prepareData();
            }
        }
        const fetchEndpoint = name => {
            fetch(this.state.country.apiURL + "/" + name)
                .then(response => response.json())
                .then(data => {
                    this.setCountryState({[name]: data}, checkAllFetchesComplete);
                });
        }
        ["parameters", "variables", "entities"].forEach(fetchEndpoint);
    }

    render() {
        // Once fully loaded, direct onto individual pages
        if(!this.state.country.fullyLoaded) {
            return <></>;
        }
        const countryName = this.state.country.name;
        return (
            <PolicyEngineWrapper>
                <CountryContext.Provider value={this.state.country}>
                    <Header />
                    <Switch>
                        <Route path={`/${countryName}/policy`}>
                            <PolicyPage />
                        </Route>
                        <Route path={`/${countryName}/population-impact`}>
                        </Route>
                        <Route path={`/${countryName}/household`}>
                        </Route>
                        <Route path={`/${countryName}/faq`}>
                        </Route>
                    </Switch>
                </CountryContext.Provider>
            </PolicyEngineWrapper>
        );
    }
};