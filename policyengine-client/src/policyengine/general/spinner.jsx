import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export default function Spinner(props) {
	return <Spin style={{paddingRight: props.rightSpacing}} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>}/>;
}