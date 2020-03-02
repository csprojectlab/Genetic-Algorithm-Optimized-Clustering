class Network {
    constructor (node_count) {
        this.nodes = [];
        this.sinks = []
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
        // this.sinkDistance = null;
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

    generateSinks () {
        // Sink.generatePositions(30);
        // Index is hard coded through observation   Uncomment for fast speed and change angle to 0.05 increment in loop
        // this.sinks.push (new Sink (151.45563794621643, 219.98486349325498, 2, 31));
        // this.sinks.push (new Sink (220.45563, 151.4556, 2, 1));
        // this.sinks.push (new Sink (80.00247390700606, 149.41149268429982, 2, 63))
        // this.sinks.push (new Sink (152.63215070215773, 80.04950477172352, 2, 95))

        // With angle 0.02
        this.sinks.push (new Sink (151.45563794621643, 219.98486349325498, 2, 77).generatePositions(30));
        this.sinks.push (new Sink (220.45563, 151.4556, 2, 2).generatePositions(70));
        this.sinks.push (new Sink (80.00247390700606, 149.41149268429982, 2, 158).generatePositions(70))
        this.sinks.push (new Sink (152.63215070215773, 80.04950477172352, 2, 237).generatePositions(30))
        return this;
    }

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

    updateSinks (speed = 1) {
        this.sinks.forEach (sink => sink.update(1))
    }

    // This is real time. Need to be called every updation
    adjustSensingRange () {
        let dMaxObj = this.farthestNodeFromSink ();
        let dMinObj = this.closestNodeFromSink ();
        this.nodes.forEach ((node, i) => {
            let dSinkObj = this.closestSink (i);
            node.adjustSensingRange (dSinkObj["D"], dMaxObj["D"], dMinObj["D"]);
        });
        return this;
    }

    generateDistMatrix () {
        this.nodeDistance = Utils.calDistMatrix (this.nodes, this.nodes);
        // this.sinkDistance = Utils.calDistMatrix (this.nodes, this.sinks);
        return this;
    }

    farthestSink (node_index) {
        let distance = -Infinity;
        let index = -1;
        // This is real time 
        this.sinks.forEach ((sink, i) => {
            let d = dist (this.nodes[node_index].pos.x, this.nodes[node_index].pos.y, sink.pos.x, sink.pos.y);
            if (d > distance) {
                distance = d;
                index = i;
            }
        });
        return {D: distance, I: index};
    }

    closestSink (node_index) {
        let distance = Infinity;
        let index = -1;
        this.sinks.forEach ((sink, i) => {
            let d = dist (this.nodes[node_index].pos.x, this.nodes[node_index].pos.y, sink.pos.x, sink.pos.y);
            if (d < distance) {
                distance = d;
                index = i;
            }
        });
        return {D: distance, I: index};
    }

    farthestNodeFromSink () {
        let distance = -Infinity;
        let index = -1;
        // This is real time 
        this.nodes.forEach ((node, node_index) => {
            this.sinks.forEach (sink => {
                let d = dist (node.pos.x, node.pos.y, sink.pos.x, sink.pos.y);
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
        // This is real time
        this.nodes.forEach ((node, node_index) => {
            this.sinks.forEach (sink => {
                let d = dist (node.pos.x, node.pos.y, sink.pos.x, sink.pos.y);
                if (d < distance) {
                    distance = d;
                    index = node_index;
                }
            });
        });
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