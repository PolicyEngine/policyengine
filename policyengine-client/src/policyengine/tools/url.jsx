/*
 * Helper functions for translating between URLs and policies
*/

export function policyToURL(targetPage, policy) {
	let searchParams = new URLSearchParams(window.location.search);
	for (const editingReform of [true, false]) {
		const targetKey = editingReform ? "value" : "baselineValue";
		const comparisonKey = editingReform ? "baselineValue" : "defaultValue";
		for (const key in policy) {
			if (policy[key][targetKey] !== policy[key][comparisonKey]) {
				let value;
				if(policy[key].unit === "/1") {
					value = parseFloat((policy[key][targetKey] * 100).toFixed(2)).toString().replace(".", "_");
				} else {
					try {
						value = +parseFloat(policy[key][targetKey].toFixed(2));
					} catch {
						value = +policy[key][targetKey];
					}
					value = value.toString().replace(".", "_");
				}
				searchParams.set(editingReform ? key : `baseline_${key}`, value);
			} else {
				searchParams.delete(editingReform ? key : `baseline_${key}`);
			}
		}
	}
	const url = `${targetPage}?${searchParams.toString()}`;
	return url;
}

export function urlToPolicy(defaultPolicy, policyRenames) {
	let plan = JSON.parse(JSON.stringify(defaultPolicy));
	const { searchParams } = new URL(document.location);
	if(policyRenames) {
		for (const key in policyRenames) {
			if (searchParams.has(key)) {
				searchParams.set(policyRenames[key], searchParams.get(key));
				searchParams.delete(key)
			}
		}
	}
	for (const key of searchParams.keys()) {
		const target = key.includes("baseline_") ? "baselineValue" : "value";
		const parameterName = key.replace("baseline_", "");
		try {
			plan[parameterName][target] = +searchParams.get(key).replace("_", ".") / (defaultPolicy[parameterName].unit === "/1" ? 100 : 1);
			if((target === "baselineValue") && !searchParams.has(parameterName)) {
				plan[parameterName].value = +searchParams.get(key).replace("_", ".") / (defaultPolicy[parameterName].unit === "/1" ? 100 : 1);
			}
		} catch(e) {
			// Bad parameter, do nothing
		}
	}
	return plan;
}