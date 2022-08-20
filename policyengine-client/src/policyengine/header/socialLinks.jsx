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
            <a href="https://facebook.com/PolicyEngine">
                <FacebookOutlined style={iconStyle} />
            </a>
            <a href="https://linkedin.com/company/ThePolicyEngine">
                <LinkedinOutlined style={iconStyle} />
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