import { Redirect, Route } from "react-router-dom";

export default function createRedirects(namedPolicies, country) {
    return Object.keys(namedPolicies).map(
        url => <Route
                exact 
                key={url}
                path={`/${country}/population-impact${url}`}
            >
                <Redirect 
                    to={`/${country}/population-impact?${namedPolicies[url]}`}
                />
            </Route>
    );
}