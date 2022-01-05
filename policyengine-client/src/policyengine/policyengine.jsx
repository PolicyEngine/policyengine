import React from "react";
import { Route, Switch } from "react-router-dom";
import { CountryContext, UK, US } from "../countries/country";
import { Header } from "./header";
import { PolicyEngineWrapper } from "./layout/general";
import PolicyPage from "./pages/policy/policy";
import { urlToPolicy } from "./tools/url";


export default class PolicyEngine extends React.Component {
    constructor(props) {
        super(props);
        this.prepareData = this.prepareData.bind(this);
        this.state = {uk: UK, us: US}[props.country];
    }

    prepareData() {
        let { policy } = this.state.validatePolicy(urlToPolicy(this.state.parameters), this.state.parameters);
        for(let parameter of Object.keys(policy)) {
            if(Object.keys(this.state.extraParameterMetadata).includes(parameter)) {
                policy[parameter] = Object.assign(policy[parameter], this.state.extraParameterMetadata[parameter]);
            }
        }
        this.setState({policy: policy, fullyLoaded: true});
    }

    componentDidMount() {
        const checkAllFetchesComplete = () => {
            if(
                (this.state.parameters !== null)
                && (this.state.variables !== null)
                && (this.state.entities !== null)
            ) {
                this.prepareData();
            }
        }
        const fetchEndpoint = name => {
            fetch(this.state.apiURL + "/" + name)
                .then(response => response.json())
                .then(data => {
                    this.setState({[name]: data}, checkAllFetchesComplete);
                });
        }
        ["parameters", "variables", "entities"].forEach(fetchEndpoint);
    }

    render() {
        if(!this.state.fullyLoaded) {
            return <></>;
        }
        const countryName = this.state.name;
        return (
            <PolicyEngineWrapper>
                <CountryContext.Provider value={this.state}>
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