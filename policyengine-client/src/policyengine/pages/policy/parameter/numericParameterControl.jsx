import React, { useContext, useState } from "react";
import { CountryContext } from "../../../../countries/country";
import { getTranslators } from "../../../tools/translation";
import { EditOutlined } from "@ant-design/icons";
import {
	Slider, 
    Alert, 
    Input,
} from "antd";
import Spinner from "../../../general/spinner";

const parsePotentiallyInfiniteNumber = (number) => {
    if (number == "inf") {
        return Infinity;
    } else if (number == "-inf") {
        return -Infinity;
    } else {
        return number;
    }
};

const checkParameterInRange = (value, min, max) => {
    // min and max may be null, in which case they are ignored.
    if (min !== null && value < min) {
        return false;
    }
    if (max !== null && value > max) {
        return false;
    }
    return true;
};

const NumericParameterControlSlider = (props) => {
    let {formatter, min, max} = getTranslators(props.metadata);
    let marks = {[max]: formatter(max)};
	if(min) {
		marks[min] = formatter(min);
	}
	let formattedValue = formatter(props.metadata[props.targetKey]);
	formattedValue = props.metadata[props.targetKey] === null ? <Spinner /> : formattedValue;
	return <Slider
		value={props.metadata[props.targetKey]}
		style={{marginLeft: min ? 30 : 0, marginRight: 30}}
		min={min}
		max={max}
		marks={marks}
		onChange={props.onChange}
		step={0.01}
		tooltipVisible={false}
		disabled={props.disabled}
		paddingRight={15}
	/>
}

const NumericParameterControl = (props) => {
    const country = useContext(CountryContext);
    const targetKey = country.editingReform ? "value" : "baselineValue";
    // focused==true means the user is currently editing the value.
    let [focused, setFocused] = useState(false);
    // error messages are shown when attempting to set an invalid value.
    let [errorMessage, setErrorMessage] = useState(null);
    
    let {formatter, min, max} = getTranslators(props.metadata);
	let formattedValue = formatter(props.metadata[targetKey]);

    let { hardMin, hardMax } = props;
    hardMin = parsePotentiallyInfiniteNumber(hardMin);
    hardMax = parsePotentiallyInfiniteNumber(hardMax);
	const multiplier = props.metadata.unit === "/1" ? 100 : 1;
	const slider = <NumericParameterControlSlider 
        metadata={props.metadata} 
        onChange={props.onChange} 
        disabled={props.disabled}
        targetKey={targetKey}
    />
	return (
		<>
			{!props.noSlider && slider}
			{
				errorMessage && <Alert style={{marginBottom: 5}} message={errorMessage} type="error" showIcon />
			}
			{
				focused & !props.displayOnly ?
					<Input.Search 
						enterButton="Enter" 
						style={{maxWidth: 300}} 
						placeholder={multiplier * props.metadata[targetKey]} 
						onSearch={value => {
							if(checkParameterInRange(value / multiplier, hardMin, hardMax)) {
								setFocused(false); 
								props.onChange(value / multiplier);
								setErrorMessage(null);
							} else {
								setErrorMessage(`Value must be between ${min} and ${max}`);
							}
						}} /> :
					<div>
						{props.displayOnly || formattedValue} 
						{
							!props.displayOnly && <EditOutlined 
								style={{marginLeft: 5}} 
								onClick={() => setFocused(true)} 
							/>
						}
					</div>
			}
		</>
	);
}

export default NumericParameterControl;