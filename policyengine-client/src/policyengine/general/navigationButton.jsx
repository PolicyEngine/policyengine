import { Button } from "antd";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { CountryContext } from "../../countries";
import { policyToURL } from "../tools/url";

export default function SimulateButton(props) {
    const country = useContext(CountryContext);
	const url = policyToURL(`/${country.name}/${props.target}`, country.policy);
	return (
		<div style={{marginBottom: 20}}>
			<Link to={url}><Button 
                disabled={props.disabled} 
                type={props.primary ? "primary" : null} 
                onClick={props.onClick}>{props.text}
            </Button></Link>
		</div>
	);
}