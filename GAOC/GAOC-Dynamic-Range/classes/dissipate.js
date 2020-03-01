class RadioConsumptionModel {
<<<<<<< HEAD
    static cprob = 0.27;
=======
    static cprob = 0.3;
>>>>>>> e34c4796307d9baee65c79df82ed062a8097bf46
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
<<<<<<< HEAD
            if (random(1) < 0.4)
=======
            if (random(1) < 0.2)
>>>>>>> e34c4796307d9baee65c79df82ed062a8097bf46
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
        let e = Utils.energyToTransmit (2000 * (nodesDissipating + 1), network.sinkDistance[h_index][clusters[h_index]["SI"]]);
        network.nodes[h_index].resEnergy -= e;  
        packetCount++;
        RadioConsumptionModel.dataPacketSent += packetCount;
        this.sinksLoad[clusters[h_index]["SI"]] += packetCount;
    }

    dissipateSingleNodeEnergy (obj) {
        if (random (1) < 0.1 && network.nodes[obj["I"]].resEnergy > 0) {
            let e = Utils.energyToTransmit (2000, network.sinkDistance[obj["I"]][obj["SI"]]);
            network.nodes[obj["I"]].resEnergy -= e;
            RadioConsumptionModel.dataPacketSent++;
            this.sinksLoad[obj["SI"]] += 1;
        }
    }
}
