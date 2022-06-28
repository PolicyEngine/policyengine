import SocialLinks from "../header/socialLinks";
import { Affix, BackTop, Divider } from "antd";
import { useContext } from "react";
import { CountryContext } from "../../countries";
import HelpButton from "../general/help";


export default function Footer(props) {
	const country = useContext(CountryContext);
	return (
		<div style={{ backgroundColor: "white", borderTop: "1px solid", borderColor: "#EEE", padding: 20 }}>
			<div className="d-none d-lg-flex justify-content-center">
				<p style={{ textAlign: "center" }}><a href="https://policyengine.org">PolicyEngine © 2022</a> | <a href={`/about`}>About</a> | <HelpButton /> | <a href={`/${country.name}/faq`}>FAQ</a> | <a href="https://blog.policyengine.org">Blog</a> | <a href="https://zej8fnylwn9.typeform.com/to/XFFu15Xq">Feedback</a> | <a href="https://opencollective.com/psl">Donate</a></p>
			</div>
			<div className="d-flex d-lg-none justify-content-center" style={{paddingBottom: 10}}>
				<SocialLinks color="black" />
			</div>
			<div className="d-block d-lg-none">
				<p style={{ textAlign: "center" }}>
					<a href="https://policyengine.org">PolicyEngine © 2022</a> | 
					<a href={`/about`}> About</a> | 
					<HelpButton /> | 
					<a href={`/${country.name}/faq`}> FAQ</a> | 
					<a href="https://blog.policyengine.org"> Blog</a> |
					<a href="https://zej8fnylwn9.typeform.com/to/XFFu15Xq"> Feedback</a> | 
					<a href="https://opencollective.com/psl"> Donate</a>
				</p>
			</div>
		</div>
	)
}