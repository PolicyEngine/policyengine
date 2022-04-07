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


export default function SocialLinks(props) {
    const iconStyle = { marginLeft: 15, fontSize: 15, color: "white" };
    return (
        <div className="d-flex justify-content-center">
            <a href="https://twitter.com/thepolicyengine">
                <TwitterOutlined style={iconStyle} />
            </a>
            <a href="https://www.facebook.com/ThePolicyEngine">
                <FacebookOutlined style={iconStyle} />
            </a>
            <a href="https://www.linkedin.com/company/thepolicyengine/about/">
                <LinkedinOutlined style={iconStyle} />
            </a>
            <a href="https://www.instagram.com/policyengine/">
                <InstagramOutlined style={iconStyle} />
            </a>
            <a href="https://www.github.com/policyengine/">
                <GithubOutlined style={iconStyle} />
            </a>
        </div>
    );
}