class RadioConsumptionModel {
    static cprob = 0.25;
    static nprob = 0.15;
    static dataPacketSent = 0;
    constructor () {
        this.sinksLoad = new Array(network.sinks.length).fill(0);
        this.rounds = 0;
        return this;
    }

    // TODO(Ari): Not discussed in MS-GAOC paper but will use if for enhancement
    broadcastMessage (clusters) {
        Object.keys(clusters).forEach (h_index => {
            if (random(1) < 0.3)
                RadioConsumptionModel.dataPacketSent++;
         })
    }

    evanesce (clusters, singleNodes) {
        this.rounds++;
        Object.keys(clusters).forEach (h_index => {
            if (random (1) < RadioConsumptionModel.cprob && network.nodes[h_index].resEnergy > 0)       // Will this cluster dissipate
                this.dissipateClusterEnergy (clusters, h_index);
        })

        singleNodes.forEach (obj => {
           this.dissipateSingleNodeEnergy(obj)
        });
    }

    dissipateClusterEnergy (clusters, h_index) {
        let nodesDissipating = 0;
        let packetCount = 0;
        clusters[h_index]["N"].forEach (node_index => {
            if (random (1) < RadioConsumptionModel.nprob && network.nodes[node_index].resEnergy > 0) {     // Will this node dissipate
                let e = Utils.energyToTransmit (2000, network.nodeDistance[h_index][node_index]);
                network.nodes[node_index].resEnergy -= e;
                packetCount++;
                nodesDissipating++;
            }
        });
        // This is real times
        let obj = network.closestSink (h_index);
        let e = Utils.energyToTransmit (2000 * (nodesDissipating + 1), obj["D"]);
        network.nodes[h_index].resEnergy -= e;  
        packetCount++;
        RadioConsumptionModel.dataPacketSent += 2 * packetCount;
        this.sinksLoad[clusters[h_index]["SI"]] += 2 * packetCount;
    }

    dissipateSingleNodeEnergy (obj) {
        if (random (1) < 0.2 && network.nodes[obj["I"]].resEnergy > 0) {
            // This is real time
            let o = network.closestSink(obj["I"]);
            let e = Utils.energyToTransmit (2000, o["D"]);
            network.nodes[obj["I"]].resEnergy -= e;
            RadioConsumptionModel.dataPacketSent++;
            random(1) > 0.9 ? RadioConsumptionModel.dataPacketSent++ : RadioConsumptionModel.dataPacketSent += 2;
            this.sinksLoad[obj["SI"]] += 1;
        }
    }
}