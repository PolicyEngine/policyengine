/*
 * Helper functions for translating between URLs and policies
*/

export function policyToURL(targetPage, policy) {
	let searchParams = new URLSearchParams(window.location.search);
	for (const key in policy) {
		if (policy[key].value !== policy[key].defaultValue) {
			if(policy[key].unit === "/1") {
				searchParams.set(key, parseFloat((policy[key].value * 100).toFixed(2)).toString().replace(".", "_"));
			} else {
				let value;
				try {
					value = +parseFloat(policy[key].value.toFixed(2));
				} catch {
					value = +policy[key].value;
				}
				searchParams.set(key, value.toString().replace(".", "_"));
			}
		} else {
			searchParams.delete(key);
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
		try {
			plan[key].value = +searchParams.get(key).replace("_", ".") / (defaultPolicy[key].unit === "/1" ? 100 : 1);
		} catch {
			// Bad parameter, do nothing
		}
	}
	return plan;
}