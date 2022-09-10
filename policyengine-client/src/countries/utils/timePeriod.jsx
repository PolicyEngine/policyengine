export default function translateTimePeriod(oldSituation, fromYear, toYear) {
    // Find every occurrence of {fromYear: ...} in the situation and replace it with
    // {toYear: ...}, removing the original entry.
    let situation = JSON.parse(JSON.stringify(oldSituation));
    for (let entity of Object.keys(situation)) {
        for (let entityInstance of Object.keys(situation[entity])) {
            for (let variable of Object.keys(situation[entity][entityInstance])) {
                if (variable !== "members") {
                    situation[entity][entityInstance][variable][toYear] = situation[entity][entityInstance][variable][fromYear];
                    delete situation[entity][entityInstance][variable][fromYear];
                }
            }
        }
    }
    return situation;
}