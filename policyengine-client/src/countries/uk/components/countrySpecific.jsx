import { Select } from "antd";
import { useContext } from "react";
import { CountryContext } from "../../country";

const { Option } = Select;

export default function CountrySpecific(props) {
	const country = useContext(CountryContext);
    const parameter = country.policy.country_specific;
	return <>
        <h6 style={{marginTop: 20}}>{parameter.label}</h6>
        <p>{parameter.description}</p>
        <Select
            style={{minWidth: 200}} 
            showSearch 
            defaultValue={parameter.baselineValue}
            onSelect={value => {
                let policy = country.policy;
                policy.country_specific.baselineValue = value;
                policy.country_specific.value = value;
                country.updateEntirePolicy(policy);
            }}>
            {parameter.possibleValues.map(value => (
                <Option
                    key={value.key} 
                    value={value.key}
                >
                    {value.value}
                </Option>
            ))}
        </Select>
    </>
}