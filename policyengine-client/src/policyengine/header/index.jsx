import { Affix } from "antd";
import { useContext } from "react";
import { Route, Switch } from "react-router-dom";
import { CountryContext } from "../../countries";
import MainNavigation from "./mainNavigation";

export function Header(props) {
    const country = useContext(CountryContext) || {};
	let navigation;
	if(props.title || props.noTabs) {
		navigation = <MainNavigation title={props.title} noTabs={props.noTabs}/>;
	} else {
		navigation = (
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
			</Switch>
		);
	}
	return (
		<Affix offsetTop={0}>
			<div style={{backgroundColor: "#2c6496"}}>
				{navigation}
			</div>
		</Affix>
	);
}
