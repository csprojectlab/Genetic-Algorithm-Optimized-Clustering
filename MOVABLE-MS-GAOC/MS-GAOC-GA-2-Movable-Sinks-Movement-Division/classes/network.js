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
        // Sink.generatePositions(70);
        // Index is hard coded through observation   Uncomment for fast speed and change angle to 0.05 increment in loop
        // this.sinks.push (new Sink (151.45563794621643, 219.98486349325498, 2, 31));
        // this.sinks.push (new Sink (220.45563, 151.4556, 2, 1));
        // this.sinks.push (new Sink (80.00247390700606, 149.41149268429982, 2, 63))
        // this.sinks.push (new Sink (152.63215070215773, 80.04950477172352, 2, 95))

        // With angle 0.02
        this.sinks.push (new Sink (151.45563794621643, 219.98486349325498, 2).generatePositions(70, 0, TWO_PI / 4));
        this.sinks.push (new Sink (220.45563, 151.4556, 2).generatePositions (70, TWO_PI / 4, TWO_PI / 2));
        this.sinks.push (new Sink (80.00247390700606, 149.41149268429982, 2).generatePositions (70, TWO_PI / 2, 3 * TWO_PI / 4))
        this.sinks.push (new Sink (152.63215070215773, 80.04950477172352, 2).generatePositions (70, 3 * TWO_PI / 4, TWO_PI))
        return this;
    }

    updateSinks (speed = 1) {
        this.sinks.forEach (sink => sink.update(1))
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

    calNetEnergy () {
        let sum = 0;
        this.nodes.forEach (node => sum += node.resEnergy);
        return sum;
    }

    display (genes) {
        this.nodes.forEach ((node, index) => {
            if (node.resEnergy > 0)
                node.display (genes[index])
        });
    }
}