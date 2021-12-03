import { DatePicker, message } from 'antd';
import React from 'react';
import moment from 'moment';

export default function TimeTravel(props) {
    return (
        <>
            <h6 style={{marginTop: 20}}>Policy date (baseline)</h6>
            <p>PolicyEngine will use tax-benefit policy as of the date set below for the baseline simulation</p>
            <DatePicker 
                defaultValue={moment(props.policy.policy_date.value, "YYYY-MM-DD")} 
                onChange={(_, dateString) => {
                    const url = `${props.api_url}/parameters?policy_date=${dateString}`;
                    fetch(url)
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        } else {
                            throw res;
                        }
                    }).then((policy) => {
                        let previous_policy = props.policy;
                        const dateInt = +(dateString.replace("-", "").replace("-", ""));
                        policy.baseline_policy_date.value = +(moment().format("YYYYMMDD"));
                        previous_policy.baseline_policy_date.value = dateInt;
                        policy.policy_date.value = +(moment().format("YYYYMMDD"));
                        previous_policy.policy_date.value = dateInt;
                        props.updateEntirePolicy(previous_policy, policy);
                    }).catch(e => {
                        message.error("Couldn't time travel - something went wrong." + e.toString());
                    });
                }}
            />
            <div style={{paddingBottom: 20}} />
        </>
  );
}