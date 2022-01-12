/*
 * Component for the top-left title.
*/

import { Tag, PageHeader, Image } from "antd";
import { useContext } from "react";
import { CountryContext } from "../../countries";
import MainLogo from "../../images/title_logo.png";
import { policyToURL } from "../tools/url";

export default function Title() {
    const country = useContext(CountryContext);
	const betaTag = country.beta ? [<Tag key="beta" color="#002766">BETA</Tag>] : null;
	const title = (
        <a href={policyToURL(`/${country.name}/policy`, country.policy)}>
            <Image 
                src={MainLogo} 
                preview={false} 
                height={50} 
                width={80} 
                style={{padding: 0, margin: 0}} 
            />
        </a>
    );
	return (
		<div style={{minWidth: 300}}>
			<div className="d-none d-lg-flex align-items-center ">
				<PageHeader
					title={title}
					style={{minHeight: 30, padding: 0, margin: 0}}
					tags={betaTag}
				/>
			</div>
			<div className="d-lg-none">
				<div className="d-flex align-items-center justify-content-center">
					<PageHeader
						title={title}
						style={{paddingBottom: 8}}
						tags={betaTag}
					/>
				</div>
			</div>
		</div>
	);
}