export function policyToURL(targetPage, policy) {
	let searchParams = new URLSearchParams(window.location.search);
	for (const key in policy) {
		if (policy[key].value !== policy[key].defaultValue) {
			if(policy[key].unit === "/1") {
				searchParams.set(key, Math.round(+policy[key].value * 100));
			} else {
				searchParams.set(key, +policy[key].value);
			}
		} else {
			searchParams.delete(key);
		}
	}
	const url = `${targetPage}?${searchParams.toString()}`;
	return url;
}

export function urlToPolicy(defaultPolicy) {
	let plan = JSON.parse(JSON.stringify(defaultPolicy));
	const { searchParams } = new URL(document.location);
	for (const key of searchParams.keys()) {
		try {
			plan[key].value = +searchParams.get(key) / (defaultPolicy[key].unit === "/1" ? 100 : 1);
		} catch {
			// Bad parameter, do nothing
		}
	}
	return plan;
}