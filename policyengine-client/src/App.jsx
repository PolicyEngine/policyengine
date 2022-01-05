/*
    * This file contains the top-level logic: directing as per the URL
    * up to the /country page.
*/

import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/policyengine.less";
import PolicyEngine from "./policyengine/policyengine";


export default function App(props) {
    return (
        <Router>
            <Switch>
                <Route exact path="/">
                    <Redirect to="/uk/policy" />
                </Route>
                <Route path="/uk">
                    <PolicyEngine country="uk" analytics={props.analytics} />
                </Route>
                <Route path="/us">
                    <PolicyEngine country="us" analytics={props.analytics} />
                </Route>
            </Switch>
        </Router>
    );
}
