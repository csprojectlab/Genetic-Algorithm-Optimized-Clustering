class Network {
    constructor (node_count) {
        this.nodes = [];
        this.sinks = [];
        this.n = node_count;
        // Number of nodes of each type
        this.adv = 0;
        this.int = 0;
        this.nrm = 0;
        // Total nergy of each type of node
        this.eAdv = 0;
        this.eInt = 0;
        this.eNrm = 0;
        this.eTotal = 0;        // Total network energy

        // Distance matrix
        this.nodeDistance = null;
        this.sinkDistance = null;
        return this;
    }

    initNetParams (nf_adv, nf_int, ef_alpha, ef_beta) {
        // Initialize node count
        this.adv = nf_adv * this.n;
        this.int = nf_int * this.n;
        this.nrm = (1 - nf_adv - nf_int) * this.n;
        // Initialize energy of each type of node
        this.eAdv = Eo * (1 + ef_alpha) * this.n * nf_adv;
        this.eInt = Eo * (1 + ef_beta) * this.n * nf_int;
        this.eNrm = Eo * (1 - nf_adv - nf_int) * this.n;
        this.eTotal = this.eAdv + this.eInt + this.eNrm;

        return this;
    }

    generateNodes () {
        for (let i = 0; i < this.adv; i++) 
            this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), this.eAdv / this.adv, NODE_TYPE.ADV));
        for (let i = 0; i < this.int; i++)
            this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), this.eInt / this.int, NODE_TYPE.INT));
        for (let i = 0; i < this.nrm; i++)
            this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), this.eNrm / this.nrm, NODE_TYPE.NRM));
        return this;
    }

    generateSinks () {
        this.sinks.push (new Sink (X + W / 2, Y + H / 2, 1));
        // this.sinks.push (new Sink (X + W / 2, Y + 10));
        return this;
    }

    adjustSensingRange () {     // This function updates the vicinity of each node based on NEECP
        let dMaxObj = this.farthestNodeFromSink ();
        let dMinObj = this.closestNodeFromSink ();
        this.nodes.forEach ((node, i) => {
            let dSink = this.sinkDistance[i][this.closestSink (i)];       // Closest sink from i'th node
            node.adjustSensingRange (dSink, dMaxObj["D"], dMinObj["D"]);
        });
        return this;
    }

    generateDistMatrix () {
        this.nodeDistance = Utils.calDistMatrix (this.nodes, this.nodes);
        this.sinkDistance = Utils.calDistMatrix (this.nodes, this.sinks);
        return this;
    }

    farthestSink (node_index) {
        let distance = -Infinity;
        let index = -1;
        this.sinkDistance[node_index].forEach ((d, i) => {
            if (d > distance) {
                distance = d;
                index = i;
            }
        });
        return index;
    }

    closestSink (node_index) {
        let distance = Infinity;
        let index = -1;
        this.sinkDistance[node_index].forEach ((d, i) => {
            if (d < distance) {
                distance = d;
                index = i;
            }
        });
        return index;
    }

    farthestNodeFromSink () {
        let distance = -Infinity;
        let index = -1;
        this.sinkDistance.forEach ((arr, node_index) => {
            arr.forEach ((d, sink_index) => {
                if (d > distance) {
                    distance = d;
                    index = node_index;
                }
            });
        });
        return {D: distance, I: index};
    }

    closestNodeFromSink () {
        let distance = Infinity;
        let index = -1;
        this.sinkDistance.forEach ((arr, node_index) => {
            arr.forEach ((d, sink_index) => {
                if (d < distance) {
                    distance = d;
                    index = node_index;
                }
            });
        })
        return {D: distance, I: index};
    }

    calNetEnergy () {
        let sum = 0;
        this.nodes.forEach (node => {
            if (isNaN (node.resEnergy)) 
                node.resEnergy = 0;
            if (node.resEnergy < 0)
                node.resEnergy = 0;
            sum += node.resEnergy
        });
        return sum;
    }

    display (genes) {
        this.nodes.forEach ((node, index) => {
            if (node.resEnergy > 0)
                node.display (genes[index])
        });
    }
}