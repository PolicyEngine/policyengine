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
    const iconStyle = { marginLeft: 15, fontSize: 15, color: props.color };
    return (
        <div className="d-flex justify-content-center">
            <a href="https://twitter.com/ThePolicyEngine">
                <TwitterOutlined style={iconStyle} />
            </a>
            <a href="https://www.facebook.com/PolicyEngine">
                <FacebookOutlined style={iconStyle} />
            </a>
            <a href="https://www.linkedin.com/company/ThePolicyEngine/about/">
                <LinkedinOutlined style={iconStyle} />
            </a>
            <a href="https://www.instagram.com/PolicyEngine/">
                <InstagramOutlined style={iconStyle} />
            </a>
            <a href="https://www.github.com/PolicyEngine/">
                <GithubOutlined style={iconStyle} />
            </a>
        </div>
    );
}