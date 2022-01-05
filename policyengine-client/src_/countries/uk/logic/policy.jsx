export function validatePolicy(policy, defaultPolicy) {
    if(defaultPolicy) {
        for(let parameter in policy) {
            policy[parameter].defaultValue = defaultPolicy[parameter].value;
        }
    }
    if(policy.higher_threshold.value === policy.add_threshold.value) {
        policy.higher_threshold.error = "The higher rate threshold must be different than the additional rate threshold.";
        policy.add_threshold.error = "The additional rate threshold must be different than the higher rate threshold.";
        return {policy: policy, policyValid: false};
    } else {
        policy.higher_threshold.error = null;
        policy.add_threshold.error = null;
    }
    return {policy: policy, policyValid: true};
}