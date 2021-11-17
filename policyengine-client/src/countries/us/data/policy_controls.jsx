import { Image } from "antd";
import UBICenterLogo from "../images/ubicenter.png";

export const ORGANISATIONS = {
	"UBI Center": {
		"logo": <Image src={UBICenterLogo} preview={false} height={30} width={30}/>,
	}
};

export const PARAMETER_MENU = {
	"UBI Center": {
		"Universal Basic Income": [
			"child_UBI",
			"adult_UBI",
			"senior_UBI",
		],
	}
};
