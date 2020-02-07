class Utils {
    static calDistMatrix (first, second) {
        let matrix = new Array (first.length);
        for (let i = 0; i < matrix.length; i++)
            matrix[i] = [];
        first.forEach ((e1, i) => second.forEach (e2 => matrix[i].push (dist (e1.pos.x, e1.pos.y, e2.pos.x, e2.pos.y))));
        return matrix;
    }

    static closestHead (node_matrix, node_index, heads) {
        let distance = Infinity;
        let closestIndex = -1;
        heads.forEach ((h_index) => {
            let d = node_matrix[node_index][h_index];
            if (d < network.nodes[h_index].vicinity && d < distance) {
                distance = d;
                closestIndex = h_index;
            }
        }); 
        return closestIndex;
    }

    static closestSink (sink_matrix, node_index, sinks) {
        let distance = Infinity;
        let closestSink = -1;
        sinks.forEach ((_, sink_index) => {
            let d = sink_matrix[node_index][sink_index];
            if (d < distance) {
                distance = d;
                closestSink = sink_index;
            }
        })
        return closestSink;
    }

    static energyToTransmit (l, d) {
        if (d < Do) 
            return l * E_ELC + l * E_EFS * pow (d, 2);
        return l * E_ELC + l * E_AMP * pow (d, 4);
    }

    static energyToReceive (l) {
        return l * E_ELC;
    }

    // TODO(Ari): Yet to be implemented by using E_DA
    static energyToAggregate (p, l) {
        return 0;       
    }
}