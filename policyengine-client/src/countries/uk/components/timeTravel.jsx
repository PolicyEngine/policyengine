import { DatePicker, message, Button } from 'antd';
import React from 'react';
import moment from 'moment';
import Spinner from '../../../policyengine/general/spinner';
import { useContext } from 'react';
import { CountryContext } from '../../country';

export default function TimeTravel(props) {
    let [reformDate, setReformDate] = React.useState(moment());
    const country = useContext(CountryContext);
    let [isLoading, setIsLoading] = React.useState(false);
    return (
        <>
            <h6 style={{marginTop: 20}}>Baseline snapshot</h6>
            <p>PolicyEngine will use tax-benefit policy as of the date set below for the baseline simulation</p>
            <DatePicker 
                defaultValue={moment(country.policy.policy_date.value, "YYYYMMDD")} 
                disabledDate={date => date < moment("2021-01-01") | date > moment("2021-12-31")}
                onChange={(_, dateString) => {
                    const url = `${country.apiURL}/parameters?policy_date=${dateString}`;
                    fetch(url)
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        } else {
                            throw res;
                        }
                    }).then((policy) => {
                        let previous_policy = country.policy;
                        const dateInt = +(dateString.replace("-", "").replace("-", ""));
                        for(let key in previous_policy) {
                            previous_policy[key].defaultValue = policy[key].value;
                        }
                        previous_policy.policy_date.value = dateInt;
                        previous_policy.policy_date.defaultValue = +(moment().format("YYYYMMDD"));
                        country.updateEntirePolicy(previous_policy);
                    }).catch(e => {
                        message.error("Couldn't time travel - something went wrong." + e.toString());
                        setIsLoading(false);
                    });
                }}
            />
            <div style={{paddingBottom: 20}} />
            <h6 style={{marginTop: 20}}>Reform snapshot</h6>
            <p>Select a date below to set all parameters to their legislative value as of that date</p>
            <DatePicker
                defaultValue={reformDate}
                onChange={date => setReformDate(date)}
                disabledDate={date => date < moment("2021-01-01") | date > moment("2021-12-31")}
            />
            <Button 
                onClick={() => {
                    const dateString = reformDate.format("YYYY-MM-DD");
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
                            for(let key in policy) {
                                if(key !== "baseline_policy_date") {
                                    previous_policy[key].value = policy[key].value;
                                }
                            }
                            country.updateEntirePolicy(previous_policy);
                            setIsLoading(false);
                        }).catch(e => {
                            message.error("Couldn't time travel - something went wrong." + e.toString());
                            setIsLoading(false);
                        });
                }}
                style={{marginLeft: 20, marginRight: 20}}
            >Set policy</Button>
            {isLoading && <Spinner />}
            <div style={{paddingBottom: 20}} />
        </>
  );
}