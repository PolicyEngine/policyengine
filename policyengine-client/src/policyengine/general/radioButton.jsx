import { Radio } from "antd";


export default function RadioButton(props) {
    return (
        <div className="justify-content-center d-flex" style={props.style}>
            <Radio.Group value={props.selected || props.options[0]} buttonStyle="solid" onChange={e => props.onChange(e.target.value)} >
                {props.options.map(option => <Radio.Button key={option} value={option}>{option}</Radio.Button>)}
            </Radio.Group>
        </div>
    );
}