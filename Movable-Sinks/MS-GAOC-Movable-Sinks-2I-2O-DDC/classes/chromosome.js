class Chromosome {
    constructor () {
        this.genes = new Array (network.nodes.length).fill (0);
        this.maxCH = 6;
        this.minCH = 2;
        this.countCH = 0;
        this.fitness = 0;
        return this;
    }

    countClusterHeads () {
        let count = 0;
        this.genes.forEach ((gene, index) => {
            if (gene && network.nodes[index].resEnergy > 0)
                count++;
        });
        return count;
    }

    copy () {
        let obj = new Chromosome ();
        obj.genes = this.genes.slice ();
        obj.countCH = this.countCH;
        obj.fitness = this.fitness;
        return obj;
    }

    isValid (gene, index) {
        if (network.nodes[index].resEnergy <= 0)
        return false;
        let obj = network.closestSink (index);
        if (obj["D"] < NON_CLUSTER_RANGE)
            return false;
        for (let i = 0; i < gene.length; i++) {
            if (i != index && gene[i] == 1) {
                if (network.nodeDistance[i][index] < VICINITY)
                    return false;
            }
        }
        return true;
    }

    generateChromosome () {
        this.genes.fill (0);
        let limit = floor (random (this.minCH, this.maxCH));
        let i = 1;
        let index = -1;
        let used = [];
        while (i <= limit) {
            index = floor (random (this.genes.length));
            if (!used.includes (index) && this.isValid (this.genes, index)) {
                // Check whether it is close enough to any sink or not.
                let obj = network.closestSink (index);  // Closest sink
                if (obj["D"] > NON_CLUSTER_RANGE) {
                    used.push (index)
                    this.genes[index] = 1;
                    i++;
                }                
            }
        }
        this.countCH = this.genes.filter (v => v == 1).length;
        return this;
    }

    calFP1 () {
        let f = 0;
        network.nodes.forEach (node => {
            if (node.resEnergy > 0)
                f = f + (node.resEnergy / node.maxEnergy);
        });
        return f;
    }

    calFP2 () {
        let fp2 = 0;
        let farthestSinkDistance = -Infinity;
        let d;
        let obj;
        network.nodes.forEach ((node, node_index) => {
            if (node.resEnergy > 0) {
                obj = network.farthestSink (node_index);
                d = obj["D"];
                if (d > farthestSinkDistance) {
                    farthestSinkDistance = d;
                }
            }           
        });
        let sum = 0;
        network.nodes.forEach ((node, node_index) => {
            if (node.resEnergy > 0) {
                obj = network.closestSink (node_index);
                d = obj["D"];
                sum += d;
                fp2 = fp2 + (d / farthestSinkDistance);
            }            
        });
        let average = sum / network.nodes.length;
        fp2 = fp2 + (network.nodes.length * (1 / average));
        return fp2;
    }

    calFP3 () {
        let count = 0;
        let usedNodes = [];
        this.genes.forEach ((value, index) => {
            if (network.nodes[index].resEnergy > 0) {
                if (value) {
                    network.nodeDistance[index].forEach ((d, i) => {
                        if (!usedNodes.includes (i) && d < VICINITY) {
                            count++;
                            usedNodes.push (i);
                        }
                    });
                }
            }            
        });
        return count;
    }

    calFP4 () {
        let count = 0;
        this.genes.forEach ((value, index) => {
           if (network.nodes[index].resEnergy > 0) {
            if (value) {
                if (network.nodes[index].type == NODE_TYPE.NRM)
                    count += 4;
                else if (network.nodes[index].type == NODE_TYPE.INT)
                    count += 8;
                else if (network.nodes[index].type == NODE_TYPE.ADV)
                    count += 12;
            }
           }
        });
        return count;
    }

    calFitness () {
        let fp1 = this.calFP1 ();
        let fp2 = this.calFP2 ();
        let fp3 = this.calFP3 ();
        let fp4 = this.calFP4 ();
        this.fitness = (VARPHI * fp1) + (DELTA * fp2) + (GAMMA * fp3) + fp4;
        this.fitness = pow (this.fitness, 2);
        return this.fitness;
    }

    crossover (other_parent) {
        let child = [];
        let cutPoint = floor (random (this.genes.length));
        let countCH = 0;
        for (let i = 0; i < this.genes.length; i++) {
            if (network.nodes[i].resEnergy > 0 && countCH < this.maxCH) {
                if (i < cutPoint)   
                    child.push (this.genes[i]);
                else 
                    child.push (other_parent.genes[i]);
                if (child[i] == 1)
                    countCH++;
            } else {
                child.push (0);
            }
            
        }
        for (let i = 0; i < child.length; i++) {
            if (child[i] == 1) {
                if (!this.isValid (child, i))
                    return null;
            }
        }
        let childChromosome = new Chromosome ();
        childChromosome.genes = child.slice ();
        childChromosome.countCH = child.filter ((v, index) => v == 1).length;
        if (childChromosome.countCH > this.maxCH)
            return null;
        return childChromosome;
    }

    mutate (m_rate) {
        for (let i = 0; i < this.genes.length; i++) {
            if (random (1) < m_rate) {
                if (this.genes[i] == 0) {
                    if (this.isValid (this.genes, i)) {
                        if (this.countCH < this.maxCH) {
                            this.genes[i] = 1;
                            this.countCH++;
                        }
                    }
                }
            }
        }
    }
}