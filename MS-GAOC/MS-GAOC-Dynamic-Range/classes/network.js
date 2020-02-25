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

    generateNodes (tier = Tier.T3) {
        switch(tier) {
            case Tier.T1: this.generateT1Nodes(); break;
            case Tier.T2: this.generateT2Nodes(); break;
            case Tier.T3: this.generateT3Nodes(); break;
            default: this.generateT3Nodes();
        }        
        return this;
    }

    // Total energy need to be 70
    generateT1Nodes () {
        for (let i = 0; i < (140); i++) {
            this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), 0.5, NODE_TYPE.NRM));
        }
    }
    // Total energy need to be 70
    generateT2Nodes () {
        for (let i = 0; i < 40; i++)
            this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), 1, NODE_TYPE.INT));
        for (let i = 0; i < 60; i++)
        this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), 0.5, NODE_TYPE.NRM));
    }

    generateT3Nodes () {
        for (let i = 0; i < this.adv; i++) 
            this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), this.eAdv / this.adv, NODE_TYPE.ADV));
        for (let i = 0; i < this.int; i++)
            this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), this.eInt / this.int, NODE_TYPE.INT));
        for (let i = 0; i < this.nrm; i++)
            this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), this.eNrm / this.nrm, NODE_TYPE.NRM));
    }

    // generateNodes () {
    //     for (let i = 0; i < this.adv; i++) 
    //         this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), this.eAdv / this.adv, NODE_TYPE.ADV));
    //     for (let i = 0; i < this.int; i++)
    //         this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), this.eInt / this.int, NODE_TYPE.INT));
    //     for (let i = 0; i < this.nrm; i++)
    //         this.nodes.push (new Node (random (X, X + W), random (Y, Y + H), this.eNrm / this.nrm, NODE_TYPE.NRM));
    //     return this;
    // }

    deploymentStrategy (radius) {
        let center = createVector (X + W / 2, Y + H / 2);
        for (let i = 0; i < this.adv; i++) {
            let r = random (0, TWO_PI);
            let x = radius * cos (r) + center.x;
            r = random (0, TWO_PI)
            let y = radius * sin (r) + center.y;
            this.nodes.push (new Node (x, y, this.eAdv / this.adv, NODE_TYPE.ADV));
        }
        for (let i = 0; i < this.int; i++) {
            let valid = false
            while (!valid) {
                let x = random (X, X + W);
                let y = random (Y, Y + H);
                if (dist (center.x, center.y, x, y) > radius) {
                    valid = true;
                    // this.nodes.push (new Node (x, y, this.eNrm / this.nrm, NODE_TYPE.NRM));
                    this.nodes.push (new Node (x, y, this.eInt / this.int, NODE_TYPE.INT));
                }
            }
        }
        let size = this.nodes.length;
        for (let i = 0; i < this.nrm; i++) {
            let valid = false;
            while (!valid) {
                let x = random (X, X + W);
                let y = random (Y, Y + H);
                if (dist (center.x, center.y, x, y) > radius) {         // Out of range of advanced nodes
                    // If normal node conflict with 3 intermediate nodes then reject it
                    let count = 0;
                    for (let j = this.int; j < size; j++) {
                        if (dist (x, y, this.nodes[j].pos.x, this.nodes[j].pos.y) < NRM_CONFLICT_RANGE)
                            count++;
                    }
                    if (count <= 1) {
                        valid = true;
                        this.nodes.push (new Node (x, y, this.eNrm / this.nrm, NODE_TYPE.NRM));
                    }
                }
            }
        }
        return this;
    }

    generateSinks () {
        // this.sinks.push (new Sink (X + W / 2, Y + H / 2, 1));
        this.sinks.push (new Sink (X - 10, Y + H / 2, 2));      // Left side
        this.sinks.push (new Sink (X + W + 10 , Y + H / 2, 2));      // Right side
        this.sinks.push (new Sink (X + W / 2, Y - 10, 2));      // Top
        this.sinks.push (new Sink (X + W / 2, Y + H + 10, 2));      // Bottom
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
            if (isNaN (node.resEnergy)) {
                node.resEnergy = 0;
            }
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