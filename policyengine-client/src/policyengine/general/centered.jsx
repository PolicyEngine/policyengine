import { Empty } from "antd"

export default function Centered(props) {
    return <Empty description="" image={null} >
        {props.children}
    </Empty>
}