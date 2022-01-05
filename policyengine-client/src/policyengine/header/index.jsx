import { Affix } from "antd";
import { useContext } from "react";
import { Route, Switch } from "react-router-dom";
import { CountryContext } from "../../countries";
import MainNavigation from "./mainNavigation";

export function Header() {
    const country = useContext(CountryContext);
	return (
		<Affix offsetTop={0}>
			<div style={{backgroundColor: "#2c6496"}}>
				<Switch>
					<Route path={`/${country.name}/policy`}>
						<MainNavigation selected="policy"/>
					</Route>
					<Route path={`/${country.name}/population-impact`}>
						<MainNavigation selected="population-impact"/>
					</Route>
					<Route path={`/${country.name}/household`}>
						<MainNavigation selected="household"/>
					</Route>
					<Route path={`/${country.name}/faq`}>
						<MainNavigation selected="faq"/>
					</Route>
				</Switch>
			</div>
		</Affix>
	);
}
