import { DatePicker, message, Button } from 'antd';
import React from 'react';
import moment from 'moment';
import Spinner from '../../../policyengine/general/spinner';
import { useContext } from 'react';
import { CountryContext } from '../../country';

export default function TimeTravel(props) {
    let [date, setDate] = React.useState(moment());
    const country = useContext(CountryContext);
    let [isLoading, setIsLoading] = React.useState(false);
    const snapShot = 
        <><h6 style={{marginTop: 20}}>Snapshot</h6>
            <p>Select a date below to set all parameters to their legislative value as of that date.</p>
            <DatePicker
                allowClear={false}
                defaultValue={date}
                onChange={date => setDate(date)}
                disabledDate={date => date < moment("2021-01-01") | date > moment("2027-12-31")}
            />
            <Button 
                onClick={() => {
                    const dateString = date.format("YYYY-MM-DD");
                    const url = `${country.apiURL}/parameters?policy_date=${dateString}`;
                    setIsLoading(true);
                    fetch(url)
                        .then((res) => {
                            if (res.ok) {
                                return res.json();
                            } else {
                                throw res;
                            }
                        }).then((policy) => {
                            let previous_policy = country.policy;
                            for(let key of Object.keys(policy)) {
                                if(Object.keys(previous_policy).includes(key)) {
                                    previous_policy[key][country.editingReform ? "value" : "baselineValue"] = policy[key].value;
                                }
                            }
                            country.updateEntirePolicy(previous_policy);
                            setIsLoading(false);
                        }).catch(e => {
                            message.error("Couldn't time travel - something went wrong.");
                            setIsLoading(false);
                        });
                }}
                style={{marginLeft: 20, marginRight: 20}}
            >Set policy</Button>
            {isLoading && <Spinner />}
            <div style={{paddingBottom: 20}} /></>;
    let [policyDate, setPolicyDate] = React.useState(moment());
    let [policyDateLoading, setPolicyDateLoading] = React.useState(false);
    let [policyDateChanged, setPolicyDateChanged] = React.useState(false);
    const policyDateControl = (
        <><h6 style={{marginTop: 20}}>Policy date</h6>
            <p>Select a date below to simulate PolicyEngine as of a particular date. This also resets all parameters.</p>
            <DatePicker
                allowClear={false}
                defaultValue={policyDate}
                onChange={date => setPolicyDate(date)}
                disabledDate={date => date < moment("2021-01-01") | date > moment("2027-12-31")}
            />
            <Button 
                onClick={() => {
                    if(!policyDateChanged) {
                        const dateString = policyDate.format("YYYY-MM-DD");
                        const url = `${country.apiURL}/parameters?policy_date=${dateString}`;
                        setPolicyDateLoading(true);
                        fetch(url)
                            .then((res) => {
                                if (res.ok) {
                                    return res.json();
                                } else {
                                    throw res;
                                }
                            }).then((policy) => {
                                let previous_policy = country.policy;
                                for(let key of Object.keys(policy)) {
                                    if(Object.keys(previous_policy).includes(key)) {
                                        previous_policy[key].defaultValue = policy[key].value;
                                        previous_policy[key].baselineValue = policy[key].value;
                                        previous_policy[key].value = policy[key].value;
                                    }
                                }
                                country.updateEntirePolicy(previous_policy);
                                setPolicyDateLoading(false);
                            }).catch(e => {
                                message.error("Couldn't time travel - something went wrong.");
                                setPolicyDateLoading(false);
                            });
                        let policy = country.policy;
                        policy.policy_date = {
                            name: "policy_date",
                            label: "PolicyEngine simulation date",
                            defaultValue: moment().format("YYYYMMDD"),
                            value: policyDate.format("YYYYMMDD"),
                            baselineValue: policyDate.format("YYYYMMDD"),
                            valueType: "date",
                        };
                        country.updateEntirePolicy(policy);
                        setPolicyDateChanged(true);
                    } else {
                        let policy = country.policy;
                        policy.policy_date = {
                            name: "policy_date",
                            label: "PolicyEngine simulation date",
                            defaultValue: 0,
                            value: 0,
                            baselineValue: 0,
                            valueType: "date",
                        };
                        country.updateEntirePolicy(policy);
                        setPolicyDateChanged(false);
                    }
                }}
                style={{marginLeft: 20, marginRight: 20}}
            >{policyDateChanged ? "Reset" : "Set date"}</Button>
            {policyDateLoading && <Spinner />}
            <div style={{paddingBottom: 20}} /></>
    );
    return (
        <>
            {country.showSnapShot && snapShot}
            <h6 style={{marginTop: 20}}>Reset</h6>
            <p>Reset all reform parameters to their values in the baseline.</p>
            <Button onClick={
                () => {
                    let previous_policy = country.policy;
                    for(let key in country.policy) {
                        previous_policy[key].value = country.policy[key].baselineValue;
                    }
                    country.updateEntirePolicy(previous_policy);
                }
            }>Reset reform to baseline</Button>
            {policyDateControl}
        </>
  );
}