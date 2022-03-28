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
    return (
        <>
            <h6 style={{marginTop: 20}}>Snapshot</h6>
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
                            for(let key in policy) {
                                previous_policy[key][country.editingReform ? "value" : "baselineValue"] = policy[key].value;
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
            <div style={{paddingBottom: 20}} />
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
        </>
  );
}