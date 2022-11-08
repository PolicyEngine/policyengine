/*
 * Social links component - the social media icons.
*/

import {
    FacebookOutlined,
    InstagramOutlined,
    LinkedinOutlined,
    TwitterOutlined,
    GithubOutlined,
} from '@ant-design/icons';

import LinkedInLogo from "../../images/logos/linkedin_logo.png"
import FacebookLogo from "../../images/logos/facebook_logo.png"


export default function SocialLinks(props) {
    const iconStyle = { marginLeft: 15, fontSize: 15, color: props.color };
    const importedIconStyle = { height: "14px", marginLeft: 15, marginTop: 4, filter: props.color === "black" ? "" : "invert(1)" };
    return (
        <div className="d-flex justify-content-center">
            <a href="https://twitter.com/ThePolicyEngine">
                <TwitterOutlined style={iconStyle} />
            </a>
            <a href="https://facebook.com/PolicyEngine">
                <img src={FacebookLogo} style={importedIconStyle}/>
            </a>
            <a href="https://linkedin.com/company/ThePolicyEngine">
                <img src={LinkedInLogo} style={importedIconStyle}/>
            </a>
            <a href="https://instagram.com/PolicyEngine">
                <InstagramOutlined style={iconStyle} />
            </a>
            <a href="https://github.com/PolicyEngine">
                <GithubOutlined style={iconStyle} />
            </a>
        </div>
    );
}