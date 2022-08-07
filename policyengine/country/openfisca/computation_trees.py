from openfisca_core.tracers import FullTracer
import dpath


def get_computation_trees_json(simulation, params):
    simulation.trace = True
    simulation.tracer = FullTracer()

    requested_computations = dpath.util.search(
        params["household"],
        "*/*/*/*",
        afilter=lambda t: t is None,
        yielded=True,
    )

    for computation in requested_computations:
        path = computation[0]
        entity_plural, entity_id, variable_name, period = path.split("/")
        result = simulation.calculate(variable_name, period)

    def trace_node_to_dict(node):
        try:
            value = [float(value) for value in node.value]
        except:
            try:
                value = [str(value) for value in node.value]
            except:
                value = None
        return {
            "name": node.name,
            "value": value,
            "children": [trace_node_to_dict(child) for child in node.children],
        }

    return {
        "computation_trees": [
            trace_node_to_dict(tree) for tree in simulation.tracer.trees
        ]
    }
