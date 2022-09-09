import './App.css';
import { useState, useEffect } from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <APIExampleTest />
      </header>
    </div>
  );
}

const exampleHousehold = {
  people: {
    person: {},
  },
  tax_units: {
    tax_unit: {
      members: ["person"],
      heat_pump_expenditures: {2023: 10_000},
      high_efficiency_electric_home_rebate_percent_covered: {2023: 1},
      capped_heat_pump_rebate: {2023: null}, // We want to calculate this.
    }
  }
}

function APIExampleTest() {
  const [rebateAmount, setRebateAmount] = useState(null);
  
  useEffect(() => {
    fetch(
      "https://policyengine.org/us/api/calculate", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          household: exampleHousehold,
        })
      }
    )
      .then(results => results.json())
      .then(data => {
        const rebateAmount = data.tax_units.tax_unit.capped_heat_pump_rebate[2023];
        setRebateAmount(rebateAmount);
      });
  }, []); // <-- Have to pass in [] here!

  if(rebateAmount === null) {
    return <p>Fetching an example from the PolicyEngine API...</p>
  } else {
    return (
      <p>
        The heat pump rebate for $10k in heat pump expenditures in 2023 is ${rebateAmount}.
      </p>
    );
  }
}

export default App;
