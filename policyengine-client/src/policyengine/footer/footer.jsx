import SocialLinks from "../header/socialLinks";
import { useContext } from "react";
import { CountryContext } from "../../countries";
import HelpButton from "../general/help";


export default function Footer(props) {
	const country = useContext(CountryContext);
	return (
		<div className="d-none d-lg-block" style={{ position: "fixed", width: "100%", bottom: 0, backgroundColor: "white", borderTop: "1px solid", borderColor: "#EEE", paddingTop: 20 }}>
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